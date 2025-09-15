import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Sparkles, RotateCcw, Activity } from 'lucide-react';
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
  | 'head-system' | 'respiratory-system' | 'cardiovascular-system' | 'digestive-system' | 'musculoskeletal-system'
  | 'head-detail' | 'chest-detail' | 'abdomen-detail' | 'arms-detail' | 'legs-detail';

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

  const getSystemIntensity = (systemParts: string[]): number => {
    return Math.max(...systemParts.map(part => getSymptomIntensity(part)));
  };

  const getIntensityFill = (intensity: number): string => {
    if (intensity === 0) return 'rgba(148, 163, 184, 0.3)'; // Neutral gray
    if (intensity <= 3) return 'rgba(34, 197, 94, 0.6)'; // Green - mild
    if (intensity <= 6) return 'rgba(234, 179, 8, 0.7)'; // Yellow - moderate
    if (intensity <= 8) return 'rgba(249, 115, 22, 0.8)'; // Orange - strong
    return 'rgba(239, 68, 68, 0.9)'; // Red - severe
  };

  const getIntensityStroke = (intensity: number): string => {
    if (intensity === 0) return 'rgba(148, 163, 184, 0.5)';
    if (intensity <= 3) return 'rgba(34, 197, 94, 0.8)';
    if (intensity <= 6) return 'rgba(234, 179, 8, 0.9)';
    if (intensity <= 8) return 'rgba(249, 115, 22, 1)';
    return 'rgba(239, 68, 68, 1)';
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

  // Enhanced gradients and filters for better visuals
  const renderGradients = () => (
    <defs>
      <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="systemHighlight" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
      </filter>

      <pattern id="systemPattern" patternUnits="userSpaceOnUse" width="4" height="4">
        <rect width="4" height="4" fill="rgba(255,255,255,0.1)"/>
        <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.2)"/>
      </pattern>
    </defs>
  );

  // LEVEL 1: Visual Body Overview with Separated Systems
  const renderOverview = () => (
    <div className="flex justify-center">
      <svg width="500" height="700" viewBox="0 0 500 700" className="w-full h-auto max-w-md">
        {renderGradients()}
        
        {currentSide === 'front' ? (
          <>
            {/* HEAD & NERVOUS SYSTEM */}
            <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('head-system')}
               onMouseEnter={() => setHoveredPart('head-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Head outline */}
              <ellipse cx="250" cy="100" rx="60" ry="75" 
                fill={getIntensityFill(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              
              {/* Brain representation */}
              <path d="M 220 80 Q 250 60, 280 80 Q 290 100, 280 120 Q 250 140, 220 120 Q 210 100, 220 80 Z"
                fill="rgba(139, 69, 19, 0.3)"
                stroke="rgba(139, 69, 19, 0.6)"
                strokeWidth="1"
              />
              
              {/* Eyes */}
              <ellipse cx="235" cy="95" rx="8" ry="6" fill="rgba(59, 130, 246, 0.7)" />
              <ellipse cx="265" cy="95" rx="8" ry="6" fill="rgba(59, 130, 246, 0.7)" />
              
              {/* System label */}
              <text x="250" y="200" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Head & Brain
              </text>
              
              {hoveredPart === 'head-system' && !readOnly && (
                <circle cx="320" cy="80" r="6" fill="rgba(99, 102, 241, 0.8)" className="animate-pulse" />
              )}
            </g>

            {/* RESPIRATORY SYSTEM */}
            <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('respiratory-system')}
               onMouseEnter={() => setHoveredPart('respiratory-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Chest cavity */}
              <rect x="200" y="180" width="100" height="120" rx="25" 
                fill={getIntensityFill(getSystemIntensity(['lungs', 'chest', 'throat']))}
                stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              
              {/* Lung representations */}
              <ellipse cx="230" cy="240" rx="25" ry="40" 
                fill="rgba(59, 130, 246, 0.4)"
                stroke="rgba(59, 130, 246, 0.7)"
                strokeWidth="2"
              />
              <ellipse cx="270" cy="240" rx="25" ry="40" 
                fill="rgba(59, 130, 246, 0.4)"
                stroke="rgba(59, 130, 246, 0.7)"
                strokeWidth="2"
              />
              
              {/* Throat */}
              <rect x="240" y="175" width="20" height="25" rx="10" 
                fill="rgba(168, 85, 247, 0.5)"
                stroke="rgba(168, 85, 247, 0.8)"
                strokeWidth="2"
              />
              
              <text x="250" y="330" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Breathing & Lungs
              </text>
              
              {hoveredPart === 'respiratory-system' && !readOnly && (
                <circle cx="320" cy="220" r="6" fill="rgba(14, 165, 233, 0.8)" className="animate-pulse" />
              )}
            </g>

            {/* CARDIOVASCULAR SYSTEM */}
            <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('cardiovascular-system')}
               onMouseEnter={() => setHoveredPart('cardiovascular-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Heart */}
              <path d="M 240 220 C 235 215, 225 215, 225 225 C 225 235, 240 250, 240 250 C 240 250, 255 235, 255 225 C 255 215, 245 215, 240 220 Z"
                fill={getIntensityFill(getSystemIntensity(['heart']))}
                stroke={getIntensityStroke(getSystemIntensity(['heart']))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              
              <text x="240" y="270" textAnchor="middle" className="text-xs font-bold fill-slate-700 pointer-events-none">
                Heart
              </text>
              
              {hoveredPart === 'cardiovascular-system' && !readOnly && (
                <circle cx="270" cy="225" r="4" fill="rgba(239, 68, 68, 0.8)" className="animate-pulse" />
              )}
            </g>

            {/* DIGESTIVE SYSTEM */}
            <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('digestive-system')}
               onMouseEnter={() => setHoveredPart('digestive-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Abdomen */}
              <rect x="210" y="310" width="80" height="100" rx="20" 
                fill={getIntensityFill(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                stroke={getIntensityStroke(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              
              {/* Stomach representation */}
              <ellipse cx="240" cy="340" rx="20" ry="15" 
                fill="rgba(34, 197, 94, 0.4)"
                stroke="rgba(34, 197, 94, 0.7)"
                strokeWidth="2"
              />
              
              {/* Intestines representation */}
              <path d="M 220 370 Q 250 360, 270 370 Q 280 380, 270 390 Q 250 400, 220 390 Q 210 380, 220 370"
                fill="rgba(168, 85, 247, 0.3)"
                stroke="rgba(168, 85, 247, 0.6)"
                strokeWidth="2"
              />
              
              <text x="250" y="440" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Stomach & Digestion
              </text>
              
              {hoveredPart === 'digestive-system' && !readOnly && (
                <circle cx="310" cy="350" r="6" fill="rgba(34, 197, 94, 0.8)" className="animate-pulse" />
              )}
            </g>

            {/* MUSCULOSKELETAL SYSTEM */}
            <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('musculoskeletal-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Arms */}
              <rect x="150" y="190" width="35" height="150" rx="17" 
                fill={getIntensityFill(getSystemIntensity(['left-arm', 'left-shoulder', 'left-hand']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder', 'left-hand']))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              <rect x="315" y="190" width="35" height="150" rx="17" 
                fill={getIntensityFill(getSystemIntensity(['right-arm', 'right-shoulder', 'right-hand']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder', 'right-hand']))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              
              {/* Hands */}
              <ellipse cx="167" cy="360" rx="15" ry="20" 
                fill={getIntensityFill(getSymptomIntensity('left-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
                strokeWidth="2"
              />
              <ellipse cx="333" cy="360" rx="15" ry="20" 
                fill={getIntensityFill(getSymptomIntensity('right-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
                strokeWidth="2"
              />
              
              {/* Legs */}
              <rect x="220" y="420" width="30" height="180" rx="15" 
                fill={getIntensityFill(getSystemIntensity(['left-leg', 'left-knee', 'left-foot']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee', 'left-foot']))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              <rect x="250" y="420" width="30" height="180" rx="15" 
                fill={getIntensityFill(getSystemIntensity(['right-leg', 'right-knee', 'right-foot']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee', 'right-foot']))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              
              {/* Feet */}
              <ellipse cx="235" cy="620" rx="12" ry="25" 
                fill={getIntensityFill(getSymptomIntensity('left-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
                strokeWidth="2"
              />
              <ellipse cx="265" cy="620" rx="12" ry="25" 
                fill={getIntensityFill(getSymptomIntensity('right-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
                strokeWidth="2"
              />
              
              <text x="120" y="280" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Arms &
              </text>
              <text x="120" y="300" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Hands
              </text>
              
              <text x="380" y="280" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Arms &
              </text>
              <text x="380" y="300" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Hands
              </text>
              
              <text x="250" y="670" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Legs & Feet
              </text>
              
              {hoveredPart === 'musculoskeletal-system' && !readOnly && (
                <circle cx="190" cy="250" r="6" fill="rgba(249, 115, 22, 0.8)" className="animate-pulse" />
              )}
            </g>
          </>
        ) : (
          // Back view - simplified
          <>
            {/* Back/Spine System */}
            <g className={cn("transition-all duration-300", !readOnly && "cursor-pointer")} 
               onClick={(e) => !readOnly && handleBodyPartClick('back', 'Back & Spine', e)}
               onMouseEnter={() => setHoveredPart('back')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="200" y="180" width="100" height="300" rx="30" 
                fill={getIntensityFill(getSymptomIntensity('back'))}
                stroke={getIntensityStroke(getSymptomIntensity('back'))}
                strokeWidth="3"
                filter="url(#systemHighlight)"
                className="hover:brightness-110 transition-all duration-200"
              />
              
              {/* Spine representation */}
              <line x1="250" y1="190" x2="250" y2="470" 
                stroke="rgba(139, 69, 19, 0.8)" 
                strokeWidth="4"
              />
              
              {/* Vertebrae dots */}
              {[200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460].map((y, i) => (
                <circle key={i} cx="250" cy={y} r="3" fill="rgba(139, 69, 19, 0.6)" />
              ))}
              
              <text x="250" y="520" textAnchor="middle" className="text-lg font-bold fill-slate-700 pointer-events-none">
                Back & Spine
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );

  // LEVEL 2: Head System Detail (same as before but with visual improvements)
  const renderHeadSystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Head & Brain Areas</h2>
        <p className="text-slate-600">Tap the specific area where you're experiencing symptoms</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'head', name: 'Head/Scalp', icon: '🧠' },
          { id: 'forehead', name: 'Forehead', icon: '👤' },
          { id: 'left-temple', name: 'Left Temple', icon: '👈' },
          { id: 'right-temple', name: 'Right Temple', icon: '👉' },
          { id: 'left-eye', name: 'Left Eye', icon: '👁️' },
          { id: 'right-eye', name: 'Right Eye', icon: '👁️' },
          { id: 'left-ear', name: 'Left Ear', icon: '👂' },
          { id: 'right-ear', name: 'Right Ear', icon: '👂' },
          { id: 'nose', name: 'Nose', icon: '👃' },
          { id: 'mouth', name: 'Mouth', icon: '👄' },
          { id: 'jaw', name: 'Jaw', icon: '🦷' },
          { id: 'neck', name: 'Neck', icon: '🦴' }
        ].map((part) => {
          const intensity = getSymptomIntensity(part.id);
          return (
            <Card
              key={part.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                intensity > 0 ? "border-orange-300 shadow-orange-200/50" : "border-slate-300"
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn(
                "p-4 text-center bg-gradient-to-br",
                intensity > 0 ? "from-orange-100 to-orange-200" : "from-slate-100 to-slate-200"
              )}>
                <div className="text-2xl mb-2">{part.icon}</div>
                <h4 className="font-semibold text-slate-800">{part.name}</h4>
                {intensity > 0 && (
                  <div className="text-xs mt-2 font-medium text-slate-600">
                    Intensity: {intensity}/10
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Add other system detail views here (respiratory, cardiovascular, etc.)
  const renderRespiratorySystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Breathing & Lung Areas</h2>
        <p className="text-slate-600">Tap the specific area affecting your breathing</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'throat', name: 'Throat', icon: '🫁' },
          { id: 'upper-chest', name: 'Upper Chest', icon: '🫁' },
          { id: 'left-lung', name: 'Left Lung', icon: '🫁' },
          { id: 'right-lung', name: 'Right Lung', icon: '🫁' },
          { id: 'chest', name: 'Chest', icon: '🫁' },
          { id: 'airways', name: 'Airways', icon: '💨' }
        ].map((part) => {
          const intensity = getSymptomIntensity(part.id);
          return (
            <Card
              key={part.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                intensity > 0 ? "border-blue-300 shadow-blue-200/50" : "border-slate-300"
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn(
                "p-4 text-center bg-gradient-to-br",
                intensity > 0 ? "from-blue-100 to-blue-200" : "from-slate-100 to-slate-200"
              )}>
                <div className="text-2xl mb-2">{part.icon}</div>
                <h4 className="font-semibold text-slate-800">{part.name}</h4>
                {intensity > 0 && (
                  <div className="text-xs mt-2 font-medium text-slate-600">
                    Intensity: {intensity}/10
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
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
      'head-system': 'Head & Brain Areas',
      'respiratory-system': 'Breathing & Lung Areas',
      'cardiovascular-system': 'Heart & Circulation',
      'digestive-system': 'Stomach & Digestion',
      'musculoskeletal-system': 'Muscles & Joints',
      'head-detail': 'Head Detail',
      'chest-detail': 'Chest Detail',
      'abdomen-detail': 'Abdomen Detail',
      'arms-detail': 'Arms Detail',
      'legs-detail': 'Legs Detail'
    };
    return titles[currentZoom] || 'Body Systems';
  };

  const getInstructions = () => {
    if (readOnly) {
      return '👁️ Visual overview of your recent symptoms by body area';
    }
    
    switch (currentZoom) {
      case 'overview':
        return '👆 Tap any body area to explore specific parts for symptom logging';
      case 'head-system':
      case 'respiratory-system':
      case 'cardiovascular-system':
      case 'digestive-system':
      case 'musculoskeletal-system':
        return '📍 Tap the specific body part where you feel symptoms';
      default:
        return '📝 Select where you\'re experiencing symptoms';
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
                  {level === 'overview' ? 'Body View' : getViewTitle()}
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
              <span className="text-xs font-medium text-slate-700">Visual Body Mapping</span>
              <Sparkles className="w-3 h-3 text-blue-500" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ZoomableBodyMap;