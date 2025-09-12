import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Symptom } from '@/types/health';

interface BodyMapProps {
  onBodyPartClick: (bodyPartId: string, bodyPartName: string, coordinates: { x: number; y: number }) => void;
  symptoms: Symptom[];
  selectedBodyPart?: string;
  className?: string;
}

const BodyMap: React.FC<BodyMapProps> = ({
  onBodyPartClick,
  symptoms,
  selectedBodyPart,
  className
}) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const getSymptomIntensity = (bodyPartId: string): number => {
    const recentSymptoms = symptoms
      .filter(s => s.bodyPartId === bodyPartId)
      .filter(s => {
        const daysDiff = (Date.now() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7; // Last 7 days
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

  const handleBodyPartClick = (bodyPartId: string, bodyPartName: string, event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const svg = event.currentTarget.closest('svg');
    if (!svg) return;
    
    const svgRect = svg.getBoundingClientRect();
    const coordinates = {
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top
    };
    
    onBodyPartClick(bodyPartId, bodyPartName, coordinates);
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <svg
        width="300"
        height="600"
        viewBox="0 0 300 600"
        className="max-w-full h-auto"
      >
        {/* Head */}
        <ellipse
          cx="150"
          cy="60"
          rx="35"
          ry="45"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('head')),
            selectedBodyPart === 'head' && "stroke-gray-800 stroke-3",
            hoveredPart === 'head' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('head', 'Head', e)}
          onMouseEnter={() => setHoveredPart('head')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Chest */}
        <rect
          x="110"
          y="120"
          width="80"
          height="100"
          rx="15"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('chest')),
            selectedBodyPart === 'chest' && "stroke-gray-800 stroke-3",
            hoveredPart === 'chest' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('chest', 'Chest', e)}
          onMouseEnter={() => setHoveredPart('chest')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Abdomen */}
        <rect
          x="115"
          y="230"
          width="70"
          height="80"
          rx="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('abdomen')),
            selectedBodyPart === 'abdomen' && "stroke-gray-800 stroke-3",
            hoveredPart === 'abdomen' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('abdomen', 'Abdomen', e)}
          onMouseEnter={() => setHoveredPart('abdomen')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Back (simplified representation) */}
        <rect
          x="120"
          y="140"
          width="60"
          height="140"
          rx="8"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2 opacity-60",
            getIntensityColor(getSymptomIntensity('back')),
            selectedBodyPart === 'back' && "stroke-gray-800 stroke-3 opacity-100",
            hoveredPart === 'back' && "scale-105 transform-origin-center opacity-80"
          )}
          onClick={(e) => handleBodyPartClick('back', 'Back', e)}
          onMouseEnter={() => setHoveredPart('back')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Leg */}
        <rect
          x="120"
          y="320"
          width="25"
          height="120"
          rx="12"
          className="fill-gray-100 stroke-gray-400 stroke-2"
        />

        {/* Right Leg */}
        <rect
          x="155"
          y="320"
          width="25"
          height="120"
          rx="12"
          className="fill-gray-100 stroke-gray-400 stroke-2"
        />

        {/* Left Knee */}
        <ellipse
          cx="132"
          cy="380"
          rx="18"
          ry="25"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('left-knee')),
            selectedBodyPart === 'left-knee' && "stroke-gray-800 stroke-3",
            hoveredPart === 'left-knee' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-knee', 'Left Knee', e)}
          onMouseEnter={() => setHoveredPart('left-knee')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Knee */}
        <ellipse
          cx="168"
          cy="380"
          rx="18"
          ry="25"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('right-knee')),
            selectedBodyPart === 'right-knee' && "stroke-gray-800 stroke-3",
            hoveredPart === 'right-knee' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-knee', 'Right Knee', e)}
          onMouseEnter={() => setHoveredPart('right-knee')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Arms */}
        <rect x="75" y="130" width="20" height="100" rx="10" className="fill-gray-100 stroke-gray-400 stroke-2" />
        <rect x="205" y="130" width="20" height="100" rx="10" className="fill-gray-100 stroke-gray-400 stroke-2" />

        {/* Symptom indicators */}
        {symptoms.map((symptom) => (
          symptom.coordinates && (
            <circle
              key={symptom.id}
              cx={symptom.coordinates.x}
              cy={symptom.coordinates.y}
              r="4"
              className={cn(
                "animate-pulse",
                symptom.intensity <= 3 ? "fill-green-500" :
                symptom.intensity <= 6 ? "fill-yellow-500" :
                symptom.intensity <= 8 ? "fill-orange-500" : "fill-red-500"
              )}
            />
          )
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredPart && (
        <div className="absolute pointer-events-none bg-gray-900 text-white px-2 py-1 rounded text-sm z-10">
          Click to log symptoms
        </div>
      )}
    </div>
  );
};

export default BodyMap;