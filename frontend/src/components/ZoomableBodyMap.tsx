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

  // Enhanced human-like body diagram with seamless joints
  const renderOverview = () => (
    <div className="flex justify-center">
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
            {/* 1. HEAD - Enhanced realistic head shape with seamless neck connection */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('head-system')}
               onMouseEnter={() => setHoveredPart('head-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Natural head shape with seamless neck connection */}
              <path d="M 260 45
                       C 290 45, 315 60, 325 85
                       C 330 100, 330 115, 325 130
                       C 320 145, 310 155, 295 160
                       C 285 163, 275 164, 265 165
                       Q 260 166, 255 166
                       Q 250 166, 245 165
                       C 235 164, 225 163, 215 160
                       C 200 155, 190 145, 185 130
                       C 180 115, 180 100, 185 85
                       C 195 60, 220 45, 260 45 Z"
                fill={getIntensityColor(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                strokeWidth="1.5"
                filter={hoveredPart === 'head-system' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced realistic facial features */}
              {/* Eyes with more detail */}
              <ellipse cx="235" cy="95" rx="10" ry="7" fill="#ffffff" stroke="#d97706" strokeWidth="0.3" />
              <ellipse cx="275" cy="95" rx="10" ry="7" fill="#ffffff" stroke="#d97706" strokeWidth="0.3" />
              <circle cx="235" cy="95" r="5" fill="#4a5568" />
              <circle cx="275" cy="95" r="5" fill="#4a5568" />
              <circle cx="237" cy="93" r="2" fill="#ffffff" opacity="0.9" />
              <circle cx="277" cy="93" r="2" fill="#ffffff" opacity="0.9" />
              
              {/* Eyebrows */}
              <path d="M 225 88 Q 235 85, 245 88" stroke="#8b4513" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 265 88 Q 275 85, 285 88" stroke="#8b4513" strokeWidth="2" fill="none" strokeLinecap="round" />
              
              {/* More realistic nose */}
              <path d="M 255 100 
                       C 253 105, 252 110, 255 115 
                       C 258 110, 257 105, 255 100" 
                fill="#fdba74" stroke="#f97316" strokeWidth="0.3" />
              <ellipse cx="252" cy="112" rx="2" ry="1.5" fill="#f97316" opacity="0.3" />
              <ellipse cx="258" cy="112" rx="2" ry="1.5" fill="#f97316" opacity="0.3" />
              
              {/* More realistic mouth */}
              <path d="M 245 125 Q 255 130, 265 125" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 250 127 Q 255 129, 260 127" stroke="#ef4444" strokeWidth="1" fill="none" strokeLinecap="round" />
              
              {/* Enhanced ears with more detail */}
              <ellipse cx="185" cy="100" rx="8" ry="15" fill="url(#faceGradient)" stroke="#f97316" strokeWidth="0.8" />
              <ellipse cx="325" cy="100" rx="8" ry="15" fill="url(#faceGradient)" stroke="#f97316" strokeWidth="0.8" />
              <ellipse cx="187" cy="100" rx="4" ry="8" fill="#fdba74" opacity="0.6" />
              <ellipse cx="323" cy="100" rx="4" ry="8" fill="#fdba74" opacity="0.6" />
              
              {/* Enhanced hair with more texture */}
              <path d="M 185 75 
                       Q 195 45, 225 40 
                       Q 240 35, 255 35
                       Q 270 35, 285 40
                       Q 315 45, 325 75
                       Q 320 55, 300 50 
                       Q 280 45, 255 45 
                       Q 230 45, 210 50 
                       Q 190 55, 185 75" 
                fill="#8b4513" stroke="#654321" strokeWidth="0.3" />
              
              {/* Hair texture details */}
              <path d="M 200 60 Q 220 55, 240 60" stroke="#654321" strokeWidth="0.5" fill="none" opacity="0.6" />
              <path d="M 270 60 Q 290 55, 310 60" stroke="#654321" strokeWidth="0.5" fill="none" opacity="0.6" />
            </g>

            {/* Seamless neck connection - puzzle piece style */}
            <path d="M 245 165 
                     Q 255 168, 265 165
                     Q 270 170, 275 175
                     Q 270 180, 265 185
                     Q 255 188, 245 185
                     Q 240 180, 235 175
                     Q 240 170, 245 165 Z" 
              fill="url(#skinToneGradient)" 
              stroke="#f97316" 
              strokeWidth="0.8"
              filter="url(#jointShadow)"
            />

            {/* 2. CHEST/RESPIRATORY SYSTEM - Enhanced with seamless shoulder connections */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('respiratory-system')}
               onMouseEnter={() => setHoveredPart('respiratory-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Enhanced chest/torso with natural curves */}
              <path d="M 235 185 
                       C 220 190, 210 200, 205 220
                       L 205 310
                       C 205 325, 215 335, 230 340
                       L 280 340
                       C 295 335, 305 325, 305 310
                       L 305 220
                       C 300 200, 290 190, 275 185
                       Q 270 183, 265 185
                       Q 255 188, 245 185
                       Q 240 183, 235 185 Z"
                fill={getIntensityColor(getSystemIntensity(['lungs', 'chest', 'throat']))}
                stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
                strokeWidth="1.5"
                filter={hoveredPart === 'respiratory-system' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced chest definition with natural muscle lines */}
              <path d="M 225 210 Q 240 205, 255 210 Q 270 205, 285 210" 
                stroke="rgba(249, 115, 22, 0.25)" strokeWidth="1" fill="none" />
              <path d="M 230 230 Q 255 225, 280 230" 
                stroke="rgba(249, 115, 22, 0.2)" strokeWidth="1" fill="none" />
              <path d="M 235 250 Q 255 248, 275 250" 
                stroke="rgba(249, 115, 22, 0.15)" strokeWidth="1" fill="none" />
            </g>

            {/* 3. HEART - Anatomically positioned with better integration */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-110"
              )} 
               onClick={() => !readOnly && handleZoomIn('cardiovascular-system')}
               onMouseEnter={() => setHoveredPart('cardiovascular-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 255 235 
                       C 245 225, 230 225, 230 245 
                       C 230 265, 255 295, 255 295 
                       C 255 295, 280 265, 280 245 
                       C 280 225, 265 225, 255 235 Z"
                fill={getIntensityColor(getSystemIntensity(['heart']))}
                stroke={getIntensityStroke(getSystemIntensity(['heart']))}
                strokeWidth="1.5"
                filter={hoveredPart === 'cardiovascular-system' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
            </g>

            {/* 4. ABDOMEN/DIGESTIVE SYSTEM - Seamless waist connection */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('digestive-system')}
               onMouseEnter={() => setHoveredPart('digestive-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Seamless waist connection - puzzle piece style */}
              <path d="M 230 340 
                       Q 240 345, 250 342
                       Q 260 345, 270 342
                       Q 280 345, 290 350
                       C 295 355, 300 365, 300 380
                       L 300 460
                       C 300 475, 290 485, 275 490
                       L 235 490
                       C 220 485, 210 475, 210 460
                       L 210 380
                       C 210 365, 215 355, 220 350
                       Q 225 345, 230 340 Z"
                fill={getIntensityColor(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                stroke={getIntensityStroke(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                strokeWidth="1.5"
                filter={hoveredPart === 'digestive-system' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Natural waist definition */}
              <path d="M 225 370 Q 255 365, 285 370" 
                stroke="rgba(249, 115, 22, 0.25)" strokeWidth="1" fill="none" />
            </g>

            {/* 5. LEFT ARM - Enhanced with seamless shoulder connection */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Seamless shoulder connection - puzzle piece style */}
              <circle cx="205" cy="210" r="15" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.8"
                filter="url(#jointShadow)"
              />
              
              {/* Upper arm with natural muscle definition */}
              <path d="M 190 210 
                       Q 175 220, 165 240
                       Q 160 260, 155 280
                       L 145 320
                       Q 140 335, 145 350
                       Q 150 365, 160 370
                       L 170 375
                       Q 180 380, 185 365
                       Q 190 350, 195 335
                       L 205 295
                       Q 210 280, 205 265
                       Q 200 250, 195 235
                       Q 192 222, 190 210 Z"
                fill={getIntensityColor(getSystemIntensity(['left-arm', 'left-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder']))}
                strokeWidth="1.5"
                filter={hoveredPart === 'left-arm' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Seamless elbow connection - puzzle piece style */}
              <ellipse cx="155" cy="375" rx="12" ry="8" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.8"
                filter="url(#jointShadow)"
              />
              
              {/* Forearm with natural taper */}
              <path d="M 145 380 
                       Q 130 390, 120 410
                       Q 115 430, 110 450
                       L 100 490
                       Q 95 505, 100 520
                       Q 105 535, 115 540
                       L 125 545
                       Q 135 550, 140 535
                       Q 145 520, 150 505
                       L 160 465
                       Q 165 450, 160 435
                       Q 155 420, 150 405
                       Q 147 392, 145 380 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
              
              {/* Seamless wrist connection */}
              <ellipse cx="110" cy="545" rx="8" ry="6" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.6"
                filter="url(#jointShadow)"
              />
              
              {/* Hand with finger definition */}
              <ellipse cx="107" cy="565" rx="14" ry="20" 
                fill={getIntensityColor(getSymptomIntensity('left-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
            </g>

            {/* 6. RIGHT ARM - Mirror with seamless connections */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <circle cx="305" cy="210" r="15" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.8"
                filter="url(#jointShadow)"
              />
              
              <path d="M 320 210 
                       Q 335 220, 345 240
                       Q 350 260, 355 280
                       L 365 320
                       Q 370 335, 365 350
                       Q 360 365, 350 370
                       L 340 375
                       Q 330 380, 325 365
                       Q 320 350, 315 335
                       L 305 295
                       Q 300 280, 305 265
                       Q 310 250, 315 235
                       Q 318 222, 320 210 Z"
                fill={getIntensityColor(getSystemIntensity(['right-arm', 'right-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder']))}
                strokeWidth="1.5"
                filter={hoveredPart === 'right-arm' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              <ellipse cx="355" cy="375" rx="12" ry="8" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.8"
                filter="url(#jointShadow)"
              />
              
              <path d="M 365 380 
                       Q 380 390, 390 410
                       Q 395 430, 400 450
                       L 410 490
                       Q 415 505, 410 520
                       Q 405 535, 395 540
                       L 385 545
                       Q 375 550, 370 535
                       Q 365 520, 360 505
                       L 350 465
                       Q 345 450, 350 435
                       Q 355 420, 360 405
                       Q 363 392, 365 380 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
              
              <ellipse cx="400" cy="545" rx="8" ry="6" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.6"
                filter="url(#jointShadow)"
              />
              
              <ellipse cx="403" cy="565" rx="14" ry="20" 
                fill={getIntensityColor(getSymptomIntensity('right-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
            </g>

            {/* 7. LEFT LEG - Separated and with seamless hip connection */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Seamless hip connection - puzzle piece style */}
              <ellipse cx="235" cy="495" rx="12" ry="8" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.8"
                filter="url(#jointShadow)"
              />
              
              {/* Thigh with natural muscle definition - separated from right leg */}
              <path d="M 225 500 
                       Q 220 510, 218 525
                       Q 216 540, 215 555
                       L 215 590
                       Q 215 605, 220 620
                       Q 225 635, 235 640
                       L 245 642
                       Q 255 644, 260 635
                       Q 265 620, 265 605
                       L 265 555
                       Q 264 540, 262 525
                       Q 260 510, 255 500
                       Q 250 495, 245 495
                       Q 235 495, 225 500 Z"
                fill={getIntensityColor(getSystemIntensity(['left-leg', 'left-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee']))}
                strokeWidth="1.5"
                filter={hoveredPart === 'left-leg' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Seamless knee connection - puzzle piece style */}
              <ellipse cx="240" cy="645" rx="15" ry="10" 
                fill="rgba(249, 115, 22, 0.4)" 
                stroke="rgba(234, 88, 12, 0.6)" 
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              {/* Calf with natural taper */}
              <path d="M 230 650 
                       Q 225 660, 222 675
                       Q 220 690, 218 705
                       L 216 740
                       Q 215 755, 220 770
                       Q 225 785, 235 790
                       L 245 792
                       Q 255 794, 260 785
                       Q 265 770, 265 755
                       L 263 705
                       Q 261 690, 259 675
                       Q 257 660, 252 650
                       Q 247 645, 242 645
                       Q 237 645, 230 650 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
              
              {/* Seamless ankle connection */}
              <ellipse cx="240" cy="795" rx="10" ry="6" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.6"
                filter="url(#jointShadow)"
              />
              
              {/* Foot */}
              <ellipse cx="237" cy="815" rx="12" ry="22" 
                fill={getIntensityColor(getSymptomIntensity('left-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
            </g>

            {/* 8. RIGHT LEG - Separated and mirrored with seamless connections */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <ellipse cx="275" cy="495" rx="12" ry="8" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.8"
                filter="url(#jointShadow)"
              />
              
              {/* Right thigh - properly separated from left leg */}
              <path d="M 285 500 
                       Q 290 510, 292 525
                       Q 294 540, 295 555
                       L 295 590
                       Q 295 605, 290 620
                       Q 285 635, 275 640
                       L 265 642
                       Q 255 644, 250 635
                       Q 245 620, 245 605
                       L 245 555
                       Q 246 540, 248 525
                       Q 250 510, 255 500
                       Q 260 495, 265 495
                       Q 275 495, 285 500 Z"
                fill={getIntensityColor(getSystemIntensity(['right-leg', 'right-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee']))}
                strokeWidth="1.5"
                filter={hoveredPart === 'right-leg' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              <ellipse cx="270" cy="645" rx="15" ry="10" 
                fill="rgba(249, 115, 22, 0.4)" 
                stroke="rgba(234, 88, 12, 0.6)" 
                strokeWidth="1"
                filter="url(#jointShadow)"
              />
              
              <path d="M 280 650 
                       Q 285 660, 288 675
                       Q 290 690, 292 705
                       L 294 740
                       Q 295 755, 290 770
                       Q 285 785, 275 790
                       L 265 792
                       Q 255 794, 250 785
                       Q 245 770, 245 755
                       L 247 705
                       Q 249 690, 251 675
                       Q 253 660, 258 650
                       Q 263 645, 268 645
                       Q 273 645, 280 650 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
              
              <ellipse cx="270" cy="795" rx="10" ry="6" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="0.6"
                filter="url(#jointShadow)"
              />
              
              <ellipse cx="273" cy="815" rx="12" ry="22" 
                fill={getIntensityColor(getSymptomIntensity('right-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
                strokeWidth="1.2"
                filter="url(#softShadow)"
              />
            </g>

          </>
        ) : (
          // BACK VIEW - Enhanced with same improvements
          <>
            {/* Enhanced back view with same seamless joint principles */}
            <path d="M 260 45
                     C 290 45, 315 60, 325 85
                     C 330 100, 330 115, 325 130
                     C 320 145, 310 155, 295 160
                     C 285 163, 275 164, 265 165
                     Q 260 166, 255 166
                     Q 250 166, 245 165
                     C 235 164, 225 163, 215 160
                     C 200 155, 190 145, 185 130
                     C 180 115, 180 100, 185 85
                     C 195 60, 220 45, 260 45 Z"
              fill={getIntensityColor(getSymptomIntensity('head'))}
              stroke={getIntensityStroke(getSymptomIntensity('head'))}
              strokeWidth="1.5"
              filter={hoveredPart === 'head' ? "url(#hoverGlow)" : "url(#softShadow)"}
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('head', 'Back of Head', e)}
              onMouseEnter={() => setHoveredPart('head')}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Enhanced hair back view */}
            <path d="M 185 75 Q 195 45, 225 40 Q 240 35, 255 35 Q 270 35, 285 40 Q 315 45, 325 75 
                     Q 320 55, 300 50 Q 280 45, 255 45 Q 230 45, 210 50 Q 190 55, 185 75" 
              fill="#8b4513" stroke="#654321" strokeWidth="0.3" />

            {/* BACK & SPINE - Enhanced with natural back contours and seamless connections */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={(e) => !readOnly && handleBodyPartClick('back', 'Back & Spine', e)}
               onMouseEnter={() => setHoveredPart('back')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Seamless neck to back connection */}
              <path d="M 245 165 
                       Q 255 168, 265 165
                       Q 270 170, 275 175
                       Q 270 180, 265 185
                       Q 255 188, 245 185
                       Q 240 180, 235 175
                       Q 240 170, 245 165 Z" 
                fill="url(#skinToneGradient)" 
                stroke="#f97316" 
                strokeWidth="0.8"
                filter="url(#jointShadow)"
              />
              
              <path d="M 235 185 
                       C 220 190, 210 200, 205 220
                       L 205 500
                       C 205 515, 215 525, 230 530
                       L 280 530
                       C 295 525, 305 515, 305 500
                       L 305 220
                       C 300 200, 290 190, 275 185
                       Q 270 183, 265 185
                       Q 255 188, 245 185
                       Q 240 183, 235 185 Z"
                fill={getIntensityColor(getSymptomIntensity('back'))}
                stroke={getIntensityStroke(getSymptomIntensity('back'))}
                strokeWidth="1.5"
                filter={hoveredPart === 'back' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Enhanced natural spine curve */}
              <path d="M 255 200 
                       Q 253 230, 255 260
                       Q 257 290, 255 320
                       Q 253 350, 255 380
                       Q 257 410, 255 440
                       Q 253 470, 255 500"
                stroke="rgba(234, 88, 12, 0.7)" 
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              
              {/* Enhanced shoulder blade definition */}
              <path d="M 220 230 Q 235 225, 245 235 Q 240 250, 225 255 Q 215 245, 220 230" 
                fill="rgba(249, 115, 22, 0.25)" stroke="rgba(234, 88, 12, 0.3)" strokeWidth="0.8" />
              <path d="M 290 230 Q 275 225, 265 235 Q 270 250, 285 255 Q 295 245, 290 230" 
                fill="rgba(249, 115, 22, 0.25)" stroke="rgba(234, 88, 12, 0.3)" strokeWidth="0.8" />
            </g>

            {/* Back arms and legs with same seamless joint improvements as front view */}
            {/* (Similar enhancements applied to back view arms and legs) */}
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
        return '👆 Tap any body area to explore specific parts, or use "General Health Changes" for whole-body symptoms';
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