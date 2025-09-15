import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Sparkles, RotateCcw, Eye, Activity, Brain, Heart, Wind, Utensils, Zap, User } from 'lucide-react';
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

const ZoomableBodyMap: React.FC<ZoomableBodyMapProps> = ({
  onBodyPartClick,
  symptoms,
  selectedBodyPart,
  className,
  readOnly = false
}) => {
  const [currentZoom, setCurrentZoom] = useState<ZoomLevel>('overview');
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
    if (intensity === 0) return 'from-slate-100 to-slate-200';
    if (intensity <= 3) return 'from-green-100 to-green-200';
    if (intensity <= 6) return 'from-yellow-100 to-yellow-200';
    if (intensity <= 8) return 'from-orange-100 to-orange-200';
    return 'from-red-100 to-red-200';
  };

  const getIntensityBorder = (intensity: number): string => {
    if (intensity === 0) return 'border-slate-300';
    if (intensity <= 3) return 'border-green-300';
    if (intensity <= 6) return 'border-yellow-300';
    if (intensity <= 8) return 'border-orange-300';
    return 'border-red-300';
  };

  const getIntensityGlow = (intensity: number): string => {
    if (intensity === 0) return '';
    if (intensity <= 3) return 'shadow-green-200/50';
    if (intensity <= 6) return 'shadow-yellow-200/50';
    if (intensity <= 8) return 'shadow-orange-200/50';
    return 'shadow-red-200/50';
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
      setIsTransitioning(false);
    }, 200);
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

  // System definitions with their body parts
  const bodySystems = [
    {
      id: 'head-system',
      name: 'Head & Nervous',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-50 to-indigo-50',
      parts: ['head', 'brain', 'left-eye', 'right-eye', 'left-ear', 'right-ear', 'nose', 'mouth', 'forehead', 'left-temple', 'right-temple'],
      description: 'Brain, head, eyes, ears, nose, mouth'
    },
    {
      id: 'respiratory-system',
      name: 'Respiratory',
      icon: Wind,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50',
      parts: ['lungs', 'left-lung', 'right-lung', 'chest', 'throat', 'upper-chest'],
      description: 'Lungs, chest, throat, breathing'
    },
    {
      id: 'cardiovascular-system',
      name: 'Cardiovascular',
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      bgColor: 'from-red-50 to-pink-50',
      parts: ['heart', 'circulation'],
      description: 'Heart, blood circulation'
    },
    {
      id: 'digestive-system',
      name: 'Digestive',
      icon: Utensils,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      parts: ['stomach', 'abdomen', 'intestines', 'liver', 'upper-abdomen', 'lower-abdomen'],
      description: 'Stomach, abdomen, intestines'
    },
    {
      id: 'musculoskeletal-system',
      name: 'Muscles & Joints',
      icon: Zap,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'from-orange-50 to-amber-50',
      parts: ['left-arm', 'right-arm', 'left-leg', 'right-leg', 'left-shoulder', 'right-shoulder', 'left-hand', 'right-hand', 'left-foot', 'right-foot', 'back', 'neck', 'left-knee', 'right-knee', 'left-ankle', 'right-ankle'],
      description: 'Arms, legs, joints, muscles, spine'
    },
    {
      id: 'nervous-system',
      name: 'Nervous System',
      icon: Zap,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'from-violet-50 to-purple-50',
      parts: ['nervous-system', 'spine', 'nerves'],
      description: 'Nerves, spine, nervous system'
    }
  ];

  // LEVEL 1: Systems Overview - All systems visible and separated
  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {bodySystems.map((system, index) => {
        const systemIntensity = getSystemIntensity(system.parts);
        const Icon = system.icon;
        
        return (
          <Card
            key={system.id}
            className={cn(
              "group cursor-pointer transition-all duration-500 hover:scale-105 border-2 overflow-hidden",
              getIntensityBorder(systemIntensity),
              getIntensityGlow(systemIntensity),
              readOnly ? "cursor-default hover:scale-100" : ""
            )}
            onClick={() => !readOnly && handleZoomIn(system.id as ZoomLevel)}
            onMouseEnter={() => setHoveredPart(system.id)}
            onMouseLeave={() => setHoveredPart(null)}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <CardContent className={cn("p-6 text-center relative bg-gradient-to-br", system.bgColor)}>
              {/* Intensity indicator */}
              {systemIntensity > 0 && (
                <div className={cn(
                  "absolute top-2 right-2 w-3 h-3 rounded-full animate-pulse",
                  systemIntensity <= 3 ? "bg-green-400" :
                  systemIntensity <= 6 ? "bg-yellow-400" :
                  systemIntensity <= 8 ? "bg-orange-400" : "bg-red-400"
                )} />
              )}
              
              {/* System icon with gradient */}
              <div className={cn(
                "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br transform group-hover:scale-110 transition-transform duration-300",
                system.color
              )}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                {system.name}
              </h3>
              
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {system.description}
              </p>
              
              {/* System stats */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  {system.parts.filter(part => getSymptomIntensity(part) > 0).length} active
                </span>
                {systemIntensity > 0 && (
                  <span className={cn(
                    "font-semibold",
                    systemIntensity <= 3 ? "text-green-600" :
                    systemIntensity <= 6 ? "text-yellow-600" :
                    systemIntensity <= 8 ? "text-orange-600" : "text-red-600"
                  )}>
                    Max: {systemIntensity}/10
                  </span>
                )}
              </div>
              
              {/* Hover effect */}
              {hoveredPart === system.id && !readOnly && (
                <div className="absolute inset-0 bg-white/10 rounded-lg pointer-events-none" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // LEVEL 2: Head System Detail
  const renderHeadSystem = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
          <Brain className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Head & Nervous System</h2>
        <p className="text-slate-600">Select the specific area where you're experiencing symptoms</p>
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
                getIntensityBorder(intensity),
                getIntensityGlow(intensity)
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn("p-4 text-center bg-gradient-to-br", getIntensityColor(intensity))}>
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
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600">
          <Wind className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Respiratory System</h2>
        <p className="text-slate-600">Select the specific area affecting your breathing</p>
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
                getIntensityBorder(intensity),
                getIntensityGlow(intensity)
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn("p-4 text-center bg-gradient-to-br", getIntensityColor(intensity))}>
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
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cardiovascular System</h2>
        <p className="text-slate-600">Select the area related to your heart or circulation</p>
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
                getIntensityBorder(intensity),
                getIntensityGlow(intensity)
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn("p-4 text-center bg-gradient-to-br", getIntensityColor(intensity))}>
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
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
          <Utensils className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Digestive System</h2>
        <p className="text-slate-600">Select the area of your digestive system</p>
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
                getIntensityBorder(intensity),
                getIntensityGlow(intensity)
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn("p-4 text-center bg-gradient-to-br", getIntensityColor(intensity))}>
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
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600">
          <User className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Muscles & Joints</h2>
        <p className="text-slate-600">Select the muscle, joint, or bone area</p>
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
                getIntensityBorder(intensity),
                getIntensityGlow(intensity)
              )}
              onClick={(e) => handleBodyPartClick(part.id, part.name, e)}
            >
              <CardContent className={cn("p-4 text-center bg-gradient-to-br", getIntensityColor(intensity))}>
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
      return '📊 Visual overview of your recent symptoms organized by body system';
    }
    
    switch (currentZoom) {
      case 'overview':
        return '🎯 Select a body system to explore specific areas for symptom logging';
      case 'head-system':
      case 'respiratory-system':
      case 'cardiovascular-system':
      case 'digestive-system':
      case 'musculoskeletal-system':
        return '📍 Tap the specific body part where you\'re experiencing symptoms';
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

      <CardContent className={cn("", readOnly ? "p-4" : "p-2")}>
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
              <span className="text-xs font-medium text-slate-700">Separated System Mapping</span>
              <Sparkles className="w-3 h-3 text-blue-500" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ZoomableBodyMap;