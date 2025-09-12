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

        {/* Left Temple */}
        <circle
          cx="125"
          cy="45"
          r="8"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('left-temple')),
            selectedBodyPart === 'left-temple' && "stroke-gray-800 stroke-2",
            hoveredPart === 'left-temple' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-temple', 'Left Temple', e)}
          onMouseEnter={() => setHoveredPart('left-temple')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Temple */}
        <circle
          cx="175"
          cy="45"
          r="8"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('right-temple')),
            selectedBodyPart === 'right-temple' && "stroke-gray-800 stroke-2",
            hoveredPart === 'right-temple' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-temple', 'Right Temple', e)}
          onMouseEnter={() => setHoveredPart('right-temple')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Eye */}
        <ellipse
          cx="135"
          cy="55"
          rx="8"
          ry="5"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('left-eye')),
            selectedBodyPart === 'left-eye' && "stroke-gray-800 stroke-2",
            hoveredPart === 'left-eye' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-eye', 'Left Eye', e)}
          onMouseEnter={() => setHoveredPart('left-eye')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Eye */}
        <ellipse
          cx="165"
          cy="55"
          rx="8"
          ry="5"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('right-eye')),
            selectedBodyPart === 'right-eye' && "stroke-gray-800 stroke-2",
            hoveredPart === 'right-eye' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-eye', 'Right Eye', e)}
          onMouseEnter={() => setHoveredPart('right-eye')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Ear */}
        <ellipse
          cx="105"
          cy="60"
          rx="8"
          ry="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('left-ear')),
            selectedBodyPart === 'left-ear' && "stroke-gray-800 stroke-2",
            hoveredPart === 'left-ear' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-ear', 'Left Ear', e)}
          onMouseEnter={() => setHoveredPart('left-ear')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Ear */}
        <ellipse
          cx="195"
          cy="60"
          rx="8"
          ry="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('right-ear')),
            selectedBodyPart === 'right-ear' && "stroke-gray-800 stroke-2",
            hoveredPart === 'right-ear' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-ear', 'Right Ear', e)}
          onMouseEnter={() => setHoveredPart('right-ear')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Nose */}
        <polygon
          points="150,65 145,80 155,80"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('nose')),
            selectedBodyPart === 'nose' && "stroke-gray-800 stroke-2",
            hoveredPart === 'nose' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('nose', 'Nose', e)}
          onMouseEnter={() => setHoveredPart('nose')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Mouth */}
        <ellipse
          cx="150"
          cy="85"
          rx="12"
          ry="6"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('mouth')),
            selectedBodyPart === 'mouth' && "stroke-gray-800 stroke-2",
            hoveredPart === 'mouth' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('mouth', 'Mouth', e)}
          onMouseEnter={() => setHoveredPart('mouth')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Throat */}
        <rect
          x="145"
          y="95"
          width="10"
          height="15"
          rx="5"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('throat')),
            selectedBodyPart === 'throat' && "stroke-gray-800 stroke-2",
            hoveredPart === 'throat' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('throat', 'Throat', e)}
          onMouseEnter={() => setHoveredPart('throat')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Neck */}
        <rect
          x="125"
          y="110"
          width="50"
          height="30"
          rx="15"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('neck')),
            selectedBodyPart === 'neck' && "stroke-gray-800 stroke-3",
            hoveredPart === 'neck' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('neck', 'Neck', e)}
          onMouseEnter={() => setHoveredPart('neck')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Shoulder */}
        <ellipse
          cx="92"
          cy="142"
          rx="18"
          ry="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('left-shoulder')),
            selectedBodyPart === 'left-shoulder' && "stroke-gray-800 stroke-3",
            hoveredPart === 'left-shoulder' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-shoulder', 'Left Shoulder', e)}
          onMouseEnter={() => setHoveredPart('left-shoulder')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Shoulder */}
        <ellipse
          cx="208"
          cy="142"
          rx="18"
          ry="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('right-shoulder')),
            selectedBodyPart === 'right-shoulder' && "stroke-gray-800 stroke-3",
            hoveredPart === 'right-shoulder' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-shoulder', 'Right Shoulder', e)}
          onMouseEnter={() => setHoveredPart('right-shoulder')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Chest */}
        <rect
          x="110"
          y="140"
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

        {/* Heart (inside chest) */}
        <path
          d="M 140 170 C 135 165, 125 165, 125 175 C 125 185, 140 200, 140 200 C 140 200, 155 185, 155 175 C 155 165, 145 165, 140 170 Z"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-red-400 stroke-1",
            getIntensityColor(getSymptomIntensity('heart')),
            selectedBodyPart === 'heart' && "stroke-red-600 stroke-2",
            hoveredPart === 'heart' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('heart', 'Heart', e)}
          onMouseEnter={() => setHoveredPart('heart')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Arm */}
        <rect
          x="60"
          y="155"
          width="25"
          height="120"
          rx="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('left-arm')),
            selectedBodyPart === 'left-arm' && "stroke-gray-800 stroke-3",
            hoveredPart === 'left-arm' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-arm', 'Left Arm', e)}
          onMouseEnter={() => setHoveredPart('left-arm')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Arm */}
        <rect
          x="215"
          y="155"
          width="25"
          height="120"
          rx="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('right-arm')),
            selectedBodyPart === 'right-arm' && "stroke-gray-800 stroke-3",
            hoveredPart === 'right-arm' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-arm', 'Right Arm', e)}
          onMouseEnter={() => setHoveredPart('right-arm')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Elbow */}
        <circle
          cx="72"
          cy="215"
          r="10"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('left-elbow')),
            selectedBodyPart === 'left-elbow' && "stroke-gray-800 stroke-2",
            hoveredPart === 'left-elbow' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-elbow', 'Left Elbow', e)}
          onMouseEnter={() => setHoveredPart('left-elbow')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Elbow */}
        <circle
          cx="228"
          cy="215"
          r="10"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('right-elbow')),
            selectedBodyPart === 'right-elbow' && "stroke-gray-800 stroke-2",
            hoveredPart === 'right-elbow' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-elbow', 'Right Elbow', e)}
          onMouseEnter={() => setHoveredPart('right-elbow')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Wrist */}
        <ellipse
          cx="72"
          cy="285"
          rx="8"
          ry="5"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('left-wrist')),
            selectedBodyPart === 'left-wrist' && "stroke-gray-800 stroke-2",
            hoveredPart === 'left-wrist' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-wrist', 'Left Wrist', e)}
          onMouseEnter={() => setHoveredPart('left-wrist')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Wrist */}
        <ellipse
          cx="228"
          cy="285"
          rx="8"
          ry="5"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('right-wrist')),
            selectedBodyPart === 'right-wrist' && "stroke-gray-800 stroke-2",
            hoveredPart === 'right-wrist' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-wrist', 'Right Wrist', e)}
          onMouseEnter={() => setHoveredPart('right-wrist')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Hand */}
        <ellipse
          cx="72"
          cy="305"
          rx="12"
          ry="18"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('left-hand')),
            selectedBodyPart === 'left-hand' && "stroke-gray-800 stroke-3",
            hoveredPart === 'left-hand' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-hand', 'Left Hand', e)}
          onMouseEnter={() => setHoveredPart('left-hand')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Hand */}
        <ellipse
          cx="228"
          cy="305"
          rx="12"
          ry="18"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('right-hand')),
            selectedBodyPart === 'right-hand' && "stroke-gray-800 stroke-3",
            hoveredPart === 'right-hand' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-hand', 'Right Hand', e)}
          onMouseEnter={() => setHoveredPart('right-hand')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Abdomen */}
        <rect
          x="115"
          y="250"
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
          height="190"
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

        {/* Left Hip */}
        <circle
          cx="125"
          cy="340"
          r="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('left-hip')),
            selectedBodyPart === 'left-hip' && "stroke-gray-800 stroke-2",
            hoveredPart === 'left-hip' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-hip', 'Left Hip', e)}
          onMouseEnter={() => setHoveredPart('left-hip')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Hip */}
        <circle
          cx="175"
          cy="340"
          r="12"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('right-hip')),
            selectedBodyPart === 'right-hip' && "stroke-gray-800 stroke-2",
            hoveredPart === 'right-hip' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-hip', 'Right Hip', e)}
          onMouseEnter={() => setHoveredPart('right-hip')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Leg */}
        <rect
          x="120"
          y="355"
          width="25"
          height="140"
          rx="12"
          className="fill-gray-100 stroke-gray-400 stroke-2"
        />

        {/* Right Leg */}
        <rect
          x="155"
          y="355"
          width="25"
          height="140"
          rx="12"
          className="fill-gray-100 stroke-gray-400 stroke-2"
        />

        {/* Left Knee */}
        <ellipse
          cx="132"
          cy="420"
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
          cy="420"
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

        {/* Left Ankle */}
        <ellipse
          cx="132"
          cy="510"
          rx="10"
          ry="8"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('left-ankle')),
            selectedBodyPart === 'left-ankle' && "stroke-gray-800 stroke-2",
            hoveredPart === 'left-ankle' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-ankle', 'Left Ankle', e)}
          onMouseEnter={() => setHoveredPart('left-ankle')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Ankle */}
        <ellipse
          cx="168"
          cy="510"
          rx="10"
          ry="8"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-1",
            getIntensityColor(getSymptomIntensity('right-ankle')),
            selectedBodyPart === 'right-ankle' && "stroke-gray-800 stroke-2",
            hoveredPart === 'right-ankle' && "scale-110 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-ankle', 'Right Ankle', e)}
          onMouseEnter={() => setHoveredPart('right-ankle')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Left Foot */}
        <ellipse
          cx="132"
          cy="540"
          rx="12"
          ry="20"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('left-foot')),
            selectedBodyPart === 'left-foot' && "stroke-gray-800 stroke-3",
            hoveredPart === 'left-foot' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('left-foot', 'Left Foot', e)}
          onMouseEnter={() => setHoveredPart('left-foot')}
          onMouseLeave={() => setHoveredPart(null)}
        />

        {/* Right Foot */}
        <ellipse
          cx="168"
          cy="540"
          rx="12"
          ry="20"
          className={cn(
            "cursor-pointer transition-all duration-200 stroke-gray-400 stroke-2",
            getIntensityColor(getSymptomIntensity('right-foot')),
            selectedBodyPart === 'right-foot' && "stroke-gray-800 stroke-3",
            hoveredPart === 'right-foot' && "scale-105 transform-origin-center"
          )}
          onClick={(e) => handleBodyPartClick('right-foot', 'Right Foot', e)}
          onMouseEnter={() => setHoveredPart('right-foot')}
          onMouseLeave={() => setHoveredPart(null)}
        />

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
          Click to log symptoms for {hoveredPart.replace('-', ' ')}
        </div>
      )}
    </div>
  );
};

export default BodyMap;