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
    if (intensity === 0) return 'url(#neutralGradient)';
    if (intensity <= 3) return 'url(#mildGradient)';
    if (intensity <= 6) return 'url(#moderateGradient)';
    if (intensity <= 8) return 'url(#strongGradient)';
    return 'url(#severeGradient)';
  };

  const getIntensityStroke = (intensity: number): string => {
    if (intensity === 0) return '#94a3b8';
    if (intensity <= 3) return '#22c55e';
    if (intensity <= 6) return '#eab308';
    if (intensity <= 8) return '#f97316';
    return '#ef4444';
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

  // Enhanced body diagram with seamless interactions
  const renderOverview = () => (
    <div className="flex justify-center">
      <svg width="500" height="700" viewBox="0 0 500 700" className="w-full h-auto max-w-lg drop-shadow-2xl">
        <defs>
          {/* Enhanced Gradients */}
          <linearGradient id="bodyBaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Intensity Gradients */}
          <radialGradient id="neutralGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </radialGradient>

          <radialGradient id="mildGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#86efac" />
          </radialGradient>

          <radialGradient id="moderateGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fefce8" />
            <stop offset="100%" stopColor="#fde047" />
          </radialGradient>

          <radialGradient id="strongGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="100%" stopColor="#fb923c" />
          </radialGradient>

          <radialGradient id="severeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef2f2" />
            <stop offset="100%" stopColor="#f87171" />
          </radialGradient>

          {/* Enhanced Filters */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="systemHighlight" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.25" floodColor="#3b82f6"/>
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" floodColor="#1e40af"/>
          </filter>

          <filter id="hoverGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feFlood floodColor="#3b82f6" floodOpacity="0.4"/>
            <feComposite in="SourceGraphic" in2="coloredBlur" operator="over"/>
          </filter>

          {/* Patterns for texture */}
          <pattern id="skinTexture" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="rgba(255,255,255,0.05)"/>
            <circle cx="4" cy="4" r="1" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        
        {currentSide === 'front' ? (
          <>
            {/* Enhanced Base Body Outline */}
            <path d="M 250 60 
                     C 210 60, 180 85, 180 120
                     L 180 140
                     C 160 155, 145 170, 145 200
                     L 145 250
                     C 145 275, 155 300, 170 320
                     L 170 450
                     C 170 475, 185 495, 205 510
                     L 205 650
                     C 205 675, 220 690, 240 700
                     L 260 700
                     C 280 690, 295 675, 295 650
                     L 295 510
                     C 315 495, 330 475, 330 450
                     L 330 320
                     C 345 300, 355 275, 355 250
                     L 355 200
                     C 355 170, 340 155, 320 140
                     L 320 120
                     C 320 85, 290 60, 250 60 Z"
              fill="url(#bodyBaseGradient)" 
              stroke="#64748b" 
              strokeWidth="2"
              filter="url(#softGlow)"
            />

            {/* 1. HEAD & BRAIN SYSTEM - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('head-system')}
               onMouseEnter={() => setHoveredPart('head-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <ellipse cx="250" cy="100" rx="65" ry="75" 
                fill={getIntensityColor(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                strokeWidth="4"
                filter={hoveredPart === 'head-system' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced facial features */}
              <ellipse cx="230" cy="90" rx="8" ry="6" fill="#1e293b" opacity="0.8" />
              <ellipse cx="270" cy="90" rx="8" ry="6" fill="#1e293b" opacity="0.8" />
              <circle cx="232" cy="88" r="2" fill="#ffffff" opacity="0.9" />
              <circle cx="272" cy="88" r="2" fill="#ffffff" opacity="0.9" />
              <path d="M 235 110 Q 250 118, 265 110" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
              
              {/* Hover indicator */}
              {hoveredPart === 'head-system' && !readOnly && (
                <circle cx="320" cy="80" r="8" fill="#3b82f6" opacity="0.8" className="animate-pulse">
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                </circle>
              )}
              
              <text x="250" y="200" textAnchor="middle" className="text-base font-bold fill-slate-700 pointer-events-none">
                Head & Brain
              </text>
            </g>

            {/* 2. RESPIRATORY SYSTEM - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('respiratory-system')}
               onMouseEnter={() => setHoveredPart('respiratory-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="190" y="210" width="120" height="130" rx="25" 
                fill={getIntensityColor(getSystemIntensity(['lungs', 'chest', 'throat']))}
                stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
                strokeWidth="4"
                filter={hoveredPart === 'respiratory-system' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced lung representations */}
              <ellipse cx="220" cy="270" rx="22" ry="45" 
                fill="rgba(59, 130, 246, 0.4)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="3"
              />
              <ellipse cx="280" cy="270" rx="22" ry="45" 
                fill="rgba(59, 130, 246, 0.4)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth="3"
              />
              
              {/* Breathing animation */}
              {hoveredPart === 'respiratory-system' && (
                <>
                  <ellipse cx="220" cy="270" rx="22" ry="45" 
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="rgba(59, 130, 246, 0.6)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <ellipse cx="280" cy="270" rx="22" ry="45" 
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="rgba(59, 130, 246, 0.6)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                </>
              )}
              
              {/* Throat connection */}
              <rect x="240" y="190" width="20" height="35" rx="10" 
                fill="rgba(168, 85, 247, 0.6)"
                stroke="rgba(168, 85, 247, 0.9)"
                strokeWidth="2"
              />
              
              <text x="250" y="370" textAnchor="middle" className="text-base font-bold fill-slate-700 pointer-events-none">
                Chest & Lungs
              </text>
            </g>

            {/* 3. HEART SYSTEM - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-110"
              )} 
               onClick={() => !readOnly && handleZoomIn('cardiovascular-system')}
               onMouseEnter={() => setHoveredPart('cardiovascular-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 240 250 C 230 240, 210 240, 210 260 C 210 280, 240 310, 240 310 C 240 310, 270 280, 270 260 C 270 240, 250 240, 240 250 Z"
                fill={getIntensityColor(getSystemIntensity(['heart']))}
                stroke={getIntensityStroke(getSystemIntensity(['heart']))}
                strokeWidth="4"
                filter={hoveredPart === 'cardiovascular-system' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Heartbeat animation */}
              {hoveredPart === 'cardiovascular-system' && (
                <path d="M 240 250 C 230 240, 210 240, 210 260 C 210 280, 240 310, 240 310 C 240 310, 270 280, 270 260 C 270 240, 250 240, 240 250 Z"
                  fill="rgba(239, 68, 68, 0.3)"
                  stroke="rgba(239, 68, 68, 0.8)"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              )}
              
              <text x="190" y="340" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Heart
              </text>
            </g>

            {/* 4. DIGESTIVE SYSTEM - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('digestive-system')}
               onMouseEnter={() => setHoveredPart('digestive-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="210" y="360" width="80" height="110" rx="20" 
                fill={getIntensityColor(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                stroke={getIntensityStroke(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                strokeWidth="4"
                filter={hoveredPart === 'digestive-system' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced stomach representation */}
              <ellipse cx="240" cy="390" rx="25" ry="18" 
                fill="rgba(34, 197, 94, 0.5)"
                stroke="rgba(34, 197, 94, 0.8)"
                strokeWidth="3"
              />
              
              {/* Intestines representation */}
              <path d="M 220 420 Q 250 410, 270 420 Q 280 435, 270 450 Q 250 460, 220 450 Q 210 435, 220 420"
                fill="rgba(168, 85, 247, 0.4)"
                stroke="rgba(168, 85, 247, 0.7)"
                strokeWidth="2"
              />
              
              <text x="250" y="500" textAnchor="middle" className="text-base font-bold fill-slate-700 pointer-events-none">
                Stomach & Belly
              </text>
            </g>

            {/* 5. LEFT ARM - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="120" y="220" width="40" height="160" rx="20" 
                fill={getIntensityColor(getSystemIntensity(['left-arm', 'left-shoulder', 'left-hand']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder', 'left-hand']))}
                strokeWidth="4"
                filter={hoveredPart === 'left-arm' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced hand */}
              <ellipse cx="140" cy="400" rx="18" ry="25" 
                fill={getIntensityColor(getSymptomIntensity('left-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
                strokeWidth="3"
              />
              
              {/* Fingers */}
              <rect x="135" y="420" width="3" height="12" rx="1.5" fill="rgba(139, 69, 19, 0.6)" />
              <rect x="139" y="425" width="3" height="15" rx="1.5" fill="rgba(139, 69, 19, 0.6)" />
              <rect x="143" y="423" width="3" height="13" rx="1.5" fill="rgba(139, 69, 19, 0.6)" />
              <rect x="147" y="420" width="3" height="10" rx="1.5" fill="rgba(139, 69, 19, 0.6)" />
              
              <text x="90" y="310" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Left Arm
              </text>
            </g>

            {/* 6. RIGHT ARM - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="340" y="220" width="40" height="160" rx="20" 
                fill={getIntensityColor(getSystemIntensity(['right-arm', 'right-shoulder', 'right-hand']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder', 'right-hand']))}
                strokeWidth="4"
                filter={hoveredPart === 'right-arm' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced hand */}
              <ellipse cx="360" cy="400" rx="18" ry="25" 
                fill={getIntensityColor(getSymptomIntensity('right-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
                strokeWidth="3"
              />
              
              {/* Fingers */}
              <rect x="350" y="420" width="3" height="10" rx="1.5" fill="rgba(139, 69, 19, 0.6)" />
              <rect x="354" y="423" width="3" height="13" rx="1.5" fill="rgba(139, 69, 19, 0.6)" />
              <rect x="358" y="425" width="3" height="15" rx="1.5" fill="rgba(139, 69, 19, 0.6)" />
              <rect x="362" y="420" width="3" height="12" rx="1.5" fill="rgba(139, 69, 19, 0.6)" />
              
              <text x="410" y="310" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Right Arm
              </text>
            </g>

            {/* 7. LEFT LEG - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="215" y="480" width="35" height="180" rx="17" 
                fill={getIntensityColor(getSystemIntensity(['left-leg', 'left-knee', 'left-foot']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee', 'left-foot']))}
                strokeWidth="4"
                filter={hoveredPart === 'left-leg' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Knee joint */}
              <ellipse cx="232" cy="580" rx="12" ry="8" fill="rgba(139, 69, 19, 0.4)" stroke="rgba(139, 69, 19, 0.6)" strokeWidth="2" />
              
              {/* Enhanced foot */}
              <ellipse cx="232" cy="680" rx="15" ry="30" 
                fill={getIntensityColor(getSymptomIntensity('left-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
                strokeWidth="3"
              />
              
              <text x="180" y="580" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Left Leg
              </text>
            </g>

            {/* 8. RIGHT LEG - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="250" y="480" width="35" height="180" rx="17" 
                fill={getIntensityColor(getSystemIntensity(['right-leg', 'right-knee', 'right-foot']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee', 'right-foot']))}
                strokeWidth="4"
                filter={hoveredPart === 'right-leg' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Knee joint */}
              <ellipse cx="267" cy="580" rx="12" ry="8" fill="rgba(139, 69, 19, 0.4)" stroke="rgba(139, 69, 19, 0.6)" strokeWidth="2" />
              
              {/* Enhanced foot */}
              <ellipse cx="267" cy="680" rx="15" ry="30" 
                fill={getIntensityColor(getSymptomIntensity('right-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
                strokeWidth="3"
              />
              
              <text x="320" y="580" textAnchor="middle" className="text-sm font-bold fill-slate-700 pointer-events-none">
                Right Leg
              </text>
            </g>

          </>
        ) : (
          // BACK VIEW - Enhanced
          <>
            {/* Enhanced Base Back Outline */}
            <path d="M 250 60 
                     C 210 60, 180 85, 180 120
                     L 180 140
                     C 160 155, 145 170, 145 200
                     L 145 250
                     C 145 275, 155 300, 170 320
                     L 170 450
                     C 170 475, 185 495, 205 510
                     L 205 650
                     C 205 675, 220 690, 240 700
                     L 260 700
                     C 280 690, 295 675, 295 650
                     L 295 510
                     C 315 495, 330 475, 330 450
                     L 330 320
                     C 345 300, 355 275, 355 250
                     L 355 200
                     C 355 170, 340 155, 320 140
                     L 320 120
                     C 320 85, 290 60, 250 60 Z"
              fill="url(#bodyBaseGradient)" 
              stroke="#64748b" 
              strokeWidth="2"
              filter="url(#softGlow)"
            />

            {/* BACK & SPINE - Enhanced */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={(e) => !readOnly && handleBodyPartClick('back', 'Back & Spine', e)}
               onMouseEnter={() => setHoveredPart('back')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <rect x="200" y="210" width="100" height="300" rx="30" 
                fill={getIntensityColor(getSymptomIntensity('back'))}
                stroke={getIntensityStroke(getSymptomIntensity('back'))}
                strokeWidth="4"
                filter={hoveredPart === 'back' ? "url(#hoverGlow)" : "url(#systemHighlight)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced spine representation */}
              <line x1="250" y1="220" x2="250" y2="500" 
                stroke="rgba(139, 69, 19, 0.9)" 
                strokeWidth="6"
                strokeLinecap="round"
              />
              
              {/* Enhanced vertebrae */}
              {[230, 250, 270, 290, 310, 330, 350, 370, 390, 410, 430, 450, 470, 490].map((y, i) => (
                <circle key={i} cx="250" cy={y} r="4" 
                  fill="rgba(139, 69, 19, 0.7)" 
                  stroke="rgba(139, 69, 19, 0.9)" 
                  strokeWidth="1"
                />
              ))}
              
              <text x="250" y="550" textAnchor="middle" className="text-xl font-bold fill-slate-700 pointer-events-none">
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

  // LEVEL 2: Respiratory System Detail
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

  // LEVEL 2: Cardiovascular System Detail
  const renderCardiovascularSystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Heart & Circulation</h2>
        <p className="text-slate-600">Tap the area related to your heart or circulation</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'heart', name: 'Heart', icon: '❤️' },
          { id: 'chest-heart', name: 'Chest (Heart Area)', icon: '💓' },
          { id: 'circulation', name: 'Circulation', icon: '🩸' },
          { id: 'pulse', name: 'Pulse/Rhythm', icon: '📈' }
        ].map((part) => {
          const intensity = getSymptomIntensity(part.id);
          return (
            <Card
              key={part.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                intensity > 0 ? "border-red-300 shadow-red-200/50" : "border-slate-300"
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn(
                "p-4 text-center bg-gradient-to-br",
                intensity > 0 ? "from-red-100 to-red-200" : "from-slate-100 to-slate-200"
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

  // LEVEL 2: Digestive System Detail
  const renderDigestiveSystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Stomach & Digestion</h2>
        <p className="text-slate-600">Tap the area of your digestive system</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'stomach', name: 'Stomach', icon: '🫃' },
          { id: 'upper-abdomen', name: 'Upper Abdomen', icon: '🫄' },
          { id: 'lower-abdomen', name: 'Lower Abdomen', icon: '🫄' },
          { id: 'abdomen', name: 'Abdomen (General)', icon: '🫄' },
          { id: 'intestines', name: 'Intestines', icon: '🌀' },
          { id: 'liver', name: 'Liver Area', icon: '🫘' }
        ].map((part) => {
          const intensity = getSymptomIntensity(part.id);
          return (
            <Card
              key={part.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                intensity > 0 ? "border-green-300 shadow-green-200/50" : "border-slate-300"
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn(
                "p-4 text-center bg-gradient-to-br",
                intensity > 0 ? "from-green-100 to-green-200" : "from-slate-100 to-slate-200"
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

  // LEVEL 2: Musculoskeletal System Detail
  const renderMusculoskeletalSystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Arms, Legs & Joints</h2>
        <p className="text-slate-600">Tap the muscle, joint, or bone area</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'neck', name: 'Neck', icon: '🦴' },
          { id: 'left-shoulder', name: 'Left Shoulder', icon: '💪' },
          { id: 'right-shoulder', name: 'Right Shoulder', icon: '💪' },
          { id: 'back', name: 'Back/Spine', icon: '🦴' },
          { id: 'left-arm', name: 'Left Arm', icon: '💪' },
          { id: 'right-arm', name: 'Right Arm', icon: '💪' },
          { id: 'left-hand', name: 'Left Hand', icon: '✋' },
          { id: 'right-hand', name: 'Right Hand', icon: '✋' },
          { id: 'left-leg', name: 'Left Leg', icon: '🦵' },
          { id: 'right-leg', name: 'Right Leg', icon: '🦵' },
          { id: 'left-knee', name: 'Left Knee', icon: '🦴' },
          { id: 'right-knee', name: 'Right Knee', icon: '🦴' },
          { id: 'left-foot', name: 'Left Foot', icon: '🦶' },
          { id: 'right-foot', name: 'Right Foot', icon: '🦶' },
          { id: 'left-ankle', name: 'Left Ankle', icon: '🦴' },
          { id: 'right-ankle', name: 'Right Ankle', icon: '🦴' }
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
                <h4 className="font-semibold text-slate-800 text-sm">{part.name}</h4>
                {intensity > 0 && (
                  <div className="text-xs mt-2 font-medium text-slate-600">
                    {intensity}/10
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
      case 'cardiovascular-system': return renderCardiovascularSystem();
      case 'digestive-system': return renderDigestiveSystem();
      case 'musculoskeletal-system': return renderMusculoskeletalSystem();
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
      'musculoskeletal-system': 'Arms, Legs & Joints',
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
              <span className="text-xs font-medium text-slate-700">Interactive Body Mapping</span>
              <Sparkles className="w-3 h-3 text-blue-500" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ZoomableBodyMap;