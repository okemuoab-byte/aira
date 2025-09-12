import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check } from 'lucide-react';
import { systemicSymptoms, SystemicCategory } from '@/data/systemicSymptoms';
import { SymptomSuggestion, Symptom } from '@/types/health';
import IntensitySelector from './IntensitySelector';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface SystemicSymptomLoggerProps {
  onSymptomAdd: (symptom: Omit<Symptom, 'id'>) => void;
  userConditions?: string[];
  className?: string;
}

type LoggingStep = 'categories' | 'symptoms' | 'intensity' | 'notes';

const SystemicSymptomLogger: React.FC<SystemicSymptomLoggerProps> = ({
  onSymptomAdd,
  userConditions = [],
  className
}) => {
  const [currentStep, setCurrentStep] = useState<LoggingStep>('categories');
  const [selectedCategory, setSelectedCategory] = useState<SystemicCategory | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SymptomSuggestion | null>(null);
  const [intensity, setIntensity] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [customSymptom, setCustomSymptom] = useState<string>('');

  const handleCategorySelect = (category: SystemicCategory) => {
    setSelectedCategory(category);
    setCurrentStep('symptoms');
  };

  const handleSuggestionSelect = (suggestion: SymptomSuggestion) => {
    setSelectedSuggestion(suggestion);
    if (suggestion.id === 'custom') {
      // Handle custom symptom input
      setCurrentStep('intensity');
    } else {
      setCurrentStep('intensity');
    }
  };

  const handleIntensitySelect = (selectedIntensity: number) => {
    setIntensity(selectedIntensity);
    setCurrentStep('notes');
  };

  const handleSaveSymptom = () => {
    if (!selectedCategory || !selectedSuggestion || intensity === 0) return;

    const symptomType = selectedSuggestion.id === 'custom' ? customSymptom : selectedSuggestion.text;
    
    const newSymptom: Omit<Symptom, 'id'> = {
      bodyPartId: selectedCategory.id,
      bodyPartName: selectedCategory.name,
      type: symptomType,
      intensity,
      notes: notes.trim() || undefined,
      timestamp: new Date()
    };

    onSymptomAdd(newSymptom);
    showSuccess(`${symptomType} logged in ${selectedCategory.name}`);
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep('categories');
    setSelectedCategory(null);
    setSelectedSuggestion(null);
    setIntensity(0);
    setNotes('');
    setCustomSymptom('');
  };

  const goBack = () => {
    switch (currentStep) {
      case 'symptoms':
        setCurrentStep('categories');
        setSelectedCategory(null);
        break;
      case 'intensity':
        setCurrentStep('symptoms');
        setSelectedSuggestion(null);
        break;
      case 'notes':
        setCurrentStep('intensity');
        setIntensity(0);
        break;
    }
  };

  const getFilteredSuggestions = (): SymptomSuggestion[] => {
    if (!selectedCategory) return [];
    
    return selectedCategory.suggestions.filter(suggestion => {
      if (suggestion.category === 'condition-specific') {
        return suggestion.conditions?.some(condition => userConditions.includes(condition));
      }
      return true;
    });
  };

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Changes in Your Body Systems
        </h2>
        <p className="text-gray-600">
          Select the type of changes you're experiencing
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemicSymptoms.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-102 border-2 hover:border-blue-300"
            onClick={() => handleCategorySelect(category)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600">
                {category.description}
              </p>
              <div className="mt-3 text-xs text-blue-600">
                {category.suggestions.length} symptoms available
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSymptoms = () => {
    if (!selectedCategory) return null;
    
    const filteredSuggestions = getFilteredSuggestions();
    const commonSuggestions = filteredSuggestions.filter(s => s.category === 'common');
    const conditionSpecific = filteredSuggestions.filter(s => s.category === 'condition-specific');
    const visualSuggestions = filteredSuggestions.filter(s => s.category === 'visual');
    const measurableSuggestions = filteredSuggestions.filter(s => s.category === 'measurable');

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'common':
          return 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800';
        case 'condition-specific':
          return 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800';
        case 'visual':
          return 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800';
        case 'measurable':
          return 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800';
        default:
          return 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800';
      }
    };

    const renderSuggestionGroup = (groupSuggestions: SymptomSuggestion[], title: string) => {
      if (groupSuggestions.length === 0) return null;

      return (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {groupSuggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                onClick={() => handleSuggestionSelect(suggestion)}
                className={cn(
                  "justify-start text-left h-auto p-3 transition-all duration-200",
                  getCategoryColor(suggestion.category),
                  selectedSuggestion?.id === suggestion.id && "ring-2 ring-offset-1 ring-gray-800 scale-102"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{suggestion.text}</span>
                  <div className="flex space-x-1">
                    {suggestion.requiresPhoto && (
                      <Badge variant="secondary" className="text-xs">📷 Photo</Badge>
                    )}
                    {suggestion.requiresMeasurement && (
                      <Badge variant="secondary" className="text-xs">📏 Measure</Badge>
                    )}
                    {suggestion.conditions && (
                      <Badge variant="secondary" className="text-xs">Condition-specific</Badge>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl mb-2">{selectedCategory.icon}</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {selectedCategory.name}
          </h3>
          <p className="text-sm text-gray-600">
            Select the specific change you're experiencing
          </p>
        </div>

        <div className="space-y-4">
          {renderSuggestionGroup(commonSuggestions, 'Common Changes')}
          {renderSuggestionGroup(conditionSpecific, 'Based on Your Conditions')}
          {renderSuggestionGroup(visualSuggestions, 'Visual Changes')}
          {renderSuggestionGroup(measurableSuggestions, 'Measurable Changes')}
        </div>

        <div className="pt-2 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => handleSuggestionSelect({ id: 'custom', text: 'Something else...', category: 'common' })}
            className="w-full text-gray-600 hover:text-gray-800"
          >
            + Something else...
          </Button>
        </div>

        {selectedSuggestion?.id === 'custom' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Describe the change:
            </label>
            <Textarea
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder="e.g., unusual skin texture, new sleep pattern..."
              className="min-h-[80px]"
            />
          </div>
        )}
      </div>
    );
  };

  const renderIntensity = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-3xl mb-2">{selectedCategory?.icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {selectedSuggestion?.text}
        </h3>
        <p className="text-sm text-gray-600">
          How much is this affecting you?
        </p>
      </div>
      <IntensitySelector
        intensity={intensity}
        onIntensityChange={handleIntensitySelect}
      />
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Almost done!
        </h3>
        <p className="text-gray-600">
          Add any additional details (optional)
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-2">Summary:</div>
        <div className="font-medium">
          {selectedSuggestion?.text} - Intensity: {intensity}/10
        </div>
        <div className="text-sm text-gray-600">
          Category: {selectedCategory?.name}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Additional details:
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="When did you first notice this? What makes it better or worse? Any patterns you've observed..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'categories':
        return renderCategories();
      case 'symptoms':
        return renderSymptoms();
      case 'intensity':
        return renderIntensity();
      case 'notes':
        return renderNotes();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'categories':
        return selectedCategory !== null;
      case 'symptoms':
        return selectedSuggestion !== null && (selectedSuggestion.id !== 'custom' || customSymptom.trim() !== '');
      case 'intensity':
        return intensity > 0;
      case 'notes':
        return true;
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">System Changes</CardTitle>
          {currentStep !== 'categories' && (
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="flex space-x-2 mt-4">
          {['categories', 'symptoms', 'intensity', 'notes'].map((step, index) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-colors ${
                currentStep === step
                  ? 'bg-purple-500'
                  : index < ['categories', 'symptoms', 'intensity', 'notes'].indexOf(currentStep)
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderCurrentStep()}

        {/* Action buttons */}
        {currentStep !== 'categories' && (
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={goBack}
            >
              Back
            </Button>

            {currentStep === 'notes' ? (
              <Button
                onClick={handleSaveSymptom}
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Change
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (currentStep === 'symptoms') setCurrentStep('intensity');
                  else if (currentStep === 'intensity') setCurrentStep('notes');
                }}
                disabled={!canProceed()}
              >
                Next
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemicSymptomLogger;