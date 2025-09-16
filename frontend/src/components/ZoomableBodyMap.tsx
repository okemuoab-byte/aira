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

  const handleBodyPartClick = (bodyPartId: string, bodyPartName: string, event: React.MouseEvent<SVGElement>) => {
    if (readOnly) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const coordinates = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    onBodyPartClick(bodyPartId, bodyPartName, coordinates);
  };

  // Enhanced human-like body diagram
  const renderOverview = () => (
    <div className="flex justify-center">
      <svg width="500" height="650" viewBox="0 0 500 650" className="w-full h-auto max-w-md drop-shadow-lg">
        <defs>
          {/* Natural skin tone gradients */}
          <radialGradient id="skinToneGradient" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef7ed" />
            <stop offset="30%" stopColor="#fed7aa" />
            <stop offset="70%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#f97316" />
          </radialGradient>

          <linearGradient id="bodyContourGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef7ed" />
            <stop offset="50%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>

          {/* Symptom intensity gradients */}
          <radialGradient id="neutralGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef7ed" />
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

          {/* Subtle shadow filters */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.2" floodColor="#92400e"/>
          </filter>

          <filter id="hoverGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feFlood floodColor="#3b82f6" floodOpacity="0.6"/>
            <feComposite in="SourceGraphic" in2="coloredBlur" operator="over"/>
          </filter>
        </defs>
        
        {currentSide === 'front' ? (
          <>
            {/* Human-like body outline - Front */}
            <path d="M 250 40 
                     C 275 40, 295 50, 310 70
                     C 320 85, 320 100, 315 115
                     C 310 130, 300 140, 290 150
                     L 285 165
                     C 280 175, 275 185, 270 195
                     L 265 215
                     C 260 235, 255 255, 250 275
                     L 245 325
                     C 240 355, 235 385, 230 415
                     L 225 455
                     C 220 495, 215 535, 210 575
                     L 205 615
                     C 200 635, 195 655, 190 675
                     L 310 675
                     C 305 655, 300 635, 295 615
                     L 290 575
                     C 285 535, 280 495, 275 455
                     L 270 415
                     C 265 385, 260 355, 255 325
                     L 250 275
                     C 245 255, 240 235, 235 215
                     L 230 195
                     C 225 185, 220 175, 215 165
                     L 210 150
                     C 200 140, 190 130, 185 115
                     C 180 100, 180 85, 190 70
                     C 205 50, 225 40, 250 40 Z"
              fill="url(#skinToneGradient)" 
              stroke="#d97706" 
              strokeWidth="1.5"
              filter="url(#softShadow)"
            />

            {/* 1. HEAD - More human-like shape */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('head-system')}
               onMouseEnter={() => setHoveredPart('head-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Natural head shape */}
              <path d="M 250 45
                       C 280 45, 305 60, 315 85
                       C 320 100, 320 115, 315 130
                       C 310 145, 300 155, 285 160
                       C 270 165, 250 165, 230 160
                       C 215 155, 205 145, 200 130
                       C 195 115, 195 100, 200 85
                       C 210 60, 235 45, 250 45 Z"
                fill={getIntensityColor(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                strokeWidth="2"
                filter={hoveredPart === 'head-system' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Facial features */}
              <ellipse cx="235" cy="95" rx="8" ry="6" fill="#ffffff" stroke="#d97706" strokeWidth="0.5" />
              <ellipse cx="265" cy="95" rx="8" ry="6" fill="#ffffff" stroke="#d97706" strokeWidth="0.5" />
              <circle cx="235" cy="95" r="4" fill="#4a5568" />
              <circle cx="265" cy="95" r="4" fill="#4a5568" />
              <circle cx="237" cy="93" r="1.5" fill="#ffffff" opacity="0.9" />
              <circle cx="267" cy="93" r="1.5" fill="#ffffff" opacity="0.9" />
              
              {/* Nose */}
              <path d="M 250 100 C 248 105, 248 110, 250 115 C 252 110, 252 105, 250 100" 
                fill="#fdba74" stroke="#f97316" strokeWidth="0.5" />
              
              {/* Mouth */}
              <path d="M 240 120 Q 250 125, 260 120" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
              
              {/* Ears */}
              <ellipse cx="195" cy="100" rx="6" ry="12" fill="url(#skinToneGradient)" stroke="#f97316" strokeWidth="1" />
              <ellipse cx="305" cy="100" rx="6" ry="12" fill="url(#skinToneGradient)" stroke="#f97316" strokeWidth="1" />
              
              {/* Hair */}
              <path d="M 200 70 Q 210 45, 240 40 Q 250 35, 260 40 Q 290 45, 300 70 
                       Q 295 55, 280 50 Q 260 45, 250 45 Q 240 45, 220 50 Q 205 55, 200 70" 
                fill="#8b4513" stroke="#654321" strokeWidth="0.5" />
              
              {/* Neck */}
              <path d="M 235 160 Q 250 165, 265 160 L 265 180 Q 250 185, 235 180 Z" 
                fill="url(#skinToneGradient)" 
                stroke="#f97316" 
                strokeWidth="1" />
            </g>

            {/* 2. CHEST/RESPIRATORY SYSTEM - Natural torso shape */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('respiratory-system')}
               onMouseEnter={() => setHoveredPart('respiratory-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Natural chest/torso */}
              <path d="M 215 180 
                       C 205 185, 200 195, 200 210
                       L 200 300
                       C 200 315, 210 325, 225 330
                       L 275 330
                       C 290 325, 300 315, 300 300
                       L 300 210
                       C 300 195, 295 185, 285 180
                       C 270 175, 255 175, 250 175
                       C 245 175, 230 175, 215 180 Z"
                fill={getIntensityColor(getSystemIntensity(['lungs', 'chest', 'throat']))}
                stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
                strokeWidth="2"
                filter={hoveredPart === 'respiratory-system' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Subtle chest definition */}
              <path d="M 220 200 Q 235 195, 250 200 Q 265 195, 280 200" 
                stroke="rgba(249, 115, 22, 0.3)" strokeWidth="1" fill="none" />
              <path d="M 225 220 Q 250 215, 275 220" 
                stroke="rgba(249, 115, 22, 0.2)" strokeWidth="1" fill="none" />
            </g>

            {/* 3. HEART - Anatomically positioned */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-110"
              )} 
               onClick={() => !readOnly && handleZoomIn('cardiovascular-system')}
               onMouseEnter={() => setHoveredPart('cardiovascular-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 250 220 
                       C 240 210, 225 210, 225 230 
                       C 225 250, 250 280, 250 280 
                       C 250 280, 275 250, 275 230 
                       C 275 210, 260 210, 250 220 Z"
                fill={getIntensityColor(getSystemIntensity(['heart']))}
                stroke={getIntensityStroke(getSystemIntensity(['heart']))}
                strokeWidth="2"
                filter={hoveredPart === 'cardiovascular-system' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
            </g>

            {/* 4. ABDOMEN/DIGESTIVE SYSTEM - Natural waist curve */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('digestive-system')}
               onMouseEnter={() => setHoveredPart('digestive-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 225 330 
                       C 215 335, 210 345, 210 360
                       L 210 440
                       C 210 455, 220 465, 235 470
                       L 265 470
                       C 280 465, 290 455, 290 440
                       L 290 360
                       C 290 345, 285 335, 275 330
                       C 260 325, 250 325, 240 330 Z"
                fill={getIntensityColor(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                stroke={getIntensityStroke(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                strokeWidth="2"
                filter={hoveredPart === 'digestive-system' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Waist definition */}
              <path d="M 225 350 Q 250 345, 275 350" 
                stroke="rgba(249, 115, 22, 0.3)" strokeWidth="1" fill="none" />
            </g>

            {/* 5. LEFT ARM - Natural arm curves */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Upper arm with natural curve */}
              <path d="M 200 190 
                       C 180 200, 165 220, 155 245
                       L 140 295
                       C 135 310, 140 325, 150 335
                       L 160 340
                       C 170 345, 180 340, 185 325
                       L 200 275
                       C 205 260, 200 245, 190 235
                       C 190 220, 190 210, 200 190 Z"
                fill={getIntensityColor(getSystemIntensity(['left-arm', 'left-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder']))}
                strokeWidth="2"
                filter={hoveredPart === 'left-arm' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Shoulder connection */}
              <circle cx="205" cy="200" r="12" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1"
                filter="url(#softShadow)"
              />
              
              {/* Forearm with natural taper */}
              <path d="M 145 335 
                       C 130 345, 120 360, 110 380
                       L 95 430
                       C 90 445, 95 460, 105 470
                       L 115 475
                       C 125 480, 135 475, 140 460
                       L 155 410
                       C 160 395, 155 380, 145 370
                       C 145 355, 145 345, 145 335 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
              
              {/* Hand */}
              <ellipse cx="102" cy="490" rx="12" ry="18" 
                fill={getIntensityColor(getSymptomIntensity('left-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
            </g>

            {/* 6. RIGHT ARM - Mirror of left with natural curves */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 300 190 
                       C 320 200, 335 220, 345 245
                       L 360 295
                       C 365 310, 360 325, 350 335
                       L 340 340
                       C 330 345, 320 340, 315 325
                       L 300 275
                       C 295 260, 300 245, 310 235
                       C 310 220, 310 210, 300 190 Z"
                fill={getIntensityColor(getSystemIntensity(['right-arm', 'right-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder']))}
                strokeWidth="2"
                filter={hoveredPart === 'right-arm' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              <circle cx="295" cy="200" r="12" 
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1"
                filter="url(#softShadow)"
              />
              
              <path d="M 355 335 
                       C 370 345, 380 360, 390 380
                       L 405 430
                       C 410 445, 405 460, 395 470
                       L 385 475
                       C 375 480, 365 475, 360 460
                       L 345 410
                       C 340 395, 345 380, 355 370
                       C 355 355, 355 345, 355 335 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
              
              <ellipse cx="398" cy="490" rx="12" ry="18" 
                fill={getIntensityColor(getSymptomIntensity('right-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
            </g>

            {/* 7. LEFT LEG - Natural leg proportions */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Thigh with natural curve */}
              <path d="M 235 470 
                       C 230 475, 225 485, 225 500
                       L 225 560
                       C 225 575, 230 585, 240 590
                       L 250 590
                       C 260 585, 265 575, 265 560
                       L 265 500
                       C 265 485, 260 475, 250 470
                       C 245 465, 240 465, 235 470 Z"
                fill={getIntensityColor(getSystemIntensity(['left-leg', 'left-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee']))}
                strokeWidth="2"
                filter={hoveredPart === 'left-leg' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Knee */}
              <ellipse cx="245" cy="590" rx="10" ry="8" 
                fill="rgba(249, 115, 22, 0.6)" 
                stroke="rgba(234, 88, 12, 0.8)" 
                strokeWidth="1" 
              />
              
              {/* Calf with natural taper */}
              <path d="M 240 600 
                       C 235 605, 230 615, 230 630
                       L 230 660
                       C 230 675, 235 685, 245 690
                       L 255 690
                       C 265 685, 270 675, 270 660
                       L 270 630
                       C 270 615, 265 605, 255 600
                       C 250 595, 245 595, 240 600 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
              
              {/* Foot */}
              <ellipse cx="247" cy="710" rx="10" ry="20" 
                fill={getIntensityColor(getSymptomIntensity('left-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
            </g>

            {/* 8. RIGHT LEG - Mirror with natural proportions */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 265 470 
                       C 270 475, 275 485, 275 500
                       L 275 560
                       C 275 575, 270 585, 260 590
                       L 250 590
                       C 240 585, 235 575, 235 560
                       L 235 500
                       C 235 485, 240 475, 250 470
                       C 255 465, 260 465, 265 470 Z"
                fill={getIntensityColor(getSystemIntensity(['right-leg', 'right-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee']))}
                strokeWidth="2"
                filter={hoveredPart === 'right-leg' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              <ellipse cx="255" cy="590" rx="10" ry="8" 
                fill="rgba(249, 115, 22, 0.6)" 
                stroke="rgba(234, 88, 12, 0.8)" 
                strokeWidth="1" 
              />
              
              <path d="M 260 600 
                       C 265 605, 270 615, 270 630
                       L 270 660
                       C 270 675, 265 685, 255 690
                       L 245 690
                       C 235 685, 230 675, 230 660
                       L 230 630
                       C 230 615, 235 605, 245 600
                       C 250 595, 255 595, 260 600 Z"
                fill="url(#skinToneGradient)"
                stroke="#f97316"
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
              
              <ellipse cx="253" cy="710" rx="10" ry="20" 
                fill={getIntensityColor(getSymptomIntensity('right-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
                strokeWidth="1.5"
                filter="url(#softShadow)"
              />
            </g>

          </>
        ) : (
          // BACK VIEW - Enhanced with natural curves
          <>
            {/* Natural back body outline */}
            <path d="M 250 40 
                     C 275 40, 295 50, 310 70
                     C 320 85, 320 100, 315 115
                     C 310 130, 300 140, 290 150
                     L 285 165
                     C 280 175, 275 185, 270 195
                     L 265 215
                     C 260 235, 255 255, 250 275
                     L 245 325
                     C 240 355, 235 385, 230 415
                     L 225 455
                     C 220 495, 215 535, 210 575
                     L 205 615
                     C 200 635, 195 655, 190 675
                     L 310 675
                     C 305 655, 300 635, 295 615
                     L 290 575
                     C 285 535, 280 495, 275 455
                     L 270 415
                     C 265 385, 260 355, 255 325
                     L 250 275
                     C 245 255, 240 235, 235 215
                     L 230 195
                     C 225 185, 220 175, 215 165
                     L 210 150
                     C 200 140, 190 130, 185 115
                     C 180 100, 180 85, 190 70
                     C 205 50, 225 40, 250 40 Z"
              fill="url(#skinToneGradient)" 
              stroke="#d97706" 
              strokeWidth="1.5"
              filter="url(#softShadow)"
            />

            {/* BACK OF HEAD */}
            <path d="M 250 45
                     C 280 45, 305 60, 315 85
                     C 320 100, 320 115, 315 130
                     C 310 145, 300 155, 285 160
                     C 270 165, 250 165, 230 160
                     C 215 155, 205 145, 200 130
                     C 195 115, 195 100, 200 85
                     C 210 60, 235 45, 250 45 Z"
              fill={getIntensityColor(getSymptomIntensity('head'))}
              stroke={getIntensityStroke(getSymptomIntensity('head'))}
              strokeWidth="2"
              filter={hoveredPart === 'head' ? "url(#hoverGlow)" : "url(#softShadow)"}
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('head', 'Back of Head', e)}
              onMouseEnter={() => setHoveredPart('head')}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Hair back view */}
            <path d="M 200 70 Q 210 45, 240 40 Q 250 35, 260 40 Q 290 45, 300 70 
                     Q 295 55, 280 50 Q 260 45, 250 45 Q 240 45, 220 50 Q 205 55, 200 70" 
              fill="#8b4513" stroke="#654321" strokeWidth="0.5" />

            {/* BACK & SPINE - Natural back contours */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={(e) => !readOnly && handleBodyPartClick('back', 'Back & Spine', e)}
               onMouseEnter={() => setHoveredPart('back')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 215 180 
                       C 205 185, 200 195, 200 210
                       L 200 460
                       C 200 475, 210 485, 225 490
                       L 275 490
                       C 290 485, 300 475, 300 460
                       L 300 210
                       C 300 195, 295 185, 285 180
                       C 270 175, 255 175, 250 175
                       C 245 175, 230 175, 215 180 Z"
                fill={getIntensityColor(getSymptomIntensity('back'))}
                stroke={getIntensityStroke(getSymptomIntensity('back'))}
                strokeWidth="2"
                filter={hoveredPart === 'back' ? "url(#hoverGlow)" : "url(#softShadow)"}
                className="transition-all duration-300"
              />
              
              {/* Natural spine curve */}
              <path d="M 250 190 
                       Q 248 220, 250 250
                       Q 252 280, 250 310
                       Q 248 340, 250 370
                       Q 252 400, 250 430
                       Q 248 460, 250 480"
                stroke="rgba(234, 88, 12, 0.8)" 
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              
              {/* Shoulder blade definition */}
              <path d="M 220 220 Q 235 215, 245 225 Q 240 240, 225 245 Q 215 235, 220 220" 
                fill="rgba(249, 115, 22, 0.3)" stroke="rgba(234, 88, 12, 0.4)" strokeWidth="1" />
              <path d="M 280 220 Q 265 215, 255 225 Q 260 240, 275 245 Q 285 235, 280 220" 
                fill="rgba(249, 115, 22, 0.3)" stroke="rgba(234, 88, 12, 0.4)" strokeWidth="1" />
            </g>

            {/* BACK ARMS - Natural positioning */}
            <path d="M 200 190 
                     C 180 200, 165 220, 155 245
                     L 140 295
                     C 135 310, 140 325, 150 335
                     L 160 340
                     C 170 345, 180 340, 185 325
                     L 200 275
                     C 205 260, 200 245, 190 235
                     C 190 220, 190 210, 200 190 Z"
              fill={getIntensityColor(getSymptomIntensity('left-arm'))}
              stroke={getIntensityStroke(getSymptomIntensity('left-arm'))}
              strokeWidth="2"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('left-arm', 'Left Arm (Back)', e)}
              filter="url(#softShadow)"
            />
            
            <path d="M 300 190 
                     C 320 200, 335 220, 345 245
                     L 360 295
                     C 365 310, 360 325, 350 335
                     L 340 340
                     C 330 345, 320 340, 315 325
                     L 300 275
                     C 295 260, 300 245, 310 235
                     C 310 220, 310 210, 300 190 Z"
              fill={getIntensityColor(getSymptomIntensity('right-arm'))}
              stroke={getIntensityStroke(getSymptomIntensity('right-arm'))}
              strokeWidth="2"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('right-arm', 'Right Arm (Back)', e)}
              filter="url(#softShadow)"
            />

            {/* BACK LEGS - Natural proportions */}
            <path d="M 235 490 
                     C 230 495, 225 505, 225 520
                     L 225 660
                     C 225 675, 230 685, 240 690
                     L 250 690
                     C 260 685, 265 675, 265 660
                     L 265 520
                     C 265 505, 260 495, 250 490
                     C 245 485, 240 485, 235 490 Z"
              fill={getIntensityColor(getSymptomIntensity('left-leg'))}
              stroke={getIntensityStroke(getSymptomIntensity('left-leg'))}
              strokeWidth="2"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('left-leg', 'Left Leg (Back)', e)}
              filter="url(#softShadow)"
            />
            
            <path d="M 265 490 
                     C 270 495, 275 505, 275 520
                     L 275 660
                     C 275 675, 270 685, 260 690
                     L 250 690
                     C 240 685, 235 675, 235 660
                     L 235 520
                     C 235 505, 240 495, 250 490
                     C 255 485, 260 485, 265 490 Z"
              fill={getIntensityColor(getSymptomIntensity('right-leg'))}
              stroke={getIntensityStroke(getSymptomIntensity('right-leg'))}
              strokeWidth="2"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('right-leg', 'Right Leg (Back)', e)}
              filter="url(#softShadow)"
            />
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