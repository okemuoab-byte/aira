import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Check } from 'lucide-react';
import BodyMap from './BodyMap';
import SymptomSuggestions from './SymptomSuggestions';
import IntensitySelector from './IntensitySelector';
import { Symptom, SymptomSuggestion } from '@/types/health';
import { symptomSuggestions } from '@/data/bodyParts';
import { showSuccess } from '@/utils/toast';

interface SymptomLoggerProps {
  symptoms: Symptom[];
  onSymptomAdd: (symptom: Omit<Symptom, 'id'>) => void;
  userConditions?: string[];
}

type LoggingStep = 'body-map' | 'suggestions' | 'intensity' | 'notes';

const SymptomLogger: React.FC<SymptomLoggerProps> = ({
  symptoms,
  onSymptomAdd,
  userConditions = []
}) => {
  const [currentStep, setCurrentStep] = useState<LoggingStep>('body-map');
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
    setCurrentStep('suggestions');
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
    if (!selectedBodyPart || !selectedSuggestion || intensity === 0) return;

    const symptomType = selectedSuggestion.id === 'custom' ? customSymptom : selectedSuggestion.text;
    
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
    setCurrentStep('body-map');
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
      case 'suggestions':
        setCurrentStep('body-map');
        setSelectedBodyPart('');
        setSelectedBodyPartName('');
        break;
      case 'intensity':
        setCurrentStep('suggestions');
        setSelectedSuggestion(null);
        break;
      case 'notes':
        setCurrentStep('intensity');
        setIntensity(0);
        break;
    }
  };

  const getFilteredSuggestions = (): SymptomSuggestion[] => {
    const suggestions = symptomSuggestions[selectedBodyPart] || [];
    return suggestions.filter(suggestion => {
      if (suggestion.category === 'condition-specific') {
        return suggestion.conditions?.some(condition => userConditions.includes(condition));
      }
      return true;
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'body-map':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                How are you feeling today?
              </h2>
              <p className="text-gray-600">
                Tap the part of your body that's bothering you
              </p>
            </div>
            <BodyMap
              onBodyPartClick={handleBodyPartClick}
              symptoms={symptoms}
              selectedBodyPart={selectedBodyPart}
            />
          </div>
        );

      case 'suggestions':
        return (
          <div className="space-y-4">
            <SymptomSuggestions
              suggestions={getFilteredSuggestions()}
              onSuggestionSelect={handleSuggestionSelect}
              selectedSuggestion={selectedSuggestion}
              bodyPartName={selectedBodyPartName}
            />
            {selectedSuggestion?.id === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Describe your symptom:
                </label>
                <Textarea
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="e.g., burning sensation, tingling..."
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>
        );

      case 'intensity':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedSuggestion?.text} in your {selectedBodyPartName.toLowerCase()}
              </h3>
            </div>
            <IntensitySelector
              intensity={intensity}
              onIntensityChange={handleIntensitySelect}
            />
          </div>
        );

      case 'notes':
        return (
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
                {selectedSuggestion?.text} in {selectedBodyPartName} - Intensity: {intensity}/10
              </div>
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
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'body-map':
        return selectedBodyPart !== '';
      case 'suggestions':
        return selectedSuggestion !== null && (selectedSuggestion.id !== 'custom' || customSymptom.trim() !== '');
      case 'intensity':
        return intensity > 0;
      case 'notes':
        return true;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Log Symptoms</CardTitle>
          {currentStep !== 'body-map' && (
            <Button variant="ghost" size="sm" onClick={goBack}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="flex space-x-2 mt-4">
          {['body-map', 'suggestions', 'intensity', 'notes'].map((step, index) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-colors ${
                currentStep === step
                  ? 'bg-blue-500'
                  : index < ['body-map', 'suggestions', 'intensity', 'notes'].indexOf(currentStep)
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
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 'body-map'}
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
                if (currentStep === 'suggestions') setCurrentStep('intensity');
                else if (currentStep === 'intensity') setCurrentStep('notes');
              }}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SymptomLogger;