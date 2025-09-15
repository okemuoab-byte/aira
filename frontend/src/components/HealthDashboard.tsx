import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, AlertCircle, Activity, Heart, Brain } from 'lucide-react';
import ZoomableBodyMap from './ZoomableBodyMap';
import { Symptom } from '@/types/health';
import { format, isToday, isYesterday, subDays } from 'date-fns';

interface HealthDashboardProps {
  symptoms: Symptom[];
  userName?: string;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({
  symptoms,
  userName = 'there'
}) => {
  const todaySymptoms = symptoms.filter(s => isToday(s.timestamp));
  const recentSymptoms = symptoms.filter(s => {
    const daysDiff = (Date.now() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

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

  const getWeeklyPatterns = () => {
    const bodyPartCounts: Record<string, number> = {};
    recentSymptoms.forEach(symptom => {
      bodyPartCounts[symptom.bodyPartName] = (bodyPartCounts[symptom.bodyPartName] || 0) + 1;
    });

    const mostAffected = Object.entries(bodyPartCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    if (mostAffected.length === 0) {
      return "You haven't logged many symptoms this week. Keep up the good work! 🎉";
    }

    return `This week, your ${mostAffected.map(([part]) => part.toLowerCase()).join(' and ')} ${mostAffected.length === 1 ? 'has' : 'have'} needed the most attention. 📊`;
  };

  const getSystemBreakdown = () => {
    const systemCounts: Record<string, number> = {};
    recentSymptoms.forEach(symptom => {
      // Categorize by body system
      const bodyPart = symptom.bodyPartName.toLowerCase();
      let system = 'Other';
      
      if (bodyPart.includes('head') || bodyPart.includes('brain') || bodyPart.includes('eye') || bodyPart.includes('ear')) {
        system = 'Neurological';
      } else if (bodyPart.includes('lung') || bodyPart.includes('chest') || bodyPart.includes('throat')) {
        system = 'Respiratory';
      } else if (bodyPart.includes('heart') || bodyPart.includes('cardiovascular')) {
        system = 'Cardiovascular';
      } else if (bodyPart.includes('stomach') || bodyPart.includes('abdomen') || bodyPart.includes('digestive')) {
        system = 'Digestive';
      } else if (bodyPart.includes('arm') || bodyPart.includes('leg') || bodyPart.includes('joint') || bodyPart.includes('muscle')) {
        system = 'Musculoskeletal';
      }
      
      systemCounts[system] = (systemCounts[system] || 0) + 1;
    });

    return Object.entries(systemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-3 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {userName}!
        </h1>
        <p className="text-lg text-slate-600">Here's your personalized health overview</p>
      </div>

      {/* Enhanced Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{recentSymptoms.length}</div>
            <p className="text-sm text-purple-600">total symptoms</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center text-pink-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              Avg Intensity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-800">
              {recentSymptoms.length > 0 
                ? Math.round(recentSymptoms.reduce((sum, s) => sum + s.intensity, 0) / recentSymptoms.length)
                : 0}/10
            </div>
            <p className="text-sm text-pink-600">this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center text-green-700">
              <Activity className="h-4 w-4 mr-2" />
              Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{getSystemBreakdown().length}</div>
            <p className="text-sm text-green-600">affected systems</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Health Insights */}
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
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 animate-pulse"></div>
              <p className="text-purple-800 font-medium leading-relaxed">{getWeeklyPatterns()}</p>
            </div>
          </div>

          {getSystemBreakdown().length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start space-x-3">
                <Brain className="h-4 w-4 text-green-600 mt-1" />
                <div>
                  <p className="text-green-800 font-medium mb-2">Most Active Systems:</p>
                  <div className="flex flex-wrap gap-2">
                    {getSystemBreakdown().map(([system, count]) => (
                      <Badge key={system} variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                        {system} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Visual Body Overview */}
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
              symptoms={recentSymptoms}
              readOnly={true}
              className="border-0 shadow-none bg-transparent"
            />
          </CardContent>
        </Card>

        {/* Enhanced Recent Symptoms */}
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
    </div>
  );
};

export default HealthDashboard;