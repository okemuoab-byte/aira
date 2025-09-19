import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Heart, 
  Brain, 
  Activity, 
  Eye,
  Info,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText
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
  const [expandedConditions, setExpandedConditions] = useState<Set<string>>(new Set());
  const [showAllConditions, setShowAllConditions] = useState(false);

  const toggleCondition = (conditionName: string) => {
    const newExpanded = new Set(expandedConditions);
    if (newExpanded.has(conditionName)) {
      newExpanded.delete(conditionName);
    } else {
      newExpanded.add(conditionName);
    }
    setExpandedConditions(newExpanded);
  };

  const getConditionIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('heart') || conditionLower.includes('cardiac')) return Heart;
    if (conditionLower.includes('diabetes') || conditionLower.includes('blood sugar')) return Activity;
    if (conditionLower.includes('cancer') || conditionLower.includes('tumor')) return FileText;
    if (conditionLower.includes('alzheimer') || conditionLower.includes('dementia') || conditionLower.includes('mental')) return Brain;
    if (conditionLower.includes('eye') || conditionLower.includes('vision') || conditionLower.includes('glaucoma')) return Eye;
    return Activity;
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

  // Calculate summary stats
  const getSummaryStats = () => {
    const conditionsUserHas = familyHistory.filter(c => c.isUserAffected);
    const multipleAffectedConditions = Object.entries(groupedConditions)
      .filter(([_, conditions]) => conditions.length > 1);

    return {
      userAffectedCount: conditionsUserHas.length,
      multipleAffectedCount: multipleAffectedConditions.length,
      totalConditions: Object.keys(groupedConditions).length,
      totalFamilyMembers: new Set(familyHistory.map(c => c.familyMember)).size
    };
  };

  const renderConditionDropdown = (conditionName: string, conditions: FamilyHistoryCondition[]) => {
    const Icon = getConditionIcon(conditionName);
    const userHasCondition = conditions.some(c => c.isUserAffected);
    const isExpanded = expandedConditions.has(conditionName);

    return (
      <Card key={conditionName} className={cn(
        "transition-all duration-300 hover:shadow-md border",
        userHasCondition ? "border-blue-300 bg-blue-50" : "border-slate-200"
      )}>
        <CardContent className="p-0">
          <Button
            variant="ghost"
            onClick={() => toggleCondition(conditionName)}
            className="w-full p-4 justify-between hover:bg-transparent"
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg",
                userHasCondition ? "bg-blue-200" : "bg-slate-100"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  userHasCondition ? "text-blue-700" : "text-slate-600"
                )} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-800">{conditionName}</h4>
                <p className="text-sm text-slate-600">
                  {conditions.length} family member{conditions.length > 1 ? 's' : ''} affected
                </p>
              </div>
              {userHasCondition && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-auto mr-2">
                  You have this
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            )}
          </Button>

          {isExpanded && (
            <div className="px-4 pb-4 space-y-3 border-t border-slate-200 pt-4">
              <div className="text-sm font-medium text-slate-700">Family members with this condition:</div>
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
          )}
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
            Adding family health history helps your healthcare provider understand your health background.
          </p>
          <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Family History
          </Button>
        </CardContent>
      </Card>
    );
  }

  const summaryStats = getSummaryStats();
  const displayedConditions = showAllConditions 
    ? Object.entries(groupedConditions)
    : Object.entries(groupedConditions).slice(0, 6);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            Family Health History
          </CardTitle>
          <p className="text-slate-600">
            Your family health background for healthcare provider reference
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{summaryStats.totalConditions}</div>
              <div className="text-sm text-blue-600">Conditions Tracked</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{summaryStats.totalFamilyMembers}</div>
              <div className="text-sm text-purple-600">Family Members</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{summaryStats.userAffectedCount}</div>
              <div className="text-sm text-green-600">You Currently Have</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{summaryStats.multipleAffectedCount}</div>
              <div className="text-sm text-orange-600">Multiple Family Members</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informational Alert */}
      {summaryStats.userAffectedCount > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Family Health Pattern:</strong> You currently have {summaryStats.userAffectedCount} condition{summaryStats.userAffectedCount > 1 ? 's' : ''} that also appear{summaryStats.userAffectedCount === 1 ? 's' : ''} in your family history. 
            This information helps your healthcare provider understand your health background.
          </AlertDescription>
        </Alert>
      )}

      {/* Conditions Dropdown List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-slate-600" />
            Family Health Conditions
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

        <div className="space-y-3">
          {displayedConditions.map(([conditionName, conditions]) => 
            renderConditionDropdown(conditionName, conditions)
          )}
        </div>
      </div>

      {/* Healthcare Provider Note */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">For Your Healthcare Provider</h4>
              <p className="text-sm text-green-700 mb-4">
                This family history information can help your healthcare provider make informed decisions about 
                screening schedules, preventive care, and treatment options tailored to your health background.
              </p>
              <Button variant="outline" className="bg-white/80 hover:bg-white text-green-700 border-green-300">
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