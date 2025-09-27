import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  FileText,
  Edit,
  Save,
  X
} from 'lucide-react';
import { FamilyHistoryCondition } from '@/types/health';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface FamilyHistorySectionProps {
  familyHistory: FamilyHistoryCondition[];
  userConditions: string[];
  onFamilyHistoryUpdate?: (history: FamilyHistoryCondition[]) => void;
  className?: string;
}

const FamilyHistorySection: React.FC<FamilyHistorySectionProps> = ({
  familyHistory,
  userConditions,
  onFamilyHistoryUpdate,
  className
}) => {
  const [expandedConditions, setExpandedConditions] = useState<Set<string>>(new Set());
  const [showAllConditions, setShowAllConditions] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCondition, setEditingCondition] = useState<FamilyHistoryCondition | null>(null);
  
  // Form state for adding/editing family history
  const [formData, setFormData] = useState({
    condition: '',
    familyMember: '',
    relationship: 'parent' as 'parent' | 'grandparent' | 'sibling' | 'aunt_uncle' | 'cousin',
    ageOfOnset: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe',
    notes: '',
    isUserAffected: false,
    riskLevel: 'low' as 'low' | 'moderate' | 'high'
  });

  const relationshipOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'aunt_uncle', label: 'Aunt/Uncle' },
    { value: 'cousin', label: 'Cousin' }
  ];

  const severityOptions = [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' }
  ];

  const riskLevelOptions = [
    { value: 'low', label: 'Low Risk' },
    { value: 'moderate', label: 'Moderate Risk' },
    { value: 'high', label: 'High Risk' }
  ];

  const toggleCondition = (conditionName: string) => {
    const newExpanded = new Set(expandedConditions);
    if (newExpanded.has(conditionName)) {
      newExpanded.delete(conditionName);
    } else {
      newExpanded.add(conditionName);
    }
    setExpandedConditions(newExpanded);
  };

  const resetForm = () => {
    setFormData({
      condition: '',
      familyMember: '',
      relationship: 'parent',
      ageOfOnset: '',
      severity: 'mild',
      notes: '',
      isUserAffected: false,
      riskLevel: 'low'
    });
    setEditingCondition(null);
  };

  const handleAddCondition = () => {
    if (!formData.condition || !formData.familyMember) return;

    const newCondition: FamilyHistoryCondition = {
      id: Date.now().toString(),
      condition: formData.condition,
      familyMember: formData.familyMember,
      relationship: formData.relationship,
      ageOfOnset: formData.ageOfOnset ? parseInt(formData.ageOfOnset) : undefined,
      severity: formData.severity,
      notes: formData.notes || undefined,
      isUserAffected: formData.isUserAffected,
      riskLevel: formData.riskLevel
    };

    const updatedHistory = [...familyHistory, newCondition];
    onFamilyHistoryUpdate?.(updatedHistory);
    showSuccess(`Added ${formData.condition} to family history`);
    resetForm();
    setShowAddForm(false);
  };

  const handleEditCondition = (condition: FamilyHistoryCondition) => {
    setEditingCondition(condition);
    setFormData({
      condition: condition.condition,
      familyMember: condition.familyMember,
      relationship: condition.relationship,
      ageOfOnset: condition.ageOfOnset?.toString() || '',
      severity: condition.severity || 'mild',
      notes: condition.notes || '',
      isUserAffected: condition.isUserAffected,
      riskLevel: condition.riskLevel
    });
    setShowAddForm(true);
  };

  const handleUpdateCondition = () => {
    if (!editingCondition || !formData.condition || !formData.familyMember) return;

    const updatedCondition: FamilyHistoryCondition = {
      ...editingCondition,
      condition: formData.condition,
      familyMember: formData.familyMember,
      relationship: formData.relationship,
      ageOfOnset: formData.ageOfOnset ? parseInt(formData.ageOfOnset) : undefined,
      severity: formData.severity,
      notes: formData.notes || undefined,
      isUserAffected: formData.isUserAffected,
      riskLevel: formData.riskLevel
    };

    const updatedHistory = familyHistory.map(condition =>
      condition.id === editingCondition.id ? updatedCondition : condition
    );
    
    onFamilyHistoryUpdate?.(updatedHistory);
    showSuccess(`Updated ${formData.condition} in family history`);
    resetForm();
    setShowAddForm(false);
  };

  const handleDeleteCondition = (conditionId: string) => {
    const updatedHistory = familyHistory.filter(condition => condition.id !== conditionId);
    onFamilyHistoryUpdate?.(updatedHistory);
    showSuccess('Removed condition from family history');
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
                    <div key={condition.id} className="text-sm text-slate-600 mb-1 flex items-center justify-between">
                      <span><strong>{condition.familyMember}:</strong> {condition.notes}</span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCondition(condition)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCondition(condition.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Edit buttons for each condition */}
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCondition(conditions[0])}
                  className="text-xs"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderFamilyHistoryForm = () => (
    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {editingCondition ? <Edit className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
            {editingCondition ? 'Edit Family History' : 'Add Family History'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Health Condition *</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                placeholder="e.g., Type 2 Diabetes, Heart Disease"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="familyMember">Family Member *</Label>
              <Input
                id="familyMember"
                value={formData.familyMember}
                onChange={(e) => setFormData(prev => ({ ...prev, familyMember: e.target.value }))}
                placeholder="e.g., Mother, Father, Grandmother"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select value={formData.relationship} onValueChange={(value: any) => setFormData(prev => ({ ...prev, relationship: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationshipOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ageOfOnset">Age of Onset</Label>
              <Input
                id="ageOfOnset"
                type="number"
                value={formData.ageOfOnset}
                onChange={(e) => setFormData(prev => ({ ...prev, ageOfOnset: e.target.value }))}
                placeholder="Age when diagnosed"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select value={formData.riskLevel} onValueChange={(value: any) => setFormData(prev => ({ ...prev, riskLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {riskLevelOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="isUserAffected"
                  checked={formData.isUserAffected}
                  onChange={(e) => setFormData(prev => ({ ...prev, isUserAffected: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isUserAffected" className="text-sm">
                  I currently have this condition
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about this condition..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={editingCondition ? handleUpdateCondition : handleAddCondition}
              disabled={!formData.condition || !formData.familyMember}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingCondition ? 'Update' : 'Add'} Condition
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (familyHistory.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Family History Recorded</h3>
            <p className="text-slate-600 mb-4">
              Adding family health history helps your healthcare provider understand your health background.
            </p>
            <Button
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Family History
            </Button>
          </CardContent>
        </Card>
        {renderFamilyHistoryForm()}
      </div>
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
              <Button
                variant="outline"
                className="bg-white/80 hover:bg-white text-green-700 border-green-300"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Update Family History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Form Modal */}
      {renderFamilyHistoryForm()}
    </div>
  );
};

export default FamilyHistorySection;