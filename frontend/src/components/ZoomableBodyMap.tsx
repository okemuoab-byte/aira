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

  // Enhanced body diagram with medical illustration quality
  const renderOverview = () => (
    <div className="flex justify-center">
      <svg width="500" height="700" viewBox="0 0 500 700" className="w-full h-auto max-w-lg drop-shadow-2xl">
        <defs>
          {/* Medical-grade skin tone gradients */}
          <radialGradient id="skinToneGradient" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#fdf2e9" />
            <stop offset="30%" stopColor="#f4e4d1" />
            <stop offset="70%" stopColor="#e8d5c4" />
            <stop offset="100%" stopColor="#d4b896" />
          </radialGradient>

          <linearGradient id="bodyContourGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8f4f0" />
            <stop offset="25%" stopColor="#f0e6d6" />
            <stop offset="50%" stopColor="#e8d5c4" />
            <stop offset="75%" stopColor="#d4b896" />
            <stop offset="100%" stopColor="#c4a484" />
          </linearGradient>

          {/* Symptom intensity gradients - more medical/clinical */}
          <radialGradient id="neutralGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdf2e9" />
            <stop offset="100%" stopColor="#f0e6d6" />
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

          {/* Organ-specific gradients */}
          <radialGradient id="lungGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </radialGradient>

          <radialGradient id="heartGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef2f2" />
            <stop offset="50%" stopColor="#fecaca" />
            <stop offset="100%" stopColor="#f87171" />
          </radialGradient>

          <radialGradient id="digestiveGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="50%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#86efac" />
          </radialGradient>

          {/* Advanced filters for depth and realism */}
          <filter id="anatomicalShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feOffset dx="2" dy="4" result="offsetBlur"/>
            <feFlood floodColor="#8b7355" floodOpacity="0.3"/>
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
          </filter>

          <filter id="organDepth" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.4" floodColor="#6b5b47"/>
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" floodColor="#4a3f35"/>
          </filter>

          <filter id="hoverHighlight" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feFlood floodColor="#3b82f6" floodOpacity="0.8"/>
            <feComposite in="SourceGraphic" in2="coloredBlur" operator="over"/>
          </filter>

          <filter id="medicalGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feFlood floodColor="#ffffff" floodOpacity="0.6"/>
            <feComposite in="SourceGraphic" in2="coloredBlur" operator="over"/>
          </filter>

          {/* Anatomical texture patterns */}
          <pattern id="muscleTexture" patternUnits="userSpaceOnUse" width="12" height="12">
            <rect width="12" height="12" fill="rgba(139, 115, 85, 0.05)"/>
            <path d="M 0 6 Q 6 3, 12 6 Q 6 9, 0 6" stroke="rgba(139, 115, 85, 0.1)" strokeWidth="0.5" fill="none"/>
          </pattern>

          <pattern id="organTexture" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="rgba(255,255,255,0.1)"/>
            <circle cx="4" cy="4" r="1.5" fill="rgba(255,255,255,0.15)"/>
          </pattern>
        </defs>
        
        {currentSide === 'front' ? (
          <>
            {/* Realistic Human Body Outline - Front */}
            <path d="M 250 50 
                     C 280 50, 300 70, 310 95
                     C 315 110, 315 125, 310 140
                     C 305 155, 295 165, 285 175
                     L 280 190
                     C 275 200, 270 210, 265 220
                     L 260 240
                     C 255 260, 250 280, 245 300
                     L 240 350
                     C 235 380, 230 410, 225 440
                     L 220 480
                     C 215 520, 210 560, 205 600
                     L 200 640
                     C 195 660, 190 680, 185 700
                     L 315 700
                     C 310 680, 305 660, 300 640
                     L 295 600
                     C 290 560, 285 520, 280 480
                     L 275 440
                     C 270 410, 265 380, 260 350
                     L 255 300
                     C 250 280, 245 260, 240 240
                     L 235 220
                     C 230 210, 225 200, 220 190
                     L 215 175
                     C 205 165, 195 155, 190 140
                     C 185 125, 185 110, 190 95
                     C 200 70, 220 50, 250 50 Z"
              fill="url(#skinToneGradient)" 
              stroke="#8b7355" 
              strokeWidth="2"
              filter="url(#anatomicalShadow)"
            />

            {/* 1. HEAD & BRAIN SYSTEM - Medical illustration quality */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('head-system')}
               onMouseEnter={() => setHoveredPart('head-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Realistic head shape */}
              <ellipse cx="250" cy="85" rx="60" ry="75" 
                fill={getIntensityColor(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                strokeWidth="3"
                filter={hoveredPart === 'head-system' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Detailed facial features */}
              {/* Eyes with realistic shape */}
              <ellipse cx="235" cy="75" rx="12" ry="8" fill="#ffffff" stroke="#8b7355" strokeWidth="1" />
              <ellipse cx="265" cy="75" rx="12" ry="8" fill="#ffffff" stroke="#8b7355" strokeWidth="1" />
              <circle cx="235" cy="75" r="6" fill="#4a5568" />
              <circle cx="265" cy="75" r="6" fill="#4a5568" />
              <circle cx="237" cy="73" r="2" fill="#ffffff" opacity="0.9" />
              <circle cx="267" cy="73" r="2" fill="#ffffff" opacity="0.9" />
              
              {/* Eyebrows */}
              <path d="M 225 65 Q 235 62, 245 65" stroke="#8b5a3c" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 255 65 Q 265 62, 275 65" stroke="#8b5a3c" strokeWidth="3" fill="none" strokeLinecap="round" />
              
              {/* Nose with nostrils */}
              <ellipse cx="250" cy="85" rx="6" ry="12" fill="#e8d5c4" stroke="#d4b896" strokeWidth="1" />
              <ellipse cx="247" cy="90" rx="2" ry="3" fill="#d4b896" />
              <ellipse cx="253" cy="90" rx="2" ry="3" fill="#d4b896" />
              
              {/* Mouth with lips */}
              <ellipse cx="250" cy="100" rx="12" ry="4" fill="#cd919e" stroke="#b8808d" strokeWidth="1" />
              <path d="M 240 100 Q 250 105, 260 100" stroke="#b8808d" strokeWidth="1" fill="none" />
              
              {/* Ears */}
              <ellipse cx="195" cy="80" rx="8" ry="15" fill="url(#skinToneGradient)" stroke="#d4b896" strokeWidth="2" />
              <ellipse cx="305" cy="80" rx="8" ry="15" fill="url(#skinToneGradient)" stroke="#d4b896" strokeWidth="2" />
              
              {/* Hair with realistic texture */}
              <path d="M 195 60 Q 200 35, 230 25 Q 250 20, 270 25 Q 300 35, 305 60 
                       Q 300 45, 285 35 Q 270 30, 250 30 Q 230 30, 215 35 Q 200 45, 195 60" 
                fill="#8b5a3c" stroke="#6b4423" strokeWidth="1" />
              
              {/* Neck connection */}
              <rect x="235" y="155" width="30" height="25" rx="15" 
                fill="url(#skinToneGradient)" 
                stroke="#d4b896" 
                strokeWidth="2" />
            </g>

            {/* 2. RESPIRATORY SYSTEM - Anatomically accurate */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('respiratory-system')}
               onMouseEnter={() => setHoveredPart('respiratory-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Chest cavity */}
              <path d="M 200 180 
                       C 190 185, 185 195, 185 210
                       L 185 320
                       C 185 335, 195 345, 210 350
                       L 290 350
                       C 305 345, 315 335, 315 320
                       L 315 210
                       C 315 195, 310 185, 300 180
                       C 285 175, 270 175, 250 175
                       C 230 175, 215 175, 200 180 Z"
                fill={getIntensityColor(getSystemIntensity(['lungs', 'chest', 'throat']))}
                stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
                strokeWidth="3"
                filter={hoveredPart === 'respiratory-system' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Realistic lungs with lobes */}
              <g opacity="0.8">
                {/* Left lung */}
                <path d="M 210 200 
                         C 195 205, 190 220, 190 240
                         L 190 310
                         C 190 325, 200 335, 215 340
                         L 235 340
                         C 245 335, 250 325, 250 310
                         L 250 240
                         C 250 220, 245 205, 235 200
                         C 225 195, 215 195, 210 200 Z"
                  fill="url(#lungGradient)"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  filter="url(#organDepth)"
                />
                
                {/* Right lung */}
                <path d="M 265 200 
                         C 255 195, 245 195, 240 200
                         C 235 205, 230 220, 230 240
                         L 230 310
                         C 230 325, 240 335, 255 340
                         L 285 340
                         C 300 335, 310 325, 310 310
                         L 310 240
                         C 310 220, 305 205, 290 200
                         C 280 195, 270 195, 265 200 Z"
                  fill="url(#lungGradient)"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  filter="url(#organDepth)"
                />
                
                {/* Lung texture/alveoli representation */}
                <circle cx="220" cy="250" r="3" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="230" cy="270" r="2" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="215" cy="290" r="2.5" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="270" cy="250" r="3" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="280" cy="270" r="2" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="285" cy="290" r="2.5" fill="rgba(14, 165, 233, 0.3)" />
              </g>
              
              {/* Trachea and bronchi */}
              <rect x="242" y="160" width="16" height="50" rx="8" 
                fill="rgba(168, 85, 247, 0.7)"
                stroke="rgba(147, 51, 234, 0.9)"
                strokeWidth="2"
              />
              
              {/* Bronchi branches */}
              <path d="M 250 210 L 230 230" stroke="rgba(147, 51, 234, 0.8)" strokeWidth="4" strokeLinecap="round" />
              <path d="M 250 210 L 270 230" stroke="rgba(147, 51, 234, 0.8)" strokeWidth="4" strokeLinecap="round" />
              
              {/* Ribcage structure */}
              <g opacity="0.4">
                <path d="M 200 190 Q 250 180, 300 190" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 205 210 Q 250 200, 295 210" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 210 230 Q 250 220, 290 230" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 215 250 Q 250 240, 285 250" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 220 270 Q 250 260, 280 270" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 225 290 Q 250 280, 275 290" stroke="#8b7355" strokeWidth="2" fill="none" />
              </g>
            </g>

            {/* 3. CARDIOVASCULAR SYSTEM - Realistic heart */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-110"
              )} 
               onClick={() => !readOnly && handleZoomIn('cardiovascular-system')}
               onMouseEnter={() => setHoveredPart('cardiovascular-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Anatomically correct heart shape */}
              <path d="M 250 230 
                       C 235 215, 210 215, 210 240 
                       C 210 265, 250 305, 250 305 
                       C 250 305, 290 265, 290 240 
                       C 290 215, 265 215, 250 230 Z"
                fill={getIntensityColor(getSystemIntensity(['heart']))}
                stroke={getIntensityStroke(getSystemIntensity(['heart']))}
                strokeWidth="3"
                filter={hoveredPart === 'cardiovascular-system' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Heart chambers and structure */}
              <g opacity="0.7">
                {/* Left atrium */}
                <path d="M 235 235 C 225 230, 215 235, 215 250 C 215 265, 235 280, 235 280 L 235 235"
                  fill="rgba(239, 68, 68, 0.4)" stroke="rgba(220, 38, 38, 0.6)" strokeWidth="1.5" />
                
                {/* Right atrium */}
                <path d="M 265 235 C 275 230, 285 235, 285 250 C 285 265, 265 280, 265 280 L 265 235"
                  fill="rgba(239, 68, 68, 0.5)" stroke="rgba(220, 38, 38, 0.7)" strokeWidth="1.5" />
                
                {/* Ventricles */}
                <ellipse cx="240" cy="275" rx="15" ry="20" fill="rgba(220, 38, 38, 0.3)" stroke="rgba(185, 28, 28, 0.5)" strokeWidth="1" />
                <ellipse cx="260" cy="275" rx="15" ry="20" fill="rgba(220, 38, 38, 0.4)" stroke="rgba(185, 28, 28, 0.6)" strokeWidth="1" />
                
                {/* Aorta */}
                <path d="M 250 230 Q 245 220, 240 210" stroke="rgba(220, 38, 38, 0.8)" strokeWidth="6" strokeLinecap="round" />
                
                {/* Pulmonary arteries */}
                <path d="M 255 235 Q 265 225, 275 220" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 245 235 Q 235 225, 225 220" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="4" strokeLinecap="round" />
              </g>
              
              {/* Heartbeat animation effect */}
              {hoveredPart === 'cardiovascular-system' && (
                <circle cx="250" cy="260" r="40" 
                  fill="none" 
                  stroke="rgba(239, 68, 68, 0.6)" 
                  strokeWidth="2" 
                  className="animate-ping" 
                />
              )}
            </g>

            {/* 4. DIGESTIVE SYSTEM - Realistic organs */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('digestive-system')}
               onMouseEnter={() => setHoveredPart('digestive-system')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Abdominal cavity */}
              <path d="M 210 350 
                       C 200 355, 195 365, 195 380
                       L 195 460
                       C 195 475, 205 485, 220 490
                       L 280 490
                       C 295 485, 305 475, 305 460
                       L 305 380
                       C 305 365, 300 355, 290 350
                       C 275 345, 260 345, 250 345
                       C 240 345, 225 345, 210 350 Z"
                fill={getIntensityColor(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                stroke={getIntensityStroke(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                strokeWidth="3"
                filter={hoveredPart === 'digestive-system' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Realistic stomach */}
              <path d="M 220 365 
                       C 210 370, 205 380, 210 395
                       C 215 410, 230 415, 250 415
                       C 270 415, 285 410, 290 395
                       C 295 380, 290 370, 280 365
                       C 270 360, 250 360, 235 360
                       C 225 360, 220 365, 220 365 Z"
                fill="url(#digestiveGradient)"
                stroke="#16a34a"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Liver (partial view) */}
              <ellipse cx="280" cy="370" rx="20" ry="15" 
                fill="rgba(133, 77, 14, 0.6)"
                stroke="rgba(120, 53, 15, 0.8)"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Small intestine coils */}
              <g opacity="0.8">
                <path d="M 230 430 Q 250 420, 270 430 Q 280 450, 270 470 Q 250 480, 230 470 Q 220 450, 230 430"
                  fill="rgba(168, 85, 247, 0.5)"
                  stroke="rgba(147, 51, 234, 0.7)"
                  strokeWidth="2"
                />
                <path d="M 240 445 Q 250 440, 260 445 Q 265 455, 260 465 Q 250 470, 240 465 Q 235 455, 240 445"
                  fill="rgba(168, 85, 247, 0.4)"
                  stroke="rgba(147, 51, 234, 0.6)"
                  strokeWidth="1.5"
                />
                
                {/* Intestinal texture */}
                <circle cx="245" cy="450" r="2" fill="rgba(147, 51, 234, 0.3)" />
                <circle cx="255" cy="460" r="1.5" fill="rgba(147, 51, 234, 0.3)" />
              </g>
            </g>

            {/* 5. LEFT ARM - Realistic anatomy */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Upper arm with muscle definition */}
              <path d="M 185 190 
                       C 175 195, 170 205, 170 220
                       L 170 280
                       C 170 295, 175 305, 185 310
                       L 195 310
                       C 205 305, 210 295, 210 280
                       L 210 220
                       C 210 205, 205 195, 195 190
                       C 190 185, 190 185, 185 190 Z"
                fill={getIntensityColor(getSystemIntensity(['left-arm', 'left-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder']))}
                strokeWidth="3"
                filter={hoveredPart === 'left-arm' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Shoulder joint */}
              <circle cx="190" cy="200" r="18" 
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Elbow joint */}
              <ellipse cx="190" cy="310" rx="12" ry="8" 
                fill="rgba(139, 115, 85, 0.6)" 
                stroke="rgba(120, 100, 75, 0.8)" 
                strokeWidth="2" 
              />
              
              {/* Forearm */}
              <path d="M 185 310 
                       C 180 315, 175 325, 175 340
                       L 175 400
                       C 175 415, 180 425, 190 430
                       L 200 430
                       C 210 425, 215 415, 215 400
                       L 215 340
                       C 215 325, 210 315, 200 310
                       C 195 305, 190 305, 185 310 Z"
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Realistic hand */}
              <ellipse cx="192" cy="450" rx="18" ry="25" 
                fill={getIntensityColor(getSymptomIntensity('left-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Detailed fingers with joints */}
              <g opacity="0.9">
                <rect x="185" y="470" width="3" height="12" rx="1.5" fill="#d4b896" />
                <rect x="189" y="475" width="3" height="15" rx="1.5" fill="#d4b896" />
                <rect x="193" y="473" width="3" height="13" rx="1.5" fill="#d4b896" />
                <rect x="197" y="470" width="3" height="10" rx="1.5" fill="#d4b896" />
                <rect x="180" y="465" width="3" height="8" rx="1.5" fill="#d4b896" />
                
                {/* Finger joints */}
                <circle cx="186.5" cy="476" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="190.5" cy="481" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="194.5" cy="479" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="198.5" cy="476" r="1" fill="rgba(139, 115, 85, 0.5)" />
              </g>
            </g>

            {/* 6. RIGHT ARM - Mirror of left arm */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Upper arm */}
              <path d="M 315 190 
                       C 325 195, 330 205, 330 220
                       L 330 280
                       C 330 295, 325 305, 315 310
                       L 305 310
                       C 295 305, 290 295, 290 280
                       L 290 220
                       C 290 205, 295 195, 305 190
                       C 310 185, 310 185, 315 190 Z"
                fill={getIntensityColor(getSystemIntensity(['right-arm', 'right-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder']))}
                strokeWidth="3"
                filter={hoveredPart === 'right-arm' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Shoulder joint */}
              <circle cx="310" cy="200" r="18" 
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Elbow joint */}
              <ellipse cx="310" cy="310" rx="12" ry="8" 
                fill="rgba(139, 115, 85, 0.6)" 
                stroke="rgba(120, 100, 75, 0.8)" 
                strokeWidth="2" 
              />
              
              {/* Forearm */}
              <path d="M 315 310 
                       C 320 315, 325 325, 325 340
                       L 325 400
                       C 325 415, 320 425, 310 430
                       L 300 430
                       C 290 425, 285 415, 285 400
                       L 285 340
                       C 285 325, 290 315, 300 310
                       C 305 305, 310 305, 315 310 Z"
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Hand */}
              <ellipse cx="308" cy="450" rx="18" ry="25" 
                fill={getIntensityColor(getSymptomIntensity('right-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Fingers */}
              <g opacity="0.9">
                <rect x="312" y="470" width="3" height="12" rx="1.5" fill="#d4b896" />
                <rect x="308" y="475" width="3" height="15" rx="1.5" fill="#d4b896" />
                <rect x="304" y="473" width="3" height="13" rx="1.5" fill="#d4b896" />
                <rect x="300" y="470" width="3" height="10" rx="1.5" fill="#d4b896" />
                <rect x="317" y="465" width="3" height="8" rx="1.5" fill="#d4b896" />
                
                {/* Finger joints */}
                <circle cx="313.5" cy="476" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="309.5" cy="481" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="305.5" cy="479" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="301.5" cy="476" r="1" fill="rgba(139, 115, 85, 0.5)" />
              </g>
            </g>

            {/* 7. LEFT LEG - Realistic anatomy */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Thigh */}
              <path d="M 220 490 
                       C 215 495, 210 505, 210 520
                       L 210 580
                       C 210 595, 215 605, 225 610
                       L 235 610
                       C 245 605, 250 595, 250 580
                       L 250 520
                       C 250 505, 245 495, 235 490
                       C 230 485, 225 485, 220 490 Z"
                fill={getIntensityColor(getSystemIntensity(['left-leg', 'left-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee']))}
                strokeWidth="3"
                filter={hoveredPart === 'left-leg' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Knee joint with patella */}
              <ellipse cx="230" cy="610" rx="15" ry="10" 
                fill="rgba(139, 115, 85, 0.6)" 
                stroke="rgba(120, 100, 75, 0.8)" 
                strokeWidth="2" 
              />
              <ellipse cx="230" cy="608" rx="8" ry="6" 
                fill="rgba(160, 135, 105, 0.8)" 
                stroke="rgba(139, 115, 85, 0.9)" 
                strokeWidth="1" 
              />
              
              {/* Shin/calf */}
              <path d="M 225 620 
                       C 220 625, 215 635, 215 650
                       L 215 680
                       C 215 695, 220 705, 230 710
                       L 240 710
                       C 250 705, 255 695, 255 680
                       L 255 650
                       C 255 635, 250 625, 240 620
                       C 235 615, 230 615, 225 620 Z"
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Ankle */}
              <ellipse cx="232" cy="710" rx="10" ry="6" 
                fill="rgba(139, 115, 85, 0.5)" 
                stroke="rgba(120, 100, 75, 0.7)" 
                strokeWidth="2" 
              />
              
              {/* Realistic foot */}
              <ellipse cx="232" cy="730" rx="15" ry="28" 
                fill={getIntensityColor(getSymptomIntensity('left-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Toes */}
              <g opacity="0.8">
                <ellipse cx="232" cy="755" rx="3" ry="6" fill="#d4b896" />
                <ellipse cx="228" cy="752" rx="2.5" ry="5" fill="#d4b896" />
                <ellipse cx="236" cy="752" rx="2.5" ry="5" fill="#d4b896" />
                <ellipse cx="224" cy="748" rx="2" ry="4" fill="#d4b896" />
                <ellipse cx="240" cy="748" rx="2" ry="4" fill="#d4b896" />
              </g>
            </g>

            {/* 8. RIGHT LEG - Mirror of left leg */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-leg')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Thigh */}
              <path d="M 280 490 
                       C 285 495, 290 505, 290 520
                       L 290 580
                       C 290 595, 285 605, 275 610
                       L 265 610
                       C 255 605, 250 595, 250 580
                       L 250 520
                       C 250 505, 255 495, 265 490
                       C 270 485, 275 485, 280 490 Z"
                fill={getIntensityColor(getSystemIntensity(['right-leg', 'right-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee']))}
                strokeWidth="3"
                filter={hoveredPart === 'right-leg' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Knee joint */}
              <ellipse cx="270" cy="610" rx="15" ry="10" 
                fill="rgba(139, 115, 85, 0.6)" 
                stroke="rgba(120, 100, 75, 0.8)" 
                strokeWidth="2" 
              />
              <ellipse cx="270" cy="608" rx="8" ry="6" 
                fill="rgba(160, 135, 105, 0.8)" 
                stroke="rgba(139, 115, 85, 0.9)" 
                strokeWidth="1" 
              />
              
              {/* Shin/calf */}
              <path d="M 275 620 
                       C 280 625, 285 635, 285 650
                       L 285 680
                       C 285 695, 280 705, 270 710
                       L 260 710
                       C 250 705, 245 695, 245 680
                       L 245 650
                       C 245 635, 250 625, 260 620
                       C 265 615, 270 615, 275 620 Z"
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Ankle */}
              <ellipse cx="268" cy="710" rx="10" ry="6" 
                fill="rgba(139, 115, 85, 0.5)" 
                stroke="rgba(120, 100, 75, 0.7)" 
                strokeWidth="2" 
              />
              
              {/* Foot */}
              <ellipse cx="268" cy="730" rx="15" ry="28" 
                fill={getIntensityColor(getSymptomIntensity('right-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Toes */}
              <g opacity="0.8">
                <ellipse cx="268" cy="755" rx="3" ry="6" fill="#d4b896" />
                <ellipse cx="272" cy="752" rx="2.5" ry="5" fill="#d4b896" />
                <ellipse cx="264" cy="752" rx="2.5" ry="5" fill="#d4b896" />
                <ellipse cx="276" cy="748" rx="2" ry="4" fill="#d4b896" />
                <ellipse cx="260" cy="748" rx="2" ry="4" fill="#d4b896" />
              </g>
            </g>

          </>
        ) : (
          // BACK VIEW - Enhanced with realistic anatomy
          <>
            {/* Realistic Back Body Outline */}
            <path d="M 250 50 
                     C 280 50, 300 70, 310 95
                     C 315 110, 315 125, 310 140
                     C 305 155, 295 165, 285 175
                     L 280 190
                     C 275 200, 270 210, 265 220
                     L 260 240
                     C 255 260, 250 280, 245 300
                     L 240 350
                     C 235 380, 230 410, 225 440
                     L 220 480
                     C 215 520, 210 560, 205 600
                     L 200 640
                     C 195 660, 190 680, 185 700
                     L 315 700
                     C 310 680, 305 660, 300 640
                     L 295 600
                     C 290 560, 285 520, 280 480
                     L 275 440
                     C 270 410, 265 380, 260 350
                     L 255 300
                     C 250 280, 245 260, 240 240
                     L 235 220
                     C 230 210, 225 200, 220 190
                     L 215 175
                     C 205 165, 195 155, 190 140
                     C 185 125, 185 110, 190 95
                     C 200 70, 220 50, 250 50 Z"
              fill="url(#skinToneGradient)" 
              stroke="#8b7355" 
              strokeWidth="2"
              filter="url(#anatomicalShadow)"
            />

            {/* BACK OF HEAD */}
            <ellipse cx="250" cy="85" rx="60" ry="75" 
              fill={getIntensityColor(getSymptomIntensity('head'))}
              stroke={getIntensityStroke(getSymptomIntensity('head'))}
              strokeWidth="3"
              filter={hoveredPart === 'head' ? "url(#hoverHighlight)" : "url(#organDepth)"}
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('head', 'Back of Head', e)}
              onMouseEnter={() => setHoveredPart('head')}
              onMouseLeave={() => setHoveredPart(null)}
            />

            {/* Hair back view */}
            <path d="M 195 60 Q 200 35, 230 25 Q 250 20, 270 25 Q 300 35, 305 60 
                     Q 300 45, 285 35 Q 270 30, 250 30 Q 230 30, 215 35 Q 200 45, 195 60" 
              fill="#8b5a3c" stroke="#6b4423" strokeWidth="1" />

            {/* BACK & SPINE - Enhanced anatomical detail */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={(e) => !readOnly && handleBodyPartClick('back', 'Back & Spine', e)}
               onMouseEnter={() => setHoveredPart('back')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 200 180 
                       C 190 185, 185 195, 185 210
                       L 185 480
                       C 185 495, 195 505, 210 510
                       L 290 510
                       C 305 505, 315 495, 315 480
                       L 315 210
                       C 315 195, 310 185, 300 180
                       C 285 175, 270 175, 250 175
                       C 230 175, 215 175, 200 180 Z"
                fill={getIntensityColor(getSymptomIntensity('back'))}
                stroke={getIntensityStroke(getSymptomIntensity('back'))}
                strokeWidth="3"
                filter={hoveredPart === 'back' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Detailed spine with realistic curvature */}
              <path d="M 250 190 
                       Q 248 220, 250 250
                       Q 252 280, 250 310
                       Q 248 340, 250 370
                       Q 252 400, 250 430
                       Q 248 460, 250 490"
                stroke="rgba(139, 115, 85, 0.9)" 
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              
              {/* Individual vertebrae with realistic spacing */}
              {[200, 215, 230, 245, 260, 275, 290, 305, 320, 335, 350, 365, 380, 395, 410, 425, 440, 455, 470, 485].map((y, i) => (
                <ellipse key={i} cx="250" cy={y} rx="5" ry="3" 
                  fill="rgba(139, 115, 85, 0.8)" 
                  stroke="rgba(120, 100, 75, 0.9)" 
                  strokeWidth="1"
                />
              ))}
              
              {/* Realistic shoulder blade anatomy */}
              <path d="M 210 220 
                       C 200 225, 195 235, 195 250
                       L 195 290
                       C 195 305, 200 315, 210 320
                       L 230 320
                       C 240 315, 245 305, 245 290
                       L 245 250
                       C 245 235, 240 225, 230 220
                       C 220 215, 220 215, 210 220 Z"
                fill="rgba(139, 115, 85, 0.4)" 
                stroke="rgba(120, 100, 75, 0.6)" 
                strokeWidth="2"
                transform="rotate(-10 222.5 270)"
              />
              
              <path d="M 270 220 
                       C 280 225, 285 235, 285 250
                       L 285 290
                       C 285 305, 280 315, 270 320
                       L 250 320
                       C 240 315, 235 305, 235 290
                       L 235 250
                       C 235 235, 240 225, 250 220
                       C 260 215, 260 215, 270 220 Z"
                fill="rgba(139, 115, 85, 0.4)" 
                stroke="rgba(120, 100, 75, 0.6)" 
                strokeWidth="2"
                transform="rotate(10 260 270)"
              />
              
              {/* Muscle definition lines */}
              <path d="M 220 240 Q 250 235, 280 240" stroke="rgba(139, 115, 85, 0.3)" strokeWidth="1" fill="none" />
              <path d="M 225 280 Q 250 275, 275 280" stroke="rgba(139, 115, 85, 0.3)" strokeWidth="1" fill="none" />
              <path d="M 230 320 Q 250 315, 270 320" stroke="rgba(139, 115, 85, 0.3)" strokeWidth="1" fill="none" />
            </g>

            {/* BACK ARMS - Enhanced */}
            <path d="M 185 190 
                     C 175 195, 170 205, 170 220
                     L 170 400
                     C 170 415, 175 425, 185 430
                     L 195 430
                     C 205 425, 210 415, 210 400
                     L 210 220
                     C 210 205, 205 195, 195 190
                     C 190 185, 190 185, 185 190 Z"
              fill={getIntensityColor(getSymptomIntensity('left-arm'))}
              stroke={getIntensityStroke(getSymptomIntensity('left-arm'))}
              strokeWidth="3"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('left-arm', 'Left Arm (Back)', e)}
              filter="url(#organDepth)"
            />
            
            <path d="M 315 190 
                     C 325 195, 330 205, 330 220
                     L 330 400
                     C 330 415, 325 425, 315 430
                     L 305 430
                     C 295 425, 290 415, 290 400
                     L 290 220
                     C 290 205, 295 195, 305 190
                     C 310 185, 310 185, 315 190 Z"
              fill={getIntensityColor(getSymptomIntensity('right-arm'))}
              stroke={getIntensityStroke(getSymptomIntensity('right-arm'))}
              strokeWidth="3"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('right-arm', 'Right Arm (Back)', e)}
              filter="url(#organDepth)"
            />

            {/* BACK LEGS - Enhanced */}
            <path d="M 220 510 
                     C 215 515, 210 525, 210 540
                     L 210 680
                     C 210 695, 215 705, 225 710
                     L 235 710
                     C 245 705, 250 695, 250 680
                     L 250 540
                     C 250 525, 245 515, 235 510
                     C 230 505, 225 505, 220 510 Z"
              fill={getIntensityColor(getSymptomIntensity('left-leg'))}
              stroke={getIntensityStroke(getSymptomIntensity('left-leg'))}
              strokeWidth="3"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('left-leg', 'Left Leg (Back)', e)}
              filter="url(#organDepth)"
            />
            
            <path d="M 280 510 
                     C 285 515, 290 525, 290 540
                     L 290 680
                     C 290 695, 285 705, 275 710
                     L 265 710
                     C 255 705, 250 695, 250 680
                     L 250 540
                     C 250 525, 255  515, 265 510
                     C 270 505, 275 505, 280 510 Z"
              fill={getIntensityColor(getSymptomIntensity('right-leg'))}
              stroke={getIntensityStroke(getSymptomIntensity('right-leg'))}
              strokeWidth="3"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('right-leg', 'Right Leg (Back)', e)}
              filter="url(#organDepth)"
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