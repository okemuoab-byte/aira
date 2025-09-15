import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  AlertTriangle, 
  Heart, 
  Brain, 
  Activity, 
  Eye,
  Info,
  TrendingUp,
  Shield,
  Plus
} from 'lucide-react';
import { FamilyHistoryCondition } from '@/types/health';
import { cn } from '@/lib/utils';

interface FamilyHistorySectionProps {
  familyHistory: FamilyHistoryCondition[];
  userConditions: string[];
  className?: string;
}

const FamilyHistorySection: React.FC<FamilyHistorySectionProps> = ({
  familyHistory,
  userConditions,
  className
}) => {
  const [showAllConditions, setShowAllConditions] = useState(false);

  const getConditionIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('heart') || conditionLower.includes('cardiac')) return Heart;
    if (conditionLower.includes('diabetes') || conditionLower.includes('blood sugar')) return Activity;
    if (conditionLower.includes('cancer') || conditionLower.includes('tumor')) return AlertTriangle;
    if (conditionLower.includes('alzheimer') || conditionLower.includes('dementia') || conditionLower.includes('mental')) return Brain;
    if (conditionLower.includes('eye') || conditionLower.includes('vision') || conditionLower.includes('glaucoma')) return Eye;
    return Activity;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'parent':
        return 'bg-purple-100 text-purple-800';
      case 'grandparent':
        return 'bg-blue-100 text-blue-800';
      case 'sibling':
        return 'bg-green-100 text-green-800';
      case 'aunt_uncle':
        return 'bg-indigo-100 text-indigo-800';
      case 'cousin':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'parent': return 'Parent';
      case 'grandparent': return 'Grandparent';
      case 'sibling': return 'Sibling';
      case 'aunt_uncle': return 'Aunt/Uncle';
      case 'cousin': return 'Cousin';
      default: return relationship;
    }
  };

  // Group conditions by condition name to show family patterns
  const groupedConditions = familyHistory.reduce((acc, condition) => {
    if (!acc[condition.condition]) {
      acc[condition.condition] = [];
    }
    acc[condition.condition].push(condition);
    return acc;
  }, {} as Record<string, FamilyHistoryCondition[]>);

  // Calculate risk patterns
  const getRiskAnalysis = () => {
    const highRiskConditions = familyHistory.filter(c => c.riskLevel === 'high');
    const conditionsUserHas = familyHistory.filter(c => c.isUserAffected);
    const multipleAffectedConditions = Object.entries(groupedConditions)
      .filter(([_, conditions]) => conditions.length > 1);

    return {
      highRiskCount: highRiskConditions.length,
      userAffectedCount: conditionsUserHas.length,
      multipleAffectedCount: multipleAffectedConditions.length,
      totalConditions: Object.keys(groupedConditions).length
    };
  };

  const riskAnalysis = getRiskAnalysis();

  const renderConditionCard = (conditionName: string, conditions: FamilyHistoryCondition[]) => {
    const Icon = getConditionIcon(conditionName);
    const userHasCondition = conditions.some(c => c.isUserAffected);
    const highestRisk = conditions.reduce((max, c) => 
      c.riskLevel === 'high' ? 'high' : 
      c.riskLevel === 'moderate' && max !== 'high' ? 'moderate' : max, 
      'low' as 'low' | 'moderate' | 'high'
    );

    return (
      <Card key={conditionName} className={cn(
        "transition-all duration-300 hover:shadow-lg border-2",
        userHasCondition ? "border-orange-300 bg-orange-50" : "border-slate-200",
        highestRisk === 'high' && !userHasCondition && "border-red-200 bg-red-50"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg",
                userHasCondition ? "bg-orange-200" : "bg-blue-100"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  userHasCondition ? "text-orange-700" : "text-blue-600"
                )} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">{conditionName}</h4>
                <p className="text-sm text-slate-600">
                  {conditions.length} family member{conditions.length > 1 ? 's' : ''} affected
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <Badge className={getRiskLevelColor(highestRisk)}>
                {highestRisk} risk
              </Badge>
              {userHasCondition && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  You have this
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-700">Affected family members:</div>
            <div className="space-y-2">
              {conditions.map((condition) => (
                <div key={condition.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className={getRelationshipColor(condition.relationship)}>
                      {getRelationshipLabel(condition.relationship)}
                    </Badge>
                    <span className="text-sm font-medium">{condition.familyMember}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    {condition.ageOfOnset && (
                      <span>Age {condition.ageOfOnset}</span>
                    )}
                    {condition.severity && (
                      <Badge variant="outline" className="text-xs">
                        {condition.severity}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {conditions.some(c => c.notes) && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="text-sm font-medium text-slate-700 mb-2">Additional notes:</div>
                {conditions.filter(c => c.notes).map((condition) => (
                  <div key={condition.id} className="text-sm text-slate-600 mb-1">
                    <strong>{condition.familyMember}:</strong> {condition.notes}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (familyHistory.length === 0) {
    return (
      <Card className={cn("border-dashed border-2 border-slate-300", className)}>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Family History Recorded</h3>
          <p className="text-slate-600 mb-4">
            Adding family health history helps identify genetic predispositions and health risks.
          </p>
          <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Family History
          </Button>
        </CardContent>
      </Card>
    );
  }

  const displayedConditions = showAllConditions 
    ? Object.entries(groupedConditions)
    : Object.entries(groupedConditions).slice(0, 6);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Risk Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="h-6 w-6 mr-2 text-purple-600" />
            Family Health History
          </CardTitle>
          <p className="text-slate-600">
            Understanding your genetic predispositions and family health patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{riskAnalysis.totalConditions}</div>
              <div className="text-sm text-purple-600">Conditions Tracked</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{riskAnalysis.highRiskCount}</div>
              <div className="text-sm text-red-600">High Risk</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{riskAnalysis.userAffectedCount}</div>
              <div className="text-sm text-orange-600">You Currently Have</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{riskAnalysis.multipleAffectedCount}</div>
              <div className="text-sm text-blue-600">Multiple Family Members</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Alerts */}
      {riskAnalysis.highRiskCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High Risk Conditions Identified:</strong> You have {riskAnalysis.highRiskCount} condition{riskAnalysis.highRiskCount > 1 ? 's' : ''} with high genetic risk. 
            Consider discussing preventive measures with your healthcare provider.
          </AlertDescription>
        </Alert>
      )}

      {riskAnalysis.userAffectedCount > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Genetic Pattern Match:</strong> You currently have {riskAnalysis.userAffectedCount} condition{riskAnalysis.userAffectedCount > 1 ? 's' : ''} that also run{riskAnalysis.userAffectedCount === 1 ? 's' : ''} in your family. 
            This information is valuable for your healthcare team.
          </AlertDescription>
        </Alert>
      )}

      {/* Conditions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Genetic Predispositions
          </h3>
          {Object.keys(groupedConditions).length > 6 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllConditions(!showAllConditions)}
            >
              {showAllConditions ? 'Show Less' : `Show All (${Object.keys(groupedConditions).length})`}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedConditions.map(([conditionName, conditions]) => 
            renderConditionCard(conditionName, conditions)
          )}
        </div>
      </div>

      {/* Prevention Insights */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Prevention & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Regular Screening</h4>
                <p className="text-sm text-green-700">
                  Based on your family history, discuss appropriate screening schedules with your doctor for early detection.
                </p>
              </div>
              <div className="p-4 bg-white/60 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Lifestyle Modifications</h4>
                <p className="text-sm text-blue-700">
                  Many genetic predispositions can be managed through lifestyle changes, diet, and exercise.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <Button variant="outline" className="bg-white/80 hover:bg-white">
                <Plus className="h-4 w-4 mr-2" />
                Update Family History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyHistorySection;