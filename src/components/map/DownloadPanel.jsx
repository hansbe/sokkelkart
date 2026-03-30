import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

export default function DownloadPanel({ 
  blocks, 
  licenses, 
  filteredBlockNames, 
  filteredLicenseNames,
  mainBlockBoundaries,
  bufferZones,
  buffer100Islands,
  svoAreas,
  svoProposal2021,
  areaStatus,
  blocksInPetroleumArea
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const downloadGeoJSON = (data, filename) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (type) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch(type) {
      case 'blocks-all':
        if (blocks) {
          downloadGeoJSON(blocks, `blokker_alle_${timestamp}.geojson`);
        }
        break;
      case 'blocks-filtered':
        if (blocks && filteredBlockNames) {
          const filtered = {
            type: 'FeatureCollection',
            features: blocks.features.filter(f => 
              filteredBlockNames.includes(f.properties.blcName)
            )
          };
          downloadGeoJSON(filtered, `blokker_utvalg_${timestamp}.geojson`);
        }
        break;
      case 'licenses-all':
        if (licenses) {
          downloadGeoJSON(licenses, `lisenser_alle_${timestamp}.geojson`);
        }
        break;
      case 'licenses-filtered':
        if (licenses && filteredLicenseNames) {
          const filtered = {
            type: 'FeatureCollection',
            features: licenses.features.filter(f => 
              filteredLicenseNames.includes(f.properties.prlName)
            )
          };
          downloadGeoJSON(filtered, `lisenser_utvalg_${timestamp}.geojson`);
        }
        break;
      case 'quadrants':
        if (mainBlockBoundaries) {
          downloadGeoJSON(mainBlockBoundaries, `kvadranter_${timestamp}.geojson`);
        }
        break;
      case 'buffer30':
        if (bufferZones?.buffer30) {
          downloadGeoJSON(bufferZones.buffer30, `buffer_30km_${timestamp}.geojson`);
        }
        break;
      case 'buffer50':
        if (bufferZones?.buffer50) {
          downloadGeoJSON(bufferZones.buffer50, `buffer_50km_${timestamp}.geojson`);
        }
        break;
      case 'buffer100Islands':
        if (buffer100Islands) {
          downloadGeoJSON(buffer100Islands, `buffer_100km_rost_bjornoya_${timestamp}.geojson`);
        }
        break;
      case 'svo':
        if (svoAreas) {
          downloadGeoJSON(svoAreas, `svo_omrader_${timestamp}.geojson`);
        }
        break;
      case 'svoProposal2021':
        if (svoProposal2021) {
          downloadGeoJSON(svoProposal2021, `svo_forslag_2021_${timestamp}.geojson`);
        }
        break;
      case 'areaStatus':
        if (areaStatus) {
          downloadGeoJSON(areaStatus, `aapnede_omrader_petroleum_${timestamp}.geojson`);
        }
        break;
      case 'blocksInPetroleum':
        if (blocksInPetroleumArea) {
          downloadGeoJSON(blocksInPetroleumArea, `blokker_i_aapnet_omrade_${timestamp}.geojson`);
        }
        break;
    }
  };

  return (
    <div className="absolute top-[280px] left-4 z-[1000] animate-in fade-in duration-200">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 w-64">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-800">Last ned data</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {isExpanded && (
            <div className="space-y-2 text-xs">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-600 px-2 py-1">Blokker</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('blocks-all')}
                  disabled={!blocks}
                >
                  Alle blokker
                </Button>
                {filteredBlockNames && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs text-teal-600"
                    onClick={() => handleDownload('blocks-filtered')}
                  >
                    Valgte blokker ({filteredBlockNames.length})
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-600 px-2 py-1">Lisenser</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('licenses-all')}
                  disabled={!licenses}
                >
                  Alle lisenser
                </Button>
                {filteredLicenseNames && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs text-blue-600"
                    onClick={() => handleDownload('licenses-filtered')}
                  >
                    Valgte lisenser ({filteredLicenseNames.length})
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-600 px-2 py-1">Andre lag</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('quadrants')}
                  disabled={!mainBlockBoundaries}
                >
                  Kvadranter
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('buffer30')}
                  disabled={!bufferZones?.buffer30}
                >
                  30km buffer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('buffer50')}
                  disabled={!bufferZones?.buffer50}
                >
                  50km buffer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('buffer100Islands')}
                  disabled={!buffer100Islands}
                >
                  100km Røst/Bjørnøya
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('svo')}
                  disabled={!svoAreas}
                >
                  SVO områder
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('svoProposal2021')}
                  disabled={!svoProposal2021}
                >
                  SVO Forslag 2021
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('areaStatus')}
                  disabled={!areaStatus}
                >
                  Åpnede områder
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => handleDownload('blocksInPetroleum')}
                  disabled={!blocksInPetroleumArea}
                >
                  Blokker i åpnet område
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}