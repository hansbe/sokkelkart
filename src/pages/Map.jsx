import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { computePetroleumBlocksFrontend } from '@/lib/petroleumBlocks';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X, MapPin, ChevronRight, Plus, Minus } from 'lucide-react';
import * as turf from '@turf/turf';
import Legend from '../components/map/Legend';
import DownloadPanel from '../components/map/DownloadPanel';
import 'leaflet/dist/leaflet.css';

// Block info panel
function BlockInfoPanel({ block, onClose }) {
  if (!block) return null;
  
  return (
    <div className="absolute bottom-4 left-4 z-[1000] animate-in slide-in-from-bottom-4 duration-300">
      <Card className="w-72 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800">
              {block.blcName}
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-xs text-slate-500">Kvadrant</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {block.qadName}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-xs text-slate-500">Blokknummer</span>
              <span className="text-sm font-medium text-slate-800">{block.blcBlockNo}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-xs text-slate-500">Hovedområde</span>
              <span className="text-sm font-medium text-slate-800">{block.blcMainArea}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-xs text-slate-500">Areal</span>
              <span className="text-sm font-medium text-slate-800">
                {block.blcArea ? `${block.blcArea.toFixed(1)} km²` : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Search panel
function SearchPanel({ searchTerm, setSearchTerm, searchResults, licenseSearchResults, onSelectBlock, onSelectLicense }) {
  return (
    <div className="absolute top-20 left-4 z-[1000] animate-in fade-in duration-200">
      <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Søk etter blokker eller lisenser (f.eks. 7/12; 1014; 1136)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 h-10 text-sm border-slate-200 focus:border-teal-500 focus:ring-teal-500"
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          {searchTerm && (searchResults.length > 0 || licenseSearchResults.length > 0) && (
            <div className="mt-2 max-h-64 overflow-y-auto">
              {licenseSearchResults.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-slate-600 px-3 py-1 bg-slate-50">Lisenser</div>
                  {licenseSearchResults.slice(0, 10).map((license, idx) => (
                    <button
                      key={`license-${idx}`}
                      onClick={() => onSelectLicense(license)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-medium text-sm text-blue-600">{license.prlName}</span>
                        <span className="text-xs text-slate-500 ml-2">{license.cmpLongName}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </>
              )}
              {searchResults.length > 0 && (
                <>
                  <div className="text-xs font-semibold text-slate-600 px-3 py-1 bg-slate-50">Blokker</div>
                  {searchResults.slice(0, 10).map((block, idx) => (
                    <button
                      key={`block-${idx}`}
                      onClick={() => onSelectBlock(block)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-medium text-sm text-slate-800">{block.blcName}</span>
                        <span className="text-xs text-slate-500 ml-2">{block.blcMainArea}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {searchTerm && searchResults.length === 0 && licenseSearchResults.length === 0 && (
            <div className="text-sm text-slate-500 text-center py-4">
              Ingen resultater funnet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Map controller for flying to locations
function MapController({ flyTo }) {
  const map = useMap();
  
  useEffect(() => {
    if (flyTo) {
      map.flyTo(flyTo.center, flyTo.zoom, { duration: 1 });
    }
  }, [flyTo, map]);
  
  return null;
}

// Zoom controls component
function ZoomControls() {
  const map = useMap();
  
  return (
    <div className="absolute top-[370px] left-4 z-[1000] flex flex-col gap-1">
      <Button
        size="icon"
        variant="secondary"
        className="h-9 w-9 bg-white/95 backdrop-blur-sm shadow-xl border-0 hover:bg-white"
        onClick={() => map.zoomIn()}
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-9 w-9 bg-white/95 backdrop-blur-sm shadow-xl border-0 hover:bg-white"
        onClick={() => map.zoomOut()}
      >
        <Minus className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function MapPage() {
  const [blocks, setBlocks] = useState(null);
  const [coastline, setCoastline] = useState(null);
  const [svoAreas, setSvoAreas] = useState(null);
  const [svoProposal2021, setSvoProposal2021] = useState(null);
  const [areaStatus, setAreaStatus] = useState(null);
  const [licenses, setLicenses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [highlightedBlock, setHighlightedBlock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [licenseSearchResults, setLicenseSearchResults] = useState([]);
  const [filteredBlockNames, setFilteredBlockNames] = useState(null);
  const [filteredLicenseNames, setFilteredLicenseNames] = useState(null);
  const [highlightedLicense, setHighlightedLicense] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [layerVisibility, setLayerVisibility] = useState({
    blocks: false,
    mainBoundaries: false,
    buffer30: false,
    buffer50: false,
    buffer100Islands: false,
    svo: false,
    svoProposal2021: false,
    areaStatus: false,
    blocksInPetroleum: false,
    licenses: false,
  });

  const geoJsonRef = useRef();
  
  const toggleLayer = useCallback((layerName) => {
    setLayerVisibility(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  }, []);
  
  const [blocksInPetroleumArea, setBlocksInPetroleumArea] = useState(null);
  const [petroleumLoading, setPetroleumLoading] = useState(false);

  // Compute petroleum blocks in frontend when layer is first turned on
  useEffect(() => {
    if (!layerVisibility.blocksInPetroleum || blocksInPetroleumArea) return;
    setPetroleumLoading(true);
    computePetroleumBlocksFrontend()
      .then(data => setBlocksInPetroleumArea(data))
      .catch(err => console.error('Failed to compute petroleum blocks:', err))
      .finally(() => setPetroleumLoading(false));
  }, [layerVisibility.blocksInPetroleum]);

  // Create main block boundaries (XXXX groups) - only when visible
  const mainBlockBoundaries = useMemo(() => {
    if (!blocks || !layerVisibility.mainBoundaries) return null;
    
    try {
      const grouped = {};
      
      // Group blocks by main block number (XXXX part)
      blocks.features.forEach(feature => {
        const mainBlock = feature.properties.blcName?.split('/')[0];
        if (mainBlock) {
          if (!grouped[mainBlock]) {
            grouped[mainBlock] = [];
          }
          grouped[mainBlock].push(feature);
        }
      });
      
      // Create dissolved boundaries for each main block
      const boundaries = [];
      Object.entries(grouped).forEach(([mainBlock, features]) => {
        try {
          if (features.length === 1) {
            boundaries.push(features[0]);
          } else {
            const union = turf.union(turf.featureCollection(features));
            if (union) {
              boundaries.push({
                ...union,
                properties: { mainBlock }
              });
            }
          }
        } catch (e) {
          console.warn(`Failed to dissolve main block ${mainBlock}`, e);
        }
      });
      
      return {
        type: 'FeatureCollection',
        features: boundaries
      };
    } catch (err) {
      console.error('Error creating main block boundaries:', err);
      return null;
    }
  }, [blocks, layerVisibility.mainBoundaries]);
  
  // Create buffer zones from coastline - only when visible
  const bufferZones = useMemo(() => {
    if (!coastline || (!layerVisibility.buffer30 && !layerVisibility.buffer50)) return { buffer30: null, buffer50: null };
    
    try {
      const buffer30 = layerVisibility.buffer30 ? turf.buffer(coastline, 30, { units: 'kilometers' }) : null;
      const buffer50 = layerVisibility.buffer50 ? turf.buffer(coastline, 50, { units: 'kilometers' }) : null;

      return { buffer30, buffer50 };
      } catch (err) {
      console.error('Error creating buffer zones:', err);
      return { buffer30: null, buffer50: null };
      }
      }, [coastline, layerVisibility.buffer30, layerVisibility.buffer50]);

  // Create 100km buffer around Røst and Bjørnøya
  const buffer100Islands = useMemo(() => {
    try {
      const rost = turf.point([12.1, 67.5]);
      const bjornoya = turf.point([19.0, 74.5]);
      
      const rostBuffer = turf.buffer(rost, 100, { units: 'kilometers' });
      const bjornoyaBuffer = turf.buffer(bjornoya, 100, { units: 'kilometers' });
      
      return {
        type: 'FeatureCollection',
        features: [rostBuffer, bjornoyaBuffer]
      };
    } catch (err) {
      console.error('Error creating island buffers:', err);
      return null;
    }
  }, []);

  // Fetch blocks and coastline data with pagination
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all blocks with pagination
        const allFeatures = [];
        let offset = 0;
        const batchSize = 1000;
        
        while (true) {
          const blocksRes = await fetch(
            `https://factmaps.sodir.no/api/rest/services/Factmaps/FactMapsWGS84/MapServer/802/query?where=1%3D1&outFields=blcName,blcNpdidBlock,blcArea,qadName,blcBlockNo,blcMainArea&returnGeometry=true&f=geojson&resultRecordCount=${batchSize}&resultOffset=${offset}`
          );
          
          if (!blocksRes.ok) throw new Error('Failed to fetch blocks');
          
          const blocksData = await blocksRes.json();
          
          if (!blocksData.features || blocksData.features.length === 0) {
            break;
          }
          
          allFeatures.push(...blocksData.features);
          
          if (blocksData.features.length < batchSize) {
            break;
          }
          
          offset += batchSize;
        }
        
        setBlocks({
          type: 'FeatureCollection',
          features: allFeatures
        });
        
        // Fetch Norway coastline
        const coastlineRes = await fetch(
          'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson'
        );
        
        if (coastlineRes.ok) {
          const countriesData = await coastlineRes.json();
          const norway = countriesData.features.find(f => f.properties.ADMIN === 'Norway');
          if (norway) {
            setCoastline(norway);
          }
        }
        
        // Fetch SVO areas (Særlig verdifulle og sårbare områder) in WGS84
        const svoRes = await fetch(
          'https://kart.miljodirektoratet.no/geoserver/svo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=svo_omrade&outputformat=application/json&srsName=EPSG:4326'
        );
        
        if (svoRes.ok) {
          const svoData = await svoRes.json();
          setSvoAreas(svoData);
        }

        // Fetch Area Status (åpnede områder for petroleumsvirksomhet)
        try {
          const areaStatusFeatures = [];
          let areaOffset = 0;
          while (true) {
            const areaRes = await fetch(
              `https://factmaps.sodir.no/api/rest/services/Factmaps/FactMapsWGS84/FeatureServer/805/query?where=arsAreaLegalRegulation+LIKE+'%25petroleumsloven%25'&outFields=arsAreaStatus,arsWhitepaperName,arsFrameworkNameNO,arsAreaKm2&returnGeometry=true&f=geojson&resultRecordCount=100&resultOffset=${areaOffset}`
            );
            if (!areaRes.ok) break;
            const areaData = await areaRes.json();
            if (!areaData.features || areaData.features.length === 0) break;
            areaStatusFeatures.push(...areaData.features);
            if (areaData.features.length < 100) break;
            areaOffset += 100;
          }
          if (areaStatusFeatures.length > 0) {
            setAreaStatus({ type: 'FeatureCollection', features: areaStatusFeatures });
          }
        } catch (err) {
          console.warn('Could not load area status:', err);
        }

        // Fetch SVO Forslag 2021 from uploaded file
        try {
          const svoProposalRes = await fetch(
            'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6975366efe2c2be3be65ccc8/c704e3455_SVOForslag2021.json'
          );
          
          if (svoProposalRes.ok) {
            const svoProposalData = await svoProposalRes.json();
            console.log('SVO Forslag 2021 loaded:', svoProposalData);
            setSvoProposal2021(svoProposalData);
          }
        } catch (err) {
          console.warn('Could not load SVO Forslag 2021:', err);
        }
        
        // Fetch all active production licenses with pagination (layer 616 - current with geometry)
        const allLicenseFeatures = [];
        let licenseOffset = 0;
        const licenseBatchSize = 1000;

        while (true) {
          const licensesRes = await fetch(
            `https://factmaps.sodir.no/api/rest/services/Factmaps/FactMapsWGS84/MapServer/616/query?where=1%3D1&outFields=*&returnGeometry=true&f=geojson&resultRecordCount=${licenseBatchSize}&resultOffset=${licenseOffset}`
          );

          if (!licensesRes.ok) break;

          const licensesData = await licensesRes.json();

          if (!licensesData.features || licensesData.features.length === 0) {
            break;
          }

          allLicenseFeatures.push(...licensesData.features);

          if (licensesData.features.length < licenseBatchSize) {
            break;
          }

          licenseOffset += licenseBatchSize;
        }

        if (allLicenseFeatures.length > 0) {
          setLicenses({
            type: 'FeatureCollection',
            features: allLicenseFeatures
          });
        }

        } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        } finally {
        setLoading(false);
        }
        };

        fetchData();
        }, []);

  // Search blocks and licenses
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setLicenseSearchResults([]);
      setFilteredBlockNames(null);
      setFilteredLicenseNames(null);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    // Check if multiple items are specified (semicolon-separated)
    if (term.includes(';')) {
      const names = term.split(';')
        .map(b => b.trim())
        .filter(b => b.length > 0);
      
      const matchedBlocks = blocks?.features
        .filter(f => {
          const blockName = f.properties.blcName?.toLowerCase();
          return names.some(name => blockName === name);
        })
        .map(f => f.properties.blcName) || [];
      
      const matchedLicenses = licenses?.features
        .filter(f => {
          const licenseName = f.properties.prlName?.toLowerCase();
          return names.some(name => licenseName === name || licenseName?.includes(name));
        })
        .map(f => f.properties.prlName) || [];
      
      setFilteredBlockNames(matchedBlocks.length > 0 ? matchedBlocks : null);
      setFilteredLicenseNames(matchedLicenses.length > 0 ? matchedLicenses : null);
      setSearchResults([]);
      setLicenseSearchResults([]);
    } else {
      // Single search term - show suggestions for both blocks and licenses
      const blockResults = blocks?.features
        .filter(f => f.properties.blcName?.toLowerCase().includes(term))
        .map(f => f.properties) || [];
      
      const licenseResults = licenses?.features
        .filter(f => f.properties.prlName?.toLowerCase().includes(term))
        .map(f => f.properties) || [];
      
      setSearchResults(blockResults);
      setLicenseSearchResults(licenseResults);
      setFilteredBlockNames(null);
      setFilteredLicenseNames(null);
    }
  }, [searchTerm, blocks, licenses]);

  const handleBlockClick = useCallback((feature) => {
    setSelectedBlock(feature.properties);
    setHighlightedBlock(feature.properties.blcName);
  }, []);

  const handleSearchSelect = useCallback((blockProps) => {
    const feature = blocks?.features.find(f => f.properties.blcName === blockProps.blcName);
    if (feature) {
      const coords = feature.geometry.coordinates[0];
      const center = coords.reduce(
        (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
        [0, 0]
      ).map(v => v / coords.length);
      
      setFlyTo({ center: [center[1], center[0]], zoom: 10 });
      setSelectedBlock(blockProps);
      setHighlightedBlock(blockProps.blcName);
      setSearchTerm('');
      setFilteredBlockNames(null);
    }
  }, [blocks]);

  const handleLicenseSelect = useCallback((licenseProps) => {
    const feature = licenses?.features.find(f => f.properties.prlName === licenseProps.prlName);
    if (feature) {
      const coords = feature.geometry.coordinates[0];
      const center = coords.reduce(
        (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
        [0, 0]
      ).map(v => v / coords.length);
      
      setFlyTo({ center: [center[1], center[0]], zoom: 9 });
      setHighlightedLicense(licenseProps.prlName);
      setSearchTerm('');
      setFilteredLicenseNames(null);
    }
  }, [licenses]);
  
  // Filter blocks for display
  const displayBlocks = useMemo(() => {
    if (!blocks || !filteredBlockNames) return blocks;
    
    return {
      type: 'FeatureCollection',
      features: blocks.features.filter(f => 
        filteredBlockNames.includes(f.properties.blcName)
      )
    };
  }, [blocks, filteredBlockNames]);

  // Filter licenses for display
  const displayLicenses = useMemo(() => {
    if (!licenses || !filteredLicenseNames) return licenses;
    
    return {
      type: 'FeatureCollection',
      features: licenses.features.filter(f => 
        filteredLicenseNames.includes(f.properties.prlName)
      )
    };
  }, [licenses, filteredLicenseNames]);

  const blockStyle = useCallback((feature) => {
    const isHighlighted = feature.properties.blcName === highlightedBlock;
    return {
      fillColor: 'transparent',
      fillOpacity: 0,
      color: isHighlighted ? '#FBBF24' : '#10B981',
      weight: isHighlighted ? 3 : 1.5,
      opacity: 1,
    };
  }, [highlightedBlock]);

  const onEachBlock = useCallback((feature, layer) => {
    layer.on({
      click: () => handleBlockClick(feature),
      mouseover: (e) => {
        const layer = e.target;
        if (feature.properties.blcName !== highlightedBlock) {
          layer.setStyle({
            weight: 2,
          });
        }
      },
      mouseout: (e) => {
        const layer = e.target;
        if (feature.properties.blcName !== highlightedBlock) {
          layer.setStyle({
            weight: 1,
          });
        }
      },
    });
    
    layer.bindTooltip(feature.properties.blcName, {
      permanent: false,
      direction: 'center',
      className: 'block-tooltip'
    });
  }, [handleBlockClick, highlightedBlock]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="oilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#glow)">
              <path
                d="M50,10 C38,18 30,32 30,50 C30,72 38,85 50,85 C62,85 70,72 70,50 C70,32 62,18 50,10 Z"
                fill="url(#oilGradient)"
              >
                <animate
                  attributeName="transform"
                  values="translate(0,0); translate(0,15); translate(0,0)"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </svg>
          <p className="text-white/80 text-sm">Laster norsk kontinentalsokkel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-slate-800 font-medium mb-1">Kunne ikke laste data</p>
            <p className="text-slate-500 text-sm">{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Prøv igjen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-gradient-to-b from-slate-900/90 to-transparent pointer-events-none">
        <div className="px-4 py-3 pointer-events-auto">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Sokkelkart</h1>
                <p className="text-white/60 text-xs">Norsk kontinentalsokkel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[66, 8]}
        zoom={5}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: '#0A1628' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController flyTo={flyTo} />
        <ZoomControls />

        {/* Blocks */}
        {displayBlocks && layerVisibility.blocks && (
          <GeoJSON
            key={`${highlightedBlock || 'blocks'}-${filteredBlockNames?.join(',') || 'all'}`}
            ref={geoJsonRef}
            data={displayBlocks}
            style={blockStyle}
            onEachFeature={onEachBlock}
          />
        )}
        
        {/* Main Block Boundaries */}
        {mainBlockBoundaries && layerVisibility.mainBoundaries && (
          <GeoJSON
            key="main-boundaries"
            data={mainBlockBoundaries}
            style={{
              fillColor: 'transparent',
              fillOpacity: 0,
              color: '#10B981',
              weight: 2.5,
              opacity: 0.9,
            }}
            interactive={false}
          />
        )}
        
        {/* Buffer Zones */}
        {bufferZones.buffer50 && layerVisibility.buffer50 && (
          <GeoJSON
            key="buffer-50"
            data={bufferZones.buffer50}
            style={{
              fillColor: 'transparent',
              fillOpacity: 0,
              color: '#DC2626',
              weight: 2,
              opacity: 0.75,
              dashArray: '6, 4'
            }}
            interactive={false}
          />
        )}
        {bufferZones.buffer30 && layerVisibility.buffer30 && (
          <GeoJSON
            key="buffer-30"
            data={bufferZones.buffer30}
            style={{
              fillColor: 'transparent',
              fillOpacity: 0,
              color: '#F97316',
              weight: 2,
              opacity: 0.75,
              dashArray: '6, 4'
            }}
            interactive={false}
          />
        )}

        {/* 100km Buffer around Røst and Bjørnøya */}
        {buffer100Islands && layerVisibility.buffer100Islands && (
          <GeoJSON
            key="buffer-100-islands"
            data={buffer100Islands}
            style={{
              fillColor: 'transparent',
              fillOpacity: 0,
              color: '#8B5CF6',
              weight: 2.5,
              opacity: 0.8,
              dashArray: '8, 4'
            }}
            interactive={false}
          />
        )}
        
        {/* SVO Areas */}
        {svoAreas && layerVisibility.svo && (
          <GeoJSON
            key="svo-areas"
            data={svoAreas}
            style={{
              fillColor: '#A855F7',
              fillOpacity: 0.15,
              color: '#A855F7',
              weight: 2,
              opacity: 0.8,
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties.navn_no || feature.properties.navn_en || 'SVO Area';
              layer.bindTooltip(name, {
                permanent: false,
                direction: 'center',
                className: 'block-tooltip'
              });
            }}
          />
        )}

        {/* Blocks overlapping petroleum open areas */}
        {blocksInPetroleumArea && layerVisibility.blocksInPetroleum && (
          <GeoJSON
            key={`blocks-petroleum-${blocksInPetroleumArea.features.length}`}
            data={blocksInPetroleumArea}
            style={{
              fillColor: '#FACC15',
              fillOpacity: 0.25,
              color: '#EAB308',
              weight: 2,
              opacity: 0.9,
            }}
            onEachFeature={(feature, layer) => {
              layer.bindTooltip(feature.properties.blcName, {
                permanent: false,
                direction: 'center',
                className: 'block-tooltip'
              });
            }}
          />
        )}

        {/* Area Status - Åpnede områder for petroleumsvirksomhet */}
        {areaStatus && layerVisibility.areaStatus && (
          <GeoJSON
            key="area-status"
            data={areaStatus}
            style={{
              fillColor: '#22C55E',
              fillOpacity: 0.15,
              color: '#16A34A',
              weight: 2,
              opacity: 0.8,
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties.arsFrameworkNameNO || feature.properties.arsWhitepaperName || 'Åpnet område';
              layer.bindTooltip(name, {
                permanent: false,
                direction: 'center',
                className: 'block-tooltip'
              });
            }}
          />
        )}

        {/* SVO Forslag 2021 */}
        {svoProposal2021 && layerVisibility.svoProposal2021 && (
          <GeoJSON
            key="svo-proposal-2021"
            data={svoProposal2021}
            style={{
              fillColor: '#EC4899',
              fillOpacity: 0.2,
              color: '#EC4899',
              weight: 2,
              opacity: 0.85,
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties.navn || feature.properties.name || feature.properties.omradenavn || 'SVO Forslag 2021';
              layer.bindTooltip(name, {
                permanent: false,
                direction: 'center',
                className: 'block-tooltip'
              });
            }}
          />
        )}


        {/* Production Licenses */}
        {displayLicenses && layerVisibility.licenses && (
          <GeoJSON
            key={`licenses-${highlightedLicense || 'all'}-${filteredLicenseNames?.join(',') || 'all'}`}
            data={displayLicenses}
            style={(feature) => {
              const isHighlighted = feature.properties.prlName === highlightedLicense;
              return {
                fillColor: isHighlighted ? '#FBBF24' : '#60A5FA',
                fillOpacity: isHighlighted ? 0.25 : 0.12,
                color: isHighlighted ? '#FBBF24' : '#60A5FA',
                weight: isHighlighted ? 3 : 2,
                opacity: isHighlighted ? 1 : 0.75,
              };
            }}
            onEachFeature={(feature, layer) => {
              const name = feature.properties.prlName || 'License';
              layer.bindTooltip(name, {
                permanent: false,
                direction: 'center',
                className: 'block-tooltip'
              });
              layer.on({
                click: () => setHighlightedLicense(feature.properties.prlName),
              });
            }}
          />
        )}
      </MapContainer>

      {/* Search Panel */}
      <SearchPanel
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={searchResults}
        licenseSearchResults={licenseSearchResults}
        onSelectBlock={handleSearchSelect}
        onSelectLicense={handleLicenseSelect}
      />

      {/* Download Panel */}
      <DownloadPanel
        blocks={blocks}
        licenses={licenses}
        filteredBlockNames={filteredBlockNames}
        filteredLicenseNames={filteredLicenseNames}
        mainBlockBoundaries={mainBlockBoundaries}
        bufferZones={bufferZones}
        buffer100Islands={buffer100Islands}
        svoAreas={svoAreas}
        svoProposal2021={svoProposal2021}
        areaStatus={areaStatus}
        blocksInPetroleumArea={blocksInPetroleumArea}
      />

      {/* Block Info Panel */}
      <BlockInfoPanel
        block={selectedBlock}
        onClose={() => {
          setSelectedBlock(null);
          setHighlightedBlock(null);
        }}
      />

      {/* Legend */}
      <Legend layers={layerVisibility} onToggleLayer={toggleLayer} petroleumLoading={petroleumLoading} />

      {/* Custom tooltip styles */}
      <style>{`
        .block-tooltip {
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #1e3a5f;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}