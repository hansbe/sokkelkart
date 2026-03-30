import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Legend({ layers, onToggleLayer, petroleumLoading }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-4 right-4 z-[1000] animate-in fade-in duration-200">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Kartlag</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {isExpanded && (
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onToggleLayer('blocks')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-4 border-2 border-emerald-500 bg-emerald-500/10 rounded"></div>
                <span className="text-slate-700 flex-1 text-left">Blokker</span>
                {layers.blocks ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              
              <button
                onClick={() => onToggleLayer('mainBoundaries')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-4 border-2 border-emerald-500 rounded" style={{ borderWidth: '3px' }}></div>
                <span className="text-slate-700 flex-1 text-left">Kvadranter</span>
                {layers.mainBoundaries ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              
              <button
                onClick={() => onToggleLayer('buffer30')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-0.5 bg-orange-500" style={{ 
                  backgroundImage: 'repeating-linear-gradient(to right, #F97316 0, #F97316 6px, transparent 6px, transparent 10px)',
                  height: '2px'
                }}></div>
                <span className="text-slate-700 flex-1 text-left">30km fra kysten</span>
                {layers.buffer30 ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              
              <button
                onClick={() => onToggleLayer('buffer50')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-0.5 bg-red-600" style={{ 
                  backgroundImage: 'repeating-linear-gradient(to right, #DC2626 0, #DC2626 6px, transparent 6px, transparent 10px)',
                  height: '2px'
                }}></div>
                <span className="text-slate-700 flex-1 text-left">50km fra kysten</span>
                {layers.buffer50 ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => onToggleLayer('buffer100Islands')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-0.5 bg-violet-600" style={{ 
                  backgroundImage: 'repeating-linear-gradient(to right, #8B5CF6 0, #8B5CF6 8px, transparent 8px, transparent 12px)',
                  height: '2.5px'
                }}></div>
                <span className="text-slate-700 flex-1 text-left">100km Røst/Bjørnøya</span>
                {layers.buffer100Islands ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              
              <button
                onClick={() => onToggleLayer('blocksInPetroleum')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-4 border-2 border-yellow-500 bg-yellow-400/25 rounded"></div>
                <span className="text-slate-700 flex-1 text-left">Blokker i åpnet område</span>
                {petroleumLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                ) : layers.blocksInPetroleum ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => onToggleLayer('areaStatus')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-4 border-2 border-green-600 bg-green-500/20 rounded"></div>
                <span className="text-slate-700 flex-1 text-left">Åpnet for petroleum</span>
                {layers.areaStatus ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => onToggleLayer('svo')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-4 border-2 border-purple-600 bg-purple-600/15 rounded"></div>
                <span className="text-slate-700 flex-1 text-left">SVO</span>
                {layers.svo ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => onToggleLayer('svoProposal2021')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-4 border-2 border-pink-600 bg-pink-600/20 rounded"></div>
                <span className="text-slate-700 flex-1 text-left">SVO Forslag 2021</span>
                {layers.svoProposal2021 ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => onToggleLayer('licenses')}
                className="flex items-center gap-2 w-full hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="w-6 h-4 border-2 border-blue-400 bg-blue-400/12 rounded"></div>
                <span className="text-slate-700 flex-1 text-left">Lisenser</span>
                {layers.licenses ? (
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              </div>
              )}
              </CardContent>
              </Card>
              </div>
              );
              }