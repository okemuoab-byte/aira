import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Symptom, BodyPart } from '@/types/health';
import { bodyParts } from '@/data/bodyParts';

interface BodyMapZoomProps {
  onBodyPartClick: (bodyPartId: string, bodyPartName: string, coordinates: { x: number; y: number }) => void;
  symptoms: Symptom[];
  selectedBodyPart?: string;
  className?: string;
}

const BodyMapZoom: React.FC<BodyMapZoomProps> = ({
  onBodyPartClick,
  symptoms,
  selectedBodyPart,
  className
}) => {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [zoomHistory, setZoomHistory] = useState<string[]>(['overview']);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const getCurrentBodyParts = (): BodyPart[] => {
    if (currentView === 'overview') {
      return bodyParts.filter(bp => bp.zoomLevel === 'overview');
    }
    
    const currentPart = bodyParts.find(bp => bp.id === currentView);
    if (currentPart?.children) {
      return bodyParts.filter(bp => currentPart.children!.includes(bp.id));
    }
    
    return bodyParts.filter(bp => bp.parentId === currentView);
  };

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
    if (intensity === 0) return 'fill-gray-100 hover:fill-gray-200';
    if (intensity <= 3) return 'fill-green-200 hover:fill-green-300';
    if (intensity <= 6) return 'fill-yellow-200 hover:fill-yellow-300';
    if (intensity <= 8) return 'fill-orange-300 hover:fill-orange-400';
    return 'fill-red-400 hover:fill-red-500';
  };

  const handleBodyPartClick = (bodyPart: BodyPart, event: React.MouseEvent) => {
    if (bodyPart.children && bodyPart.children.length > 0) {
      // Zoom into this body part
      setCurrentView(bodyPart.id);
      setZoomHistory(prev => [...prev, bodyPart.id]);
    } else {
      // Log symptom for this body part
      const coordinates = { x: event.clientX, y: event.clientY };
      onBodyPartClick(bodyPart.id, bodyPart.name, coordinates);
    }
  };

  const goBack = () => {
    if (zoomHistory.length > 1) {
      const newHistory = zoomHistory.slice(0, -1);
      setZoomHistory(newHistory);
      setCurrentView(newHistory[newHistory.length - 1]);
    }
  };

  const renderOverviewBody = () => (
    <svg width="300" height="600" viewBox="0 0 300 600" className="max-w-full h-auto">
      {/* Head */}
      <ellipse
        cx="150" cy="60" rx="35" ry="45"
        className={cn(
          "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
          getIntensityColor(getSymptomIntensity('head')),
          selectedBodyPart === 'head' && "stroke-gray-800 stroke-3",
          hoveredPart === 'head' && "scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'head')!, e)}
        onMouseEnter={() => setHoveredPart('head')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* Neck */}
      <rect
        x="125" y="110" width="50" height="30" rx="15"
        className={cn(
          "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
          getIntensityColor(getSymptomIntensity('neck')),
          hoveredPart === 'neck' && "scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'neck')!, e)}
        onMouseEnter={() => setHoveredPart('neck')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* Chest */}
      <rect
        x="110" y="140" width="80" height="100" rx="15"
        className={cn(
          "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
          getIntensityColor(getSymptomIntensity('chest')),
          hoveredPart === 'chest' && "scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'chest')!, e)}
        onMouseEnter={() => setHoveredPart('chest')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* Arms */}
      <rect
        x="60" y="140" width="40" height="200" rx="20"
        className={cn(
          "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
          getIntensityColor(getSymptomIntensity('left-arm')),
          hoveredPart === 'left-arm' && "scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'left-arm')!, e)}
        onMouseEnter={() => setHoveredPart('left-arm')}
        onMouseLeave={() => setHoveredPart(null)}
      />
      
      <rect
        x="200" y="140" width="40" height="200" rx="20"
        className={cn(
          "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
          getIntensityColor(getSymptomIntensity('right-arm')),
          hoveredPart === 'right-arm' && "scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'right-arm')!, e)}
        onMouseEnter={() => setHoveredPart('right-arm')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* Abdomen */}
      <rect
        x="115" y="250" width="70" height="80" rx="12"
        className={cn(
          "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
          getIntensityColor(getSymptomIntensity('abdomen')),
          hoveredPart === 'abdomen' && "scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'abdomen')!, e)}
        onMouseEnter={() => setHoveredPart('abdomen')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* Legs */}
      <rect
        x="120" y="340" width="30" height="200" rx="15"
        className={cn(
          "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
          getIntensityColor(getSymptomIntensity('left-leg')),
          hoveredPart === 'left-leg' && "scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'left-leg')!, e)}
        onMouseEnter={() => setHoveredPart('left-leg')}
        onMouseLeave={() => setHoveredPart(null)}
      />
      
      <rect
        x="150" y="340" width="30" height="200" rx="15"
        className={cn(
          "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
          getIntensityColor(getSymptomIntensity('right-leg')),
          hoveredPart === 'right-leg' && "scale-105 transform-origin-center"
        )}
        onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'right-leg')!, e)}
        onMouseEnter={() => setHoveredPart('right-leg')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* Zoom indicators */}
      {getCurrentBodyParts().filter(bp => bp.children && bp.children.length > 0).map(bodyPart => (
        <g key={`zoom-${bodyPart.id}`}>
          <circle
            cx={bodyPart.coordinates?.x ? bodyPart.coordinates.x + bodyPart.coordinates.width - 10 : 0}
            cy={bodyPart.coordinates?.y ? bodyPart.coordinates.y + 10 : 0}
            r="8"
            className="fill-blue-500 opacity-75"
          />
          <ZoomIn 
            className="h-3 w-3 text-white"
            x={bodyPart.coordinates?.x ? bodyPart.coordinates.x + bodyPart.coordinates.width - 16 : 0}
            y={bodyPart.coordinates?.y ? bodyPart.coordinates.y + 4 : 0}
          />
        </g>
      ))}
    </svg>
  );

  const renderDetailedView = () => {
    const currentPart = bodyParts.find(bp => bp.id === currentView);
    const childParts = getCurrentBodyParts();

    if (currentView === 'head') {
      return (
        <svg width="400" height="500" viewBox="0 0 400 500" className="max-w-full h-auto">
          {/* Head outline */}
          <ellipse cx="200" cy="200" rx="120" ry="150" className="fill-gray-50 stroke-gray-300 stroke-2" />
          
          {/* Forehead */}
          <rect x="120" y="80" width="160" height="60" rx="30" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity('forehead')))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'forehead')!, e)} />
          
          {/* Eyes */}
          <ellipse cx="160" cy="180" rx="25" ry="15" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity('left-eye')))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'left-eye')!, e)} />
          <ellipse cx="240" cy="180" rx="25" ry="15" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity('right-eye')))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'right-eye')!, e)} />
          
          {/* Nose */}
          <polygon points="200,200 185,240 215,240" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity('nose')))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'nose')!, e)} />
          
          {/* Mouth */}
          <ellipse cx="200" cy="280" rx="30" ry="15" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity('mouth')))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'mouth')!, e)} />
          
          {/* Ears */}
          <ellipse cx="100" cy="200" rx="20" ry="35" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity('left-ear')))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'left-ear')!, e)} />
          <ellipse cx="300" cy="200" rx="20" ry="35" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity('right-ear')))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === 'right-ear')!, e)} />
        </svg>
      );
    }

    if (currentView === 'left-hand' || currentView === 'right-hand') {
      return (
        <svg width="300" height="400" viewBox="0 0 300 400" className="max-w-full h-auto">
          {/* Hand outline */}
          <rect x="100" y="200" width="100" height="150" rx="20" className="fill-gray-50 stroke-gray-300 stroke-2" />
          
          {/* Fingers */}
          <rect x="110" y="50" width="20" height="160" rx="10" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-thumb`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-thumb`)!, e)} />
          <rect x="140" y="30" width="18" height="180" rx="9" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-index`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-index`)!, e)} />
          <rect x="165" y="20" width="18" height="190" rx="9" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-middle`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-middle`)!, e)} />
          <rect x="190" y="30" width="18" height="180" rx="9" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-ring`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-ring`)!, e)} />
          <rect x="215" y="50" width="16" height="160" rx="8" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-pinky`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-pinky`)!, e)} />
        </svg>
      );
    }

    if (currentView === 'left-foot' || currentView === 'right-foot') {
      return (
        <svg width="200" height="350" viewBox="0 0 200 350" className="max-w-full h-auto">
          {/* Foot outline */}
          <ellipse cx="100" cy="200" rx="60" ry="120" className="fill-gray-50 stroke-gray-300 stroke-2" />
          
          {/* Toes */}
          <circle cx="100" cy="80" r="15" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-big-toe`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-big-toe`)!, e)} />
          <circle cx="80" cy="70" r="10" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-toes`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-toes`)!, e)} />
          <circle cx="120" cy="70" r="10" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-toes`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-toes`)!, e)} />
          
          {/* Arch */}
          <ellipse cx="100" cy="180" rx="40" ry="30" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-arch`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-arch`)!, e)} />
          
          {/* Heel */}
          <circle cx="100" cy="280" r="35" 
            className={cn("cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2", getIntensityColor(getSymptomIntensity(`${currentView.split('-')[0]}-heel`)))}
            onClick={(e) => handleBodyPartClick(bodyParts.find(bp => bp.id === `${currentView.split('-')[0]}-heel`)!, e)} />
        </svg>
      );
    }

    return <div className="text-center py-8">Detailed view for {currentPart?.name} coming soon...</div>;
  };

  const getCurrentTitle = () => {
    if (currentView === 'overview') return 'Body Overview';
    const currentPart = bodyParts.find(bp => bp.id === currentView);
    return currentPart?.name || 'Detailed View';
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{getCurrentTitle()}</CardTitle>
          {currentView !== 'overview' && (
            <Button variant="outline" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {zoomHistory.map((viewId, index) => (
            <React.Fragment key={viewId}>
              {index > 0 && <span>→</span>}
              <span className={index === zoomHistory.length - 1 ? 'font-medium text-gray-900' : ''}>
                {viewId === 'overview' ? 'Body' : bodyParts.find(bp => bp.id === viewId)?.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex justify-center">
        {currentView === 'overview' ? renderOverviewBody() : renderDetailedView()}
      </CardContent>

      {/* Instructions */}
      <div className="px-6 pb-4">
        <p className="text-xs text-gray-500 text-center">
          {currentView === 'overview' 
            ? 'Click body parts to zoom in or log symptoms. Blue dots indicate zoomable areas.'
            : 'Click specific areas to log symptoms, or use Back to return to overview.'
          }
        </p>
      </div>
    </Card>
  );
};

export default BodyMapZoom;