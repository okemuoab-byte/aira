import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Activity, 
  Heart, 
  Brain, 
  Sparkles,
  Users,
  Pill,
  Target,
  CheckCircle,
  Zap,
  TrendingDown,
  Minus,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ZoomableBodyMap from './ZoomableBodyMap';
import { Symptom, Medication } from '@/types/health';
import { format, isToday, isYesterday, subDays, isWithinInterval } from 'date-fns';

interface CombinedDashboardProps {
  symptoms: Symptom[];
  medications: Medication[];
  userName?: string;
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

const CombinedDashboard: React.FC<CombinedDashboardProps> = ({
  symptoms,
  medications,
  userName = 'there',
  className
}) => {
  // Determine if user is a frequent logger (weekly view) or infrequent (monthly view)
  const isFrequentLogger = useMemo(() => {
    const lastWeek = subDays(new Date(), 7);
    const recentSymptoms = symptoms.filter(s => s.timestamp >= lastWeek);
    return recentSymptoms.length >= 5; // 5+ symptoms in last week = frequent logger
  }, [symptoms]);

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>(
    isFrequentLogger ? 'week' : 'month'
  );

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

  const todaySymptoms = symptoms.filter(s => isToday(s.timestamp));
  const timeframeSymptoms = getTimeframeData();

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-green-100 text-green-800 border-green-200';
    if (intensity <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (intensity <= 8) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 3) return 'Mild';
    if (intensity <= 6) return 'Moderate';
    if (intensity <= 8) return 'Strong';
    return 'Severe';
  };

  const formatSymptomDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const getHealthSummary = () => {
    if (todaySymptoms.length === 0) {
      return "No symptoms logged today. Great job taking care of yourself! 🌟";
    }

    const avgIntensity = todaySymptoms.reduce((sum, s) => sum + s.intensity, 0) / todaySymptoms.length;
    const bodyParts = [...new Set(todaySymptoms.map(s => s.bodyPartName))];

    if (avgIntensity <= 3) {
      return `You're having a relatively good day with mild symptoms in ${bodyParts.join(' and ')}. Keep up the self-care! 💚`;
    } else if (avgIntensity <= 6) {
      return `You're experiencing moderate symptoms in ${bodyParts.join(' and ')}. Consider your usual management strategies. 💛`;
    } else {
      return `You're having a challenging day with stronger symptoms. Consider reaching out to your healthcare provider if this continues. ❤️`;
    }
  };

  const getMostAffectedArea = () => {
    if (timeframeSymptoms.length === 0) return { name: 'None', count: 0 };
    
    const bodyPartCounts: Record<string, number> = {};
    timeframeSymptoms.forEach(symptom => {
      bodyPartCounts[symptom.bodyPartName] = (bodyPartCounts[symptom.bodyPartName] || 0) + 1;
    });

    const mostAffected = Object.entries(bodyPartCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      name: mostAffected[0],
      count: mostAffected[1]
    };
  };

  const analyzeHealthPatterns = (): HealthPattern[] => {
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

    return patterns.sort((a, b) => b.confidence - a.confidence);
  };

  const healthPatterns = useMemo(() => analyzeHealthPatterns(), [timeframeSymptoms, selectedTimeframe]);

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'correlation': return Target;
      case 'prediction': return Brain;
      case 'alert': return AlertCircle;
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
    const avgIntensity = timeframeSymptoms.length > 0 
      ? timeframeSymptoms.reduce((sum, s) => sum + s.intensity, 0) / timeframeSymptoms.length 
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
            Based on {timeframeSymptoms.length} symptoms in the past {selectedTimeframe}
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

  const mostAffectedArea = getMostAffectedArea();

  return (
    <div className={cn("space-y-8", className)}>
      {/* Welcome Header */}
      <div className="text-center space-y-3 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {userName}!
        </h1>
        <p className="text-lg text-slate-600">Here's your personalized health overview</p>
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
          <span>Showing {isFrequentLogger ? 'weekly' : 'monthly'} view</span>
          <span>•</span>
          <span>{isFrequentLogger ? 'Frequent logger' : 'Regular logger'}</span>
        </div>
      </div>

      {/* Timeframe Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            Health Insights & Overview
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

      {/* Enhanced Health Summary Cards - Updated to 2x2 Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1: Today and This Period as 2 halves */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center text-blue-700">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{todaySymptoms.length}</div>
            <p className="text-sm text-blue-600">symptoms logged</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center text-purple-700">
              <TrendingUp className="h-4 w-4 mr-2" />
              This {selectedTimeframe}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{timeframeSymptoms.length}</div>
            <p className="text-sm text-purple-600">total symptoms</p>
          </CardContent>
        </Card>

        {/* Row 2: Most Affected Area and Medications */}
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center text-pink-700">
              <MapPin className="h-4 w-4 mr-2" />
              Most Affected Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-800 truncate">
              {mostAffectedArea.name}
            </div>
            <p className="text-sm text-pink-600">
              {mostAffectedArea.count > 0 ? `${mostAffectedArea.count} symptoms` : 'No symptoms'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center text-green-700">
              <Pill className="h-4 w-4 mr-2" />
              Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">
              {medications.filter(m => !m.endDate || m.endDate > new Date()).length}
            </div>
            <p className="text-sm text-green-600">active medications</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Summary */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Your Health Story
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
              <p className="text-blue-800 font-medium leading-relaxed">{getHealthSummary()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Score */}
      {renderHealthScore()}

      {/* AI Insights Grid */}
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

      {/* Visual Body Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Body Systems Overview
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Visual representation of your recent symptoms organized by body system
            </p>
          </CardHeader>
          <CardContent className="p-2">
            <ZoomableBodyMap
              onBodyPartClick={() => {}} // Read-only in dashboard
              symptoms={timeframeSymptoms}
              readOnly={true}
              className="border-0 shadow-none bg-transparent"
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
              Recent Activity
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Your latest symptom entries and patterns
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {symptoms.slice(0, 10).map((symptom) => (
                <div key={symptom.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{symptom.type}</div>
                    <div className="text-sm text-slate-600 flex items-center space-x-2 mt-1">
                      <span>{symptom.bodyPartName}</span>
                      <span className="text-slate-400">•</span>
                      <span>{formatSymptomDate(symptom.timestamp)}</span>
                    </div>
                    {symptom.notes && (
                      <div className="text-sm text-slate-500 mt-2 p-2 bg-white/50 rounded-lg">
                        {symptom.notes}
                      </div>
                    )}
                  </div>
                  <Badge className={cn("ml-4 border", getIntensityColor(symptom.intensity))}>
                    {symptom.intensity}/10 {getIntensityLabel(symptom.intensity)}
                  </Badge>
                </div>
              ))}
              
              {symptoms.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium mb-2">No symptoms logged yet</p>
                  <p className="text-sm">Start by tapping "Log Symptoms" to track how you're feeling.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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

export default CombinedDashboard;