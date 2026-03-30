import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Convert GeoJSON geometry to ESRI JSON
function geojsonToEsriGeometry(geom) {
  if (geom.type === 'Polygon') return { rings: geom.coordinates };
  if (geom.type === 'MultiPolygon') return { rings: geom.coordinates.flat() };
  return null;
}

// Proper area-weighted polygon centroid
function ringCentroid(ring) {
  let area = 0, cx = 0, cy = 0;
  const n = ring.length - 1;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area /= 2;
  if (Math.abs(area) < 1e-12) {
    // fallback: simple average
    let x = 0, y = 0;
    for (let i = 0; i < n; i++) { x += ring[i][0]; y += ring[i][1]; }
    return [x / n, y / n];
  }
  return [cx / (6 * area), cy / (6 * area)];
}

// Ray casting point-in-ring
function pointInRing(px, py, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Point inside polygon respecting holes
function pointInPolygon(px, py, coordinates) {
  if (!pointInRing(px, py, coordinates[0])) return false;
  for (let i = 1; i < coordinates.length; i++) {
    if (pointInRing(px, py, coordinates[i])) return false;
  }
  return true;
}

function ringBbox(ring) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch opened petroleum areas
    const areaFeatures = [];
    let areaOffset = 0;
    while (true) {
      const res = await fetch(
        `https://factmaps.sodir.no/api/rest/services/Factmaps/FactMapsWGS84/FeatureServer/805/query?where=arsAreaLegalRegulation+LIKE+'%25petroleumsloven%25'&outFields=arsAreaStatus&returnGeometry=true&f=geojson&resultRecordCount=100&resultOffset=${areaOffset}`
      );
      if (!res.ok) break;
      const data = await res.json();
      if (!data.features || data.features.length === 0) break;
      areaFeatures.push(...data.features);
      if (data.features.length < 100) break;
      areaOffset += 100;
    }

    // Build area polygon list with bboxes for fast point-in-polygon
    const areaPolygons = [];
    for (const f of areaFeatures) {
      const g = f.geometry;
      if (g.type === 'Polygon') {
        areaPolygons.push({ coords: g.coordinates, bbox: ringBbox(g.coordinates[0]) });
      } else if (g.type === 'MultiPolygon') {
        for (const poly of g.coordinates) {
          areaPolygons.push({ coords: poly, bbox: ringBbox(poly[0]) });
        }
      }
    }

    // Test if a point is inside any area polygon (respecting holes)
    function isInsideAnyArea(px, py) {
      for (const { coords, bbox } of areaPolygons) {
        if (px < bbox[0] || px > bbox[2] || py < bbox[1] || py > bbox[3]) continue;
        if (pointInPolygon(px, py, coords)) return true;
      }
      return false;
    }

    // Use ESRI intersection to get candidate blocks per area (server-side spatial index)
    const candidateMap = {};
    for (const area of areaFeatures) {
      const esriGeom = geojsonToEsriGeometry(area.geometry);
      if (!esriGeom) continue;

      let bOffset = 0;
      while (true) {
        const body = new URLSearchParams({
          geometry: JSON.stringify(esriGeom),
          geometryType: 'esriGeometryPolygon',
          inSR: '4326',
          spatialRel: 'esriSpatialRelIntersects',
          outFields: 'blcName,blcNpdidBlock,blcArea,qadName,blcBlockNo,blcMainArea',
          returnGeometry: 'true',
          f: 'geojson',
          resultRecordCount: '1000',
          resultOffset: String(bOffset),
        });
        const res = await fetch(
          'https://factmaps.sodir.no/api/rest/services/Factmaps/FactMapsWGS84/MapServer/802/query',
          { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }
        );
        if (!res.ok) break;
        const data = await res.json();
        if (!data.features || data.features.length === 0) break;
        for (const f of data.features) {
          if (!candidateMap[f.properties.blcName]) candidateMap[f.properties.blcName] = f;
        }
        if (data.features.length < 1000) break;
        bOffset += 1000;
      }
    }

    // Sample a 5x5 grid inside the block's bounding box, count how many points are
    // (a) inside the block polygon and (b) inside an area polygon.
    // Include block if >50% of in-block sample points are inside an area.
    const GRID = 10;
    const overlapping = Object.values(candidateMap).filter(blockFeature => {
      const g = blockFeature.geometry;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      return polys.some(polyCoords => {
        const outer = polyCoords[0];
        const bb = ringBbox(outer);
        const dx = (bb[2] - bb[0]) / (GRID + 1);
        const dy = (bb[3] - bb[1]) / (GRID + 1);
        let inBlock = 0, inArea = 0;
        for (let i = 1; i <= GRID; i++) {
          for (let j = 1; j <= GRID; j++) {
            const px = bb[0] + i * dx;
            const py = bb[1] + j * dy;
            if (pointInPolygon(px, py, polyCoords)) {
              inBlock++;
              if (isInsideAnyArea(px, py)) inArea++;
            }
          }
        }
        // Require at least 1% of in-block sample points to be inside an area
        return inBlock > 0 && inArea / inBlock >= 0.01;
      });
    });

    return Response.json({
      type: 'FeatureCollection',
      features: overlapping
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});