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

  const handleGeneralHealthClick = () => {
    if (readOnly) return;
    // Trigger the callback with a special identifier for general health changes
    onBodyPartClick('general-health', 'General Health Changes', { x: 0, y: 0 });
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

  // Enhanced human-like body diagram with better anatomical accuracy
  const renderOverview = () => (
    <div className="flex justify-center relative">
      <svg width="520" height="680" viewBox="0 0 520 680" className="w-full h-auto max-w-md drop-shadow-lg">
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

          <linearGradient id="bodyContourGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9f3" />
            <stop offset="50%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>

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
        
        {currentSide === 'front' ? (
          <>
            {/* 1. HEAD - Enhanced realistic head shape */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('head-system')}
               onMouseEnter={(e) => handleMouseEnter('Head & Brain', e)}
               onMouseLeave={handleMouseLeave}>
              
              {/* More anatomically accurate head shape */}
              <path d="M 260 45
                       C 295 45, 320 65, 330 90
                       C 335 105, 335 120, 330 135
                       C 325 150, 315 160, 300 165
                       C 290 168, 280 169, 270 170
                       Q 260 171, 250 170
                       C 240 169, 230 168, 220 165
                       C 205 160, 195 150, 190 135
                       C 185 120, 185 105, 190 90
                       C 200 65, 225 45, 260 45 Z"
                fill={getIntensityColor(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                strokeWidth="2"
                filter={hoveredPart === 'Head & Brain' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced realistic facial features */}
              {/* More detailed eyes */}
              <ellipse cx="235" cy="100" rx="12" ry="8" fill="#ffffff" stroke="#d97706" strokeWidth="0.5" />
              <ellipse cx="285" cy="100" rx="12" ry="8" fill="#ffffff" stroke="#d97706" strokeWidth="0.5" />
              <circle cx="235" cy="100" r="6" fill="#4a5568" />
              <circle cx="285" cy="100" r="6" fill="#4a5568" />
              <circle cx="237" cy="98" r="2" fill="#ffffff" opacity="0.9" />
              <circle cx="287" cy="98" r="2" fill="#ffffff" opacity="0.9" />
              
              {/* Better eyebrows */}
              <path d="M 223 92 Q 235 88, 247 92" stroke="#8b4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 273 92 Q 285 88, 297 92" stroke="#8b4513" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              
              {/* More realistic nose */}
              <path d="M 260 105 
                       C 257 112, 256 118, 260 125 
                       C 264 118, 263 112, 260 105" 
                fill="#fdba74" stroke="#f97316" strokeWidth="0.5" />
              <ellipse cx="256" cy="122" rx="2.5" ry="2" fill="#f97316" opacity="0.4" />
              <ellipse cx="264" cy="122" rx="2.5" ry="2" fill="#f97316" opacity="0.4" />
              
              {/* Better mouth */}
              <path d="M 245 135 Q 260 142, 275 135" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 252 138 Q 260 141, 268 138" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              
              {/* Enhanced ears */}
              <ellipse cx="185" cy="105" rx="10" ry="18" fill="url(#faceGradient)" stroke="#f97316" strokeWidth="1" />
              <ellipse cx="335" cy="105" rx="10" ry="18" fill="url(#faceGradient)" stroke="#f97316" strokeWidth="1" />
              <ellipse cx="188" cy="105" rx="5" ry="10" fill="#fdba74" opacity="0.7" />
              <ellipse cx="332" cy="105" rx="5" ry="10" fill="#fdba74" opacity="0.7" />
              
              {/* Better hair */}
              <path d="M 190 85 
                       Q 200 50, 230 45 
                       Q 245 40, 260 40
                       Q 275 40, 290 45
                       Q 320 50, 330 85
                       Q 325 60, 305 55 
                       Q 285 50, 260 50 
                       Q 235 50, 215 55 
                       Q 195 60, 190 85" 
                fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
            </g>

            {/* Seamless neck connection */}
            <path d="M 250 170 
                     Q 260 173, 270 170
                     Q 275 175, 280 180
                     Q 275 185, 270 190
                     Q 260 193, 250 190
                     Q 245 185, 240 180
                     Q 245 175, 250 170 Z" 
              fill="url(#skinToneGradient)" 
              stroke="#f97316" 
              strokeWidth="1"
              filter="url(#jointShadow)"
            />

            {/* 2. CHEST/RESPIRATORY SYSTEM - Better chest anatomy */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('respiratory-system')}
               onMouseEnter={(e) => handleMouseEnter('Chest & Lungs', e)}
               onMouseLeave={handleMouseLeave}>
              
              {/* More anatomically accurate chest */}
              <path d="M 240 190 
                       C 220 195, 205 210, 200 230
                       L 200 320
                       C 200 340, 215 355, 235 360
                       L 285 360
                       C 305 355, 320 340, 320 320
                       L 320 230
                       C 315 210, 300 195, 280 190
                       Q 275 188, 270 190
                       Q 260 193, 250 190
                       Q 245 188, 240 190 Z"
                fill={getIntensityColor(getSystemIntensity(['lungs', 'chest', 'throat']))}
                stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
                strokeWidth="2"
                filter={hoveredPart === 'Chest & Lungs' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Rib cage indication */}
              <path d="M 230 220 Q 245 215, 260 220 Q 275 215, 290 220" 
                stroke="rgba(249, 115, 22, 0.3)" strokeWidth="1.5" fill="none" />
              <path d="M 235 240 Q 260 235, 285 240" 
                stroke="rgba(249, 115, 22, 0.25)" strokeWidth="1.5" fill="none" />
              <path d="M 240 260 Q 260 258, 280 260" 
                stroke="rgba(249, 115, 22, 0.2)" strokeWidth="1.5" fill="none" />
              
              {/* Lung outlines */}
              <ellipse cx="235" cy="270" rx="25" ry="40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="3,2" />
              <ellipse cx="285" cy="270" rx="25" ry="40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="3,2" />
            </g>

            {/* 3. HEART - Better anatomical positioning */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-110"
              )} 
               onClick={() => !readOnly && handleZoomIn('cardiovascular-system')}
               onMouseEnter={(e) => handleMouseEnter('Heart', e)}
               onMouseLeave={handleMouseLeave}>
              
              {/* More anatomically accurate heart */}
              <path d="M 260 250 
                       C 248 238, 230 238, 230 260 
                       C 230 285, 260 320, 260 320 
                       C 260 320, 290 285, 290 260 
                       C 290 238, 272 238, 260 250 Z"
                fill={getIntensityColor(getSystemIntensity(['heart']))}
                stroke={getIntensityStroke(getSystemIntensity(['heart']))}
                strokeWidth="2"
                filter={hoveredPart === 'Heart' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Heart detail lines */}
              <path d="M 245 265 Q 260 270, 275 265" stroke="rgba(220, 38, 38, 0.4)" strokeWidth="1" fill="none" />
            </g>

            {/* 4. STOMACH - Completely redesigned for anatomical accuracy */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('digestive-system')}
               onMouseEnter={(e) => handleMouseEnter('Stomach & Abdomen', e)}
               onMouseLeave={handleMouseLeave}>
              
              {/* Anatomically accurate stomach shape */}
              <path d="M 220 340
                       C 215 345, 210 355, 210 370
                       Q 208 385, 215 400
                       C 220 415, 230 425, 245 430
                       Q 260 435, 275 430
                       C 290 425, 300 415, 305 400
                       Q 312 385, 310 370
                       C 310 355, 305 345, 300 340
                       Q 285 338, 275 340
                       Q 260 342, 245 340
                       Q 230 338, 220 340 Z"
                fill={getIntensityColor(getSystemIntensity(['stomach']))}
                stroke={getIntensityStroke(getSystemIntensity(['stomach']))}
                strokeWidth="2"
                filter={hoveredPart === 'Stomach & Abdomen' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Stomach internal curve to show it's a stomach */}
              <path d="M 230 360 Q 245 355, 260 360 Q 275 355, 290 360" 
                stroke="rgba(34, 197, 94, 0.4)" strokeWidth="1.5" fill="none" />
              <path d="M 235 380 Q 260 375, 285 380" 
                stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1" fill="none" />
            </g>

            {/* 5. LOWER ABDOMEN/INTESTINES - Separate from stomach */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('digestive-system')}
               onMouseEnter={(e) => handleMouseEnter('Lower Abdomen', e)}
               onMouseLeave={handleMouseLeave}>
              
              {/* Lower abdominal area */}
              <path d="M 235 430
                       C 220 435, 210 450, 210 470
                       L 210 520
                       C 210 540, 220 555, 240 560
                       L 280 560
                       C 300 555, 310 540, 310 520
                       L 310 470
                       C 310 450, 300 435, 285 430
                       Q 275 428, 265 430
                       Q 260 432, 255 430
                       Q 245 428, 235 430 Z"
                fill={getIntensityColor(getSystemIntensity(['intestines', 'lower-abdomen']))}
                stroke={getIntensityStroke(getSystemIntensity(['intestines', 'lower-abdomen']))}
                strokeWidth="2"
                filter={hoveredPart === 'Lower Abdomen' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Intestinal indication */}
              <path d="M 240 450 Q 260 445, 280 450 Q 270 465, 250 470 Q 270 485, 280 500" 
                stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1.5" fill="none" />
            </g>

            {/* 6. LEFT ARM - Better proportions */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={(e) => handleMouseEnter('Left Arm', e)}
               onMouseLeave={handleMouseLeave}>
              
              {/* Shoulder joint */}
              <circle cx="200" cy="220" r="18" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              {/* Upper arm - better proportions */}
              <path d="M 182 220 
                       Q 165 235, 155 260
                       Q 150 285, 145 310
                       L 135 350
                       Q 130 370, 135 390
                       Q 140 410, 155 420
                       L 170 425
                       Q 185 430, 190 410
                       Q 195 390, 200 370
                       L 210 330
                       Q 215 310, 210 290
                       Q 205 270, 200 250
                       Q 195 235, 182 220 Z"
                fill={getIntensityColor(getSystemIntensity(['left-arm', 'left-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder']))}
                strokeWidth="2"
                filter={hoveredPart === 'Left Arm' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Elbow joint */}
              <ellipse cx="145" cy="425" rx="15" ry="10" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              {/* Forearm */}
              <path d="M 130 435 
                       Q 115 450, 105 480
                       Q 100 510, 95 540
                       L 85 580
                       Q 80 600, 85 620
                       Q 90 640, 105 650
                       L 120 655
                       Q 135 660, 140 640
                       Q 145 620, 150 600
                       L 160 560
                       Q 165 540, 160 520
                       Q 155 500, 150 480
                       Q 147 450, 130 435 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
              
              {/* Hand */}
              <ellipse cx="92" cy="675" rx="16" ry="25" 
                fill={getIntensityColor(getSymptomIntensity('left-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
            </g>

            {/* 7. RIGHT ARM - Mirror of left arm */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={(e) => handleMouseEnter('Right Arm', e)}
               onMouseLeave={handleMouseLeave}>
              
              <circle cx="320" cy="220" r="18" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              <path d="M 338 220 
                       Q 355 235, 365 260
                       Q 370 285, 375 310
                       L 385 350
                       Q 390 370, 385 390
                       Q 380 410, 365 420
                       L 350 425
                       Q 335 430, 330 410
                       Q 325 390, 320 370
                       L 310 330
                       Q 305 310, 310 290
                       Q 315 270, 320 250
                       Q 325 235, 338 220 Z"
                fill={getIntensityColor(getSystemIntensity(['right-arm', 'right-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder']))}
                strokeWidth="2"
                filter={hoveredPart === 'Right Arm' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              <ellipse cx="375" cy="425" rx="15" ry="10" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              <path d="M 390 435 
                       Q 405 450, 415 480
                       Q 420 510, 425 540
                       L 435 580
                       Q 440 600, 435 620
                       Q 430 640, 415 650
                       L 400 655
                       Q 385 660, 380 640
                       Q 375 620, 370 600
                       L 360 560
                       Q 355 540, 360 520
                       Q 365 500, 370 480
                       Q 373 450, 390 435 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
              
              <ellipse cx="428" cy="675" rx="16" ry="25" 
                fill={getIntensityColor(getSymptomIntensity('right-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
            </g>

            {/* 8. LEFT LEG - Better proportions */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={(e) => handleMouseEnter('Left Leg', e)}
               onMouseLeave={handleMouseLeave}>
              
              {/* Hip joint */}
              <ellipse cx="240" cy="565" rx="15" ry="10" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              {/* Thigh */}
              <path d="M 225 570 
                       Q 220 585, 218 605
                       Q 216 625, 215 645
                       L 215 685
                       Q 215 705, 220 725
                       Q 225 745, 240 750
                       L 255 752
                       Q 270 754, 275 745
                       Q 280 725, 280 705
                       L 280 645
                       Q 279 625, 277 605
                       Q 275 585, 270 570
                       Q 265 565, 255 565
                       Q 245 565, 225 570 Z"
                fill={getIntensityColor(getSystemIntensity(['left-leg', 'left-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee']))}
                strokeWidth="2"
                filter={hoveredPart === 'Left Leg' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Knee */}
              <ellipse cx="247" cy="755" rx="18" ry="12" 
                fill="rgba(249, 115, 22, 0.4)" 
                stroke="rgba(234, 88, 12, 0.6)" 
                strokeWidth="1.5"
                filter="url(#jointShadow)"
              />
              
              {/* Calf */}
              <path d="M 230 765 
                       Q 225 780, 222 800
                       Q 220 820, 218 840
                       L 216 880
                       Q 215 900, 220 920
                       Q 225 940, 240 945
                       L 255 947
                       Q 270 949, 275 940
                       Q 280 920, 280 900
                       L 278 840
                       Q 276 820, 274 800
                       Q 272 780, 267 765
                       Q 262 760, 252 760
                       Q 242 760, 230 765 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
              
              {/* Foot */}
              <ellipse cx="247" cy="970" rx="15" ry="28" 
                fill={getIntensityColor(getSymptomIntensity('left-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
            </g>

            {/* 9. RIGHT LEG - Mirror of left leg */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={(e) => handleMouseEnter('Right Leg', e)}
               onMouseLeave={handleMouseLeave}>
              
              <ellipse cx="280" cy="565" rx="15" ry="10" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              <path d="M 295 570 
                       Q 300 585, 302 605
                       Q 304 625, 305 645
                       L 305 685
                       Q 305 705, 300 725
                       Q 295 745, 280 750
                       L 265 752
                       Q 250 754, 245 745
                       Q 240 725, 240 705
                       L 240 645
                       Q 241 625, 243 605
                       Q 245 585, 250 570
                       Q 255 565, 265 565
                       Q 275 565, 295 570 Z"
                fill={getIntensityColor(getSystemIntensity(['right-leg', 'right-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee']))}
                strokeWidth="2"
                filter={hoveredPart === 'Right Leg' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              <ellipse cx="273" cy="755" rx="18" ry="12" 
                fill="rgba(249, 115, 22, 0.4)" 
                stroke="rgba(234, 88, 12, 0.6)" 
                strokeWidth="1.5"
                filter="url(#jointShadow)"
              />
              
              <path d="M 290 765 
                       Q 295 780, 298 800
                       Q 300 820, 302 840
                       L 304 880
                       Q 305 900, 300 920
                       Q 295 940, 280 945
                       L 265 947
                       Q 250 949, 245 940
                       Q 240 920, 240 900
                       L 242 840
                       Q 244 820, 246 800
                       Q 248 780, 253 765
                       Q 258 760, 268 760
                       Q 278 760, 290 765 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
              
              <ellipse cx="273" cy="970" rx="15" ry="28" 
                fill={getIntensityColor(getSymptomIntensity('right-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
            </g>

          </>
        ) : (
          // BACK VIEW - Enhanced with better anatomy
          <>
            {/* Back of head */}
            <path d="M 260 45
                     C 295 45, 320 65, 330 90
                     C 335 105, 335 120, 330 135
                     C 325 150, 315 160, 300 165
                     C 290 168, 280 169, 270 170
                     Q 260 171, 250 170
                     C 240 169, 230 168, 220 165
                     C 205 160, 195 150, 190 135
                     C 185 120, 185 105, 190 90
                     C 200 65, 225 45, 260 45 Z"
              fill={getIntensityColor(getSymptomIntensity('head'))}
              stroke={getIntensityStroke(getSymptomIntensity('head'))}
              strokeWidth="2"
              filter={hoveredPart === 'Back of Head' ? "url(#hoverGlow)" : "url(#softShadow)"}
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('head', 'Back of Head', e)}
              onMouseEnter={(e) => handleMouseEnter('Back of Head', e)}
              onMouseLeave={handleMouseLeave}
            />

            {/* Hair back view */}
            <path d="M 190 85 Q 200 50, 230 45 Q 245 40, 260 40 Q 275 40, 290 45 Q 320 50, 330 85 
                     Q 325 60, 305 55 Q 285 50, 260 50 Q 235 50, 215 55 Q 195 60, 190 85" 
              fill="#8b4513" stroke="#654321" strokeWidth="0.5" />

            {/* BACK & SPINE - Enhanced anatomy */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={(e) => !readOnly && handleBodyPartClick('back', 'Back & Spine', e)}
               onMouseEnter={(e) => handleMouseEnter('Back & Spine', e)}
               onMouseLeave={handleMouseLeave}>
              
              {/* Neck connection */}
              <path d="M 250 170 
                       Q 260 173, 270 170
                       Q 275 175, 280 180
                       Q 275 185, 270 190
                       Q 260 193, 250 190
                       Q 245 185, 240 180
                       Q 245 175, 250 170 Z" 
                fill="url(#skinToneGradient)" 
                stroke="#f97316" 
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              {/* Back torso */}
              <path d="M 240 190 
                       C 220 195, 205 210, 200 230
                       L 200 560
                       C 200 580, 215 595, 235 600
                       L 285 600
                       C 305 595, 320 580, 320 560
                       L 320 230
                       C 315 210, 300 195, 280 190
                       Q 275 188, 270 190
                       Q 260 193, 250 190
                       Q 245 188, 240 190 Z"
                fill={getIntensityColor(getSymptomIntensity('back'))}
                stroke={getIntensityStroke(getSymptomIntensity('back'))}
                strokeWidth="2"
                filter={hoveredPart === 'Back & Spine' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Spine */}
              <path d="M 260 210 
                       Q 258 250, 260 290
                       Q 262 330, 260 370
                       Q 258 410, 260 450
                       Q 262 490, 260 530
                       Q 258 570, 260 580"
                stroke="rgba(234, 88, 12, 0.8)" 
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              
              {/* Shoulder blades */}
              <ellipse cx="230" cy="260" rx="20" ry="35" fill="none" stroke="rgba(249, 115, 22, 0.4)" strokeWidth="1.5" />
              <ellipse cx="290" cy="260" rx="20" ry="35" fill="none" stroke="rgba(249, 115, 22, 0.4)" strokeWidth="1.5" />
            </g>
          </>
        )}

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
        return '👆 Hover to see body part names, then tap any area to explore specific parts';
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
              {/* Front/Back Toggle - Only show on overview */}
              {['overview'].includes(currentZoom) && (
                <Button variant="secondary" size="sm" onClick={toggleSide} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {currentSide === 'front' ? 'Back View' : 'Front View'}
                </Button>
              )}
              
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
                  {level === 'overview' ? 'Body View' : getViewTitle()}
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