import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Zap, 
  Target, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Activity
} from 'lucide-react';
import { Symptom } from '@/types/health';
import { cn } from '@/lib/utils';
import { format, subDays, isWithinInterval } from 'date-fns';

interface HealthInsightsProps {
  symptoms: Symptom[];
  className?: string;
}

interface HealthPattern {
  id: string;
  type: 'trend' | 'correlation' | 'prediction' | 'alert';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  bodyParts: string[];
  timeframe: string;
  actionable: boolean;
  recommendation?: string;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({
  symptoms,
  className
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  const getTimeframeData = () => {
    const now = new Date();
    const startDate = selectedTimeframe === 'week' 
      ? subDays(now, 7)
      : selectedTimeframe === 'month'
      ? subDays(now, 30)
      : subDays(now, 90);

    return symptoms.filter(symptom => 
      isWithinInterval(symptom.timestamp, { start: startDate, end: now })
    );
  };

  const analyzeHealthPatterns = (): HealthPattern[] => {
    const timeframeSymptoms = getTimeframeData();
    const patterns: HealthPattern[] = [];

    // Trend Analysis
    const bodyPartTrends = new Map<string, number[]>();
    timeframeSymptoms.forEach(symptom => {
      if (!bodyPartTrends.has(symptom.bodyPartName)) {
        bodyPartTrends.set(symptom.bodyPartName, []);
      }
      bodyPartTrends.get(symptom.bodyPartName)!.push(symptom.intensity);
    });

    bodyPartTrends.forEach((intensities, bodyPart) => {
      if (intensities.length >= 3) {
        const recent = intensities.slice(-3);
        const earlier = intensities.slice(0, -3);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg;
        
        const trend = recentAvg - earlierAvg;
        if (Math.abs(trend) > 1) {
          patterns.push({
            id: `trend-${bodyPart}`,
            type: 'trend',
            title: trend > 0 ? `${bodyPart} symptoms worsening` : `${bodyPart} symptoms improving`,
            description: `Average intensity has ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(1)} points`,
            confidence: Math.min(95, 60 + Math.abs(trend) * 10),
            severity: Math.abs(trend) > 2 ? 'high' : 'medium',
            bodyParts: [bodyPart],
            timeframe: selectedTimeframe,
            actionable: trend > 0,
            recommendation: trend > 0 
              ? `Consider tracking triggers for ${bodyPart} symptoms and consult your healthcare provider`
              : `Great progress! Continue current management strategies for ${bodyPart}`
          });
        }
      }
    });

    // Correlation Analysis
    const symptomsByDay = new Map<string, Symptom[]>();
    timeframeSymptoms.forEach(symptom => {
      const day = format(symptom.timestamp, 'yyyy-MM-dd');
      if (!symptomsByDay.has(day)) {
        symptomsByDay.set(day, []);
      }
      symptomsByDay.get(day)!.push(symptom);
    });

    const bodyPartPairs = new Map<string, number>();
    symptomsByDay.forEach(daySymptoms => {
      const bodyParts = [...new Set(daySymptoms.map(s => s.bodyPartName))];
      for (let i = 0; i < bodyParts.length; i++) {
        for (let j = i + 1; j < bodyParts.length; j++) {
          const pair = [bodyParts[i], bodyParts[j]].sort().join(' + ');
          bodyPartPairs.set(pair, (bodyPartPairs.get(pair) || 0) + 1);
        }
      }
    });

    bodyPartPairs.forEach((count, pair) => {
      if (count >= 3) {
        const [part1, part2] = pair.split(' + ');
        patterns.push({
          id: `correlation-${pair}`,
          type: 'correlation',
          title: `${part1} and ${part2} symptoms often occur together`,
          description: `These symptoms appeared together on ${count} days in the past ${selectedTimeframe}`,
          confidence: Math.min(90, 40 + count * 10),
          severity: count > 5 ? 'medium' : 'low',
          bodyParts: [part1, part2],
          timeframe: selectedTimeframe,
          actionable: true,
          recommendation: `Consider if there's a common trigger affecting both ${part1} and ${part2}`
        });
      }
    });

    // High Intensity Alerts
    const highIntensitySymptoms = timeframeSymptoms.filter(s => s.intensity >= 8);
    if (highIntensitySymptoms.length > 0) {
      const bodyPartsAffected = [...new Set(highIntensitySymptoms.map(s => s.bodyPartName))];
      patterns.push({
        id: 'high-intensity-alert',
        type: 'alert',
        title: 'High intensity symptoms detected',
        description: `${highIntensitySymptoms.length} severe symptoms (8+/10) recorded in ${bodyPartsAffected.join(', ')}`,
        confidence: 100,
        severity: 'high',
        bodyParts: bodyPartsAffected,
        timeframe: selectedTimeframe,
        actionable: true,
        recommendation: 'Consider discussing these severe symptoms with your healthcare provider'
      });
    }

    // Frequency Predictions
    const frequentBodyParts = new Map<string, number>();
    timeframeSymptoms.forEach(symptom => {
      frequentBodyParts.set(symptom.bodyPartName, (frequentBodyParts.get(symptom.bodyPartName) || 0) + 1);
    });

    const mostFrequent = [...frequentBodyParts.entries()]
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    mostFrequent.forEach(([bodyPart, count]) => {
      if (count >= 5) {
        const avgPerWeek = count / (selectedTimeframe === 'week' ? 1 : selectedTimeframe === 'month' ? 4 : 12);
        patterns.push({
          id: `prediction-${bodyPart}`,
          type: 'prediction',
          title: `${bodyPart} symptoms likely to continue`,
          description: `Based on ${count} occurrences, expect ~${avgPerWeek.toFixed(1)} symptoms per week`,
          confidence: Math.min(85, 50 + count * 3),
          severity: avgPerWeek > 2 ? 'medium' : 'low',
          bodyParts: [bodyPart],
          timeframe: selectedTimeframe,
          actionable: true,
          recommendation: `Consider preventive measures for ${bodyPart} symptoms`
        });
      }
    });

    return patterns.sort((a, b) => b.confidence - a.confidence);
  };

  const healthPatterns = useMemo(() => analyzeHealthPatterns(), [symptoms, selectedTimeframe]);

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'correlation': return Target;
      case 'prediction': return Brain;
      case 'alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const getPatternColor = (type: string, severity: string) => {
    if (type === 'alert') return 'from-red-500 to-red-600';
    if (severity === 'high') return 'from-orange-500 to-red-500';
    if (severity === 'medium') return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-purple-500';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const renderHealthScore = () => {
    const recentSymptoms = getTimeframeData();
    const avgIntensity = recentSymptoms.length > 0 
      ? recentSymptoms.reduce((sum, s) => sum + s.intensity, 0) / recentSymptoms.length 
      : 0;
    
    const healthScore = Math.max(0, Math.min(100, 100 - (avgIntensity * 10)));
    const scoreColor = healthScore >= 80 ? 'text-green-600' : healthScore >= 60 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-slate-800">Health Score</h3>
          </div>
          <div className={cn("text-4xl font-bold mb-2", scoreColor)}>
            {healthScore.toFixed(0)}
          </div>
          <div className="text-sm text-slate-600 mb-4">
            Based on {recentSymptoms.length} symptoms in the past {selectedTimeframe}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                healthScore >= 80 ? "bg-green-500" : healthScore >= 60 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPatternCard = (pattern: HealthPattern) => {
    const Icon = getPatternIcon(pattern.type);
    
    return (
      <Card key={pattern.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-r",
                getPatternColor(pattern.type, pattern.severity)
              )}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{pattern.title}</h4>
                <p className="text-sm text-slate-600">{pattern.description}</p>
              </div>
            </div>
            <Badge className={cn("text-xs", getSeverityBadge(pattern.severity))}>
              {pattern.confidence}% confident
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {pattern.bodyParts.map(part => (
              <Badge key={part} variant="outline" className="text-xs">
                {part}
              </Badge>
            ))}
          </div>
          
          {pattern.recommendation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{pattern.recommendation}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            Health Insights
          </h2>
          <p className="text-gray-600">AI-powered analysis of your health patterns</p>
        </div>
        
        <Tabs value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Health Score */}
      {renderHealthScore()}

      {/* Insights Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Pattern Analysis
        </h3>
        
        {healthPatterns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Not enough data for pattern analysis</p>
              <p className="text-sm text-gray-500">Log more symptoms to see AI-powered insights</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {healthPatterns.map(renderPatternCard)}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Recommended Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <Calendar className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Schedule Check-up</div>
                <div className="text-xs text-gray-600">Based on symptom patterns</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <Activity className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Track Triggers</div>
                <div className="text-xs text-gray-600">Identify symptom causes</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthInsights;