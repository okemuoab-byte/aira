import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Check, User, Activity, Sparkles } from 'lucide-react';
import ZoomableBodyMap from './ZoomableBodyMap';
import SystemicSymptomLogger from './SystemicSymptomLogger';
import IntensitySelector from './IntensitySelector';
import { Symptom, SymptomSuggestion } from '@/types/health';
import { symptomSuggestions } from '@/data/bodyParts';
import { showSuccess } from '@/utils/toast';

interface SymptomLoggerProps {
  symptoms: Symptom[];
  onSymptomAdd: (symptom: Omit<Symptom, 'id'>) => void;
  userConditions?: string[];
}

type LoggingStep = 'selection' | 'intensity' | 'notes' | 'system-changes';
type LoggingMode = 'body-parts' | 'system-changes';

const SymptomLogger: React.FC<SymptomLoggerProps> = ({
  symptoms,
  onSymptomAdd,
  userConditions = []
}) => {
  const [currentStep, setCurrentStep] = useState<LoggingStep>('selection');
  const [loggingMode, setLoggingMode] = useState<LoggingMode>('body-parts');
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');
  const [selectedBodyPartName, setSelectedBodyPartName] = useState<string>('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SymptomSuggestion | null>(null);
  const [intensity, setIntensity] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [customSymptom, setCustomSymptom] = useState<string>('');

  const handleBodyPartClick = (bodyPartId: string, bodyPartName: string, coordinates: { x: number; y: number }) => {
    setSelectedBodyPart(bodyPartId);
    setSelectedBodyPartName(bodyPartName);
    setSelectedCoordinates(coordinates);
    setLoggingMode('body-parts');
    
    // Auto-select if there's only one common symptom
    const suggestions = getFilteredSuggestions(bodyPartId);
    if (suggestions.length === 1) {
      setSelectedSuggestion(suggestions[0]);
      setCurrentStep('intensity');
    } else {
      setCurrentStep('intensity'); // Skip suggestion step for now, go straight to intensity
    }
  };

  const handleSystemChangesSelect = () => {
    setLoggingMode('system-changes');
    setCurrentStep('system-changes');
  };

  const handleSuggestionSelect = (suggestion: SymptomSuggestion) => {
    setSelectedSuggestion(suggestion);
    setCurrentStep('intensity');
  };

  const handleIntensitySelect = (selectedIntensity: number) => {
    setIntensity(selectedIntensity);
    setCurrentStep('notes');
  };

  const handleSaveSymptom = () => {
    if (!selectedBodyPart || intensity === 0) return;

    // Use a default symptom type if none selected
    const symptomType = selectedSuggestion?.text || customSymptom || `${selectedBodyPartName} discomfort`;
    
    const newSymptom: Omit<Symptom, 'id'> = {
      bodyPartId: selectedBodyPart,
      bodyPartName: selectedBodyPartName,
      type: symptomType,
      intensity,
      notes: notes.trim() || undefined,
      timestamp: new Date(),
      coordinates: selectedCoordinates || undefined
    };

    onSymptomAdd(newSymptom);
    showSuccess(`${symptomType} logged for ${selectedBodyPartName}`);
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep('selection');
    setLoggingMode('body-parts');
    setSelectedBodyPart('');
    setSelectedBodyPartName('');
    setSelectedCoordinates(null);
    setSelectedSuggestion(null);
    setIntensity(0);
    setNotes('');
    setCustomSymptom('');
  };

  const goBack = () => {
    switch (currentStep) {
      case 'intensity':
        setCurrentStep('selection');
        setSelectedBodyPart('');
        setSelectedBodyPartName('');
        setSelectedSuggestion(null);
        break;
      case 'notes':
        setCurrentStep('intensity');
        setIntensity(0);
        break;
      case 'system-changes':
        setCurrentStep('selection');
        setLoggingMode('body-parts');
        break;
    }
  };

  const getFilteredSuggestions = (bodyPartId: string): SymptomSuggestion[] => {
    const suggestions = symptomSuggestions[bodyPartId] || [];
    return suggestions.filter(suggestion => {
      if (suggestion.category === 'condition-specific') {
        return suggestion.conditions?.some(condition => userConditions.includes(condition));
      }
      return true;
    });
  };

  const renderSelection = () => {
    if (loggingMode === 'system-changes') {
      return null; // SystemicSymptomLogger will handle its own rendering
    }

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Where are you experiencing symptoms?
          </h2>
          <p className="text-gray-600 mb-6">
            Choose a specific body part or select system-wide changes
          </p>
        </div>

        {/* Body Map */}
        <ZoomableBodyMap
          onBodyPartClick={handleBodyPartClick}
          symptoms={symptoms}
          selectedBodyPart={selectedBodyPart}
        />

        {/* System Changes Option */}
        <div className="flex justify-center">
          <Card 
            className="cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg max-w-md"
            onClick={handleSystemChangesSelect}
          >
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">
                System Changes
              </h3>
              <p className="text-purple-700 text-sm mb-4">
                Track changes that affect your whole body like mood, sleep, appetite, or skin changes
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-purple-600">
                <Activity className="h-4 w-4" />
                <span>6 categories available</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            💡 <strong>Tip:</strong> Use "System Changes" for symptoms like fatigue, mood changes, sleep issues, or skin changes that affect your whole body
          </p>
        </div>
      </div>
    );
  };

  const renderIntensity = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            How intense is the discomfort in your {selectedBodyPartName.toLowerCase()}?
          </h3>
          <p className="text-sm text-gray-600">
            You can add more details on the next step
          </p>
        </div>
        <IntensitySelector
          intensity={intensity}
          onIntensityChange={handleIntensitySelect}
        />
      </div>
    );
  };

  const renderNotes = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tell us more about your {selectedBodyPartName.toLowerCase()} symptoms
          </h3>
          <p className="text-gray-600">
            Add any additional details (optional)
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">Summary:</div>
          <div className="font-medium">
            {selectedBodyPartName} discomfort - Intensity: {intensity}/10
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            What type of symptom is this?
          </label>
          <Textarea
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
            placeholder="e.g., sharp pain, dull ache, stiffness, burning sensation, swelling..."
            className="min-h-[60px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Additional notes:
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="When did it start? What makes it better or worse? Any other details..."
            className="min-h-[100px]"
          />
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (currentStep === 'system-changes') {
      return (
        <SystemicSymptomLogger
          onSymptomAdd={onSymptomAdd}
          userConditions={userConditions}
        />
      );
    }

    switch (currentStep) {
      case 'selection':
        return renderSelection();
      case 'intensity':
        return renderIntensity();
      case 'notes':
        return renderNotes();
      default:
        return renderSelection();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'selection':
        return selectedBodyPart !== '' || loggingMode === 'system-changes';
      case 'intensity':
        return intensity > 0;
      case 'notes':
        return true;
      case 'system-changes':
        return true;
    }
  };

  const getProgressSteps = () => {
    if (currentStep === 'system-changes') {
      return []; // SystemicSymptomLogger handles its own progress
    }
    return ['selection', 'intensity', 'notes'];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Log Your Symptoms
            </CardTitle>
            {currentStep !== 'selection' && currentStep !== 'system-changes' && (
              <Button variant="ghost" size="sm" onClick={goBack}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Progress indicator for body symptoms only */}
          {currentStep !== 'selection' && currentStep !== 'system-changes' && (
            <div className="flex space-x-2 mb-6">
              {getProgressSteps().map((step, index) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    currentStep === step
                      ? 'bg-blue-500'
                      : index < getProgressSteps().indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}

          {renderCurrentStep()}

          {/* Action buttons for body symptoms only */}
          {currentStep !== 'selection' && currentStep !== 'system-changes' && (
            <div className="flex justify-between pt-6">
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
                  Save Symptom
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (currentStep === 'intensity') setCurrentStep('notes');
                  }}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              )}
            </div>
          )}

          {/* Back button for system changes */}
          {currentStep === 'system-changes' && (
            <div className="flex justify-start pt-6">
              <Button
                variant="outline"
                onClick={goBack}
              >
                ← Back to Body Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomLogger;