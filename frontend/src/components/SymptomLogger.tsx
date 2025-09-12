import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Check, User, Activity } from 'lucide-react';
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

type LoggingStep = 'selection' | 'intensity' | 'notes';

const SymptomLogger: React.FC<SymptomLoggerProps> = ({
  symptoms,
  onSymptomAdd,
  userConditions = []
}) => {
  const [activeTab, setActiveTab] = useState<'body' | 'systems'>('body');
  const [currentStep, setCurrentStep] = useState<LoggingStep>('selection');
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
    
    // Auto-select if there's only one common symptom
    const suggestions = getFilteredSuggestions(bodyPartId);
    if (suggestions.length === 1) {
      setSelectedSuggestion(suggestions[0]);
      setCurrentStep('intensity');
    } else {
      setCurrentStep('intensity'); // Skip suggestion step for now, go straight to intensity
    }
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

  const renderBodySymptomLogger = () => {
    if (currentStep === 'selection') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Where are you experiencing symptoms?
            </h2>
            <p className="text-gray-600">
              Click on body parts to zoom in and select specific areas
            </p>
          </div>
          <ZoomableBodyMap
            onBodyPartClick={handleBodyPartClick}
            symptoms={symptoms}
            selectedBodyPart={selectedBodyPart}
          />
        </div>
      );
    }

    if (currentStep === 'intensity') {
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
    }

    if (currentStep === 'notes') {
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
    }

    return null;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'selection':
        return selectedBodyPart !== '';
      case 'intensity':
        return intensity > 0;
      case 'notes':
        return true;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Log Your Symptoms</CardTitle>
            {currentStep !== 'selection' && activeTab === 'body' && (
              <Button variant="ghost" size="sm" onClick={goBack}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'body' | 'systems')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="body" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Body Parts</span>
              </TabsTrigger>
              <TabsTrigger value="systems" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>System Changes</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="body" className="mt-6">
              {activeTab === 'body' && (
                <>
                  {/* Progress indicator for body symptoms */}
                  {currentStep !== 'selection' && (
                    <div className="flex space-x-2 mb-6">
                      {['selection', 'intensity', 'notes'].map((step, index) => (
                        <div
                          key={step}
                          className={`h-2 flex-1 rounded-full transition-colors ${
                            currentStep === step
                              ? 'bg-blue-500'
                              : index < ['selection', 'intensity', 'notes'].indexOf(currentStep)
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {renderBodySymptomLogger()}

                  {/* Action buttons for body symptoms */}
                  {currentStep !== 'selection' && (
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
                </>
              )}
            </TabsContent>

            <TabsContent value="systems" className="mt-6">
              <SystemicSymptomLogger
                onSymptomAdd={onSymptomAdd}
                userConditions={userConditions}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomLogger;