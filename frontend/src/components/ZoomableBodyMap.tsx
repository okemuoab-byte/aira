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

  const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return '#e2e8f0'; // Light gray
    if (intensity <= 3) return '#86efac'; // Light green
    if (intensity <= 6) return '#fde047'; // Light yellow
    if (intensity <= 8) return '#fb923c'; // Light orange
    return '#f87171'; // Light red
  };

  const getIntensityStroke = (intensity: number): string => {
    if (intensity === 0) return '#94a3b8'; // Gray
    if (intensity <= 3) return '#22c55e'; // Green
    if (intensity <= 6) return '#eab308'; // Yellow
    if (intensity <= 8) return '#f97316'; // Orange
    return '#ef4444'; // Red
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

  // Clean body diagram with distinct clickable areas
  const renderOverview = () => (
    <div className="flex justify-center">
      <svg width="400" height="600" viewBox="0 0 400 600" className="w-full h-auto max-w-sm">
        <defs>
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {currentSide === 'front' ? (
          <>
            {/* BASE BODY OUTLINE - Light gray, non-clickable */}
            <path d="M 200 50 
                     C 170 50, 150 70, 150 100
                     L 150 120
                     C 130 130, 120 140, 120 160
                     L 120 200
                     C 120 220, 130 240, 140 250
                     L 140 350
                     C 140 370, 150 380, 160 390
                     L 160 500
                     C 160 520, 170 530, 180 540
                     L 180 580
                     L 220 580
                     L 220 540
                     C 230 530, 240 520, 240 500
                     L 240 390
                     C 250 380, 260 370, 260 350
                     L 260 250
                     C 270 240, 280 220, 280 200
                     L 280 160
                     C 280 140, 270 130, 250 120
                     L 250 100
                     C 250 70, 230 50, 200 50 Z"
              fill="#f1f5f9" 
              stroke="#cbd5e1" 
              strokeWidth="2"
            />

            {/* 1. HEAD & BRAIN SYSTEM */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('head-system')}
               onMouseEnter={() => setHoveredPart('head-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <ellipse cx="200" cy="80" rx="45" ry="55" 
                fill={getIntensityColor(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'head-system' && "brightness-110 scale-105"
                )}
              />
              
              {/* Simple facial features */}
              <circle cx="185" cy="75" r="3" fill="#1e293b" />
              <circle cx="215" cy="75" r="3" fill="#1e293b" />
              <path d="M 190 90 Q 200 95, 210 90" stroke="#1e293b" strokeWidth="2" fill="none" />
              
              <text x="200" y="155" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
                Head & Brain
              </text>
            </g>

            {/* 2. RESPIRATORY SYSTEM */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('respiratory-system')}
               onMouseEnter={() => setHoveredPart('respiratory-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="160" y="170" width="80" height="90" rx="15" 
                fill={getIntensityColor(getSystemIntensity(['lungs', 'chest', 'throat']))}
                stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'respiratory-system' && "brightness-110 scale-105"
                )}
              />
              
              {/* Lung shapes */}
              <ellipse cx="180" cy="210" rx="15" ry="25" fill="rgba(59, 130, 246, 0.3)" />
              <ellipse cx="220" cy="210" rx="15" ry="25" fill="rgba(59, 130, 246, 0.3)" />
              
              <text x="200" y="285" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
                Chest & Lungs
              </text>
            </g>

            {/* 3. HEART SYSTEM */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('cardiovascular-system')}
               onMouseEnter={() => setHoveredPart('cardiovascular-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 190 200 C 185 195, 175 195, 175 205 C 175 215, 190 230, 190 230 C 190 230, 205 215, 205 205 C 205 195, 195 195, 190 200 Z"
                fill={getIntensityColor(getSystemIntensity(['heart']))}
                stroke={getIntensityStroke(getSystemIntensity(['heart']))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'cardiovascular-system' && "brightness-110 scale-110"
                )}
              />
              
              <text x="150" y="250" textAnchor="middle" className="text-xs font-semibold fill-slate-700">
                Heart
              </text>
            </g>

            {/* 4. DIGESTIVE SYSTEM */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('digestive-system')}
               onMouseEnter={() => setHoveredPart('digestive-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="170" y="280" width="60" height="80" rx="12" 
                fill={getIntensityColor(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                stroke={getIntensityStroke(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'digestive-system' && "brightness-110 scale-105"
                )}
              />
              
              {/* Stomach shape */}
              <ellipse cx="190" cy="310" rx="15" ry="12" fill="rgba(34, 197, 94, 0.3)" />
              
              <text x="200" y="385" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
                Stomach & Belly
              </text>
            </g>

            {/* 5. LEFT ARM */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="100" y="180" width="30" height="120" rx="15" 
                fill={getIntensityColor(getSystemIntensity(['left-arm', 'left-shoulder', 'left-hand']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder', 'left-hand']))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'left-arm' && "brightness-110 scale-105"
                )}
              />
              
              {/* Hand */}
              <ellipse cx="115" cy="320" rx="12" ry="18" 
                fill={getIntensityColor(getSymptomIntensity('left-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
                strokeWidth="2"
              />
              
              <text x="80" y="250" textAnchor="middle" className="text-xs font-semibold fill-slate-700">
                Left Arm
              </text>
            </g>

            {/* 6. RIGHT ARM */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="270" y="180" width="30" height="120" rx="15" 
                fill={getIntensityColor(getSystemIntensity(['right-arm', 'right-shoulder', 'right-hand']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder', 'right-hand']))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'right-arm' && "brightness-110 scale-105"
                )}
              />
              
              {/* Hand */}
              <ellipse cx="285" cy="320" rx="12" ry="18" 
                fill={getIntensityColor(getSymptomIntensity('right-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
                strokeWidth="2"
              />
              
              <text x="320" y="250" textAnchor="middle" className="text-xs font-semibold fill-slate-700">
                Right Arm
              </text>
            </g>

            {/* 7. LEFT LEG */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="175" y="400" width="25" height="140" rx="12" 
                fill={getIntensityColor(getSystemIntensity(['left-leg', 'left-knee', 'left-foot']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee', 'left-foot']))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'left-leg' && "brightness-110 scale-105"
                )}
              />
              
              {/* Foot */}
              <ellipse cx="187" cy="560" rx="10" ry="20" 
                fill={getIntensityColor(getSymptomIntensity('left-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
                strokeWidth="2"
              />
              
              <text x="150" y="480" textAnchor="middle" className="text-xs font-semibold fill-slate-700">
                Left Leg
              </text>
            </g>

            {/* 8. RIGHT LEG */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="200" y="400" width="25" height="140" rx="12" 
                fill={getIntensityColor(getSystemIntensity(['right-leg', 'right-knee', 'right-foot']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee', 'right-foot']))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'right-leg' && "brightness-110 scale-105"
                )}
              />
              
              {/* Foot */}
              <ellipse cx="212" cy="560" rx="10" ry="20" 
                fill={getIntensityColor(getSymptomIntensity('right-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
                strokeWidth="2"
              />
              
              <text x="250" y="480" textAnchor="middle" className="text-xs font-semibold fill-slate-700">
                Right Leg
              </text>
            </g>

          </>
        ) : (
          // BACK VIEW - Clean and simple
          <>
            {/* BASE BACK OUTLINE */}
            <path d="M 200 50 
                     C 170 50, 150 70, 150 100
                     L 150 120
                     C 130 130, 120 140, 120 160
                     L 120 200
                     C 120 220, 130 240, 140 250
                     L 140 350
                     C 140 370, 150 380, 160 390
                     L 160 500
                     C 160 520, 170 530, 180 540
                     L 180 580
                     L 220 580
                     L 220 540
                     C 230 530, 240 520, 240 500
                     L 240 390
                     C 250 380, 260 370, 260 350
                     L 260 250
                     C 270 240, 280 220, 280 200
                     L 280 160
                     C 280 140, 270 130, 250 120
                     L 250 100
                     C 250 70, 230 50, 200 50 Z"
              fill="#f1f5f9" 
              stroke="#cbd5e1" 
              strokeWidth="2"
            />

            {/* BACK & SPINE */}
            <g className={cn("transition-all duration-200", !readOnly && "cursor-pointer")} 
               onClick={(e) => !readOnly && handleBodyPartClick('back', 'Back & Spine', e)}
               onMouseEnter={() => setHoveredPart('back')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="170" y="170" width="60" height="200" rx="15" 
                fill={getIntensityColor(getSymptomIntensity('back'))}
                stroke={getIntensityStroke(getSymptomIntensity('back'))}
                strokeWidth="3"
                filter="url(#dropShadow)"
                className={cn(
                  "transition-all duration-200",
                  hoveredPart === 'back' && "brightness-110 scale-105"
                )}
              />
              
              {/* Spine line */}
              <line x1="200" y1="180" x2="200" y2="360" 
                stroke="#64748b" 
                strokeWidth="3"
              />
              
              <text x="200" y="400" textAnchor="middle" className="text-sm font-semibold fill-slate-700">
                Back & Spine
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );

  // LEVEL 2: Head System Detail
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

  const getCurrentView = () => {
    switch (currentZoom) {
      case 'overview': return renderOverview();
      case 'head-system': return renderHeadSystem();
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
        return '👆 Tap any colored body area to explore specific parts for symptom logging';
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
              <span className="text-xs font-medium text-slate-700">Clean Medical Mapping</span>
              <Sparkles className="w-3 h-3 text-blue-500" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ZoomableBodyMap;