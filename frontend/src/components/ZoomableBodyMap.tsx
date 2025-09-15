import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Sparkles, RotateCcw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Symptom } from '@/types/health';

interface ZoomableBodyMapProps {
  onBodyPartClick: (bodyPartId: string, bodyPartName: string, coordinates: { x: number; y: number }) => void;
  symptoms: Symptom[];
  selectedBodyPart?: string;
  className?: string;
}

type ZoomLevel = 
  | 'overview' 
  | 'upper-body' | 'head-neck' | 'lower-body'
  | 'chest-heart' | 'arms' | 'shoulders' | 'face' | 'legs' | 'feet'
  | 'left-arm' | 'right-arm' | 'left-hand' | 'right-hand' 
  | 'left-leg' | 'right-leg' | 'left-foot' | 'right-foot';

type ViewSide = 'front' | 'back';

const ZoomableBodyMap: React.FC<ZoomableBodyMapProps> = ({
  onBodyPartClick,
  symptoms,
  selectedBodyPart,
  className
}) => {
  const [currentZoom, setCurrentZoom] = useState<ZoomLevel>('overview');
  const [currentSide, setCurrentSide] = useState<ViewSide>('front');
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
    }, 300);
  };

  const handleZoomOut = () => {
    if (zoomHistory.length > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        const newHistory = zoomHistory.slice(0, -1);
        setZoomHistory(newHistory);
        setCurrentZoom(newHistory[newHistory.length - 1]);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleGoHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentZoom('overview');
      setZoomHistory(['overview']);
      setCurrentSide('front');
      setIsTransitioning(false);
    }, 300);
  };

  const toggleSide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSide(prev => prev === 'front' ? 'back' : 'front');
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

  // LEVEL 1: Full Body Overview
  const renderOverview = () => (
    <svg width="320" height="640" viewBox="0 0 320 640" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      <rect width="320" height="640" fill="url(#healthParticles)" opacity="0.3" />
      
      {currentSide === 'front' ? (
        <>
          {/* Head & Neck Region */}
          <g className="cursor-pointer transition-all duration-700 ease-out hover:scale-105" 
             onClick={() => handleZoomIn('head-neck')}
             onMouseEnter={() => setHoveredPart('head-neck')}
             onMouseLeave={() => setHoveredPart(null)}>
            <ellipse cx="160" cy="70" rx="42" ry="52" 
              fill={getIntensityGradient(Math.max(getSymptomIntensity('head'), getSymptomIntensity('neck')))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2.5"
              filter="url(#premiumGlow)"
            />
            <rect x="135" y="125" width="50" height="35" rx="18" 
              fill={getIntensityGradient(getSymptomIntensity('neck'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#innerShadow)"
            />
            <text x="160" y="85" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Head & Neck
            </text>
            {hoveredPart === 'head-neck' && (
              <circle cx="200" cy="50" r="8" fill="rgba(59, 130, 246, 0.9)" className="animate-pulse">
                <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite"/>
              </circle>
            )}
          </g>

          {/* Upper Body Region */}
          <g className="cursor-pointer transition-all duration-700 ease-out hover:scale-105" 
             onClick={() => handleZoomIn('upper-body')}
             onMouseEnter={() => setHoveredPart('upper-body')}
             onMouseLeave={() => setHoveredPart(null)}>
            {/* Shoulders */}
            <ellipse cx="102" cy="155" rx="22" ry="16" 
              fill={getIntensityGradient(getSymptomIntensity('left-shoulder'))}
              stroke="rgba(59, 130, 246, 0.35)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <ellipse cx="218" cy="155" rx="22" ry="16" 
              fill={getIntensityGradient(getSymptomIntensity('right-shoulder'))}
              stroke="rgba(59, 130, 246, 0.35)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            {/* Chest */}
            <rect x="120" y="160" width="80" height="110" rx="20" 
              fill={getIntensityGradient(Math.max(getSymptomIntensity('chest'), getSymptomIntensity('heart')))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2.5"
              filter="url(#premiumGlow)"
            />
            <text x="160" y="220" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Upper Body
            </text>
            {hoveredPart === 'upper-body' && (
              <circle cx="185" cy="180" r="6" fill="rgba(59, 130, 246, 0.9)" className="animate-pulse">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            )}
          </g>

          {/* Lower Body Region */}
          <g className="cursor-pointer transition-all duration-700 ease-out hover:scale-105" 
             onClick={() => handleZoomIn('lower-body')}
             onMouseEnter={() => setHoveredPart('lower-body')}
             onMouseLeave={() => setHoveredPart(null)}>
            {/* Abdomen */}
            <rect x="125" y="280" width="70" height="85" rx="16" 
              fill={getIntensityGradient(getSymptomIntensity('abdomen'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2.5"
              filter="url(#premiumGlow)"
            />
            {/* Hips */}
            <circle cx="125" cy="380" r="12" 
              fill={getIntensityGradient(getSymptomIntensity('left-hip'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <circle cx="195" cy="380" r="12" 
              fill={getIntensityGradient(getSymptomIntensity('right-hip'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            {/* Legs */}
            <rect x="130" y="395" width="25" height="140" rx="12" 
              fill={getIntensityGradient(getSymptomIntensity('left-leg'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <rect x="165" y="395" width="25" height="140" rx="12" 
              fill={getIntensityGradient(getSymptomIntensity('right-leg'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            {/* Feet */}
            <ellipse cx="142" cy="555" rx="12" ry="20" 
              fill={getIntensityGradient(getSymptomIntensity('left-foot'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <ellipse cx="178" cy="555" rx="12" ry="20" 
              fill={getIntensityGradient(getSymptomIntensity('right-foot'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <text x="160" y="340" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Lower Body
            </text>
          </g>
        </>
      ) : (
        // Back view
        <>
          {/* Back of Head & Neck */}
          <g className="cursor-pointer transition-all duration-700 ease-out hover:scale-105" 
             onClick={() => handleZoomIn('head-neck')}
             onMouseEnter={() => setHoveredPart('head-neck')}
             onMouseLeave={() => setHoveredPart(null)}>
            <ellipse cx="160" cy="70" rx="42" ry="52" 
              fill={getIntensityGradient(getSymptomIntensity('back-head'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2.5"
              filter="url(#premiumGlow)"
            />
            <rect x="135" y="125" width="50" height="35" rx="18" 
              fill={getIntensityGradient(getSymptomIntensity('back-neck'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#innerShadow)"
            />
            <text x="160" y="85" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Head & Neck
            </text>
          </g>

          {/* Upper Back */}
          <g className="cursor-pointer transition-all duration-700 ease-out hover:scale-105" 
             onClick={() => handleZoomIn('upper-body')}
             onMouseEnter={() => setHoveredPart('upper-body')}
             onMouseLeave={() => setHoveredPart(null)}>
            <rect x="120" y="160" width="80" height="110" rx="20" 
              fill={getIntensityGradient(getSymptomIntensity('upper-back'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2.5"
              filter="url(#premiumGlow)"
            />
            <text x="160" y="220" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Upper Back
            </text>
          </g>

          {/* Lower Back & Legs */}
          <g className="cursor-pointer transition-all duration-700 ease-out hover:scale-105" 
             onClick={() => handleZoomIn('lower-body')}
             onMouseEnter={() => setHoveredPart('lower-body')}
             onMouseLeave={() => setHoveredPart(null)}>
            <rect x="125" y="280" width="70" height="85" rx="16" 
              fill={getIntensityGradient(getSymptomIntensity('lower-back'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2.5"
              filter="url(#premiumGlow)"
            />
            <rect x="130" y="395" width="25" height="140" rx="12" 
              fill={getIntensityGradient(getSymptomIntensity('left-leg-back'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <rect x="165" y="395" width="25" height="140" rx="12" 
              fill={getIntensityGradient(getSymptomIntensity('right-leg-back'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <text x="160" y="340" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Lower Body
            </text>
          </g>
        </>
      )}
    </svg>
  );

  // LEVEL 2: Head & Neck Region
  const renderHeadNeck = () => (
    <svg width="400" height="500" viewBox="0 0 400 500" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      {currentSide === 'front' ? (
        <>
          {/* Face Region */}
          <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
             onClick={() => handleZoomIn('face')}
             onMouseEnter={() => setHoveredPart('face')}
             onMouseLeave={() => setHoveredPart(null)}>
            <ellipse cx="200" cy="150" rx="80" ry="100" 
              fill={getIntensityGradient(Math.max(getSymptomIntensity('forehead'), getSymptomIntensity('eyes'), getSymptomIntensity('nose')))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="3"
              filter="url(#premiumGlow)"
            />
            <text x="200" y="160" textAnchor="middle" 
              className="text-lg font-bold fill-slate-700 pointer-events-none">
              Face
            </text>
            <text x="200" y="180" textAnchor="middle" 
              className="text-sm fill-slate-600 pointer-events-none">
              (Tap to explore)
            </text>
          </g>

          {/* Ears */}
          <ellipse cx="100" cy="150" rx="25" ry="40" 
            fill={getIntensityGradient(getSymptomIntensity('left-ear'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-110"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('left-ear', 'Left Ear', e)} />
          
          <ellipse cx="300" cy="150" rx="25" ry="40" 
            fill={getIntensityGradient(getSymptomIntensity('right-ear'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-110"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('right-ear', 'Right Ear', e)} />

          {/* Neck */}
          <rect x="150" y="260" width="100" height="80" rx="25" 
            fill={getIntensityGradient(getSymptomIntensity('neck'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-105"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('neck', 'Neck', e)} />
          <text x="200" y="305" textAnchor="middle" 
            className="text-sm font-semibold fill-slate-700 pointer-events-none">
            Neck
          </text>

          {/* Throat */}
          <ellipse cx="200" cy="280" rx="30" ry="20" 
            fill={getIntensityGradient(getSymptomIntensity('throat'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-110"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('throat', 'Throat', e)} />
          <text x="200" y="320" textAnchor="middle" 
            className="text-xs font-medium fill-slate-600 pointer-events-none">
            Throat
          </text>
        </>
      ) : (
        // Back of head view
        <>
          <ellipse cx="200" cy="150" rx="80" ry="100" 
            fill={getIntensityGradient(getSymptomIntensity('back-head'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="3"
            className="cursor-pointer transition-all duration-400 hover:scale-105"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('back-head', 'Back of Head', e)} />
          <text x="200" y="160" textAnchor="middle" 
            className="text-lg font-bold fill-slate-700 pointer-events-none">
            Back of Head
          </text>

          <rect x="150" y="260" width="100" height="80" rx="25" 
            fill={getIntensityGradient(getSymptomIntensity('back-neck'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-105"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('back-neck', 'Back of Neck', e)} />
          <text x="200" y="305" textAnchor="middle" 
            className="text-sm font-semibold fill-slate-700 pointer-events-none">
            Back of Neck
          </text>
        </>
      )}
    </svg>
  );

  // LEVEL 2: Upper Body Region
  const renderUpperBody = () => (
    <svg width="450" height="400" viewBox="0 0 450 400" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      {currentSide === 'front' ? (
        <>
          {/* Shoulders */}
          <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
             onClick={() => handleZoomIn('shoulders')}
             onMouseEnter={() => setHoveredPart('shoulders')}
             onMouseLeave={() => setHoveredPart(null)}>
            <ellipse cx="120" cy="80" rx="40" ry="25" 
              fill={getIntensityGradient(getSymptomIntensity('left-shoulder'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2.5"
              filter="url(#premiumGlow)"
            />
            <ellipse cx="330" cy="80" rx="40" ry="25" 
              fill={getIntensityGradient(getSymptomIntensity('right-shoulder'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2.5"
              filter="url(#premiumGlow)"
            />
            <text x="225" y="60" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Shoulders
            </text>
          </g>

          {/* Arms */}
          <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
             onClick={() => handleZoomIn('arms')}
             onMouseEnter={() => setHoveredPart('arms')}
             onMouseLeave={() => setHoveredPart(null)}>
            <rect x="50" y="105" width="35" height="200" rx="17" 
              fill={getIntensityGradient(getSymptomIntensity('left-arm'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <rect x="365" y="105" width="35" height="200" rx="17" 
              fill={getIntensityGradient(getSymptomIntensity('right-arm'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <text x="67" y="210" textAnchor="middle" 
              className="text-xs font-medium fill-slate-700 pointer-events-none"
              transform="rotate(-90 67 210)">
              Arms
            </text>
          </g>

          {/* Chest & Heart */}
          <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
             onClick={() => handleZoomIn('chest-heart')}
             onMouseEnter={() => setHoveredPart('chest-heart')}
             onMouseLeave={() => setHoveredPart(null)}>
            <rect x="140" y="105" width="170" height="180" rx="25" 
              fill={getIntensityGradient(Math.max(getSymptomIntensity('chest'), getSymptomIntensity('heart')))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="3"
              filter="url(#premiumGlow)"
            />
            {/* Heart indicator */}
            <path d="M 210 150 C 205 145, 195 145, 195 155 C 195 165, 210 180, 210 180 C 210 180, 225 165, 225 155 C 225 145, 215 145, 210 150 Z"
              fill="rgba(239, 68, 68, 0.7)"
              className="animate-pulse"
            />
            <text x="225" y="200" textAnchor="middle" 
              className="text-lg font-bold fill-slate-700 pointer-events-none">
              Chest & Heart
            </text>
            <text x="225" y="220" textAnchor="middle" 
              className="text-sm fill-slate-600 pointer-events-none">
              (Tap to explore)
            </text>
          </g>
        </>
      ) : (
        // Back view
        <>
          <rect x="140" y="105" width="170" height="180" rx="25" 
            fill={getIntensityGradient(getSymptomIntensity('upper-back'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="3"
            className="cursor-pointer transition-all duration-400 hover:scale-105"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('upper-back', 'Upper Back', e)} />
          <text x="225" y="200" textAnchor="middle" 
            className="text-lg font-bold fill-slate-700 pointer-events-none">
            Upper Back
          </text>

          {/* Shoulder blades */}
          <ellipse cx="180" cy="140" rx="25" ry="40" 
            fill={getIntensityGradient(getSymptomIntensity('left-shoulder-blade'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-110"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('left-shoulder-blade', 'Left Shoulder Blade', e)} />
          
          <ellipse cx="270" cy="140" rx="25" ry="40" 
            fill={getIntensityGradient(getSymptomIntensity('right-shoulder-blade'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-110"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('right-shoulder-blade', 'Right Shoulder Blade', e)} />
        </>
      )}
    </svg>
  );

  // LEVEL 2: Lower Body Region
  const renderLowerBody = () => (
    <svg width="400" height="600" viewBox="0 0 400 600" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      {currentSide === 'front' ? (
        <>
          {/* Abdomen */}
          <rect x="150" y="50" width="100" height="120" rx="20" 
            fill={getIntensityGradient(getSymptomIntensity('abdomen'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="3"
            className="cursor-pointer transition-all duration-500 hover:scale-105"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('abdomen', 'Abdomen', e)} />
          <text x="200" y="115" textAnchor="middle" 
            className="text-lg font-bold fill-slate-700 pointer-events-none">
            Abdomen
          </text>

          {/* Legs */}
          <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
             onClick={() => handleZoomIn('legs')}
             onMouseEnter={() => setHoveredPart('legs')}
             onMouseLeave={() => setHoveredPart(null)}>
            <rect x="160" y="180" width="35" height="280" rx="17" 
              fill={getIntensityGradient(getSymptomIntensity('left-leg'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <rect x="205" y="180" width="35" height="280" rx="17" 
              fill={getIntensityGradient(getSymptomIntensity('right-leg'))}
              stroke="rgba(59, 130, 246, 0.3)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <text x="200" y="330" textAnchor="middle" 
              className="text-lg font-bold fill-slate-700 pointer-events-none">
              Legs
            </text>
            <text x="200" y="350" textAnchor="middle" 
              className="text-sm fill-slate-600 pointer-events-none">
              (Tap to explore)
            </text>
          </g>

          {/* Feet */}
          <g className="cursor-pointer transition-all duration-500 hover:scale-105" 
             onClick={() => handleZoomIn('feet')}
             onMouseEnter={() => setHoveredPart('feet')}
             onMouseLeave={() => setHoveredPart(null)}>
            <ellipse cx="177" cy="490" rx="20" ry="35" 
              fill={getIntensityGradient(getSymptomIntensity('left-foot'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <ellipse cx="223" cy="490" rx="20" ry="35" 
              fill={getIntensityGradient(getSymptomIntensity('right-foot'))}
              stroke="rgba(59, 130, 246, 0.4)" 
              strokeWidth="2"
              filter="url(#premiumGlow)"
            />
            <text x="200" y="550" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Feet (Tap to explore)
            </text>
          </g>
        </>
      ) : (
        // Back view
        <>
          <rect x="150" y="50" width="100" height="120" rx="20" 
            fill={getIntensityGradient(getSymptomIntensity('lower-back'))}
            stroke="rgba(59, 130, 246, 0.4)" 
            strokeWidth="3"
            className="cursor-pointer transition-all duration-400 hover:scale-105"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('lower-back', 'Lower Back', e)} />
          <text x="200" y="115" textAnchor="middle" 
            className="text-lg font-bold fill-slate-700 pointer-events-none">
            Lower Back
          </text>

          <rect x="160" y="180" width="35" height="280" rx="17" 
            fill={getIntensityGradient(getSymptomIntensity('left-leg-back'))}
            stroke="rgba(59, 130, 246, 0.3)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-105"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('left-leg-back', 'Left Leg Back', e)} />
          
          <rect x="205" y="180" width="35" height="280" rx="17" 
            fill={getIntensityGradient(getSymptomIntensity('right-leg-back'))}
            stroke="rgba(59, 130, 246, 0.3)" 
            strokeWidth="2"
            className="cursor-pointer transition-all duration-400 hover:scale-105"
            filter="url(#premiumGlow)"
            onClick={(e) => handleBodyPartClick('right-leg-back', 'Right Leg Back', e)} />
        </>
      )}
    </svg>
  );

  // LEVEL 3: Face Detail
  const renderFace = () => (
    <svg width="400" height="500" viewBox="0 0 400 500" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      <ellipse cx="200" cy="200" rx="120" ry="150" 
        fill="rgba(248, 250, 252, 0.8)" 
        stroke="rgba(59, 130, 246, 0.15)" 
        strokeWidth="3" 
        filter="url(#innerShadow)"
      />
      
      {/* Forehead */}
      <rect x="120" y="80" width="160" height="60" rx="30" 
        fill={getIntensityGradient(getSymptomIntensity('forehead'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('forehead', 'Forehead', e)} />
      <text x="200" y="115" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Forehead
      </text>
      
      {/* Temples */}
      <circle cx="140" cy="120" r="20" 
        fill={getIntensityGradient(getSymptomIntensity('left-temple'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('left-temple', 'Left Temple', e)} />
      
      <circle cx="260" cy="120" r="20" 
        fill={getIntensityGradient(getSymptomIntensity('right-temple'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('right-temple', 'Right Temple', e)} />
      
      {/* Eyes */}
      <ellipse cx="160" cy="180" rx="25" ry="15" 
        fill={getIntensityGradient(getSymptomIntensity('left-eye'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('left-eye', 'Left Eye', e)} />
      
      <ellipse cx="240" cy="180" rx="25" ry="15" 
        fill={getIntensityGradient(getSymptomIntensity('right-eye'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('right-eye', 'Right Eye', e)} />
      
      {/* Nose */}
      <polygon points="200,200 185,240 215,240" 
        fill={getIntensityGradient(getSymptomIntensity('nose'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('nose', 'Nose', e)} />
      
      {/* Mouth */}
      <ellipse cx="200" cy="280" rx="30" ry="15" 
        fill={getIntensityGradient(getSymptomIntensity('mouth'))}
        stroke="rgba(59, 130, 246, 0.4)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('mouth', 'Mouth', e)} />
      
      {/* Jaw */}
      <ellipse cx="200" cy="320" rx="60" ry="30" 
        fill={getIntensityGradient(getSymptomIntensity('jaw'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('jaw', 'Jaw', e)} />
    </svg>
  );

  // Add more detailed render functions for other levels...
  const renderChestHeart = () => (
    <svg width="400" height="450" viewBox="0 0 400 450" className="w-full h-auto">
      {renderAdvancedGradients()}
      
      <rect x="50" y="50" width="300" height="350" rx="40" 
        fill="rgba(248, 250, 252, 0.7)" 
        stroke="rgba(59, 130, 246, 0.15)" 
        strokeWidth="3" 
        filter="url(#innerShadow)"
      />
      
      {/* Heart */}
      <path d="M 180 160 C 175 155, 165 155, 165 165 C 165 175, 180 190, 180 190 C 180 190, 195 175, 195 165 C 195 155, 185 155, 180 160 Z"
        fill={getIntensityGradient(getSymptomIntensity('heart'))}
        stroke="rgba(239, 68, 68, 0.6)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-110"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('heart', 'Heart', e)} />
      <text x="180" y="210" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Heart
      </text>
      
      {/* Lungs */}
      <ellipse cx="140" cy="180" rx="50" ry="70"
        fill={getIntensityGradient(getSymptomIntensity('left-lung'))}
        stroke="rgba(59, 130, 246, 0.35)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('left-lung', 'Left Lung', e)} />
      
      <ellipse cx="260" cy="180" rx="50" ry="70"
        fill={getIntensityGradient(getSymptomIntensity('right-lung'))}
        stroke="rgba(59, 130, 246, 0.35)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('right-lung', 'Right Lung', e)} />
      
      {/* Chest areas */}
      <rect x="80" y="80" width="240" height="120" rx="25"
        fill={getIntensityGradient(getSymptomIntensity('upper-chest'))}
        stroke="rgba(59, 130, 246, 0.3)" 
        strokeWidth="2"
        className="cursor-pointer transition-all duration-400 hover:scale-105"
        filter="url(#premiumGlow)"
        onClick={(e) => handleBodyPartClick('upper-chest', 'Upper Chest', e)} />
    </svg>
  );

  const getCurrentView = () => {
    switch (currentZoom) {
      case 'overview': return renderOverview();
      case 'head-neck': return renderHeadNeck();
      case 'upper-body': return renderUpperBody();
      case 'lower-body': return renderLowerBody();
      case 'face': return renderFace();
      case 'chest-heart': return renderChestHeart();
      // Add more cases as needed
      default: return renderOverview();
    }
  };

  const getViewTitle = () => {
    const titles: Record<ZoomLevel, string> = {
      'overview': 'Your Body',
      'head-neck': 'Head & Neck',
      'upper-body': 'Upper Body',
      'lower-body': 'Lower Body',
      'face': 'Face & Features',
      'chest-heart': 'Chest & Heart',
      'arms': 'Arms',
      'shoulders': 'Shoulders',
      'legs': 'Legs',
      'feet': 'Feet',
      'left-arm': 'Left Arm',
      'right-arm': 'Right Arm',
      'left-hand': 'Left Hand',
      'right-hand': 'Right Hand',
      'left-leg': 'Left Leg',
      'right-leg': 'Right Leg',
      'left-foot': 'Left Foot',
      'right-foot': 'Right Foot'
    };
    return titles[currentZoom] || 'Your Body';
  };

  const getInstructions = () => {
    switch (currentZoom) {
      case 'overview':
        return '✨ Tap major body regions to explore detailed areas with precision mapping';
      case 'head-neck':
      case 'upper-body':
      case 'lower-body':
        return '🎯 Select specific systems to explore, or tap individual areas to log symptoms';
      default:
        return '📍 Tap specific areas to log symptoms, or navigate back to explore more regions';
    }
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl overflow-hidden", className)}>
      <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center">
            <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
            {getViewTitle()}
          </CardTitle>
          <div className="flex space-x-2">
            {/* Front/Back Toggle */}
            {['overview', 'head-neck', 'upper-body', 'lower-body'].includes(currentZoom) && (
              <Button variant="secondary" size="sm" onClick={toggleSide} className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                {currentSide === 'front' ? 'Back' : 'Front'}
              </Button>
            )}
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
        
        {/* Enhanced breadcrumb */}
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
          {currentSide === 'back' && (
            <span className="px-2 py-1 rounded-full bg-white/10 text-blue-100 text-xs">
              <Eye className="h-3 w-3 inline mr-1" />
              Back View
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex justify-center p-8 bg-gradient-to-b from-white via-slate-50 to-blue-50">
        <div className={cn(
          "transition-all duration-500 ease-out transform",
          isTransitioning && "scale-95 opacity-50"
        )}>
          {getCurrentView()}
        </div>
      </CardContent>

      <div className="px-8 pb-6 bg-gradient-to-r from-slate-50 via-blue-50 to-purple-50">
        <p className="text-sm text-slate-600 text-center font-medium mb-4">
          {getInstructions()}
        </p>
        
        <div className="flex justify-center">
          <div className="flex items-center space-x-3 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-lg">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <span className="text-sm font-semibold text-slate-700">Seamless Health Mapping</span>
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ZoomableBodyMap;