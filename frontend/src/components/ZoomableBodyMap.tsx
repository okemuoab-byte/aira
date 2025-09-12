import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Symptom } from '@/types/health';

interface ZoomableBodyMapProps {
  onBodyPartClick: (bodyPartId: string, bodyPartName: string, coordinates: { x: number; y: number }) => void;
  symptoms: Symptom[];
  selectedBodyPart?: string;
  className?: string;
}

type ZoomLevel = 'overview' | 'head' | 'chest' | 'left-arm' | 'right-arm' | 'left-hand' | 'right-hand' | 'abdomen' | 'back' | 'left-leg' | 'right-leg' | 'left-foot' | 'right-foot';

const ZoomableBodyMap: React.FC<ZoomableBodyMapProps> = ({
  onBodyPartClick,
  symptoms,
  selectedBodyPart,
  className
}) => {
  const [currentZoom, setCurrentZoom] = useState<ZoomLevel>('overview');
  const [zoomHistory, setZoomHistory] = useState<ZoomLevel[]>(['overview']);

  const getSymptomIntensity = (bodyPartId: string): number => {
    const recentSymptoms = symptoms
      .filter(s => s.bodyPartId === bodyPartId)
      .filter(s => {
        const daysDiff = (Date.now() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });
    
    if (recentSymptoms.length === 0) return 0;
    return Math.max(...recentSymptoms.map(s => s.intensity));
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return 'fill-blue-50 hover:fill-blue-100 stroke-blue-200';
    if (intensity <= 3) return 'fill-green-200 hover:fill-green-300 stroke-green-400';
    if (intensity <= 6) return 'fill-yellow-200 hover:fill-yellow-300 stroke-yellow-400';
    if (intensity <= 8) return 'fill-orange-300 hover:fill-orange-400 stroke-orange-500';
    return 'fill-red-400 hover:fill-red-500 stroke-red-600';
  };

  const handleZoomIn = (zoomLevel: ZoomLevel) => {
    setCurrentZoom(zoomLevel);
    setZoomHistory(prev => [...prev, zoomLevel]);
  };

  const handleZoomOut = () => {
    if (zoomHistory.length > 1) {
      const newHistory = zoomHistory.slice(0, -1);
      setZoomHistory(newHistory);
      setCurrentZoom(newHistory[newHistory.length - 1]);
    }
  };

  const handleGoHome = () => {
    setCurrentZoom('overview');
    setZoomHistory(['overview']);
  };

  const handleBodyPartClick = (bodyPartId: string, bodyPartName: string, event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const coordinates = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    onBodyPartClick(bodyPartId, bodyPartName, coordinates);
  };

  const renderOverview = () => (
    <svg width="300" height="600" viewBox="0 0 300 600" className="w-full h-auto">
      {/* Head - Clickable for zoom */}
      <ellipse
        cx="150" cy="60" rx="35" ry="45"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2",
          getIntensityColor(getSymptomIntensity('head')),
          "hover:scale-105 transform-origin-center"
        )}
        onClick={() => handleZoomIn('head')}
      />
      <text x="150" y="65" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Head</text>

      {/* Neck */}
      <rect
        x="125" y="110" width="50" height="30" rx="15"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2",
          getIntensityColor(getSymptomIntensity('neck')),
          "hover:scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick('neck', 'Neck', e)}
      />

      {/* Chest - Clickable for zoom */}
      <rect
        x="110" y="140" width="80" height="100" rx="15"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2",
          getIntensityColor(getSymptomIntensity('chest')),
          "hover:scale-105 transform-origin-center"
        )}
        onClick={() => handleZoomIn('chest')}
      />
      <text x="150" y="195" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Chest</text>

      {/* Left Arm - Clickable for zoom */}
      <rect
        x="60" y="155" width="25" height="120" rx="12"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2",
          getIntensityColor(getSymptomIntensity('left-arm')),
          "hover:scale-105 transform-origin-center"
        )}
        onClick={() => handleZoomIn('left-arm')}
      />
      <text x="72" y="220" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">L Arm</text>

      {/* Right Arm - Clickable for zoom */}
      <rect
        x="215" y="155" width="25" height="120" rx="12"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2",
          getIntensityColor(getSymptomIntensity('right-arm')),
          "hover:scale-105 transform-origin-center"
        )}
        onClick={() => handleZoomIn('right-arm')}
      />
      <text x="227" y="220" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">R Arm</text>

      {/* Abdomen - Clickable for zoom */}
      <rect
        x="115" y="250" width="70" height="80" rx="12"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2",
          getIntensityColor(getSymptomIntensity('abdomen')),
          "hover:scale-105 transform-origin-center"
        )}
        onClick={() => handleZoomIn('abdomen')}
      />
      <text x="150" y="295" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Abdomen</text>

      {/* Back */}
      <rect
        x="120" y="140" width="60" height="190" rx="8"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2 opacity-40",
          getIntensityColor(getSymptomIntensity('back')),
          "hover:scale-105 transform-origin-center hover:opacity-60"
        )}
        onClick={() => handleZoomIn('back')}
      />

      {/* Left Leg - Clickable for zoom */}
      <rect
        x="120" y="340" width="25" height="180" rx="12"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2",
          getIntensityColor(getSymptomIntensity('left-leg')),
          "hover:scale-105 transform-origin-center"
        )}
        onClick={() => handleZoomIn('left-leg')}
      />
      <text x="132" y="440" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">L Leg</text>

      {/* Right Leg - Clickable for zoom */}
      <rect
        x="155" y="340" width="25" height="180" rx="12"
        className={cn(
          "cursor-pointer transition-all duration-300 stroke-2",
          getIntensityColor(getSymptomIntensity('right-leg')),
          "hover:scale-105 transform-origin-center"
        )}
        onClick={() => handleZoomIn('right-leg')}
      />
      <text x="167" y="440" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">R Leg</text>
    </svg>
  );

  const renderHeadZoom = () => (
    <svg width="400" height="500" viewBox="0 0 400 500" className="w-full h-auto">
      {/* Head outline */}
      <ellipse cx="200" cy="200" rx="120" ry="150" className="fill-gray-50 stroke-gray-300 stroke-2" />
      
      {/* Forehead */}
      <rect x="120" y="80" width="160" height="60" rx="30" 
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('forehead')))}
        onClick={(e) => handleBodyPartClick('forehead', 'Forehead', e)} />
      <text x="200" y="115" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Forehead</text>
      
      {/* Left Eye */}
      <ellipse cx="160" cy="180" rx="25" ry="15" 
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('left-eye')))}
        onClick={(e) => handleBodyPartClick('left-eye', 'Left Eye', e)} />
      <text x="160" y="210" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Left Eye</text>
      
      {/* Right Eye */}
      <ellipse cx="240" cy="180" rx="25" ry="15" 
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('right-eye')))}
        onClick={(e) => handleBodyPartClick('right-eye', 'Right Eye', e)} />
      <text x="240" y="210" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Right Eye</text>
      
      {/* Nose */}
      <polygon points="200,220 185,260 215,260" 
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('nose')))}
        onClick={(e) => handleBodyPartClick('nose', 'Nose', e)} />
      <text x="200" y="280" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Nose</text>
      
      {/* Mouth */}
      <ellipse cx="200" cy="300" rx="30" ry="15" 
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('mouth')))}
        onClick={(e) => handleBodyPartClick('mouth', 'Mouth', e)} />
      <text x="200" y="330" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Mouth</text>
      
      {/* Left Ear */}
      <ellipse cx="80" cy="200" rx="20" ry="35" 
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('left-ear')))}
        onClick={(e) => handleBodyPartClick('left-ear', 'Left Ear', e)} />
      <text x="80" y="250" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Left Ear</text>
      
      {/* Right Ear */}
      <ellipse cx="320" cy="200" rx="20" ry="35" 
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('right-ear')))}
        onClick={(e) => handleBodyPartClick('right-ear', 'Right Ear', e)} />
      <text x="320" y="250" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Right Ear</text>

      {/* Throat */}
      <rect x="185" y="350" width="30" height="40" rx="15"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('throat')))}
        onClick={(e) => handleBodyPartClick('throat', 'Throat', e)} />
      <text x="200" y="410" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Throat</text>
    </svg>
  );

  const renderChestZoom = () => (
    <svg width="400" height="400" viewBox="0 0 400 400" className="w-full h-auto">
      {/* Chest outline */}
      <rect x="50" y="50" width="300" height="300" rx="30" className="fill-gray-50 stroke-gray-300 stroke-2" />
      
      {/* Heart */}
      <path d="M 180 150 C 170 140, 150 140, 150 160 C 150 180, 180 220, 180 220 C 180 220, 210 180, 210 160 C 210 140, 190 140, 180 150 Z"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('heart')))}
        onClick={(e) => handleBodyPartClick('heart', 'Heart', e)} />
      <text x="180" y="250" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Heart</text>
      
      {/* Left Lung */}
      <ellipse cx="120" cy="180" rx="40" ry="80"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('left-lung')))}
        onClick={(e) => handleBodyPartClick('left-lung', 'Left Lung', e)} />
      <text x="120" y="270" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Left Lung</text>
      
      {/* Right Lung */}
      <ellipse cx="280" cy="180" rx="40" ry="80"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity('right-lung')))}
        onClick={(e) => handleBodyPartClick('right-lung', 'Right Lung', e)} />
      <text x="280" y="270" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Right Lung</text>
      
      {/* Upper Chest */}
      <rect x="80" y="80" width="240" height="60" rx="15"
        className={cn("cursor-pointer transition-all duration-200 stroke-2 opacity-60", getIntensityColor(getSymptomIntensity('upper-chest')))}
        onClick={(e) => handleBodyPartClick('upper-chest', 'Upper Chest', e)} />
      <text x="200" y="115" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Upper Chest</text>
      
      {/* Ribs */}
      <rect x="80" y="280" width="240" height="40" rx="15"
        className={cn("cursor-pointer transition-all duration-200 stroke-2 opacity-60", getIntensityColor(getSymptomIntensity('ribs')))}
        onClick={(e) => handleBodyPartClick('ribs', 'Ribs', e)} />
      <text x="200" y="305" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Ribs</text>
    </svg>
  );

  const renderArmZoom = (side: 'left' | 'right') => (
    <svg width="200" height="600" viewBox="0 0 200 600" className="w-full h-auto">
      {/* Shoulder */}
      <ellipse cx="100" cy="80" rx="50" ry="30"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-shoulder`)))}
        onClick={(e) => handleBodyPartClick(`${side}-shoulder`, `${side === 'left' ? 'Left' : 'Right'} Shoulder`, e)} />
      <text x="100" y="120" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Shoulder</text>
      
      {/* Upper Arm */}
      <rect x="75" y="110" width="50" height="120" rx="25"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-upper-arm`)))}
        onClick={(e) => handleBodyPartClick(`${side}-upper-arm`, `${side === 'left' ? 'Left' : 'Right'} Upper Arm`, e)} />
      <text x="100" y="175" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Upper Arm</text>
      
      {/* Elbow */}
      <circle cx="100" cy="250" r="25"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-elbow`)))}
        onClick={(e) => handleBodyPartClick(`${side}-elbow`, `${side === 'left' ? 'Left' : 'Right'} Elbow`, e)} />
      <text x="100" y="290" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Elbow</text>
      
      {/* Forearm */}
      <rect x="75" y="275" width="50" height="120" rx="25"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-forearm`)))}
        onClick={(e) => handleBodyPartClick(`${side}-forearm`, `${side === 'left' ? 'Left' : 'Right'} Forearm`, e)} />
      <text x="100" y="340" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Forearm</text>
      
      {/* Wrist */}
      <ellipse cx="100" cy="410" rx="20" ry="15"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-wrist`)))}
        onClick={(e) => handleBodyPartClick(`${side}-wrist`, `${side === 'left' ? 'Left' : 'Right'} Wrist`, e)} />
      <text x="100" y="440" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Wrist</text>
      
      {/* Hand - Clickable for zoom */}
      <ellipse cx="100" cy="480" rx="30" ry="50"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-hand`)), "hover:scale-105")}
        onClick={() => handleZoomIn(`${side}-hand` as ZoomLevel)} />
      <text x="100" y="550" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Hand (Click to zoom)</text>
    </svg>
  );

  const renderHandZoom = (side: 'left' | 'right') => (
    <svg width="300" height="400" viewBox="0 0 300 400" className="w-full h-auto">
      {/* Palm */}
      <rect x="100" y="200" width="100" height="150" rx="20"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-palm`)))}
        onClick={(e) => handleBodyPartClick(`${side}-palm`, `${side === 'left' ? 'Left' : 'Right'} Palm`, e)} />
      <text x="150" y="280" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Palm</text>
      
      {/* Fingers */}
      <rect x="110" y="50" width="20" height="160" rx="10"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-thumb`)))}
        onClick={(e) => handleBodyPartClick(`${side}-thumb`, `${side === 'left' ? 'Left' : 'Right'} Thumb`, e)} />
      <text x="120" y="40" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Thumb</text>
      
      <rect x="140" y="30" width="18" height="180" rx="9"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-index`)))}
        onClick={(e) => handleBodyPartClick(`${side}-index`, `${side === 'left' ? 'Left' : 'Right'} Index`, e)} />
      <text x="149" y="20" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Index</text>
      
      <rect x="165" y="20" width="18" height="190" rx="9"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-middle`)))}
        onClick={(e) => handleBodyPartClick(`${side}-middle`, `${side === 'left' ? 'Left' : 'Right'} Middle`, e)} />
      <text x="174" y="10" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Middle</text>
      
      <rect x="190" y="30" width="18" height="180" rx="9"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-ring`)))}
        onClick={(e) => handleBodyPartClick(`${side}-ring`, `${side === 'left' ? 'Left' : 'Right'} Ring`, e)} />
      <text x="199" y="20" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Ring</text>
      
      <rect x="215" y="50" width="16" height="160" rx="8"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-pinky`)))}
        onClick={(e) => handleBodyPartClick(`${side}-pinky`, `${side === 'left' ? 'Left' : 'Right'} Pinky`, e)} />
      <text x="223" y="40" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Pinky</text>
    </svg>
  );

  const renderLegZoom = (side: 'left' | 'right') => (
    <svg width="200" height="700" viewBox="0 0 200 700" className="w-full h-auto">
      {/* Hip */}
      <circle cx="100" cy="80" r="30"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-hip`)))}
        onClick={(e) => handleBodyPartClick(`${side}-hip`, `${side === 'left' ? 'Left' : 'Right'} Hip`, e)} />
      <text x="100" y="125" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Hip</text>
      
      {/* Thigh */}
      <rect x="75" y="110" width="50" height="150" rx="25"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-thigh`)))}
        onClick={(e) => handleBodyPartClick(`${side}-thigh`, `${side === 'left' ? 'Left' : 'Right'} Thigh`, e)} />
      <text x="100" y="190" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Thigh</text>
      
      {/* Knee */}
      <ellipse cx="100" cy="280" rx="35" ry="25"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-knee`)))}
        onClick={(e) => handleBodyPartClick(`${side}-knee`, `${side === 'left' ? 'Left' : 'Right'} Knee`, e)} />
      <text x="100" y="320" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Knee</text>
      
      {/* Calf */}
      <rect x="75" y="305" width="50" height="120" rx="25"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-calf`)))}
        onClick={(e) => handleBodyPartClick(`${side}-calf`, `${side === 'left' ? 'Left' : 'Right'} Calf`, e)} />
      <text x="100" y="370" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Calf</text>
      
      {/* Shin */}
      <rect x="85" y="305" width="30" height="120" rx="15"
        className={cn("cursor-pointer transition-all duration-200 stroke-2 opacity-60", getIntensityColor(getSymptomIntensity(`${side}-shin`)))}
        onClick={(e) => handleBodyPartClick(`${side}-shin`, `${side === 'left' ? 'Left' : 'Right'} Shin`, e)} />
      
      {/* Ankle */}
      <ellipse cx="100" cy="450" rx="25" ry="20"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-ankle`)))}
        onClick={(e) => handleBodyPartClick(`${side}-ankle`, `${side === 'left' ? 'Left' : 'Right'} Ankle`, e)} />
      <text x="100" y="485" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Ankle</text>
      
      {/* Foot - Clickable for zoom */}
      <ellipse cx="100" cy="550" rx="30" ry="60"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-foot`)), "hover:scale-105")}
        onClick={() => handleZoomIn(`${side}-foot` as ZoomLevel)} />
      <text x="100" y="630" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Foot (Click to zoom)</text>
    </svg>
  );

  const renderFootZoom = (side: 'left' | 'right') => (
    <svg width="200" height="350" viewBox="0 0 200 350" className="w-full h-auto">
      {/* Foot outline */}
      <ellipse cx="100" cy="200" rx="60" ry="120" className="fill-gray-50 stroke-gray-300 stroke-2" />
      
      {/* Big Toe */}
      <circle cx="100" cy="80" r="15"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-big-toe`)))}
        onClick={(e) => handleBodyPartClick(`${side}-big-toe`, `${side === 'left' ? 'Left' : 'Right'} Big Toe`, e)} />
      <text x="100" y="60" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Big Toe</text>
      
      {/* Other Toes */}
      <circle cx="80" cy="70" r="10"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-toes`)))}
        onClick={(e) => handleBodyPartClick(`${side}-toes`, `${side === 'left' ? 'Left' : 'Right'} Toes`, e)} />
      <circle cx="120" cy="70" r="10"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-toes`)))}
        onClick={(e) => handleBodyPartClick(`${side}-toes`, `${side === 'left' ? 'Left' : 'Right'} Toes`, e)} />
      <text x="100" y="50" textAnchor="middle" className="text-xs fill-gray-700 pointer-events-none">Toes</text>
      
      {/* Arch */}
      <ellipse cx="100" cy="180" rx="40" ry="30"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-arch`)))}
        onClick={(e) => handleBodyPartClick(`${side}-arch`, `${side === 'left' ? 'Left' : 'Right'} Arch`, e)} />
      <text x="100" y="185" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Arch</text>
      
      {/* Heel */}
      <circle cx="100" cy="280" r="35"
        className={cn("cursor-pointer transition-all duration-200 stroke-2", getIntensityColor(getSymptomIntensity(`${side}-heel`)))}
        onClick={(e) => handleBodyPartClick(`${side}-heel`, `${side === 'left' ? 'Left' : 'Right'} Heel`, e)} />
      <text x="100" y="330" textAnchor="middle" className="text-sm fill-gray-700 pointer-events-none">Heel</text>
      
      {/* Sole */}
      <ellipse cx="100" cy="220" rx="35" ry="80"
        className={cn("cursor-pointer transition-all duration-200 stroke-2 opacity-40", getIntensityColor(getSymptomIntensity(`${side}-sole`)))}
        onClick={(e) => handleBodyPartClick(`${side}-sole`, `${side === 'left' ? 'Left' : 'Right'} Sole`, e)} />
    </svg>
  );

  const getCurrentView = () => {
    switch (currentZoom) {
      case 'overview': return renderOverview();
      case 'head': return renderHeadZoom();
      case 'chest': return renderChestZoom();
      case 'left-arm': return renderArmZoom('left');
      case 'right-arm': return renderArmZoom('right');
      case 'left-hand': return renderHandZoom('left');
      case 'right-hand': return renderHandZoom('right');
      case 'left-leg': return renderLegZoom('left');
      case 'right-leg': return renderLegZoom('right');
      case 'left-foot': return renderFootZoom('left');
      case 'right-foot': return renderFootZoom('right');
      default: return renderOverview();
    }
  };

  const getViewTitle = () => {
    switch (currentZoom) {
      case 'overview': return 'Body Overview';
      case 'head': return 'Head & Face';
      case 'chest': return 'Chest & Lungs';
      case 'left-arm': return 'Left Arm';
      case 'right-arm': return 'Right Arm';
      case 'left-hand': return 'Left Hand';
      case 'right-hand': return 'Right Hand';
      case 'left-leg': return 'Left Leg';
      case 'right-leg': return 'Right Leg';
      case 'left-foot': return 'Left Foot';
      case 'right-foot': return 'Right Foot';
      default: return 'Body Overview';
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getViewTitle()}</CardTitle>
          <div className="flex space-x-2">
            {currentZoom !== 'overview' && (
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentZoom !== 'overview' && (
              <Button variant="outline" size="sm" onClick={handleGoHome}>
                <Home className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {zoomHistory.map((level, index) => (
            <React.Fragment key={level}>
              {index > 0 && <span>→</span>}
              <span className={index === zoomHistory.length - 1 ? 'font-medium text-gray-900' : ''}>
                {level === 'overview' ? 'Body' : getViewTitle()}
              </span>
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex justify-center">
        <div className="transition-all duration-500 ease-in-out">
          {getCurrentView()}
        </div>
      </CardContent>

      <div className="px-6 pb-4">
        <p className="text-xs text-gray-500 text-center">
          {currentZoom === 'overview' 
            ? 'Click body parts to zoom in and explore detailed areas'
            : 'Click specific areas to log symptoms, or use navigation buttons above'
          }
        </p>
      </div>
    </Card>
  );
};

export default ZoomableBodyMap;