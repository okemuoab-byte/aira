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

  // Enhanced body diagram in anatomical position
  const renderOverview = () => (
    <div className="flex justify-center">
      <svg width="600" height="700" viewBox="0 0 600 700" className="w-full h-auto max-w-lg drop-shadow-2xl">
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
            {/* Anatomical Position Body Outline - Front */}
            <path d="M 300 50 
                     C 330 50, 350 70, 360 95
                     C 365 110, 365 125, 360 140
                     C 355 155, 345 165, 335 175
                     L 330 190
                     C 325 200, 320 210, 315 220
                     L 310 240
                     C 305 260, 300 280, 295 300
                     L 290 350
                     C 285 380, 280 410, 275 440
                     L 270 480
                     C 265 520, 260 560, 255 600
                     L 250 640
                     C 245 660, 240 680, 235 700
                     L 365 700
                     C 360 680, 355 660, 350 640
                     L 345 600
                     C 340 560, 335 520, 330 480
                     L 325 440
                     C 320 410, 315 380, 310 350
                     L 305 300
                     C 300 280, 295 260, 290 240
                     L 285 220
                     C 280 210, 275 200, 270 190
                     L 265 175
                     C 255 165, 245 155, 240 140
                     C 235 125, 235 110, 240 95
                     C 250 70, 270 50, 300 50 Z"
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
              <ellipse cx="300" cy="85" rx="60" ry="75" 
                fill={getIntensityColor(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                stroke={getIntensityStroke(getSystemIntensity(['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear']))}
                strokeWidth="3"
                filter={hoveredPart === 'head-system' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Detailed facial features */}
              {/* Eyes with realistic shape */}
              <ellipse cx="285" cy="75" rx="12" ry="8" fill="#ffffff" stroke="#8b7355" strokeWidth="1" />
              <ellipse cx="315" cy="75" rx="12" ry="8" fill="#ffffff" stroke="#8b7355" strokeWidth="1" />
              <circle cx="285" cy="75" r="6" fill="#4a5568" />
              <circle cx="315" cy="75" r="6" fill="#4a5568" />
              <circle cx="287" cy="73" r="2" fill="#ffffff" opacity="0.9" />
              <circle cx="317" cy="73" r="2" fill="#ffffff" opacity="0.9" />
              
              {/* Eyebrows */}
              <path d="M 275 65 Q 285 62, 295 65" stroke="#8b5a3c" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 305 65 Q 315 62, 325 65" stroke="#8b5a3c" strokeWidth="3" fill="none" strokeLinecap="round" />
              
              {/* Nose with nostrils */}
              <ellipse cx="300" cy="85" rx="6" ry="12" fill="#e8d5c4" stroke="#d4b896" strokeWidth="1" />
              <ellipse cx="297" cy="90" rx="2" ry="3" fill="#d4b896" />
              <ellipse cx="303" cy="90" rx="2" ry="3" fill="#d4b896" />
              
              {/* Mouth with lips */}
              <ellipse cx="300" cy="100" rx="12" ry="4" fill="#cd919e" stroke="#b8808d" strokeWidth="1" />
              <path d="M 290 100 Q 300 105, 310 100" stroke="#b8808d" strokeWidth="1" fill="none" />
              
              {/* Ears */}
              <ellipse cx="245" cy="80" rx="8" ry="15" fill="url(#skinToneGradient)" stroke="#d4b896" strokeWidth="2" />
              <ellipse cx="355" cy="80" rx="8" ry="15" fill="url(#skinToneGradient)" stroke="#d4b896" strokeWidth="2" />
              
              {/* Hair with realistic texture */}
              <path d="M 245 60 Q 250 35, 280 25 Q 300 20, 320 25 Q 350 35, 355 60 
                       Q 350 45, 335 35 Q 320 30, 300 30 Q 280 30, 265 35 Q 250 45, 245 60" 
                fill="#8b5a3c" stroke="#6b4423" strokeWidth="1" />
              
              {/* Neck connection */}
              <rect x="285" y="155" width="30" height="25" rx="15" 
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
              <path d="M 250 180 
                       C 240 185, 235 195, 235 210
                       L 235 320
                       C 235 335, 245 345, 260 350
                       L 340 350
                       C 355 345, 365 335, 365 320
                       L 365 210
                       C 365 195, 360 185, 350 180
                       C 335 175, 320 175, 300 175
                       C 280 175, 265 175, 250 180 Z"
                fill={getIntensityColor(getSystemIntensity(['lungs', 'chest', 'throat']))}
                stroke={getIntensityStroke(getSystemIntensity(['lungs', 'chest', 'throat']))}
                strokeWidth="3"
                filter={hoveredPart === 'respiratory-system' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Realistic lungs with lobes */}
              <g opacity="0.8">
                {/* Left lung */}
                <path d="M 260 200 
                         C 245 205, 240 220, 240 240
                         L 240 310
                         C 240 325, 250 335, 265 340
                         L 285 340
                         C 295 335, 300 325, 300 310
                         L 300 240
                         C 300 220, 295 205, 285 200
                         C 275 195, 265 195, 260 200 Z"
                  fill="url(#lungGradient)"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  filter="url(#organDepth)"
                />
                
                {/* Right lung */}
                <path d="M 315 200 
                         C 305 195, 295 195, 290 200
                         C 285 205, 280 220, 280 240
                         L 280 310
                         C 280 325, 290 335, 305 340
                         L 335 340
                         C 350 335, 360 325, 360 310
                         L 360 240
                         C 360 220, 355 205, 340 200
                         C 330 195, 320 195, 315 200 Z"
                  fill="url(#lungGradient)"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  filter="url(#organDepth)"
                />
                
                {/* Lung texture/alveoli representation */}
                <circle cx="270" cy="250" r="3" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="280" cy="270" r="2" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="265" cy="290" r="2.5" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="320" cy="250" r="3" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="330" cy="270" r="2" fill="rgba(14, 165, 233, 0.3)" />
                <circle cx="335" cy="290" r="2.5" fill="rgba(14, 165, 233, 0.3)" />
              </g>
              
              {/* Trachea and bronchi */}
              <rect x="292" y="160" width="16" height="50" rx="8" 
                fill="rgba(168, 85, 247, 0.7)"
                stroke="rgba(147, 51, 234, 0.9)"
                strokeWidth="2"
              />
              
              {/* Bronchi branches */}
              <path d="M 300 210 L 280 230" stroke="rgba(147, 51, 234, 0.8)" strokeWidth="4" strokeLinecap="round" />
              <path d="M 300 210 L 320 230" stroke="rgba(147, 51, 234, 0.8)" strokeWidth="4" strokeLinecap="round" />
              
              {/* Ribcage structure */}
              <g opacity="0.4">
                <path d="M 250 190 Q 300 180, 350 190" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 255 210 Q 300 200, 345 210" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 260 230 Q 300 220, 340 230" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 265 250 Q 300 240, 335 250" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 270 270 Q 300 260, 330 270" stroke="#8b7355" strokeWidth="2" fill="none" />
                <path d="M 275 290 Q 300 280, 325 290" stroke="#8b7355" strokeWidth="2" fill="none" />
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
              <path d="M 300 230 
                       C 285 215, 260 215, 260 240 
                       C 260 265, 300 305, 300 305 
                       C 300 305, 340 265, 340 240 
                       C 340 215, 315 215, 300 230 Z"
                fill={getIntensityColor(getSystemIntensity(['heart']))}
                stroke={getIntensityStroke(getSystemIntensity(['heart']))}
                strokeWidth="3"
                filter={hoveredPart === 'cardiovascular-system' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Heart chambers and structure */}
              <g opacity="0.7">
                {/* Left atrium */}
                <path d="M 285 235 C 275 230, 265 235, 265 250 C 265 265, 285 280, 285 280 L 285 235"
                  fill="rgba(239, 68, 68, 0.4)" stroke="rgba(220, 38, 38, 0.6)" strokeWidth="1.5" />
                
                {/* Right atrium */}
                <path d="M 315 235 C 325 230, 335 235, 335 250 C 335 265, 315 280, 315 280 L 315 235"
                  fill="rgba(239, 68, 68, 0.5)" stroke="rgba(220, 38, 38, 0.7)" strokeWidth="1.5" />
                
                {/* Ventricles */}
                <ellipse cx="290" cy="275" rx="15" ry="20" fill="rgba(220, 38, 38, 0.3)" stroke="rgba(185, 28, 28, 0.5)" strokeWidth="1" />
                <ellipse cx="310" cy="275" rx="15" ry="20" fill="rgba(220, 38, 38, 0.4)" stroke="rgba(185, 28, 28, 0.6)" strokeWidth="1" />
                
                {/* Aorta */}
                <path d="M 300 230 Q 295 220, 290 210" stroke="rgba(220, 38, 38, 0.8)" strokeWidth="6" strokeLinecap="round" />
                
                {/* Pulmonary arteries */}
                <path d="M 305 235 Q 315 225, 325 220" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="4" strokeLinecap="round" />
                <path d="M 295 235 Q 285 225, 275 220" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="4" strokeLinecap="round" />
              </g>
              
              {/* Heartbeat animation effect */}
              {hoveredPart === 'cardiovascular-system' && (
                <circle cx="300" cy="260" r="40" 
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
              <path d="M 260 350 
                       C 250 355, 245 365, 245 380
                       L 245 460
                       C 245 475, 255 485, 270 490
                       L 330 490
                       C 345 485, 355 475, 355 460
                       L 355 380
                       C 355 365, 350 355, 340 350
                       C 325 345, 310 345, 300 345
                       C 290 345, 275 345, 260 350 Z"
                fill={getIntensityColor(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                stroke={getIntensityStroke(getSystemIntensity(['stomach', 'abdomen', 'intestines']))}
                strokeWidth="3"
                filter={hoveredPart === 'digestive-system' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Realistic stomach */}
              <path d="M 270 365 
                       C 260 370, 255 380, 260 395
                       C 265 410, 280 415, 300 415
                       C 320 415, 335 410, 340 395
                       C 345 380, 340 370, 330 365
                       C 320 360, 300 360, 285 360
                       C 275 360, 270 365, 270 365 Z"
                fill="url(#digestiveGradient)"
                stroke="#16a34a"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Liver (partial view) */}
              <ellipse cx="330" cy="370" rx="20" ry="15" 
                fill="rgba(133, 77, 14, 0.6)"
                stroke="rgba(120, 53, 15, 0.8)"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Small intestine coils */}
              <g opacity="0.8">
                <path d="M 280 430 Q 300 420, 320 430 Q 330 450, 320 470 Q 300 480, 280 470 Q 270 450, 280 430"
                  fill="rgba(168, 85, 247, 0.5)"
                  stroke="rgba(147, 51, 234, 0.7)"
                  strokeWidth="2"
                />
                <path d="M 290 445 Q 300 440, 310 445 Q 315 455, 310 465 Q 300 470, 290 465 Q 285 455, 290 445"
                  fill="rgba(168, 85, 247, 0.4)"
                  stroke="rgba(147, 51, 234, 0.6)"
                  strokeWidth="1.5"
                />
                
                {/* Intestinal texture */}
                <circle cx="295" cy="450" r="2" fill="rgba(147, 51, 234, 0.3)" />
                <circle cx="305" cy="460" r="1.5" fill="rgba(147, 51, 234, 0.3)" />
              </g>
            </g>

            {/* 5. LEFT ARM - Anatomical Position (Extended) */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('left-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Upper arm extended at 45 degrees */}
              <path d="M 235 190 
                       C 220 200, 210 215, 200 235
                       L 180 290
                       C 175 305, 180 320, 190 330
                       L 200 335
                       C 210 340, 220 335, 225 320
                       L 245 265
                       C 250 250, 245 235, 235 225
                       C 235 210, 235 200, 235 190 Z"
                fill={getIntensityColor(getSystemIntensity(['left-arm', 'left-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-arm', 'left-shoulder']))}
                strokeWidth="3"
                filter={hoveredPart === 'left-arm' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Shoulder joint */}
              <circle cx="240" cy="200" r="18" 
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Elbow joint */}
              <ellipse cx="190" cy="330" rx="12" ry="8" 
                fill="rgba(139, 115, 85, 0.6)" 
                stroke="rgba(120, 100, 75, 0.8)" 
                strokeWidth="2" 
              />
              
              {/* Forearm extended */}
              <path d="M 185 330 
                       C 175 340, 165 355, 155 375
                       L 135 430
                       C 130 445, 135 460, 145 470
                       L 155 475
                       C 165 480, 175 475, 180 460
                       L 200 405
                       C 205 390, 200 375, 190 365
                       C 190 350, 190 340, 185 330 Z"
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Realistic hand */}
              <ellipse cx="142" cy="490" rx="18" ry="25" 
                fill={getIntensityColor(getSymptomIntensity('left-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-hand'))}
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Detailed fingers with joints */}
              <g opacity="0.9">
                <rect x="135" y="510" width="3" height="12" rx="1.5" fill="#d4b896" />
                <rect x="139" y="515" width="3" height="15" rx="1.5" fill="#d4b896" />
                <rect x="143" y="513" width="3" height="13" rx="1.5" fill="#d4b896" />
                <rect x="147" y="510" width="3" height="10" rx="1.5" fill="#d4b896" />
                <rect x="130" y="505" width="3" height="8" rx="1.5" fill="#d4b896" />
                
                {/* Finger joints */}
                <circle cx="136.5" cy="516" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="140.5" cy="521" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="144.5" cy="519" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="148.5" cy="516" r="1" fill="rgba(139, 115, 85, 0.5)" />
              </g>
            </g>

            {/* 6. RIGHT ARM - Anatomical Position (Extended) */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={() => !readOnly && handleZoomIn('musculoskeletal-system')}
               onMouseEnter={() => setHoveredPart('right-arm')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              {/* Upper arm extended at 45 degrees */}
              <path d="M 365 190 
                       C 380 200, 390 215, 400 235
                       L 420 290
                       C 425 305, 420 320, 410 330
                       L 400 335
                       C 390 340, 380 335, 375 320
                       L 355 265
                       C 350 250, 355 235, 365 225
                       C 365 210, 365 200, 365 190 Z"
                fill={getIntensityColor(getSystemIntensity(['right-arm', 'right-shoulder']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-arm', 'right-shoulder']))}
                strokeWidth="3"
                filter={hoveredPart === 'right-arm' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Shoulder joint */}
              <circle cx="360" cy="200" r="18" 
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Elbow joint */}
              <ellipse cx="410" cy="330" rx="12" ry="8" 
                fill="rgba(139, 115, 85, 0.6)" 
                stroke="rgba(120, 100, 75, 0.8)" 
                strokeWidth="2" 
              />
              
              {/* Forearm extended */}
              <path d="M 415 330 
                       C 425 340, 435 355, 445 375
                       L 465 430
                       C 470 445, 465 460, 455 470
                       L 445 475
                       C 435 480, 425 475, 420 460
                       L 400 405
                       C 395 390, 400 375, 410 365
                       C 410 350, 410 340, 415 330 Z"
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Hand */}
              <ellipse cx="458" cy="490" rx="18" ry="25" 
                fill={getIntensityColor(getSymptomIntensity('right-hand'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-hand'))}
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Fingers */}
              <g opacity="0.9">
                <rect x="462" y="510" width="3" height="12" rx="1.5" fill="#d4b896" />
                <rect x="458" y="515" width="3" height="15" rx="1.5" fill="#d4b896" />
                <rect x="454" y="513" width="3" height="13" rx="1.5" fill="#d4b896" />
                <rect x="450" y="510" width="3" height="10" rx="1.5" fill="#d4b896" />
                <rect x="467" y="505" width="3" height="8" rx="1.5" fill="#d4b896" />
                
                {/* Finger joints */}
                <circle cx="463.5" cy="516" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="459.5" cy="521" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="455.5" cy="519" r="1" fill="rgba(139, 115, 85, 0.5)" />
                <circle cx="451.5" cy="516" r="1" fill="rgba(139, 115, 85, 0.5)" />
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
              <path d="M 270 490 
                       C 265 495, 260 505, 260 520
                       L 260 580
                       C 260 595, 265 605, 275 610
                       L 285 610
                       C 295 605, 300 595, 300 580
                       L 300 520
                       C 300 505, 295 495, 285 490
                       C 280 485, 275 485, 270 490 Z"
                fill={getIntensityColor(getSystemIntensity(['left-leg', 'left-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['left-leg', 'left-knee']))}
                strokeWidth="3"
                filter={hoveredPart === 'left-leg' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Knee joint with patella */}
              <ellipse cx="280" cy="610" rx="15" ry="10" 
                fill="rgba(139, 115, 85, 0.6)" 
                stroke="rgba(120, 100, 75, 0.8)" 
                strokeWidth="2" 
              />
              <ellipse cx="280" cy="608" rx="8" ry="6" 
                fill="rgba(160, 135, 105, 0.8)" 
                stroke="rgba(139, 115, 85, 0.9)" 
                strokeWidth="1" 
              />
              
              {/* Shin/calf */}
              <path d="M 275 620 
                       C 270 625, 265 635, 265 650
                       L 265 680
                       C 265 695, 270 705, 280 710
                       L 290 710
                       C 300 705, 305 695, 305 680
                       L 305 650
                       C 305 635, 300 625, 290 620
                       C 285 615, 280 615, 275 620 Z"
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Ankle */}
              <ellipse cx="282" cy="710" rx="10" ry="6" 
                fill="rgba(139, 115, 85, 0.5)" 
                stroke="rgba(120, 100, 75, 0.7)" 
                strokeWidth="2" 
              />
              
              {/* Realistic foot */}
              <ellipse cx="282" cy="730" rx="15" ry="28" 
                fill={getIntensityColor(getSymptomIntensity('left-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('left-foot'))}
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Toes */}
              <g opacity="0.8">
                <ellipse cx="282" cy="755" rx="3" ry="6" fill="#d4b896" />
                <ellipse cx="278" cy="752" rx="2.5" ry="5" fill="#d4b896" />
                <ellipse cx="286" cy="752" rx="2.5" ry="5" fill="#d4b896" />
                <ellipse cx="274" cy="748" rx="2" ry="4" fill="#d4b896" />
                <ellipse cx="290" cy="748" rx="2" ry="4" fill="#d4b896" />
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
              <path d="M 330 490 
                       C 335 495, 340 505, 340 520
                       L 340 580
                       C 340 595, 335 605, 325 610
                       L 315 610
                       C 305 605, 300 595, 300 580
                       L 300 520
                       C 300 505, 305 495, 315 490
                       C 320 485, 325 485, 330 490 Z"
                fill={getIntensityColor(getSystemIntensity(['right-leg', 'right-knee']))}
                stroke={getIntensityStroke(getSystemIntensity(['right-leg', 'right-knee']))}
                strokeWidth="3"
                filter={hoveredPart === 'right-leg' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Knee joint */}
              <ellipse cx="320" cy="610" rx="15" ry="10" 
                fill="rgba(139, 115, 85, 0.6)" 
                stroke="rgba(120, 100, 75, 0.8)" 
                strokeWidth="2" 
              />
              <ellipse cx="320" cy="608" rx="8" ry="6" 
                fill="rgba(160, 135, 105, 0.8)" 
                stroke="rgba(139, 115, 85, 0.9)" 
                strokeWidth="1" 
              />
              
              {/* Shin/calf */}
              <path d="M 325 620 
                       C 330 625, 335 635, 335 650
                       L 335 680
                       C 335 695, 330 705, 320 710
                       L 310 710
                       C 300 705, 295 695, 295 680
                       L 295 650
                       C 295 635, 300 625, 310 620
                       C 315 615, 320 615, 325 620 Z"
                fill="url(#skinToneGradient)"
                stroke="#d4b896"
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Ankle */}
              <ellipse cx="318" cy="710" rx="10" ry="6" 
                fill="rgba(139, 115, 85, 0.5)" 
                stroke="rgba(120, 100, 75, 0.7)" 
                strokeWidth="2" 
              />
              
              {/* Foot */}
              <ellipse cx="318" cy="730" rx="15" ry="28" 
                fill={getIntensityColor(getSymptomIntensity('right-foot'))}
                stroke={getIntensityStroke(getSymptomIntensity('right-foot'))}
                strokeWidth="2"
                filter="url(#organDepth)"
              />
              
              {/* Toes */}
              <g opacity="0.8">
                <ellipse cx="318" cy="755" rx="3" ry="6" fill="#d4b896" />
                <ellipse cx="322" cy="752" rx="2.5" ry="5" fill="#d4b896" />
                <ellipse cx="314" cy="752" rx="2.5" ry="5" fill="#d4b896" />
                <ellipse cx="326" cy="748" rx="2" ry="4" fill="#d4b896" />
                <ellipse cx="310" cy="748" rx="2" ry="4" fill="#d4b896" />
              </g>
            </g>

          </>
        ) : (
          // BACK VIEW - Enhanced with anatomical position
          <>
            {/* Anatomical Position Back Body Outline */}
            <path d="M 300 50 
                     C 330 50, 350 70, 360 95
                     C 365 110, 365 125, 360 140
                     C 355 155, 345 165, 335 175
                     L 330 190
                     C 325 200, 320 210, 315 220
                     L 310 240
                     C 305 260, 300 280, 295 300
                     L 290 350
                     C 285 380, 280 410, 275 440
                     L 270 480
                     C 265 520, 260 560, 255 600
                     L 250 640
                     C 245 660, 240 680, 235 700
                     L 365 700
                     C 360 680, 355 660, 350 640
                     L 345 600
                     C 340 560, 335 520, 330 480
                     L 325 440
                     C 320 410, 315 380, 310 350
                     L 305 300
                     C 300 280, 295 260, 290 240
                     L 285 220
                     C 280 210, 275 200, 270 190
                     L 265 175
                     C 255 165, 245 155, 240 140
                     C 235 125, 235 110, 240 95
                     C 250 70, 270 50, 300 50 Z"
              fill="url(#skinToneGradient)" 
              stroke="#8b7355" 
              strokeWidth="2"
              filter="url(#anatomicalShadow)"
            />

            {/* BACK OF HEAD */}
            <ellipse cx="300" cy="85" rx="60" ry="75" 
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
            <path d="M 245 60 Q 250 35, 280 25 Q 300 20, 320 25 Q 350 35, 355 60 
                     Q 350 45, 335 35 Q 320 30, 300 30 Q 280 30, 265 35 Q 250 45, 245 60" 
              fill="#8b5a3c" stroke="#6b4423" strokeWidth="1" />

            {/* BACK & SPINE - Enhanced anatomical detail */}
            <g className={cn(
                "transition-all duration-300 transform-gpu", 
                !readOnly && "cursor-pointer hover:scale-105"
              )} 
               onClick={(e) => !readOnly && handleBodyPartClick('back', 'Back & Spine', e)}
               onMouseEnter={() => setHoveredPart('back')}
               onMouseLeave={() => setHoveredPart(null)}>
              
              <path d="M 250 180 
                       C 240 185, 235 195, 235 210
                       L 235 480
                       C 235 495, 245 505, 260 510
                       L 340 510
                       C 355 505, 365 495, 365 480
                       L 365 210
                       C 365 195, 360 185, 350 180
                       C 335 175, 320 175, 300 175
                       C 280 175, 265 175, 250 180 Z"
                fill={getIntensityColor(getSymptomIntensity('back'))}
                stroke={getIntensityStroke(getSymptomIntensity('back'))}
                strokeWidth="3"
                filter={hoveredPart === 'back' ? "url(#hoverHighlight)" : "url(#organDepth)"}
                className="transition-all duration-300"
              />
              
              {/* Detailed spine with realistic curvature */}
              <path d="M 300 190 
                       Q 298 220, 300 250
                       Q 302 280, 300 310
                       Q 298 340, 300 370
                       Q 302 400, 300 430
                       Q 298 460, 300 490"
                stroke="rgba(139, 115, 85, 0.9)" 
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              
              {/* Individual vertebrae with realistic spacing */}
              {[200, 215, 230, 245, 260, 275, 290, 305, 320, 335, 350, 365, 380, 395, 410, 425, 440, 455, 470, 485].map((y, i) => (
                <ellipse key={i} cx="300" cy={y} rx="5" ry="3" 
                  fill="rgba(139, 115, 85, 0.8)" 
                  stroke="rgba(120, 100, 75, 0.9)" 
                  strokeWidth="1"
                />
              ))}
              
              {/* Realistic shoulder blade anatomy */}
              <path d="M 260 220 
                       C 250 225, 245 235, 245 250
                       L 245 290
                       C 245 305, 250 315, 260 320
                       L 280 320
                       C 290 315, 295 305, 295 290
                       L 295 250
                       C 295 235, 290 225, 280 220
                       C 270 215, 270 215, 260 220 Z"
                fill="rgba(139, 115, 85, 0.4)" 
                stroke="rgba(120, 100, 75, 0.6)" 
                strokeWidth="2"
                transform="rotate(-10 272.5 270)"
              />
              
              <path d="M 320 220 
                       C 330 225, 335 235, 335 250
                       L 335 290
                       C 335 305, 330 315, 320 320
                       L 300 320
                       C 290 315, 285 305, 285 290
                       L 285 250
                       C 285 235, 290 225, 300 220
                       C 310 215, 310 215, 320 220 Z"
                fill="rgba(139, 115, 85, 0.4)" 
                stroke="rgba(120, 100, 75, 0.6)" 
                strokeWidth="2"
                transform="rotate(10 310 270)"
              />
              
              {/* Muscle definition lines */}
              <path d="M 270 240 Q 300 235, 330 240" stroke="rgba(139, 115, 85, 0.3)" strokeWidth="1" fill="none" />
              <path d="M 275 280 Q 300 275, 325 280" stroke="rgba(139, 115, 85, 0.3)" strokeWidth="1" fill="none" />
              <path d="M 280 320 Q 300 315, 320 320" stroke="rgba(139, 115, 85, 0.3)" strokeWidth="1" fill="none" />
            </g>

            {/* BACK ARMS - Anatomical Position */}
            <path d="M 235 190 
                     C 220 200, 210 215, 200 235
                     L 180 290
                     C 175 305, 180 320, 190 330
                     L 200 335
                     C 210 340, 220 335, 225 320
                     L 245 265
                     C 250 250, 245 235, 235 225
                     C 235 210, 235 200, 235 190 Z"
              fill={getIntensityColor(getSymptomIntensity('left-arm'))}
              stroke={getIntensityStroke(getSymptomIntensity('left-arm'))}
              strokeWidth="3"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('left-arm', 'Left Arm (Back)', e)}
              filter="url(#organDepth)"
            />
            
            <path d="M 365 190 
                     C 380 200, 390 215, 400 235
                     L 420 290
                     C 425 305, 420 320, 410 330
                     L 400 335
                     C 390 340, 380 335, 375 320
                     L 355 265
                     C 350 250, 355 235, 365 225
                     C 365 210, 365 200, 365 190 Z"
              fill={getIntensityColor(getSymptomIntensity('right-arm'))}
              stroke={getIntensityStroke(getSymptomIntensity('right-arm'))}
              strokeWidth="3"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('right-arm', 'Right Arm (Back)', e)}
              filter="url(#organDepth)"
            />

            {/* BACK LEGS - Enhanced */}
            <path d="M 270 510 
                     C 265 515, 260 525, 260 540
                     L 260 680
                     C 260 695, 265 705, 275 710
                     L 285 710
                     C 295 705, 300 695, 300 680
                     L 300 540
                     C 300 525, 295 515, 285 510
                     C 280 505, 275 505, 270 510 Z"
              fill={getIntensityColor(getSymptomIntensity('left-leg'))}
              stroke={getIntensityStroke(getSymptomIntensity('left-leg'))}
              strokeWidth="3"
              className={cn("transition-all duration-300", !readOnly && "cursor-pointer")}
              onClick={(e) => !readOnly && handleBodyPartClick('left-leg', 'Left Leg (Back)', e)}
              filter="url(#organDepth)"
            />
            
            <path d="M 330 510 
                     C 335 515, 340 525, 340 540
                     L 340 680
                     C 340 695, 335 705, 325 710
                     L 315 710
                     C 305 705, 300 695, 300 680
                     
                     L 300 540
                     C 300 525, 305 515, 315 510
                     C 320 505, 325 505, 330 510 Z"
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