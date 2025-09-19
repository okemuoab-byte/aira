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
  | 'upper-body' | 'lower-body'
  | 'head-system' | 'respiratory-system' | 'cardiovascular-system' | 'digestive-system' | 'arms-system'
  | 'legs-system' | 'feet-system';

type ViewSide = 'front' | 'back';

interface HoverTooltip {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

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
  const [tooltip, setTooltip] = useState<HoverTooltip>({ visible: false, text: '', x: 0, y: 0 });

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
    if (intensity === 0) return '#8b7355';
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

  const handleMouseEnter = (partName: string, event: React.MouseEvent<SVGElement>) => {
    if (!readOnly) {
      setHoveredPart(partName);
      const rect = event.currentTarget.getBoundingClientRect();
      const svgRect = event.currentTarget.closest('svg')?.getBoundingClientRect();
      if (svgRect) {
        setTooltip({
          visible: true,
          text: partName,
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top - 10
        });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredPart(null);
    setTooltip({ visible: false, text: '', x: 0, y: 0 });
  };

  // Overview - Choice between Upper and Lower Body
  const renderOverview = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Choose Body Area</h2>
        <p className="text-slate-600">Select the area where you're experiencing symptoms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upper Body Card */}
        <Card 
          className="cursor-pointer transition-all duration-500 hover:scale-105 border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 hover:shadow-2xl group"
          onClick={() => handleZoomIn('upper-body')}
        >
          <CardContent className="p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                🫁
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-4 group-hover:text-blue-900 transition-colors">
                Upper Body
              </h3>
              <p className="text-blue-700 text-base mb-6 leading-relaxed">
                Head, neck, chest, heart, lungs, arms, and stomach area
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-600 mb-4">
                <div className="flex items-center space-x-1">
                  <span>🧠</span><span>Head & Brain</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>❤️</span><span>Heart</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🫁</span><span>Lungs</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>💪</span><span>Arms</span>
                </div>
              </div>
              
              {getSystemIntensity(['head', 'chest', 'heart', 'stomach', 'left-arm', 'right-arm']) > 0 && (
                <div className="mt-4 p-2 bg-orange-100 rounded-lg border border-orange-200">
                  <span className="text-sm font-medium text-orange-800">
                    Recent symptoms detected
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lower Body Card */}
        <Card 
          className="cursor-pointer transition-all duration-500 hover:scale-105 border-2 border-green-300 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 hover:shadow-2xl group"
          onClick={() => handleZoomIn('lower-body')}
        >
          <CardContent className="p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                🦵
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-4 group-hover:text-green-900 transition-colors">
                Lower Body
              </h3>
              <p className="text-green-700 text-base mb-6 leading-relaxed">
                Hips, legs, knees, ankles, feet, and lower back
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-green-600 mb-4">
                <div className="flex items-center space-x-1">
                  <span>🦴</span><span>Hips</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🦵</span><span>Legs</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🦴</span><span>Knees</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🦶</span><span>Feet</span>
                </div>
              </div>
              
              {getSystemIntensity(['left-leg', 'right-leg', 'left-knee', 'right-knee', 'left-foot', 'right-foot', 'back']) > 0 && (
                <div className="mt-4 p-2 bg-orange-100 rounded-lg border border-orange-200">
                  <span className="text-sm font-medium text-orange-800">
                    Recent symptoms detected
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
        <p className="text-sm text-slate-700 font-medium">
          💡 <strong>Choose your area:</strong> Upper body for head, chest, heart, and arm symptoms. Lower body for leg, knee, hip, and foot symptoms.
        </p>
      </div>
    </div>
  );

  // Upper Body Detailed View
  const renderUpperBody = () => (
    <div className="flex justify-center relative">
      <svg width="520" height="500" viewBox="0 0 520 500" className="w-full h-auto max-w-lg drop-shadow-lg">
        <defs>
          {/* Enhanced natural skin tone gradients */}
          <radialGradient id="skinToneGradient" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef9f3" />
            <stop offset="20%" stopColor="#fed7aa" />
            <stop offset="60%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#f97316" />
          </radialGradient>

          <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fef9f3" />
            <stop offset="40%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </radialGradient>

          {/* Symptom intensity gradients */}
          <radialGradient id="neutralGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef9f3" />
            <stop offset="100%" stopColor="#fed7aa" />
          </radialGradient>

          <radialGradient id="mildGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="50%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </radialGradient>

          <radialGradient id="moderateGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="50%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </radialGradient>

          <radialGradient id="strongGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="50%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </radialGradient>

          <radialGradient id="severeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef2f2" />
            <stop offset="50%" stopColor="#fecaca" />
            <stop offset="100%" stopColor="#fca5a5" />
          </radialGradient>

          {/* Enhanced shadow and glow filters */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" floodColor="#92400e"/>
          </filter>

          <filter id="hoverGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feFlood floodColor="#3b82f6" floodOpacity="0.4"/>
            <feComposite in="SourceGraphic" in2="coloredBlur" operator="over"/>
          </filter>

          <filter id="jointShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" floodColor="#92400e"/>
          </filter>
        </defs>
        
        {/* HEAD */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-105"
          )} 
           onClick={() => !readOnly && handleZoomIn('head-system')}
           onMouseEnter={(e) => handleMouseEnter('Head & Brain', e)}
           onMouseLeave={handleMouseLeave}>
          
          <path d="M 260 30
                   C 295 30, 320 50, 330 75
                   C 335 90, 335 105, 330 120
                   C 325 135, 315 145, 300 150
                   C 290 153, 280 154, 270 155
                   Q 260 156, 250 155
                   C 240 154, 230 153, 220 150
                   C 205 145, 195 135, 190 120
                   C 185 105, 185 90, 190 75
                   C 200 50, 225 30, 260 30 Z"
            fill={getIntensityColor(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
            stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
            strokeWidth="2"
            filter={hoveredPart === 'Head & Brain' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
          
          {/* Enhanced facial features */}
          <ellipse cx="235" cy="85" rx="12" ry="8" fill="#ffffff" stroke="#d97706" strokeWidth="0.5" />
          <ellipse cx="285" cy="85" rx="12" ry="8" fill="#ffffff" stroke="#d97706" strokeWidth="0.5" />
          <circle cx="235" cy="85" r="6" fill="#4a5568" />
          <circle cx="285" cy="85" r="6" fill="#4a5568" />
          <circle cx="237" cy="83" r="2" fill="#ffffff" opacity="0.9" />
          <circle cx="287" cy="83" r="2" fill="#ffffff" opacity="0.9" />
          
          <path d="M 223 77 Q 235 73, 247 77" stroke="#8b4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 273 77 Q 285 73, 297 77" stroke="#8b4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          
          <path d="M 260 90 C 257 97, 256 103, 260 110 C 264 103, 263 97, 260 90" 
            fill="#fdba74" stroke="#f97316" strokeWidth="0.5" />
          <ellipse cx="256" cy="107" rx="2.5" ry="2" fill="#f97316" opacity="0.4" />
          <ellipse cx="264" cy="107" rx="2.5" ry="2" fill="#f97316" opacity="0.4" />
          
          <path d="M 245 120 Q 260 127, 275 120" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          <ellipse cx="185" cy="90" rx="10" ry="18" fill="url(#faceGradient)" stroke="#f97316" strokeWidth="1" />
          <ellipse cx="335" cy="90" rx="10" ry="18" fill="url(#faceGradient)" stroke="#f97316" strokeWidth="1" />
          
          <path d="M 190 70 Q 200 35, 230 30 Q 245 25, 260 25 Q 275 25, 290 30 Q 320 35, 330 70" 
            fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
        </g>

        {/* NECK */}
        <path d="M 250 155 Q 260 158, 270 155 Q 275 160, 280 165 Q 275 170, 270 175 Q 260 178, 250 175 Q 245 170, 240 165 Q 245 160, 250 155 Z" 
          fill="url(#skinToneGradient)" 
          stroke="#f97316" 
          strokeWidth="1"
          filter="url(#jointShadow)"
        />

        {/* CHEST/RESPIRATORY SYSTEM */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-105"
          )} 
           onClick={() => !readOnly && handleZoomIn('respiratory-system')}
           onMouseEnter={(e) => handleMouseEnter('Chest & Lungs', e)}
           onMouseLeave={handleMouseLeave}>
          
          <path d="M 240 175 
                   C 220 180, 205 195, 200 215
                   L 200 305
                   C 200 325, 215 340, 235 345
                   L 285 345
                   C 305 340, 320 325, 320 305
                   L 320 215
                   C 315 195, 300 180, 280 175
                   Q 275 173, 270 175
                   Q 260 178, 250 175
                   Q 245 173, 240 175 Z"
            fill={getIntensityColor(getSystemIntensity(['lungs', 'chest', 'throat']))}
            stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
            strokeWidth="2"
            filter={hoveredPart === 'Chest & Lungs' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
          
          <path d="M 230 205 Q 245 200, 260 205 Q 275 200, 290 205" 
            stroke="rgba(249, 115, 22, 0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 235 225 Q 260 220, 285 225" 
            stroke="rgba(249, 115, 22, 0.25)" strokeWidth="1.5" fill="none" />
          
          <ellipse cx="235" cy="255" rx="25" ry="40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="3,2" />
          <ellipse cx="285" cy="255" rx="25" ry="40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="3,2" />
        </g>

        {/* HEART */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-110"
          )} 
           onClick={() => !readOnly && handleZoomIn('cardiovascular-system')}
           onMouseEnter={(e) => handleMouseEnter('Heart', e)}
           onMouseLeave={handleMouseLeave}>
          
          <path d="M 260 235 
                   C 248 223, 230 223, 230 245 
                   C 230 270, 260 305, 260 305 
                   C 260 305, 290 270, 290 245 
                   C 290 223, 272 223, 260 235 Z"
            fill={getIntensityColor(getSystemIntensity(['heart']))}
            stroke={getIntensityStroke(getSystemIntensity(['heart']))}
            strokeWidth="2"
            filter={hoveredPart === 'Heart' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
        </g>

        {/* STOMACH */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-105"
          )} 
           onClick={() => !readOnly && handleZoomIn('digestive-system')}
           onMouseEnter={(e) => handleMouseEnter('Stomach & Abdomen', e)}
           onMouseLeave={handleMouseLeave}>
          
          <path d="M 220 325
                   C 215 330, 210 340, 210 355
                   Q 208 370, 215 385
                   C 220 400, 230 410, 245 415
                   Q 260 420, 275 415
                   C 290 410, 300 400, 305 385
                   Q 312 370, 310 355
                   C 310 340, 305 330, 300 325
                   Q 285 323, 275 325
                   Q 260 327, 245 325
                   Q 230 323, 220 325 Z"
            fill={getIntensityColor(getSystemIntensity(['stomach']))}
            stroke={getIntensityStroke(getSystemIntensity(['stomach']))}
            strokeWidth="2"
            filter={hoveredPart === 'Stomach & Abdomen' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
          
          <path d="M 230 345 Q 245 340, 260 345 Q 275 340, 290 345" 
            stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1.5" fill="none" />
        </g>

        {/* LEFT ARM */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-105"
          )} 
           onClick={() => !readOnly && handleZoomIn('arms-system')}
           onMouseEnter={(e) => handleMouseEnter('Left Arm', e)}
           onMouseLeave={handleMouseLeave}>
          
          <circle cx="200" cy="205" r="18" 
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="1"
            filter="url(#jointShadow)"
          />
          
          <path d="M 182 205 
                   Q 165 220, 155 245
                   Q 150 270, 145 295
                   L 135 335
                   Q 130 355, 135 375
                   Q 140 395, 155 405
                   L 170 410
                   Q 185 415, 190 395
                   Q 195 375, 200 355
                   L 210 315
                   Q 215 295, 210 275
                   Q 205 255, 200 235
                   Q 195 220, 182 205 Z"
            fill={getIntensityColor(getSystemIntensity(['left-arm', 'left-shoulder']))}
            stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder']))}
            strokeWidth="2"
            filter={hoveredPart === 'Left Arm' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
          
          <ellipse cx="145" cy="410" rx="15" ry="10" 
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="1"
            filter="url(#jointShadow)"
          />
          
          <ellipse cx="92" cy="460" rx="16" ry="25" 
            fill={getIntensityColor(getSymptomIntensity('left-hand'))}
            stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />
        </g>

        {/* RIGHT ARM */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-105"
          )} 
           onClick={() => !readOnly && handleZoomIn('arms-system')}
           onMouseEnter={(e) => handleMouseEnter('Right Arm', e)}
           onMouseLeave={handleMouseLeave}>
          
          <circle cx="320" cy="205" r="18" 
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="1"
            filter="url(#jointShadow)"
          />
          
          <path d="M 338 205 
                   Q 355 220, 365 245
                   Q 370 270, 375 295
                   L 385 335
                   Q 390 355, 385 375
                   Q 380 395, 365 405
                   L 350 410
                   Q 335 415, 330 395
                   Q 325 375, 320 355
                   L 310 315
                   Q 305 295, 310 275
                   Q 315 255, 320 235
                   Q 325 220, 338 205 Z"
            fill={getIntensityColor(getSystemIntensity(['right-arm', 'right-shoulder']))}
            stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder']))}
            strokeWidth="2"
            filter={hoveredPart === 'Right Arm' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
          
          <ellipse cx="375" cy="410" rx="15" ry="10" 
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="1"
            filter="url(#jointShadow)"
          />
          
          <ellipse cx="428" cy="460" rx="16" ry="25" 
            fill={getIntensityColor(getSymptomIntensity('right-hand'))}
            stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />
        </g>

        {/* Hover Tooltip */}
        {tooltip.visible && (
          <g>
            <rect
              x={tooltip.x - 40}
              y={tooltip.y - 25}
              width="80"
              height="20"
              rx="10"
              fill="rgba(0, 0, 0, 0.8)"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />
            <text
              x={tooltip.x}
              y={tooltip.y - 10}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="500"
            >
              {tooltip.text}
            </text>
          </g>
        )}
      </svg>
    </div>
  );

  // Lower Body Detailed View
  const renderLowerBody = () => (
    <div className="flex justify-center relative">
      <svg width="520" height="500" viewBox="0 0 520 500" className="w-full h-auto max-w-lg drop-shadow-lg">
        <defs>
          {/* Same gradients as upper body */}
          <radialGradient id="skinToneGradient" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef9f3" />
            <stop offset="20%" stopColor="#fed7aa" />
            <stop offset="60%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#f97316" />
          </radialGradient>

          <radialGradient id="neutralGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef9f3" />
            <stop offset="100%" stopColor="#fed7aa" />
          </radialGradient>

          <radialGradient id="mildGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="50%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </radialGradient>

          <radialGradient id="moderateGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="50%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </radialGradient>

          <radialGradient id="strongGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="50%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </radialGradient>

          <radialGradient id="severeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef2f2" />
            <stop offset="50%" stopColor="#fecaca" />
            <stop offset="100%" stopColor="#fca5a5" />
          </radialGradient>

          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" floodColor="#92400e"/>
          </filter>

          <filter id="hoverGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feFlood floodColor="#3b82f6" floodOpacity="0.4"/>
            <feComposite in="SourceGraphic" in2="coloredBlur" operator="over"/>
          </filter>

          <filter id="jointShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" floodColor="#92400e"/>
          </filter>
        </defs>
        
        {/* HIPS */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-105"
          )} 
           onClick={() => !readOnly && handleZoomIn('legs-system')}
           onMouseEnter={(e) => handleMouseEnter('Hips & Pelvis', e)}
           onMouseLeave={handleMouseLeave}>
          
          <path d="M 210 30
                   C 205 35, 200 45, 200 60
                   L 200 90
                   C 200 105, 210 115, 225 120
                   L 295 120
                   C 310 115, 320 105, 320 90
                   L 320 60
                   C 320 45, 315 35, 310 30
                   Q 295 28, 285 30
                   Q 260 32, 235 30
                   Q 220 28, 210 30 Z"
            fill={getIntensityColor(getSystemIntensity(['left-hip', 'right-hip', 'lower-abdomen']))}
            stroke={getIntensityStroke(getSystemIntensity(['left-hip', 'right-hip', 'lower-abdomen']))}
            strokeWidth="2"
            filter={hoveredPart === 'Hips & Pelvis' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
          
          <ellipse cx="235" cy="125" rx="12" ry="8" 
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="0.8"
            filter="url(#jointShadow)"
          />
          <ellipse cx="285" cy="125" rx="12" ry="8" 
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="0.8"
            filter="url(#jointShadow)"
          />
        </g>

        {/* LEFT LEG */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-105"
          )} 
           onClick={() => !readOnly && handleZoomIn('legs-system')}
           onMouseEnter={(e) => handleMouseEnter('Left Leg', e)}
           onMouseLeave={handleMouseLeave}>
          
          <path d="M 225 130 
                   Q 220 145, 218 165
                   Q 216 185, 215 205
                   L 215 245
                   Q 215 265, 220 285
                   Q 225 305, 235 310
                   L 245 312
                   Q 255 314, 260 305
                   Q 265 285, 265 265
                   L 265 205
                   Q 264 185, 262 165
                   Q 260 145, 255 130
                   Q 250 125, 245 125
                   Q 235 125, 225 130 Z"
            fill={getIntensityColor(getSystemIntensity(['left-leg', 'left-knee']))}
            stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee']))}
            strokeWidth="2"
            filter={hoveredPart === 'Left Leg' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
          
          <ellipse cx="240" cy="315" rx="18" ry="12" 
            fill="rgba(249, 115, 22, 0.4)" 
            stroke="rgba(234, 88, 12, 0.6)" 
            strokeWidth="1.5"
            filter="url(#jointShadow)"
          />
          
          <path d="M 230 325 
                   Q 225 340, 222 360
                   Q 220 380, 218 400
                   L 216 440
                   Q 215 460, 220 480
                   Q 225 500, 235 505
                   L 245 507
                   Q 255 509, 260 500
                   Q 265 480, 265 460
                   L 263 400
                   Q 261 380, 259 360
                   Q 257 340, 252 325
                   Q 247 320, 242 320
                   Q 237 320, 230 325 Z"
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />
          
          <ellipse cx="240" cy="510" rx="10" ry="6" 
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="0.6"
            filter="url(#jointShadow)"
          />
          
          <ellipse cx="237" cy="530" rx="12" ry="22" 
            fill={getIntensityColor(getSymptomIntensity('left-foot'))}
            stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />
        </g>

        {/* RIGHT LEG */}
        <g className={cn(
            "transition-all duration-300 transform-gpu", 
            !readOnly && "cursor-pointer hover:scale-105"
          )} 
           onClick={() => !readOnly && handleZoomIn('legs-system')}
           onMouseEnter={(e) => handleMouseEnter('Right Leg', e)}
           onMouseLeave={handleMouseLeave}>
          
          <path d="M 295 130 
                   Q 300 145, 302 165
                   Q 304 185, 305 205
                   L 305 245
                   Q 305 265, 300 285
                   Q 295 305, 285 310
                   L 275 312
                   Q 265 314, 260 305
                   Q 255 285, 255 265
                   L 255 205
                   Q 256 185, 258 165
                   Q 260 145, 265 130
                   Q 270 125, 275 125
                   Q 285 125, 295 130 Z"
            fill={getIntensityColor(getSystemIntensity(['right-leg', 'right-knee']))}
            stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee']))}
            strokeWidth="2"
            filter={hoveredPart === 'Right Leg' ? "url(#hoverGlow)" : "url(#softShadow)"}
            className="transition-all duration-300"
          />
          
          <ellipse cx="280" cy="315" rx="18" ry="12" 
            fill="rgba(249, 115, 22, 0.4)" 
            stroke="rgba(234, 88, 12, 0.6)" 
            strokeWidth="1.5"
            filter="url(#jointShadow)"
          />
          
          <path d="M 290 325 
                   Q 295 340, 298 360
                   Q 300 380, 302 400
                   L 304 440
                   Q 305 460, 300 480
                   Q 295 500, 285 505
                   L 275 507
                   Q 265 509, 260 500
                   Q 255 480, 255 460
                   L 257 400
                   Q 259 380, 261 360
                   Q 263 340, 268 325
                   Q 273 320, 278 320
                   Q 283 320, 290 325 Z"
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />
          
          <ellipse cx="280" cy="510" rx="10" ry="6" 
            fill="url(#skinToneGradient)"
            stroke="#f97316"
            strokeWidth="0.6"
            filter="url(#jointShadow)"
          />
          
          <ellipse cx="283" cy="530" rx="12" ry="22" 
            fill={getIntensityColor(getSymptomIntensity('right-foot'))}
            stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
            strokeWidth="1.5"
            filter="url(#softShadow)"
          />
        </g>

        {/* Hover Tooltip */}
        {tooltip.visible && (
          <g>
            <rect
              x={tooltip.x - 40}
              y={tooltip.y - 25}
              width="80"
              height="20"
              rx="10"
              fill="rgba(0, 0, 0, 0.8)"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
            />
            <text
              x={tooltip.x}
              y={tooltip.y - 10}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="500"
            >
              {tooltip.text}
            </text>
          </g>
        )}
      </svg>
    </div>
  );

  // System detail views (simplified for now)
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

  const renderDigestiveSystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Stomach & Digestion</h2>
        <p className="text-slate-600">Tap the area of your digestive system</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'upper-stomach', name: 'Upper Stomach', icon: '🫃' },
          { id: 'lower-stomach', name: 'Lower Stomach', icon: '🫃' },
          { id: 'upper-abdomen', name: 'Upper Abdomen', icon: '🫄' },
          { id: 'lower-abdomen', name: 'Lower Abdomen', icon: '🫄' },
          { id: 'left-side-abdomen', name: 'Left Side Abdomen', icon: '🫄' },
          { id: 'right-side-abdomen', name: 'Right Side Abdomen', icon: '🫄' },
          { id: 'intestines', name: 'Intestines', icon: '🌀' },
          { id: 'liver-area', name: 'Liver Area', icon: '🫘' }
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

  const renderArmsSystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Arms & Hands</h2>
        <p className="text-slate-600">Tap the specific arm or hand area</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'left-shoulder', name: 'Left Shoulder', icon: '💪' },
          { id: 'right-shoulder', name: 'Right Shoulder', icon: '💪' },
          { id: 'left-arm', name: 'Left Arm', icon: '💪' },
          { id: 'right-arm', name: 'Right Arm', icon: '💪' },
          { id: 'left-elbow', name: 'Left Elbow', icon: '🦴' },
          { id: 'right-elbow', name: 'Right Elbow', icon: '🦴' },
          { id: 'left-wrist', name: 'Left Wrist', icon: '🦴' },
          { id: 'right-wrist', name: 'Right Wrist', icon: '🦴' },
          { id: 'left-hand', name: 'Left Hand', icon: '✋' },
          { id: 'right-hand', name: 'Right Hand', icon: '✋' }
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

  const renderLegsSystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Legs & Feet</h2>
        <p className="text-slate-600">Tap the specific leg or foot area</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'left-hip', name: 'Left Hip', icon: '🦴' },
          { id: 'right-hip', name: 'Right Hip', icon: '🦴' },
          { id: 'left-thigh', name: 'Left Thigh', icon: '🦵' },
          { id: 'right-thigh', name: 'Right Thigh', icon: '🦵' },
          { id: 'left-knee', name: 'Left Knee', icon: '🦴' },
          { id: 'right-knee', name: 'Right Knee', icon: '🦴' },
          { id: 'left-calf', name: 'Left Calf', icon: '🦵' },
          { id: 'right-calf', name: 'Right Calf', icon: '🦵' },
          { id: 'left-ankle', name: 'Left Ankle', icon: '🦴' },
          { id: 'right-ankle', name: 'Right Ankle', icon: '🦴' },
          { id: 'left-foot', name: 'Left Foot', icon: '🦶' },
          { id: 'right-foot', name: 'Right Foot', icon: '🦶' }
        ].map((part) => {
          const intensity = getSymptomIntensity(part.id);
          return (
            <Card
              key={part.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                intensity > 0 ? "border-green-300 shadow-green-200/50" : "border-slate-300"
              )}
              onClick={(e) => handleBodyPartClick(part.i, part.name, e)}
            >
              <CardContent className={cn(
                "p-4 text-center bg-gradient-to-br",
                intensity > 0 ? "from-green-100 to-green-200" : "from-slate-100 to-slate-200"
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
      case 'upper-body': return renderUpperBody();
      case 'lower-body': return renderLowerBody();
      case 'head-system': return renderHeadSystem();
      case 'respiratory-system': return renderRespiratorySystem();
      case 'cardiovascular-system': return renderCardiovascularSystem();
      case 'digestive-system': return renderDigestiveSystem();
      case 'arms-system': return renderArmsSystem();
      case 'legs-system': return renderLegsSystem();
      default: return renderOverview();
    }
  };

  const getViewTitle = () => {
    const titles: Record<ZoomLevel, string> = {
      'overview': 'Body Areas',
      'upper-body': 'Upper Body',
      'lower-body': 'Lower Body',
      'head-system': 'Head & Brain Areas',
      'respiratory-system': 'Breathing & Lung Areas',
      'cardiovascular-system': 'Heart & Circulation',
      'digestive-system': 'Stomach & Digestion',
      'arms-system': 'Arms & Hands',
      'legs-system': 'Legs & Feet',
      'feet-system': 'Feet & Ankles'
    };
    return titles[currentZoom] || 'Body Areas';
  };

  const getInstructions = () => {
    if (readOnly) {
      return '👁️ Visual overview of your recent symptoms by body area';
    }
    
    switch (currentZoom) {
      case 'overview':
        return '👆 Choose between Upper Body (head, chest, arms) or Lower Body (legs, hips, feet)';
      case 'upper-body':
      case 'lower-body':
        return '👆 Hover to see body part names, then tap any area to explore specific parts';
      case 'head-system':
      case 'respiratory-system':
      case 'cardiovascular-system':
      case 'digestive-system':
      case 'arms-system':
      case 'legs-system':
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
              {/* Back Button */}
              {currentZoom !== 'overview' && (
                <Button variant="secondary" size="sm" onClick={handleZoomOut} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              {/* Home Button */}
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
                  {level === 'overview' ? 'Body Areas' : getViewTitle()}
                </span>
              </React.Fragment>
            
            ))}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("flex justify-center",  readOnly ? "p-4" : "p-6")}>
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