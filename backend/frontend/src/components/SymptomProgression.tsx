import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, Camera, Ruler, Calendar } from 'lucide-react';
import { Symptom, SymptomProgression } from '@/types/health';
import { format, subDays, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface SymptomProgressionProps {
  symptoms: Symptom[];
  className?: string;
}

const SymptomProgression: React.FC<SymptomProgressionProps> = ({
  symptoms,
  className
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('all');

  const getTimeframeData = () => {
    const now = new Date();
    const startDate = selectedTimeframe === 'week' 
      ? subDays(now, 7)
      : selectedTimeframe === 'month'
      ? subDays(now, 30)
      : subDays(now, 90);

    return symptoms.filter(symptom => 
      isWithinInterval(symptom.timestamp, { start: startDate, end: now }) &&
      (selectedBodyPart === 'all' || symptom.bodyPartId === selectedBodyPart)
    );
  };

  const calculateProgression = (symptomType: string, bodyPartId: string): SymptomProgression => {
    const relevantSymptoms = symptoms
      .filter(s => s.type === symptomType && s.bodyPartId === bodyPartId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    if (relevantSymptoms.length < 2) {
      return {
        symptomType,
        bodyPartId,
        entries: relevantSymptoms,
        trend: 'stable',
        averageIntensity: relevantSymptoms[0]?.intensity || 0,
        frequencyPerWeek: relevantSymptoms.length
      };
    }

    const recent = relevantSymptoms.slice(-3);
    const earlier = relevantSymptoms.slice(0, Math.max(1, relevantSymptoms.length - 3));
    
    const recentAvg = recent.reduce((sum, s) => sum + s.intensity, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, s) => sum + s.intensity, 0) / earlier.length;
    
    let trend: 'improving' | 'worsening' | 'stable' | 'fluctuating' = 'stable';
    const difference = recentAvg - earlierAvg;
    
    if (Math.abs(difference) < 0.5) {
      trend = 'stable';
    } else if (difference > 0.5) {
      trend = 'worsening';
    } else if (difference < -0.5) {
      trend = 'improving';
    }

    // Check for fluctuation
    const intensityVariance = relevantSymptoms.reduce((sum, s) => {
      const diff = s.intensity - recentAvg;
      return sum + (diff * diff);
    }, 0) / relevantSymptoms.length;

    if (intensityVariance > 4) {
      trend = 'fluctuating';
    }

    return {
      symptomType,
      bodyPartId,
      entries: relevantSymptoms,
      trend,
      averageIntensity: recentAvg,
      frequencyPerWeek: (relevantSymptoms.length / (relevantSymptoms.length > 0 ? 
        (Date.now() - relevantSymptoms[0].timestamp.getTime()) / (1000 * 60 * 60 * 24 * 7) : 1))
    };
  };

  const getUniqueSymptomTypes = () => {
    const timeframeData = getTimeframeData();
    const uniqueTypes = new Map<string, { type: string; bodyPart: string; count: number }>();
    
    timeframeData.forEach(symptom => {
      const key = `${symptom.type}-${symptom.bodyPartId}`;
      if (uniqueTypes.has(key)) {
        uniqueTypes.get(key)!.count++;
      } else {
        uniqueTypes.set(key, {
          type: symptom.type,
          bodyPart: symptom.bodyPartName,
          count: 1
        });
      }
    });

    return Array.from(uniqueTypes.values()).sort((a, b) => b.count - a.count);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'fluctuating':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'worsening':
        return 'bg-red-100 text-red-800';
      case 'fluctuating':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTimelineChart = (progression: SymptomProgression) => {
    const maxIntensity = 10;
    const chartHeight = 120;
    const chartWidth = 300;
    
    if (progression.entries.length === 0) return null;

    const points = progression.entries.map((entry, index) => {
      const x = (index / (progression.entries.length - 1)) * chartWidth;
      const y = chartHeight - (entry.intensity / maxIntensity) * chartHeight;
      return { x, y, entry };
    });

    return (
      <div className="relative">
        <svg width={chartWidth} height={chartHeight + 40} className="overflow-visible">
          {/* Grid lines */}
          {[0, 2, 4, 6, 8, 10].map(intensity => (
            <line
              key={intensity}
              x1="0"
              y1={chartHeight - (intensity / maxIntensity) * chartHeight}
              x2={chartWidth}
              y2={chartHeight - (intensity / maxIntensity) * chartHeight}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Trend line */}
          {points.length > 1 && (
            <polyline
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          )}
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all cursor-pointer"
              />
              {point.entry.photos && point.entry.photos.length > 0 && (
                <Camera className="h-3 w-3 text-purple-600" x={point.x - 6} y={point.y - 15} />
              )}
            </g>
          ))}
          
          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {format(point.entry.timestamp, 'MMM d')}
            </text>
          ))}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600 -ml-8">
          <span>10</span>
          <span>8</span>
          <span>6</span>
          <span>4</span>
          <span>2</span>
          <span>0</span>
        </div>
      </div>
    );
  };

  const uniqueBodyParts = [...new Set(symptoms.map(s => s.bodyPartId))];
  const symptomTypes = getUniqueSymptomTypes();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <select
          value={selectedBodyPart}
          onChange={(e) => setSelectedBodyPart(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Body Parts</option>
          {uniqueBodyParts.map(bodyPartId => {
            const symptom = symptoms.find(s => s.bodyPartId === bodyPartId);
            return (
              <option key={bodyPartId} value={bodyPartId}>
                {symptom?.bodyPartName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Progression Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {symptomTypes.slice(0, 6).map(({ type, bodyPart }) => {
          const bodyPartId = symptoms.find(s => s.type === type && s.bodyPartName === bodyPart)?.bodyPartId || '';
          const progression = calculateProgression(type, bodyPartId);
          
          return (
            <Card key={`${type}-${bodyPartId}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{type}</CardTitle>
                  {getTrendIcon(progression.trend)}
                </div>
                <p className="text-xs text-gray-600">{bodyPart}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Trend</span>
                  <Badge className={getTrendColor(progression.trend)}>
                    {progression.trend}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Avg Intensity</span>
                  <span className="text-sm font-medium">
                    {progression.averageIntensity.toFixed(1)}/10
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Frequency</span>
                  <span className="text-sm font-medium">
                    {progression.frequencyPerWeek.toFixed(1)}/week
                  </span>
                </div>

                {progression.entries.length > 1 && (
                  <div className="mt-4">
                    {renderTimelineChart(progression)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Timeline</CardTitle>
          <p className="text-sm text-gray-600">
            Chronological view of your symptoms with photos and measurements
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {getTimeframeData()
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((symptom) => (
                <div key={symptom.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{symptom.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {symptom.bodyPartName}
                      </Badge>
                      <Badge className={cn(
                        "text-xs",
                        symptom.intensity <= 3 ? "bg-green-100 text-green-800" :
                        symptom.intensity <= 6 ? "bg-yellow-100 text-yellow-800" :
                        symptom.intensity <= 8 ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {symptom.intensity}/10
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      {format(symptom.timestamp, 'MMM d, yyyy • h:mm a')}
                    </div>
                    
                    {symptom.notes && (
                      <p className="text-sm text-gray-700 mb-2">{symptom.notes}</p>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      {symptom.photos && symptom.photos.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-purple-600">
                          <Camera className="h-3 w-3" />
                          <span>{symptom.photos.length} photo{symptom.photos.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {symptom.measurements && symptom.measurements.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <Ruler className="h-3 w-3" />
                          <span>{symptom.measurements.length} measurement{symptom.measurements.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            
            {getTimeframeData().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No symptoms logged in the selected timeframe.</p>
                <p className="text-sm">Start logging symptoms to see progression patterns.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomProgression;