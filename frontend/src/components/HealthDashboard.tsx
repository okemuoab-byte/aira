import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import BodyMap from './BodyMap';
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
    if (intensity <= 3) return 'bg-green-100 text-green-800';
    if (intensity <= 6) return 'bg-yellow-100 text-yellow-800';
    if (intensity <= 8) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
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
      return "No symptoms logged today. Great job taking care of yourself!";
    }

    const avgIntensity = todaySymptoms.reduce((sum, s) => sum + s.intensity, 0) / todaySymptoms.length;
    const bodyParts = [...new Set(todaySymptoms.map(s => s.bodyPartName))];

    if (avgIntensity <= 3) {
      return `You're having a relatively good day with mild symptoms in ${bodyParts.join(' and ')}.`;
    } else if (avgIntensity <= 6) {
      return `You're experiencing moderate symptoms in ${bodyParts.join(' and ')}. Consider your usual management strategies.`;
    } else {
      return `You're having a challenging day with stronger symptoms. Consider reaching out to your healthcare provider if this continues.`;
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
      return "You haven't logged many symptoms this week. Keep up the good work!";
    }

    return `This week, your ${mostAffected.map(([part]) => part.toLowerCase()).join(' and ')} ${mostAffected.length === 1 ? 'has' : 'have'} needed the most attention.`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {userName}!
        </h1>
        <p className="text-gray-600">Here's your health overview</p>
      </div>

      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySymptoms.length}</div>
            <p className="text-xs text-gray-600">symptoms logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentSymptoms.length}</div>
            <p className="text-xs text-gray-600">total symptoms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Avg Intensity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentSymptoms.length > 0 
                ? Math.round(recentSymptoms.reduce((sum, s) => sum + s.intensity, 0) / recentSymptoms.length)
                : 0}/10
            </div>
            <p className="text-xs text-gray-600">this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Health Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{getHealthSummary()}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800">{getWeeklyPatterns()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Visual Body Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Body Overview</CardTitle>
            <p className="text-sm text-gray-600">
              Colors show recent symptom intensity
            </p>
          </CardHeader>
          <CardContent>
            <BodyMap
              onBodyPartClick={() => {}} // Read-only in dashboard
              symptoms={recentSymptoms}
              className="pointer-events-none"
            />
          </CardContent>
        </Card>

        {/* Recent Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {symptoms.slice(0, 10).map((symptom) => (
                <div key={symptom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{symptom.type}</div>
                    <div className="text-xs text-gray-600">
                      {symptom.bodyPartName} • {formatSymptomDate(symptom.timestamp)}
                    </div>
                    {symptom.notes && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {symptom.notes}
                      </div>
                    )}
                  </div>
                  <Badge className={getIntensityColor(symptom.intensity)}>
                    {symptom.intensity}/10 {getIntensityLabel(symptom.intensity)}
                  </Badge>
                </div>
              ))}
              
              {symptoms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No symptoms logged yet.</p>
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