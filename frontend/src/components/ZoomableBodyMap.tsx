import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
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
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

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

  const getIntensityGradient = (intensity: number): string => {
    if (intensity === 0) return 'url(#healthyGradient)';
    if (intensity <= 3) return 'url(#mildGradient)';
    if (intensity <= 6) return 'url(#moderateGradient)';
    if (intensity <= 8) return 'url(#strongGradient)';
    return 'url(#severeGradient)';
  };

  const getGlowEffect = (intensity: number): string => {
    if (intensity === 0) return '';
    if (intensity <= 3) return 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))';
    if (intensity <= 6) return 'drop-shadow(0 0 12px rgba(234, 179, 8, 0.5))';
    if (intensity <= 8) return 'drop-shadow(0 0 16px rgba(249, 115, 22, 0.6))';
    return 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.7))';
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

  const renderGradientDefinitions = () => (
    <defs>
      {/* Healthy gradient */}
      <linearGradient id="healthyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f0f9ff" />
        <stop offset="50%" stopColor="#e0f2fe" />
        <stop offset="100%" stopColor="#bae6fd" />
      </linearGradient>
      
      {/* Mild symptoms gradient */}
      <linearGradient id="mildGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dcfce7" />
        <stop offset="50%" stopColor="#bbf7d0" />
        <stop offset="100%" stopColor="#86efac" />
      </linearGradient>
      
      {/* Moderate symptoms gradient */}
      <linearGradient id="moderateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="50%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#fcd34d" />
      </linearGradient>
      
      {/* Strong symptoms gradient */}
      <linearGradient id="strongGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="50%" stopColor="#fdba74" />
        <stop offset="100%" stopColor="#fb923c" />
      </linearGradient>
      
      {/* Severe symptoms gradient */}
      <linearGradient id="severeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fecaca" />
        <stop offset="50%" stopColor="#fca5a5" />
        <stop offset="100%" stopColor="#f87171" />
      </linearGradient>

      {/* Glow filters */}
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      {/* Pulse animation */}
      <filter id="pulse" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  );

  const renderOverview = () => (
    <svg width="320" height="640" viewBox="0 0 320 640" className="w-full h-auto">
      {renderGradientDefinitions()}
      
      {/* Background with subtle pattern */}
      <rect width="320" height="640" fill="url(#backgroundPattern)" opacity="0.02" />
      
      {/* Head - Premium design */}
      <g className="cursor-pointer transition-all duration-500 ease-out hover:scale-105" 
         onClick={() => handleZoomIn('head')}
         onMouseEnter={() => setHoveredPart('head')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="160" cy="70" rx="42" ry="52" 
          fill={getIntensityGradient(getSymptomIntensity('head'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="2"
          filter={getGlowEffect(getSymptomIntensity('head')) ? "url(#softGlow)" : ""}
          style={{ filter: getGlowEffect(getSymptomIntensity('head')) }}
        />
        <text x="160" y="78" textAnchor="middle" 
          className="text-sm font-medium fill-slate-700 pointer-events-none select-none">
          Head
        </text>
        {hoveredPart === 'head' && (
          <circle cx="200" cy="50" r="8" fill="rgba(59, 130, 246, 0.8)" className="animate-pulse">
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
          </circle>
        )}
      </g>

      {/* Neck - Elegant transition */}
      <g className="cursor-pointer transition-all duration-300 hover:scale-105"
         onClick={(e) => handleBodyPartClick('neck', 'Neck', e)}
         onMouseEnter={() => setHoveredPart('neck')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="135" y="125" width="50" height="35" rx="18" 
          fill={getIntensityGradient(getSymptomIntensity('neck'))}
          stroke="rgba(59, 130, 246, 0.2)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('neck')) }}
        />
        <text x="160" y="145" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Neck
        </text>
      </g>

      {/* Shoulders - Sophisticated curves */}
      <g className="cursor-pointer transition-all duration-400 hover:scale-105"
         onClick={(e) => handleBodyPartClick('left-shoulder', 'Left Shoulder', e)}
         onMouseEnter={() => setHoveredPart('left-shoulder')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="102" cy="155" rx="22" ry="16" 
          fill={getIntensityGradient(getSymptomIntensity('left-shoulder'))}
          stroke="rgba(59, 130, 246, 0.25)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-shoulder')) }}
        />
        <text x="102" y="160" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          L
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-400 hover:scale-105"
         onClick={(e) => handleBodyPartClick('right-shoulder', 'Right Shoulder', e)}
         onMouseEnter={() => setHoveredPart('right-shoulder')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="218" cy="155" rx="22" ry="16" 
          fill={getIntensityGradient(getSymptomIntensity('right-shoulder'))}
          stroke="rgba(59, 130, 246, 0.25)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-shoulder')) }}
        />
        <text x="218" y="160" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          R
        </text>
      </g>

      {/* Chest - Beautiful anatomical accuracy */}
      <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
         onClick={() => handleZoomIn('chest')}
         onMouseEnter={() => setHoveredPart('chest')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="120" y="160" width="80" height="110" rx="20" 
          fill={getIntensityGradient(getSymptomIntensity('chest'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="2"
          style={{ filter: getGlowEffect(getSymptomIntensity('chest')) }}
        />
        <text x="160" y="220" textAnchor="middle" 
          className="text-sm font-medium fill-slate-700 pointer-events-none">
          Chest
        </text>
        {hoveredPart === 'chest' && (
          <circle cx="185" cy="180" r="6" fill="rgba(59, 130, 246, 0.8)" className="animate-pulse">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        )}
      </g>

      {/* Arms - Fluid design */}
      <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
         onClick={() => handleZoomIn('left-arm')}
         onMouseEnter={() => setHoveredPart('left-arm')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="70" y="175" width="28" height="130" rx="14" 
          fill={getIntensityGradient(getSymptomIntensity('left-arm'))}
          stroke="rgba(59, 130, 246, 0.25)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-arm')) }}
        />
        <text x="84" y="245" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none"
          transform="rotate(-90 84 245)">
          Left Arm
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
         onClick={() => handleZoomIn('right-arm')}
         onMouseEnter={() => setHoveredPart('right-arm')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="222" y="175" width="28" height="130" rx="14" 
          fill={getIntensityGradient(getSymptomIntensity('right-arm'))}
          stroke="rgba(59, 130, 246, 0.25)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-arm')) }}
        />
        <text x="236" y="245" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none"
          transform="rotate(90 236 245)">
          Right Arm
        </text>
      </g>

      {/* Hands - Delicate detail */}
      <g className="cursor-pointer transition-all duration-400 hover:scale-110" 
         onClick={() => handleZoomIn('left-hand')}
         onMouseEnter={() => setHoveredPart('left-hand')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="84" cy="325" rx="16" ry="22" 
          fill={getIntensityGradient(getSymptomIntensity('left-hand'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-hand')) }}
        />
        <text x="84" y="330" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Hand
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-400 hover:scale-110" 
         onClick={() => handleZoomIn('right-hand')}
         onMouseEnter={() => setHoveredPart('right-hand')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="236" cy="325" rx="16" ry="22" 
          fill={getIntensityGradient(getSymptomIntensity('right-hand'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-hand')) }}
        />
        <text x="236" y="330" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Hand
        </text>
      </g>

      {/* Abdomen - Organic curves */}
      <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
         onClick={() => handleZoomIn('abdomen')}
         onMouseEnter={() => setHoveredPart('abdomen')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="125" y="280" width="70" height="85" rx="16" 
          fill={getIntensityGradient(getSymptomIntensity('abdomen'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="2"
          style={{ filter: getGlowEffect(getSymptomIntensity('abdomen')) }}
        />
        <text x="160" y="328" textAnchor="middle" 
          className="text-sm font-medium fill-slate-700 pointer-events-none">
          Abdomen
        </text>
      </g>

      {/* Back - Subtle overlay */}
      <g className="cursor-pointer transition-all duration-400 hover:scale-105 opacity-40 hover:opacity-70" 
         onClick={() => handleZoomIn('back')}
         onMouseEnter={() => setHoveredPart('back')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="130" y="160" width="60" height="200" rx="12" 
          fill={getIntensityGradient(getSymptomIntensity('back'))}
          stroke="rgba(59, 130, 246, 0.2)" 
          strokeWidth="1"
          style={{ filter: getGlowEffect(getSymptomIntensity('back')) }}
        />
        <text x="160" y="265" textAnchor="middle" 
          className="text-xs font-medium fill-slate-500 pointer-events-none">
          Back
        </text>
      </g>

      {/* Legs - Proportional elegance */}
      <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
         onClick={() => handleZoomIn('left-leg')}
         onMouseEnter={() => setHoveredPart('left-leg')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="130" y="375" width="28" height="190" rx="14" 
          fill={getIntensityGradient(getSymptomIntensity('left-leg'))}
          stroke="rgba(59, 130, 246, 0.25)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-leg')) }}
        />
        <text x="144" y="475" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none"
          transform="rotate(-90 144 475)">
          Left Leg
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
         onClick={() => handleZoomIn('right-leg')}
         onMouseEnter={() => setHoveredPart('right-leg')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="162" y="375" width="28" height="190" rx="14" 
          fill={getIntensityGradient(getSymptomIntensity('right-leg'))}
          stroke="rgba(59, 130, 246, 0.25)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-leg')) }}
        />
        <text x="176" y="475" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none"
          transform="rotate(90 176 475)">
          Right Leg
        </text>
      </g>

      {/* Feet - Refined detail */}
      <g className="cursor-pointer transition-all duration-400 hover:scale-110" 
         onClick={() => handleZoomIn('left-foot')}
         onMouseEnter={() => setHoveredPart('left-foot')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="144" cy="585" rx="16" ry="25" 
          fill={getIntensityGradient(getSymptomIntensity('left-foot'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-foot')) }}
        />
        <text x="144" y="590" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Foot
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-400 hover:scale-110" 
         onClick={() => handleZoomIn('right-foot')}
         onMouseEnter={() => setHoveredPart('right-foot')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="176" cy="585" rx="16" ry="25" 
          fill={getIntensityGradient(getSymptomIntensity('right-foot'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="1.5"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-foot')) }}
        />
        <text x="176" y="590" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Foot
        </text>
      </g>

      {/* Floating symptom indicators with premium animation */}
      {symptoms.map((symptom, index) => (
        symptom.coordinates && (
          <g key={symptom.id}>
            <circle
              cx={symptom.coordinates.x}
              cy={symptom.coordinates.y}
              r="6"
              fill={symptom.intensity <= 3 ? "#22c55e" : 
                    symptom.intensity <= 6 ? "#eab308" : 
                    symptom.intensity <= 8 ? "#f97316" : "#ef4444"}
              className="animate-pulse"
              filter="url(#softGlow)"
            >
              <animate attributeName="r" values="4;8;4" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
            </circle>
            <text x={symptom.coordinates.x} y={symptom.coordinates.y - 12} 
              textAnchor="middle" 
              className="text-xs font-semibold fill-white pointer-events-none"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {symptom.intensity}
            </text>
          </g>
        )
      ))}
    </svg>
  );

  const renderHeadZoom = () => (
    <svg width="420" height="520" viewBox="0 0 420 520" className="w-full h-auto">
      {renderGradientDefinitions()}
      
      {/* Head outline with premium styling */}
      <ellipse cx="210" cy="220" rx="130" ry="160" 
        fill="rgba(248, 250, 252, 0.8)" 
        stroke="rgba(59, 130, 246, 0.1)" 
        strokeWidth="3" 
      />
      
      {/* Forehead - Sophisticated gradient */}
      <rect x="130" y="90" width="160" height="70" rx="35" 
        fill={getIntensityGradient(getSymptomIntensity('forehead'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity('forehead')) }}
        onClick={(e) => handleBodyPartClick('forehead', 'Forehead', e)} />
      <text x="210" y="130" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Forehead
      </text>
      
      {/* Eyes - Delicate detail */}
      <ellipse cx="170" cy="190" rx="28" ry="18" 
        fill={getIntensityGradient(getSymptomIntensity('left-eye'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity('left-eye')) }}
        onClick={(e) => handleBodyPartClick('left-eye', 'Left Eye', e)} />
      <text x="170" y="225" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Left Eye
      </text>
      
      <ellipse cx="250" cy="190" rx="28" ry="18" 
        fill={getIntensityGradient(getSymptomIntensity('right-eye'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity('right-eye')) }}
        onClick={(e) => handleBodyPartClick('right-eye', 'Right Eye', e)} />
      <text x="250" y="225" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Right Eye
      </text>
      
      {/* Nose - Elegant geometry */}
      <polygon points="210,235 195,275 225,275" 
        fill={getIntensityGradient(getSymptomIntensity('nose'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity('nose')) }}
        onClick={(e) => handleBodyPartClick('nose', 'Nose', e)} />
      <text x="210" y="295" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Nose
      </text>
      
      {/* Mouth - Refined curves */}
      <ellipse cx="210" cy="320" rx="35" ry="18" 
        fill={getIntensityGradient(getSymptomIntensity('mouth'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity('mouth')) }}
        onClick={(e) => handleBodyPartClick('mouth', 'Mouth', e)} />
      <text x="210" y="350" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Mouth
      </text>
      
      {/* Ears - Premium design */}
      <ellipse cx="90" cy="210" rx="25" ry="40" 
        fill={getIntensityGradient(getSymptomIntensity('left-ear'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity('left-ear')) }}
        onClick={(e) => handleBodyPartClick('left-ear', 'Left Ear', e)} />
      <text x="90" y="265" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Left Ear
      </text>
      
      <ellipse cx="330" cy="210" rx="25" ry="40" 
        fill={getIntensityGradient(getSymptomIntensity('right-ear'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity('right-ear')) }}
        onClick={(e) => handleBodyPartClick('right-ear', 'Right Ear', e)} />
      <text x="330" y="265" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Right Ear
      </text>

      {/* Throat - Smooth transition */}
      <rect x="190" y="370" width="40" height="50" rx="20"
        fill={getIntensityGradient(getSymptomIntensity('throat'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity('throat')) }}
        onClick={(e) => handleBodyPartClick('throat', 'Throat', e)} />
      <text x="210" y="435" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Throat
      </text>
    </svg>
  );

  const renderChestZoom = () => (
    <svg width="420" height="420" viewBox="0 0 420 420" className="w-full h-auto">
      {renderGradientDefinitions()}
      
      {/* Chest outline */}
      <rect x="60" y="60" width="300" height="300" rx="40" 
        fill="rgba(248, 250, 252, 0.6)" 
        stroke="rgba(59, 130, 246, 0.1)" 
        strokeWidth="3" 
      />
      
      {/* Heart - Beautiful anatomical design */}
      <path d="M 190 160 C 180 150, 160 150, 160 170 C 160 190, 190 230, 190 230 C 190 230, 220 190, 220 170 C 220 150, 200 150, 190 160 Z"
        fill={getIntensityGradient(getSymptomIntensity('heart'))}
        stroke="rgba(239, 68, 68, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity('heart')) }}
        onClick={(e) => handleBodyPartClick('heart', 'Heart', e)} />
      <text x="190" y="260" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Heart
      </text>
      
      {/* Lungs - Organic shapes */}
      <ellipse cx="130" cy="190" rx="45" ry="85"
        fill={getIntensityGradient(getSymptomIntensity('left-lung'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity('left-lung')) }}
        onClick={(e) => handleBodyPartClick('left-lung', 'Left Lung', e)} />
      <text x="130" y="285" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Left Lung
      </text>
      
      <ellipse cx="290" cy="190" rx="45" ry="85"
        fill={getIntensityGradient(getSymptomIntensity('right-lung'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity('right-lung')) }}
        onClick={(e) => handleBodyPartClick('right-lung', 'Right Lung', e)} />
      <text x="290" y="285" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Right Lung
      </text>
      
      {/* Upper Chest */}
      <rect x="90" y="90" width="240" height="70" rx="20"
        fill={getIntensityGradient(getSymptomIntensity('upper-chest'))}
        stroke="rgba(59, 130, 246, 0.2)" 
        strokeWidth="1.5"
        className="cursor-pointer transition-all duration-300 hover:scale-105 opacity-70"
        style={{ filter: getGlowEffect(getSymptomIntensity('upper-chest')) }}
        onClick={(e) => handleBodyPartClick('upper-chest', 'Upper Chest', e)} />
      <text x="210" y="130" textAnchor="middle" 
        className="text-sm font-medium fill-slate-600 pointer-events-none">
        Upper Chest
      </text>
      
      {/* Ribs */}
      <rect x="90" y="290" width="240" height="50" rx="20"
        fill={getIntensityGradient(getSymptomIntensity('ribs'))}
        stroke="rgba(59, 130, 246, 0.2)" 
        strokeWidth="1.5"
        className="cursor-pointer transition-all duration-300 hover:scale-105 opacity-70"
        style={{ filter: getGlowEffect(getSymptomIntensity('ribs')) }}
        onClick={(e) => handleBodyPartClick('ribs', 'Ribs', e)} />
      <text x="210" y="320" textAnchor="middle" 
        className="text-sm font-medium fill-slate-600 pointer-events-none">
        Ribs
      </text>
    </svg>
  );

  // Similar premium styling for other zoom views...
  const renderArmZoom = (side: 'left' | 'right') => (
    <svg width="220" height="620" viewBox="0 0 220 620" className="w-full h-auto">
      {renderGradientDefinitions()}
      
      {/* Shoulder */}
      <ellipse cx="110" cy="90" rx="55" ry="35"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-shoulder`))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-shoulder`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-shoulder`, `${side === 'left' ? 'Left' : 'Right'} Shoulder`, e)} />
      <text x="110" y="135" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Shoulder
      </text>
      
      {/* Upper Arm */}
      <rect x="80" y="125" width="60" height="130" rx="30"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-upper-arm`))}
        stroke="rgba(59, 130, 246, 0.25)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-upper-arm`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-upper-arm`, `${side === 'left' ? 'Left' : 'Right'} Upper Arm`, e)} />
      <text x="110" y="195" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Upper Arm
      </text>
      
      {/* Elbow */}
      <circle cx="110" cy="275" r="30"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-elbow`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-elbow`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-elbow`, `${side === 'left' ? 'Left' : 'Right'} Elbow`, e)} />
      <text x="110" y="320" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Elbow
      </text>
      
      {/* Forearm */}
      <rect x="80" y="305" width="60" height="130" rx="30"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-forearm`))}
        stroke="rgba(59, 130, 246, 0.25)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-forearm`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-forearm`, `${side === 'left' ? 'Left' : 'Right'} Forearm`, e)} />
      <text x="110" y="375" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Forearm
      </text>
      
      {/* Wrist */}
      <ellipse cx="110" cy="450" rx="25" ry="18"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-wrist`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-wrist`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-wrist`, `${side === 'left' ? 'Left' : 'Right'} Wrist`, e)} />
      <text x="110" y="485" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Wrist
      </text>
      
      {/* Hand - Premium clickable for zoom */}
      <ellipse cx="110" cy="520" rx="35" ry="55"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-hand`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-hand`)) }}
        onClick={() => handleZoomIn(`${side}-hand` as ZoomLevel)} />
      <text x="110" y="590" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Hand (Tap to zoom)
      </text>
      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" 
        style={{ position: 'absolute', transform: 'translate(125px, 500px)' }} />
    </svg>
  );

  // Continue with other detailed views using the same premium styling...
  const renderHandZoom = (side: 'left' | 'right') => (
    <svg width="320" height="420" viewBox="0 0 320 420" className="w-full h-auto">
      {renderGradientDefinitions()}
      
      {/* Palm */}
      <rect x="110" y="220" width="100" height="150" rx="25"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-palm`))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-105"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-palm`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-palm`, `${side === 'left' ? 'Left' : 'Right'} Palm`, e)} />
      <text x="160" y="300" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Palm
      </text>
      
      {/* Fingers with premium styling */}
      <rect x="120" y="60" width="22" height="170" rx="11"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-thumb`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-thumb`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-thumb`, `${side === 'left' ? 'Left' : 'Right'} Thumb`, e)} />
      <text x="131" y="45" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Thumb
      </text>
      
      <rect x="150" y="40" width="20" height="190" rx="10"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-index`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-index`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-index`, `${side === 'left' ? 'Left' : 'Right'} Index`, e)} />
      <text x="160" y="25" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Index
      </text>
      
      <rect x="175" y="30" width="20" height="200" rx="10"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-middle`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-middle`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-middle`, `${side === 'left' ? 'Left' : 'Right'} Middle`, e)} />
      <text x="185" y="15" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Middle
      </text>
      
      <rect x="200" y="40" width="20" height="190" rx="10"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-ring`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-ring`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-ring`, `${side === 'left' ? 'Left' : 'Right'} Ring`, e)} />
      <text x="210" y="25" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Ring
      </text>
      
      <rect x="225" y="60" width="18" height="170" rx="9"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-pinky`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-pinky`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-pinky`, `${side === 'left' ? 'Left' : 'Right'} Pinky`, e)} />
      <text x="234" y="45" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Pinky
      </text>
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
      // Add other views with similar premium styling...
      default: return renderOverview();
    }
  };

  const getViewTitle = () => {
    switch (currentZoom) {
      case 'overview': return 'Your Body';
      case 'head': return 'Head & Face';
      case 'chest': return 'Chest & Heart';
      case 'left-arm': return 'Left Arm';
      case 'right-arm': return 'Right Arm';
      case 'left-hand': return 'Left Hand';
      case 'right-hand': return 'Right Hand';
      default: return 'Your Body';
    }
  };

  return (
    <Card className={cn("w-full max-w-3xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl", className)}>
      <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center">
            <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
            {getViewTitle()}
          </CardTitle>
          <div className="flex space-x-2">
            {currentZoom !== 'overview' && (
              <Button variant="secondary" size="sm" onClick={handleZoomOut} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentZoom !== 'overview' && (
              <Button variant="secondary" size="sm" onClick={handleGoHome} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Home className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Premium breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-blue-100 mt-2">
          {zoomHistory.map((level, index) => (
            <React.Fragment key={level}>
              {index > 0 && <span className="text-blue-200">→</span>}
              <span className={index === zoomHistory.length - 1 ? 'font-semibold text-white' : 'text-blue-200'}>
                {level === 'overview' ? 'Body' : getViewTitle()}
              </span>
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex justify-center p-8 bg-gradient-to-b from-white to-slate-50">
        <div className="transition-all duration-700 ease-out transform">
          {getCurrentView()}
        </div>
      </CardContent>

      <div className="px-8 pb-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
        <p className="text-sm text-slate-600 text-center font-medium">
          {currentZoom === 'overview' 
            ? '✨ Tap body parts to explore detailed areas with precision'
            : '🎯 Select specific areas to log symptoms, or navigate back to explore more'
          }
        </p>
        
        {/* Premium status indicator */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-white/60 rounded-full border border-blue-200/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-700">Interactive Health Mapping</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ZoomableBodyMap;