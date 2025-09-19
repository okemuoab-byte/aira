import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Check, User, Activity, Sparkles, ArrowRight, Heart, Mic, FileText } from 'lucide-react';
import ZoomableBodyMap from './ZoomableBodyMap';
import SystemicSymptomLogger from './SystemicSymptomLogger';
import IntensitySelector from './IntensitySelector';
import VoiceRecorder from './VoiceRecorder';
import { Symptom, SymptomSuggestion, VoiceRecording } from '@/types/health';
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
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording | null>(null);

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

  const handleVoiceRecordingSave = (audioBlob: Blob, duration: number, transcript?: string) => {
    const recording: VoiceRecording = {
      id: Date.now().toString(),
      audioBlob,
      duration,
      timestamp: new Date(),
      transcript,
      fileSize: audioBlob.size
    };
    setVoiceRecording(recording);
    showSuccess('Voice recording saved');
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
      coordinates: selectedCoordinates || undefined,
      voiceRecording: voiceRecording || undefined
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
    setVoiceRecording(null);
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
            Choose a specific body part or track general health changes
          </p>
        </div>

        {/* Body Map */}
        <ZoomableBodyMap
          onBodyPartClick={handleBodyPartClick}
          symptoms={symptoms}
          selectedBodyPart={selectedBodyPart}
        />

        {/* Enhanced General Health Changes Integration */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 w-px h-8 bg-gradient-to-b from-blue-300 to-purple-300"></div>
          
          {/* Connection Dots */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="flex justify-center">
            <Card 
              className="cursor-pointer transition-all duration-500 hover:scale-105 border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 hover:shadow-2xl max-w-lg relative overflow-hidden group"
              onClick={handleSystemChangesSelect}
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-8 right-6 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-6 left-8 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
              </div>
              
              <CardContent className="p-8 text-center relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Heart className="h-10 w-10 text-white animate-pulse" />
                    </div>
                    {/* Ripple effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping opacity-20"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-pink-300 animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-purple-800 mb-3 group-hover:text-purple-900 transition-colors">
                  General Health Changes
                </h3>
                
                <p className="text-purple-700 text-base mb-6 leading-relaxed">
                  Track changes that affect your overall wellbeing like energy, mood, sleep, appetite, or skin changes
                </p>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-purple-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>6 categories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Whole-body tracking</span>
                  </div>
                </div>
                
                {/* Call to action */}
                <div className="flex items-center justify-center space-x-2 text-purple-700 font-medium group-hover:text-purple-800 transition-colors">
                  <span>Tap to explore</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-slate-700 font-medium">
            💡 <strong>Choose your approach:</strong> Use the body map above for location-specific symptoms, or "General Health Changes" for symptoms that affect your whole body like fatigue, mood changes, or sleep issues.
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
            Add details by typing or speaking - whatever feels easier for you
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">Summary:</div>
          <div className="font-medium">
            {selectedBodyPartName} discomfort - Intensity: {intensity}/10
          </div>
          {voiceRecording && (
            <div className="text-sm text-green-600 mt-1 flex items-center">
              <Mic className="h-3 w-3 mr-1" />
              Voice recording attached ({Math.round(voiceRecording.duration)}s)
            </div>
          )}
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Type Details</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Voice Description</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4 mt-6">
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
          </TabsContent>
          
          <TabsContent value="voice" className="mt-6">
            <VoiceRecorder
              onAudioSave={handleVoiceRecordingSave}
              existingAudio={voiceRecording ? {
                blob: voiceRecording.audioBlob,
                duration: voiceRecording.duration,
                transcript: voiceRecording.transcript
              } : undefined}
              maxDuration={300} // 5 minutes
            />
          </TabsContent>
        </Tabs>
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