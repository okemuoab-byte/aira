import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Sparkles, Zap } from 'lucide-react';
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
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    if (intensity <= 3) return 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.5))';
    if (intensity <= 6) return 'drop-shadow(0 0 16px rgba(234, 179, 8, 0.6))';
    if (intensity <= 8) return 'drop-shadow(0 0 20px rgba(249, 115, 22, 0.7))';
    return 'drop-shadow(0 0 24px rgba(239, 68, 68, 0.8))';
  };

  const handleZoomIn = (zoomLevel: ZoomLevel) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentZoom(zoomLevel);
      setZoomHistory(prev => [...prev, zoomLevel]);
      setIsTransitioning(false);
    }, 200);
  };

  const handleZoomOut = () => {
    if (zoomHistory.length > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        const newHistory = zoomHistory.slice(0, -1);
        setZoomHistory(newHistory);
        setCurrentZoom(newHistory[newHistory.length - 1]);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const handleGoHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentZoom('overview');
      setZoomHistory(['overview']);
      setIsTransitioning(false);
    }, 200);
  };

  const handleBodyPartClick = (bodyPartId: string, bodyPartName: string, event: React.MouseEvent<SVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const coordinates = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    onBodyPartClick(bodyPartId, bodyPartName, coordinates);
  };

  const renderAdvancedGradients = () => (
    <defs>
      {/* Enhanced gradient definitions with more sophistication */}
      <linearGradient id="healthyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f0f9ff" />
        <stop offset="30%" stopColor="#e0f2fe" />
        <stop offset="70%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#7dd3fc" />
      </linearGradient>
      
      <radialGradient id="mildGradient" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#f0fdf4" />
        <stop offset="40%" stopColor="#dcfce7" />
        <stop offset="80%" stopColor="#bbf7d0" />
        <stop offset="100%" stopColor="#86efac" />
      </radialGradient>
      
      <radialGradient id="moderateGradient" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="40%" stopColor="#fef3c7" />
        <stop offset="80%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#fcd34d" />
      </radialGradient>
      
      <radialGradient id="strongGradient" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fff7ed" />
        <stop offset="40%" stopColor="#fed7aa" />
        <stop offset="80%" stopColor="#fdba74" />
        <stop offset="100%" stopColor="#fb923c" />
      </radialGradient>
      
      <radialGradient id="severeGradient" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#fef2f2" />
        <stop offset="40%" stopColor="#fecaca" />
        <stop offset="80%" stopColor="#fca5a5" />
        <stop offset="100%" stopColor="#f87171" />
      </radialGradient>

      {/* Advanced filters for premium effects */}
      <filter id="premiumGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feOffset dx="0" dy="2" result="offsetBlur"/>
        <feMerge> 
          <feMergeNode in="offsetBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feOffset dx="0" dy="2"/>
        <feGaussianBlur stdDeviation="2" result="offset-blur"/>
        <feFlood floodColor="#000000" floodOpacity="0.1"/>
        <feComposite in2="offset-blur" operator="in"/>
        <feMerge> 
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="breathingGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.05;1"
          dur="3s"
          repeatCount="indefinite"
        />
      </filter>

      {/* Particle effect patterns */}
      <pattern id="healthParticles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="5" r="1" fill="rgba(59, 130, 246, 0.1)">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="25" cy="15" r="0.5" fill="rgba(59, 130, 246, 0.15)">
          <animate attributeName="opacity" values="0.15;0.4;0.15" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="35" cy="30" r="1.5" fill="rgba(59, 130, 246, 0.08)">
          <animate attributeName="opacity" values="0.08;0.25;0.08" dur="5s" repeatCount="indefinite"/>
        </circle>
      </pattern>
    </defs>
  );

  const renderOverview = () => (
    <svg width="320" height="640" viewBox="0 0 320 640" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      {/* Animated background particles */}
      <rect width="320" height="640" fill="url(#healthParticles)" opacity="0.3" />
      
      {/* Head - Premium design with breathing animation */}
      <g className="cursor-pointer transition-all duration-700 ease-out hover:scale-105" 
         onClick={() => handleZoomIn('head')}
         onMouseEnter={() => setHoveredPart('head')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="160" cy="70" rx="42" ry="52" 
          fill={getIntensityGradient(getSymptomIntensity('head'))}
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="2.5"
          filter={getSymptomIntensity('head') > 0 ? "url(#breathingGlow)" : "url(#premiumGlow)"}
          style={{ filter: getGlowEffect(getSymptomIntensity('head')) }}
        />
        <text x="160" y="78" textAnchor="middle" 
          className="text-sm font-semibold fill-slate-700 pointer-events-none select-none">
          Head
        </text>
        {hoveredPart === 'head' && (
          <>
            <circle cx="200" cy="50" r="8" fill="rgba(59, 130, 246, 0.9)" className="animate-pulse">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
            </circle>
            <Zap className="w-4 h-4 text-blue-400 animate-bounce" 
              style={{ position: 'absolute', transform: 'translate(205px, 45px)' }} />
          </>
        )}
      </g>

      {/* Enhanced Neck with premium styling */}
      <g className="cursor-pointer transition-all duration-400 hover:scale-105"
         onClick={(e) => handleBodyPartClick('neck', 'Neck', e)}
         onMouseEnter={() => setHoveredPart('neck')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="135" y="125" width="50" height="35" rx="18" 
          fill={getIntensityGradient(getSymptomIntensity('neck'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="2"
          filter="url(#innerShadow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('neck')) }}
        />
        <text x="160" y="145" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Neck
        </text>
      </g>

      {/* Premium Shoulders with sophisticated curves */}
      <g className="cursor-pointer transition-all duration-500 hover:scale-105"
         onClick={(e) => handleBodyPartClick('left-shoulder', 'Left Shoulder', e)}
         onMouseEnter={() => setHoveredPart('left-shoulder')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="102" cy="155" rx="22" ry="16" 
          fill={getIntensityGradient(getSymptomIntensity('left-shoulder'))}
          stroke="rgba(59, 130, 246, 0.35)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-shoulder')) }}
        />
        <text x="102" y="160" textAnchor="middle" 
          className="text-xs font-semibold fill-slate-600 pointer-events-none">
          L
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-500 hover:scale-105"
         onClick={(e) => handleBodyPartClick('right-shoulder', 'Right Shoulder', e)}
         onMouseEnter={() => setHoveredPart('right-shoulder')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="218" cy="155" rx="22" ry="16" 
          fill={getIntensityGradient(getSymptomIntensity('right-shoulder'))}
          stroke="rgba(59, 130, 246, 0.35)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-shoulder')) }}
        />
        <text x="218" y="160" textAnchor="middle" 
          className="text-xs font-semibold fill-slate-600 pointer-events-none">
          R
        </text>
      </g>

      {/* Chest - Beautiful anatomical accuracy with premium effects */}
      <g className="cursor-pointer transition-all duration-600 hover:scale-105" 
         onClick={() => handleZoomIn('chest')}
         onMouseEnter={() => setHoveredPart('chest')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="120" y="160" width="80" height="110" rx="20" 
          fill={getIntensityGradient(getSymptomIntensity('chest'))}
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="2.5"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('chest')) }}
        />
        <text x="160" y="220" textAnchor="middle" 
          className="text-sm font-semibold fill-slate-700 pointer-events-none">
          Chest
        </text>
        {hoveredPart === 'chest' && (
          <g>
            <circle cx="185" cy="180" r="6" fill="rgba(59, 130, 246, 0.9)" className="animate-pulse">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="185" cy="180" r="12" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1">
              <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
          </g>
        )}
      </g>

      {/* Arms - Fluid design with enhanced animations */}
      <g className="cursor-pointer transition-all duration-600 hover:scale-105" 
         onClick={() => handleZoomIn('left-arm')}
         onMouseEnter={() => setHoveredPart('left-arm')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="70" y="175" width="28" height="130" rx="14" 
          fill={getIntensityGradient(getSymptomIntensity('left-arm'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-arm')) }}
        />
        <text x="84" y="245" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none"
          transform="rotate(-90 84 245)">
          Left Arm
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-600 hover:scale-105" 
         onClick={() => handleZoomIn('right-arm')}
         onMouseEnter={() => setHoveredPart('right-arm')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="222" y="175" width="28" height="130" rx="14" 
          fill={getIntensityGradient(getSymptomIntensity('right-arm'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-arm')) }}
        />
        <text x="236" y="245" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none"
          transform="rotate(90 236 245)">
          Right Arm
        </text>
      </g>

      {/* Hands - Delicate detail with premium hover effects */}
      <g className="cursor-pointer transition-all duration-500 hover:scale-110" 
         onClick={() => handleZoomIn('left-hand')}
         onMouseEnter={() => setHoveredPart('left-hand')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="84" cy="325" rx="16" ry="22" 
          fill={getIntensityGradient(getSymptomIntensity('left-hand'))}
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-hand')) }}
        />
        <text x="84" y="330" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Hand
        </text>
        {hoveredPart === 'left-hand' && (
          <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" 
            style={{ position: 'absolute', transform: 'translate(95px, 315px)' }} />
        )}
      </g>

      <g className="cursor-pointer transition-all duration-500 hover:scale-110" 
         onClick={() => handleZoomIn('right-hand')}
         onMouseEnter={() => setHoveredPart('right-hand')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="236" cy="325" rx="16" ry="22" 
          fill={getIntensityGradient(getSymptomIntensity('right-hand'))}
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-hand')) }}
        />
        <text x="236" y="330" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Hand
        </text>
        {hoveredPart === 'right-hand' && (
          <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" 
            style={{ position: 'absolute', transform: 'translate(247px, 315px)' }} />
        )}
      </g>

      {/* Abdomen - Organic curves with premium styling */}
      <g className="cursor-pointer transition-all duration-600 hover:scale-105" 
         onClick={() => handleZoomIn('abdomen')}
         onMouseEnter={() => setHoveredPart('abdomen')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="125" y="280" width="70" height="85" rx="16" 
          fill={getIntensityGradient(getSymptomIntensity('abdomen'))}
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="2.5"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('abdomen')) }}
        />
        <text x="160" y="328" textAnchor="middle" 
          className="text-sm font-semibold fill-slate-700 pointer-events-none">
          Abdomen
        </text>
      </g>

      {/* Back - Subtle overlay with enhanced effects */}
      <g className="cursor-pointer transition-all duration-500 hover:scale-105 opacity-50 hover:opacity-80" 
         onClick={() => handleZoomIn('back')}
         onMouseEnter={() => setHoveredPart('back')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="130" y="160" width="60" height="200" rx="12" 
          fill={getIntensityGradient(getSymptomIntensity('back'))}
          stroke="rgba(59, 130, 246, 0.25)" 
          strokeWidth="1.5"
          filter="url(#innerShadow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('back')) }}
        />
        <text x="160" y="265" textAnchor="middle" 
          className="text-xs font-medium fill-slate-500 pointer-events-none">
          Back
        </text>
      </g>

      {/* Legs - Proportional elegance with premium effects */}
      <g className="cursor-pointer transition-all duration-600 hover:scale-105" 
         onClick={() => handleZoomIn('left-leg')}
         onMouseEnter={() => setHoveredPart('left-leg')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="130" y="375" width="28" height="190" rx="14" 
          fill={getIntensityGradient(getSymptomIntensity('left-leg'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-leg')) }}
        />
        <text x="144" y="475" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none"
          transform="rotate(-90 144 475)">
          Left Leg
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-600 hover:scale-105" 
         onClick={() => handleZoomIn('right-leg')}
         onMouseEnter={() => setHoveredPart('right-leg')}
         onMouseLeave={() => setHoveredPart(null)}>
        <rect x="162" y="375" width="28" height="190" rx="14" 
          fill={getIntensityGradient(getSymptomIntensity('right-leg'))}
          stroke="rgba(59, 130, 246, 0.3)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-leg')) }}
        />
        <text x="176" y="475" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none"
          transform="rotate(90 176 475)">
          Right Leg
        </text>
      </g>

      {/* Feet - Refined detail with premium animations */}
      <g className="cursor-pointer transition-all duration-500 hover:scale-110" 
         onClick={() => handleZoomIn('left-foot')}
         onMouseEnter={() => setHoveredPart('left-foot')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="144" cy="585" rx="16" ry="25" 
          fill={getIntensityGradient(getSymptomIntensity('left-foot'))}
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('left-foot')) }}
        />
        <text x="144" y="590" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Foot
        </text>
      </g>

      <g className="cursor-pointer transition-all duration-500 hover:scale-110" 
         onClick={() => handleZoomIn('right-foot')}
         onMouseEnter={() => setHoveredPart('right-foot')}
         onMouseLeave={() => setHoveredPart(null)}>
        <ellipse cx="176" cy="585" rx="16" ry="25" 
          fill={getIntensityGradient(getSymptomIntensity('right-foot'))}
          stroke="rgba(59, 130, 246, 0.4)" 
          strokeWidth="2"
          filter="url(#premiumGlow)"
          style={{ filter: getGlowEffect(getSymptomIntensity('right-foot')) }}
        />
        <text x="176" y="590" textAnchor="middle" 
          className="text-xs font-medium fill-slate-600 pointer-events-none">
          Foot
        </text>
      </g>

      {/* Enhanced floating symptom indicators with premium animations */}
      {symptoms.map((symptom, index) => (
        symptom.coordinates && (
          <g key={symptom.id}>
            <circle
              cx={symptom.coordinates.x}
              cy={symptom.coordinates.y}
              r="8"
              fill={symptom.intensity <= 3 ? "#22c55e" : 
                    symptom.intensity <= 6 ? "#eab308" : 
                    symptom.intensity <= 8 ? "#f97316" : "#ef4444"}
              className="animate-pulse"
              filter="url(#premiumGlow)"
            >
              <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle
              cx={symptom.coordinates.x}
              cy={symptom.coordinates.y}
              r="16"
              fill="none"
              stroke={symptom.intensity <= 3 ? "#22c55e" : 
                     symptom.intensity <= 6 ? "#eab308" : 
                     symptom.intensity <= 8 ? "#f97316" : "#ef4444"}
              strokeWidth="1"
              opacity="0.3"
            >
              <animate attributeName="r" values="8;20;8" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0;0.5" dur="4s" repeatCount="indefinite"/>
            </circle>
            <text x={symptom.coordinates.x} y={symptom.coordinates.y - 15} 
              textAnchor="middle" 
              className="text-xs font-bold fill-white pointer-events-none"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
              {symptom.intensity}
            </text>
          </g>
        )
      ))}
    </svg>
  );

  // Add complete detailed views for legs and feet
  const renderLegZoom = (side: 'left' | 'right') => (
    <svg width="240" height="700" viewBox="0 0 240 700" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      {/* Hip - Premium design */}
      <ellipse cx="120" cy="80" rx="40" ry="30"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-hip`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2.5"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-hip`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-hip`, `${side === 'left' ? 'Left' : 'Right'} Hip`, e)} />
      <text x="120" y="125" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Hip
      </text>
      
      {/* Thigh - Enhanced styling */}
      <rect x="90" y="110" width="60" height="160" rx="30"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-thigh`))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-thigh`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-thigh`, `${side === 'left' ? 'Left' : 'Right'} Thigh`, e)} />
      <text x="120" y="195" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Thigh
      </text>
      
      {/* Knee - Premium circular design */}
      <ellipse cx="120" cy="290" rx="45" ry="35"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-knee`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2.5"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-knee`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-knee`, `${side === 'left' ? 'Left' : 'Right'} Knee`, e)} />
      <text x="120" y="340" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Knee
      </text>
      
      {/* Calf - Anatomically accurate */}
      <ellipse cx="120" cy="420" rx="35" ry="80"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-calf`))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-calf`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-calf`, `${side === 'left' ? 'Left' : 'Right'} Calf`, e)} />
      <text x="120" y="430" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Calf
      </text>
      
      {/* Shin - Subtle overlay */}
      <rect x="105" y="340" width="30" height="140" rx="15"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-shin`))}
        stroke="rgba(59, 130, 246, 0.25)" 
        strokeWidth="1.5"
        className="cursor-pointer transition-all duration-400 hover:scale-105 opacity-70"
        filter="url(#innerShadow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-shin`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-shin`, `${side === 'left' ? 'Left' : 'Right'} Shin`, e)} />
      <text x="120" y="415" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Shin
      </text>
      
      {/* Ankle - Delicate joint */}
      <ellipse cx="120" cy="520" rx="30" ry="25"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-ankle`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-ankle`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-ankle`, `${side === 'left' ? 'Left' : 'Right'} Ankle`, e)} />
      <text x="120" y="560" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Ankle
      </text>
      
      {/* Foot - Premium clickable for zoom */}
      <ellipse cx="120" cy="600" rx="35" ry="60"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-foot`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2.5"
        className="cursor-pointer transition-all duration-500 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-foot`)) }}
        onClick={() => handleZoomIn(`${side}-foot` as ZoomLevel)} />
      <text x="120" y="680" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Foot (Tap to zoom)
      </text>
      <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" 
        style={{ position: 'absolute', transform: 'translate(140px, 580px)' }} />
    </svg>
  );

  const renderFootZoom = (side: 'left' | 'right') => (
    <svg width="280" height="400" viewBox="0 0 280 400" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      {/* Foot outline with premium styling */}
      <ellipse cx="140" cy="220" rx="80" ry="140" 
        fill="rgba(248, 250, 252, 0.8)" 
        stroke="rgba(59, 130, 246, 0.15)" 
        strokeWidth="3" 
        filter="url(#innerShadow)"
      />
      
      {/* Big Toe - Prominent design */}
      <ellipse cx="140" cy="90" rx="20" ry="25"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-big-toe`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2.5"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-big-toe`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-big-toe`, `${side === 'left' ? 'Left' : 'Right'} Big Toe`, e)} />
      <text x="140" y="65" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Big Toe
      </text>
      
      {/* Other Toes - Elegant arrangement */}
      <ellipse cx="110" cy="80" rx="12" ry="18"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-toes`))}
        stroke="rgba(59, 130, 246, 0.35)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-toes`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-toes`, `${side === 'left' ? 'Left' : 'Right'} Toes`, e)} />
      
      <ellipse cx="170" cy="80" rx="12" ry="18"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-toes`))}
        stroke="rgba(59, 130, 246, 0.35)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-toes`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-toes`, `${side === 'left' ? 'Left' : 'Right'} Toes`, e)} />
      
      <ellipse cx="85" cy="85" rx="10" ry="15"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-toes`))}
        stroke="rgba(59, 130, 246, 0.35)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-toes`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-toes`, `${side === 'left' ? 'Left' : 'Right'} Toes`, e)} />
      
      <ellipse cx="195" cy="85" rx="10" ry="15"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-toes`))}
        stroke="rgba(59, 130, 246, 0.35)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-toes`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-toes`, `${side === 'left' ? 'Left' : 'Right'} Toes`, e)} />
      
      <text x="140" y="45" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Toes
      </text>
      
      {/* Arch - Central support structure */}
      <ellipse cx="140" cy="200" rx="50" ry="40"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-arch`))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-arch`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-arch`, `${side === 'left' ? 'Left' : 'Right'} Arch`, e)} />
      <text x="140" y="205" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Arch
      </text>
      
      {/* Heel - Robust design */}
      <ellipse cx="140" cy="320" rx="45" ry="50"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-heel`))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2.5"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-heel`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-heel`, `${side === 'left' ? 'Left' : 'Right'} Heel`, e)} />
      <text x="140" y="380" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Heel
      </text>
      
      {/* Sole - Subtle overlay */}
      <ellipse cx="140" cy="240" rx="45" ry="100"
        fill={getIntensityGradient(getSymptomIntensity(`${side}-sole`))}
        stroke="rgba(59, 130, 246, 0.2)" 
        strokeWidth="1.5"
        className="cursor-pointer transition-all duration-400 hover:scale-105 opacity-50"
        filter="url(#innerShadow)"
        style={{ filter: getGlowEffect(getSymptomIntensity(`${side}-sole`)) }}
        onClick={(e) => handleBodyPartClick(`${side}-sole`, `${side === 'left' ? 'Left' : 'Right'} Sole`, e)} />
    </svg>
  );

  // Add abdomen and back detailed views
  const renderAbdomenZoom = () => (
    <svg width="400" height="450" viewBox="0 0 400 450" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      {/* Abdomen outline */}
      <rect x="50" y="50" width="300" height="350" rx="40" 
        fill="rgba(248, 250, 252, 0.7)" 
        stroke="rgba(59, 130, 246, 0.15)" 
        strokeWidth="3" 
        filter="url(#innerShadow)"
      />
      
      {/* Upper Abdomen */}
      <rect x="80" y="80" width="240" height="100" rx="25"
        fill={getIntensityGradient(getSymptomIntensity('upper-abdomen'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('upper-abdomen')) }}
        onClick={(e) => handleBodyPartClick('upper-abdomen', 'Upper Abdomen', e)} />
      <text x="200" y="135" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Upper Abdomen
      </text>
      
      {/* Stomach - Organic shape */}
      <ellipse cx="160" cy="150" rx="60" ry="45"
        fill={getIntensityGradient(getSymptomIntensity('stomach'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2.5"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('stomach')) }}
        onClick={(e) => handleBodyPartClick('stomach', 'Stomach', e)} />
      <text x="160" y="210" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Stomach
      </text>
      
      {/* Liver - Anatomically positioned */}
      <ellipse cx="260" cy="140" rx="50" ry="35"
        fill={getIntensityGradient(getSymptomIntensity('liver'))}
        stroke="rgba(59, 130, 246, 0.35)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('liver')) }}
        onClick={(e) => handleBodyPartClick('liver', 'Liver', e)} />
      <text x="260" y="185" textAnchor="middle" 
        className="text-sm font-medium fill-slate-700 pointer-events-none">
        Liver
      </text>
      
      {/* Lower Abdomen */}
      <rect x="80" y="220" width="240" height="120" rx="25"
        fill={getIntensityGradient(getSymptomIntensity('lower-abdomen'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('lower-abdomen')) }}
        onClick={(e) => handleBodyPartClick('lower-abdomen', 'Lower Abdomen', e)} />
      <text x="200" y="285" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Lower Abdomen
      </text>
      
      {/* Intestines - Subtle representation */}
      <ellipse cx="200" cy="280" rx="80" ry="60"
        fill={getIntensityGradient(getSymptomIntensity('intestines'))}
        stroke="rgba(59, 130, 246, 0.25)" 
        strokeWidth="1.5"
        className="cursor-pointer transition-all duration-400 hover:scale-105 opacity-60"
        filter="url(#innerShadow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('intestines')) }}
        onClick={(e) => handleBodyPartClick('intestines', 'Intestines', e)} />
      <text x="200" y="350" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Intestines
      </text>
    </svg>
  );

  const renderBackZoom = () => (
    <svg width="350" height="600" viewBox="0 0 350 600" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      {/* Back outline */}
      <rect x="50" y="50" width="250" height="500" rx="30" 
        fill="rgba(248, 250, 252, 0.7)" 
        stroke="rgba(59, 130, 246, 0.15)" 
        strokeWidth="3" 
        filter="url(#innerShadow)"
      />
      
      {/* Upper Back */}
      <rect x="80" y="80" width="190" height="120" rx="20"
        fill={getIntensityGradient(getSymptomIntensity('upper-back'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('upper-back')) }}
        onClick={(e) => handleBodyPartClick('upper-back', 'Upper Back', e)} />
      <text x="175" y="145" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Upper Back
      </text>
      
      {/* Middle Back */}
      <rect x="80" y="210" width="190" height="140" rx="20"
        fill={getIntensityGradient(getSymptomIntensity('middle-back'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('middle-back')) }}
        onClick={(e) => handleBodyPartClick('middle-back', 'Middle Back', e)} />
      <text x="175" y="285" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Middle Back
      </text>
      
      {/* Lower Back - Prominent design */}
      <rect x="80" y="360" width="190" height="120" rx="20"
        fill={getIntensityGradient(getSymptomIntensity('lower-back'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2.5"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('lower-back')) }}
        onClick={(e) => handleBodyPartClick('lower-back', 'Lower Back', e)} />
      <text x="175" y="425" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Lower Back
      </text>
      
      {/* Spine - Central line */}
      <rect x="170" y="80" width="10" height="400" rx="5"
        fill={getIntensityGradient(getSymptomIntensity('spine'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="1.5"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        style={{ filter: getGlowEffect(getSymptomIntensity('spine')) }}
        onClick={(e) => handleBodyPartClick('spine', 'Spine', e)} />
      <text x="175" y="520" textAnchor="middle" 
        className="text-xs font-medium fill-slate-600 pointer-events-none">
        Spine
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
      case 'abdomen': return renderAbdomenZoom();
      case 'back': return renderBackZoom();
      case 'left-leg': return renderLegZoom('left');
      case 'right-leg': return renderLegZoom('right');
      case 'left-foot': return renderFootZoom('left');
      case 'right-foot': return renderFootZoom('right');
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
      case 'abdomen': return 'Abdomen & Digestive';
      case 'back': return 'Back & Spine';
      case 'left-leg': return 'Left Leg';
      case 'right-leg': return 'Right Leg';
      case 'left-foot': return 'Left Foot';
      case 'right-foot': return 'Right Foot';
      default: return 'Your Body';
    }
  };

  // Rest of the component remains the same...
  return (
    <Card className={cn("w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl overflow-hidden", className)}>
      <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center">
            <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
            {getViewTitle()}
          </CardTitle>
          <div className="flex space-x-2">
            {currentZoom !== 'overview' && (
              <Button variant="secondary" size="sm" onClick={handleZoomOut} className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentZoom !== 'overview' && (
              <Button variant="secondary" size="sm" onClick={handleGoHome} className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <Home className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Premium breadcrumb with enhanced styling */}
        <div className="flex items-center space-x-2 text-sm text-blue-100 mt-3">
          {zoomHistory.map((level, index) => (
            <React.Fragment key={level}>
              {index > 0 && <span className="text-blue-200 animate-pulse">→</span>}
              <span className={cn(
                "px-2 py-1 rounded-full transition-all duration-300",
                index === zoomHistory.length - 1 
                  ? 'font-semibold text-white bg-white/20 backdrop-blur-sm' 
                  : 'text-blue-200 hover:text-white'
              )}>
                {level === 'overview' ? 'Body' : getViewTitle()}
              </span>
            </React.Fragment>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex justify-center p-8 bg-gradient-to-b from-white via-slate-50 to-blue-50">
        <div className={cn(
          "transition-all duration-700 ease-out transform",
          isTransitioning && "scale-95 opacity-50"
        )}>
          {getCurrentView()}
        </div>
      </CardContent>

      <div className="px-8 pb-6 bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50">
        <p className="text-sm text-slate-600 text-center font-medium mb-4">
          {currentZoom === 'overview' 
            ? '✨ Tap body parts to explore detailed areas with precision mapping'
            : '🎯 Select specific areas to log symptoms, or navigate back to explore more regions'
          }
        </p>
        
        {/* Enhanced status indicator with premium styling */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-lg">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <span className="text-sm font-semibold text-slate-700">Interactive Health Mapping</span>
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ZoomableBodyMap;