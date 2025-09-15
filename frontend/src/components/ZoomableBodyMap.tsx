import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Sparkles, RotateCcw, Eye, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Symptom } from '@/types/health';

interface ZoomableBodyMapProps {
  onBodyPartClick: (bodyPartId: string, bodyPartName: string, coordinates: { x: number; y: number }) => void;
  symptoms: Symptom[];
  selectedBodyPart?: string;
  className?: string;
  readOnly?: boolean;
}

type ZoomLevel = 
  | 'overview' 
  | 'head-system' | 'respiratory-system' | 'cardiovascular-system' | 'digestive-system' | 'musculoskeletal-system' | 'nervous-system'
  | 'head-detail' | 'chest-detail' | 'abdomen-detail' | 'arms-detail' | 'legs-detail'
  | 'left-arm' | 'right-arm' | 'left-hand' | 'right-hand' 
  | 'left-leg' | 'right-leg' | 'left-foot' | 'right-foot';

type ViewSide = 'front' | 'back';

const ZoomableBodyMap: React.FC<ZoomableBodyMapProps> = ({
  onBodyPartClick,
  symptoms,
  selectedBodyPart,
  className,
  readOnly = false
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

  const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return 'rgba(148, 163, 184, 0.3)'; // Neutral gray
    if (intensity <= 3) return 'rgba(34, 197, 94, 0.6)'; // Green - mild
    if (intensity <= 6) return 'rgba(234, 179, 8, 0.7)'; // Yellow - moderate
    if (intensity <= 8) return 'rgba(249, 115, 22, 0.8)'; // Orange - strong
    return 'rgba(239, 68, 68, 0.9)'; // Red - severe
  };

  const getIntensityGlow = (intensity: number): string => {
    if (intensity === 0) return '';
    if (intensity <= 3) return 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))';
    if (intensity <= 6) return 'drop-shadow(0 0 12px rgba(234, 179, 8, 0.5))';
    if (intensity <= 8) return 'drop-shadow(0 0 16px rgba(249, 115, 22, 0.6))';
    return 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.7))';
  };

  const handleZoomIn = (zoomLevel: ZoomLevel) => {
    if (readOnly) return;
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
      setCurrentSide('front');
      setIsTransitioning(false);
    }, 200);
  };

  const toggleSide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSide(prev => prev === 'front' ? 'back' : 'front');
      setIsTransitioning(false);
    }, 150);
  };

  const handleBodyPartClick = (bodyPartId: string, bodyPartName: string, event: React.MouseEvent<SVGElement>) => {
    if (readOnly) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const coordinates = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    onBodyPartClick(bodyPartId, bodyPartName, coordinates);
  };

  // Enhanced gradients for better aesthetics
  const renderGradients = () => (
    <defs>
      <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      
      <radialGradient id="healthyGlow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="rgba(148, 163, 184, 0.1)" />
        <stop offset="100%" stopColor="rgba(148, 163, 184, 0.3)" />
      </radialGradient>
      
      <radialGradient id="mildGlow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="rgba(34, 197, 94, 0.2)" />
        <stop offset="100%" stopColor="rgba(34, 197, 94, 0.6)" />
      </radialGradient>
      
      <radialGradient id="moderateGlow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="rgba(234, 179, 8, 0.3)" />
        <stop offset="100%" stopColor="rgba(234, 179, 8, 0.7)" />
      </radialGradient>
      
      <radialGradient id="strongGlow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="rgba(249, 115, 22, 0.4)" />
        <stop offset="100%" stopColor="rgba(249, 115, 22, 0.8)" />
      </radialGradient>
      
      <radialGradient id="severeGlow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="rgba(239, 68, 68, 0.5)" />
        <stop offset="100%" stopColor="rgba(239, 68, 68, 0.9)" />
      </radialGradient>

      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feOffset dx="0" dy="1"/>
        <feGaussianBlur stdDeviation="1" result="offset-blur"/>
        <feFlood floodColor="#000000" floodOpacity="0.05"/>
        <feComposite in2="offset-blur" operator="in"/>
        <feMerge> 
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  );

  const getIntensityFill = (intensity: number): string => {
    if (intensity === 0) return 'url(#healthyGlow)';
    if (intensity <= 3) return 'url(#mildGlow)';
    if (intensity <= 6) return 'url(#moderateGlow)';
    if (intensity <= 8) return 'url(#strongGlow)';
    return 'url(#severeGlow)';
  };

  // LEVEL 1: System Overview - Organized by medical systems
  const renderOverview = () => (
    <svg width="400" height="600" viewBox="0 0 400 600" className="w-full h-auto">
      {renderGradients()}
      
      {/* Background body silhouette */}
      <ellipse cx="200" cy="80" rx="45" ry="55" fill="url(#bodyGradient)" opacity="0.3" />
      <rect x="155" y="135" width="90" height="200" rx="25" fill="url(#bodyGradient)" opacity="0.3" />
      <rect x="170" y="335" width="25" height="150" rx="12" fill="url(#bodyGradient)" opacity="0.3" />
      <rect x="205" y="335" width="25" height="150" rx="12" fill="url(#bodyGradient)" opacity="0.3" />

      {currentSide === 'front' ? (
        <>
          {/* Head & Nervous System */}
          <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")} 
             onClick={() => handleZoomIn('head-system')}
             onMouseEnter={() => setHoveredPart('head-system')}
             onMouseLeave={() => setHoveredPart(null)}>
            <ellipse cx="200" cy="80" rx="45" ry="55" 
              fill={getIntensityFill(Math.max(
                getSymptomIntensity('head'), 
                getSymptomIntensity('brain'),
                getSymptomIntensity('eyes'),
                getSymptomIntensity('ears')
              ))}
              stroke="rgba(99, 102, 241, 0.5)" 
              strokeWidth="2"
              filter="url(#softGlow)"
              style={{ filter: getIntensityGlow(Math.max(getSymptomIntensity('head'), getSymptomIntensity('brain'))) }}
            />
            <text x="200" y="85" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Head & Nervous
            </text>
            {hoveredPart === 'head-system' && !readOnly && (
              <circle cx="250" cy="60" r="4" fill="rgba(99, 102, 241, 0.8)" className="animate-pulse" />
            )}
          </g>

          {/* Respiratory System */}
          <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")} 
             onClick={() => handleZoomIn('respiratory-system')}
             onMouseEnter={() => setHoveredPart('respiratory-system')}
             onMouseLeave={() => setHoveredPart(null)}>
            <rect x="160" y="140" width="80" height="90" rx="20" 
              fill={getIntensityFill(Math.max(
                getSymptomIntensity('lungs'), 
                getSymptomIntensity('chest'),
                getSymptomIntensity('throat')
              ))}
              stroke="rgba(14, 165, 233, 0.5)" 
              strokeWidth="2"
              filter="url(#softGlow)"
              style={{ filter: getIntensityGlow(getSymptomIntensity('lungs')) }}
            />
            <text x="200" y="190" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Respiratory
            </text>
            {hoveredPart === 'respiratory-system' && !readOnly && (
              <circle cx="220" cy="160" r="3" fill="rgba(14, 165, 233, 0.8)" className="animate-pulse" />
            )}
          </g>

          {/* Cardiovascular System */}
          <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")} 
             onClick={() => handleZoomIn('cardiovascular-system')}
             onMouseEnter={() => setHoveredPart('cardiovascular-system')}
             onMouseLeave={() => setHoveredPart(null)}>
            <path d="M 185 170 C 180 165, 170 165, 170 175 C 170 185, 185 200, 185 200 C 185 200, 200 185, 200 175 C 200 165, 190 165, 185 170 Z"
              fill={getIntensityFill(getSymptomIntensity('heart'))}
              stroke="rgba(239, 68, 68, 0.6)" 
              strokeWidth="2"
              filter="url(#softGlow)"
              style={{ filter: getIntensityGlow(getSymptomIntensity('heart')) }}
            />
            <text x="185" y="220" textAnchor="middle" 
              className="text-xs font-semibold fill-slate-700 pointer-events-none">
              Heart
            </text>
            {hoveredPart === 'cardiovascular-system' && !readOnly && (
              <circle cx="205" cy="175" r="2" fill="rgba(239, 68, 68, 0.8)" className="animate-pulse" />
            )}
          </g>

          {/* Digestive System */}
          <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")} 
             onClick={() => handleZoomIn('digestive-system')}
             onMouseEnter={() => setHoveredPart('digestive-system')}
             onMouseLeave={() => setHoveredPart(null)}>
            <rect x="165" y="240" width="70" height="85" rx="18" 
              fill={getIntensityFill(Math.max(
                getSymptomIntensity('stomach'), 
                getSymptomIntensity('abdomen'),
                getSymptomIntensity('intestines')
              ))}
              stroke="rgba(168, 85, 247, 0.5)" 
              strokeWidth="2"
              filter="url(#softGlow)"
              style={{ filter: getIntensityGlow(getSymptomIntensity('stomach')) }}
            />
            <text x="200" y="290" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Digestive
            </text>
            {hoveredPart === 'digestive-system' && !readOnly && (
              <circle cx="220" cy="260" r="3" fill="rgba(168, 85, 247, 0.8)" className="animate-pulse" />
            )}
          </g>

          {/* Musculoskeletal System */}
          <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")} 
             onClick={() => handleZoomIn('musculoskeletal-system')}
             onMouseEnter={() => setHoveredPart('musculoskeletal-system')}
             onMouseLeave={() => setHoveredPart(null)}>
            {/* Arms */}
            <rect x="120" y="150" width="25" height="120" rx="12" 
              fill={getIntensityFill(getSymptomIntensity('left-arm'))}
              stroke="rgba(34, 197, 94, 0.5)" 
              strokeWidth="2"
              filter="url(#softGlow)"
            />
            <rect x="255" y="150" width="25" height="120" rx="12" 
              fill={getIntensityFill(getSymptomIntensity('right-arm'))}
              stroke="rgba(34, 197, 94, 0.5)" 
              strokeWidth="2"
              filter="url(#softGlow)"
            />
            {/* Legs */}
            <rect x="170" y="335" width="25" height="150" rx="12" 
              fill={getIntensityFill(getSymptomIntensity('left-leg'))}
              stroke="rgba(34, 197, 94, 0.5)" 
              strokeWidth="2"
              filter="url(#softGlow)"
            />
            <rect x="205" y="335" width="25" height="150" rx="12" 
              fill={getIntensityFill(getSymptomIntensity('right-leg'))}
              stroke="rgba(34, 197, 94, 0.5)" 
              strokeWidth="2"
              filter="url(#softGlow)"
            />
            <text x="200" y="400" textAnchor="middle" 
              className="text-sm font-semibold fill-slate-700 pointer-events-none">
              Muscles & Joints
            </text>
            {hoveredPart === 'musculoskeletal-system' && !readOnly && (
              <circle cx="180" cy="350" r="3" fill="rgba(34, 197, 94, 0.8)" className="animate-pulse" />
            )}
          </g>
        </>
      ) : (
        // Back view - simplified for better UX
        <>
          <rect x="160" y="140" width="80" height="180" rx="20" 
            fill={getIntensityFill(getSymptomIntensity('back'))}
            stroke="rgba(99, 102, 241, 0.5)" 
            strokeWidth="2"
            className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")}
            filter="url(#softGlow)"
            onClick={(e) => handleBodyPartClick('back', 'Back', e)} />
          <text x="200" y="235" textAnchor="middle" 
            className="text-lg font-bold fill-slate-700 pointer-events-none">
            Back & Spine
          </text>
        </>
      )}
    </svg>
  );

  // LEVEL 2: Head System Detail
  const renderHeadSystem = () => (
    <svg width="400" height="500" viewBox="0 0 400 500" className="w-full h-auto">
      {renderGradients()}
      
      <ellipse cx="200" cy="200" rx="120" ry="150" 
        fill="rgba(248, 250, 252, 0.9)" 
        stroke="rgba(99, 102, 241, 0.2)" 
        strokeWidth="2" 
        filter="url(#innerShadow)"
      />
      
      {/* Brain/Head */}
      <ellipse cx="200" cy="150" rx="80" ry="70" 
        fill={getIntensityFill(getSymptomIntensity('head'))}
        stroke="rgba(99, 102, 241, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('head', 'Head', e)} />
      <text x="200" y="155" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Head
      </text>
      
      {/* Eyes */}
      <ellipse cx="170" cy="180" rx="20" ry="12" 
        fill={getIntensityFill(getSymptomIntensity('left-eye'))}
        stroke="rgba(59, 130, 246, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-110")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('left-eye', 'Left Eye', e)} />
      
      <ellipse cx="230" cy="180" rx="20" ry="12" 
        fill={getIntensityFill(getSymptomIntensity('right-eye'))}
        stroke="rgba(59, 130, 246, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-110")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('right-eye', 'Right Eye', e)} />
      
      {/* Ears */}
      <ellipse cx="120" cy="200" rx="20" ry="30" 
        fill={getIntensityFill(getSymptomIntensity('left-ear'))}
        stroke="rgba(168, 85, 247, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-110")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('left-ear', 'Left Ear', e)} />
      
      <ellipse cx="280" cy="200" rx="20" ry="30" 
        fill={getIntensityFill(getSymptomIntensity('right-ear'))}
        stroke="rgba(168, 85, 247, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-110")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('right-ear', 'Right Ear', e)} />
      
      {/* Nose */}
      <polygon points="200,210 190,240 210,240" 
        fill={getIntensityFill(getSymptomIntensity('nose'))}
        stroke="rgba(34, 197, 94, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-110")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('nose', 'Nose', e)} />
      
      {/* Mouth */}
      <ellipse cx="200" cy="270" rx="25" ry="12" 
        fill={getIntensityFill(getSymptomIntensity('mouth'))}
        stroke="rgba(239, 68, 68, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-110")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('mouth', 'Mouth', e)} />
      
      {/* Neck */}
      <rect x="160" y="320" width="80" height="60" rx="20" 
        fill={getIntensityFill(getSymptomIntensity('neck'))}
        stroke="rgba(14, 165, 233, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('neck', 'Neck', e)} />
      <text x="200" y="355" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Neck
      </text>
    </svg>
  );

  // Add more system detail views...
  const renderRespiratorySystem = () => (
    <svg width="400" height="400" viewBox="0 0 400 400" className="w-full h-auto">
      {renderGradients()}
      
      <rect x="50" y="50" width="300" height="300" rx="30" 
        fill="rgba(248, 250, 252, 0.9)" 
        stroke="rgba(14, 165, 233, 0.2)" 
        strokeWidth="2" 
        filter="url(#innerShadow)"
      />
      
      {/* Lungs */}
      <ellipse cx="150" cy="180" rx="60" ry="80"
        fill={getIntensityFill(getSymptomIntensity('left-lung'))}
        stroke="rgba(14, 165, 233, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('left-lung', 'Left Lung', e)} />
      <text x="150" y="185" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Left Lung
      </text>
      
      <ellipse cx="250" cy="180" rx="60" ry="80"
        fill={getIntensityFill(getSymptomIntensity('right-lung'))}
        stroke="rgba(14, 165, 233, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('right-lung', 'Right Lung', e)} />
      <text x="250" y="185" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Right Lung
      </text>
      
      {/* Throat */}
      <ellipse cx="200" cy="100" rx="25" ry="20" 
        fill={getIntensityFill(getSymptomIntensity('throat'))}
        stroke="rgba(168, 85, 247, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-110")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('throat', 'Throat', e)} />
      <text x="200" y="105" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Throat
      </text>
      
      {/* Chest */}
      <rect x="120" y="280" width="160" height="60" rx="15" 
        fill={getIntensityFill(getSymptomIntensity('chest'))}
        stroke="rgba(34, 197, 94, 0.5)" 
        strokeWidth="2"
        className={cn("transition-all duration-300", !readOnly && "cursor-pointer hover:scale-105")}
        filter="url(#softGlow)"
        onClick={(e) => handleBodyPartClick('chest', 'Chest', e)} />
      <text x="200" y="315" textAnchor="middle" 
        className="text-sm font-semibold fill-slate-700 pointer-events-none">
        Chest
      </text>
    </svg>
  );

  const getCurrentView = () => {
    switch (currentZoom) {
      case 'overview': return renderOverview();
      case 'head-system': return renderHeadSystem();
      case 'respiratory-system': return renderRespiratorySystem();
      // Add more cases as needed
      default: return renderOverview();
    }
  };

  const getViewTitle = () => {
    const titles: Record<ZoomLevel, string> = {
      'overview': 'Body Systems',
      'head-system': 'Head & Nervous System',
      'respiratory-system': 'Respiratory System',
      'cardiovascular-system': 'Cardiovascular System',
      'digestive-system': 'Digestive System',
      'musculoskeletal-system': 'Muscles & Joints',
      'nervous-system': 'Nervous System',
      'head-detail': 'Head Detail',
      'chest-detail': 'Chest Detail',
      'abdomen-detail': 'Abdomen Detail',
      'arms-detail': 'Arms Detail',
      'legs-detail': 'Legs Detail',
      'left-arm': 'Left Arm',
      'right-arm': 'Right Arm',
      'left-hand': 'Left Hand',
      'right-hand': 'Right Hand',
      'left-leg': 'Left Leg',
      'right-leg': 'Right Leg',
      'left-foot': 'Left Foot',
      'right-foot': 'Right Foot'
    };
    return titles[currentZoom] || 'Body Systems';
  };

  const getInstructions = () => {
    if (readOnly) {
      return '📊 Visual overview of your recent symptoms by body system';
    }
    
    switch (currentZoom) {
      case 'overview':
        return '🎯 Select a body system to explore specific areas for symptom logging';
      case 'head-system':
      case 'respiratory-system':
      case 'cardiovascular-system':
      case 'digestive-system':
      case 'musculoskeletal-system':
        return '📍 Tap specific body parts to log symptoms with precise location';
      default:
        return '📝 Select the exact location where you\'re experiencing symptoms';
    }
  };

  return (
    <Card className={cn("w-full bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-lg overflow-hidden", className)}>
      {!readOnly && (
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              {getViewTitle()}
            </CardTitle>
            <div className="flex space-x-2">
              {['overview'].includes(currentZoom) && (
                <Button variant="secondary" size="sm" onClick={toggleSide} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {currentSide === 'front' ? 'Back' : 'Front'}
                </Button>
              )}
              {currentZoom !== 'overview' && (
                <Button variant="secondary" size="sm" onClick={handleZoomOut} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <ArrowLeft className="h-4 w-4 mr-1" />
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
          
          <div className="flex items-center space-x-2 text-sm text-blue-100 mt-2">
            {zoomHistory.map((level, index) => (
              <React.Fragment key={level}>
                {index > 0 && <span className="text-blue-200">→</span>}
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  index === zoomHistory.length - 1 
                    ? 'font-semibold text-white bg-white/20' 
                    : 'text-blue-200'
                )}>
                  {level === 'overview' ? 'Systems' : getViewTitle()}
                </span>
              </React.Fragment>
            ))}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("flex justify-center", readOnly ? "p-4" : "p-6")}>
        <div className={cn(
          "transition-all duration-200 ease-out",
          isTransitioning && "scale-95 opacity-70"
        )}>
          {getCurrentView()}
        </div>
      </CardContent>

      {!readOnly && (
        <div className="px-6 pb-4 bg-gradient-to-r from-slate-50 to-blue-50">
          <p className="text-sm text-slate-600 text-center font-medium mb-3">
            {getInstructions()}
          </p>
          
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full border border-blue-200/50 shadow-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-slate-700">System-Based Symptom Mapping</span>
              <Sparkles className="w-3 h-3 text-blue-500" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ZoomableBodyMap;