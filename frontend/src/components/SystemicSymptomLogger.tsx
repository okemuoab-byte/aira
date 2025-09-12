import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-500 animate-pulse mr-3" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Changes
          </h2>
        </div>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Track changes in your body's systems beyond specific locations
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemicSymptoms.map((category, index) => (
          <Card
            key={category.id}
            className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-gradient-to-br from-white to-slate-50 overflow-hidden"
            onClick={() => handleCategorySelect(category)}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <CardContent className="p-8 text-center relative">
              {/* Premium background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {category.description}
                </p>
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {category.suggestions.length} options
                </div>
              </div>
              
              {/* Subtle border glow on hover */}
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300" />
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

    const getCategoryGradient = (category: string) => {
      switch (category) {
        case 'common':
          return 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-800';
        case 'condition-specific':
          return 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 text-purple-800';
        case 'visual':
          return 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 text-green-800';
        case 'measurable':
          return 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 text-orange-800';
        default:
          return 'from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200 text-gray-800';
      }
    };

    const renderSuggestionGroup = (groupSuggestions: SymptomSuggestion[], title: string) => {
      if (groupSuggestions.length === 0) return null;

      return (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            {title}
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {groupSuggestions.map((suggestion, index) => (
              <Button
                key={suggestion.id}
                variant="outline"
                onClick={() => handleSuggestionSelect(suggestion)}
                className={cn(
                  "justify-start text-left h-auto p-4 transition-all duration-300 bg-gradient-to-r border-2",
                  getCategoryGradient(suggestion.category),
                  selectedSuggestion?.id === suggestion.id && "ring-2 ring-blue-400 ring-offset-2 scale-105 shadow-lg",
                  "hover:scale-102 hover:shadow-md"
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInLeft 0.4s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">{suggestion.text}</span>
                  <div className="flex space-x-2">
                    {suggestion.requiresPhoto && (
                      <Badge variant="secondary" className="text-xs bg-white/80">📷</Badge>
                    )}
                    {suggestion.requiresMeasurement && (
                      <Badge variant="secondary" className="text-xs bg-white/80">📏</Badge>
                    )}
                    {suggestion.conditions && (
                      <Badge variant="secondary" className="text-xs bg-white/80">🎯</Badge>
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
      <div className="space-y-8">
        <div className="text-center">
          <div className="text-4xl mb-3">{selectedCategory.icon}</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            {selectedCategory.name}
          </h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Select the specific change you're experiencing
          </p>
        </div>

        <div className="space-y-8">
          {renderSuggestionGroup(commonSuggestions, 'Common Changes')}
          {renderSuggestionGroup(conditionSpecific, 'Based on Your Conditions')}
          {renderSuggestionGroup(visualSuggestions, 'Visual Changes')}
          {renderSuggestionGroup(measurableSuggestions, 'Measurable Changes')}
        </div>

        <div className="pt-6 border-t border-slate-200">
          <Button
            variant="ghost"
            onClick={() => handleSuggestionSelect({ id: 'custom', text: 'Something else...', category: 'common' })}
            className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-100 py-4 text-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Something else...
          </Button>
        </div>

        {selectedSuggestion?.id === 'custom' && (
          <div className="space-y-3 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <label className="text-sm font-semibold text-slate-700">
              Describe the change:
            </label>
            <Textarea
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder="e.g., unusual skin texture, new sleep pattern..."
              className="min-h-[100px] border-blue-200 focus:border-blue-400 bg-white/80"
            />
          </div>
        )}
      </div>
    );
  };

  const renderIntensity = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-4xl mb-3">{selectedCategory?.icon}</div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          {selectedSuggestion?.text}
        </h3>
        <p className="text-slate-600">
          How much is this affecting your daily life?
        </p>
      </div>
      <div className="max-w-lg mx-auto">
        <IntensitySelector
          intensity={intensity}
          onIntensityChange={handleIntensitySelect}
        />
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-500 mr-3" />
          <h3 className="text-2xl font-bold text-slate-800">
            Almost Complete!
          </h3>
        </div>
        <p className="text-slate-600">
          Add any additional details to help track this change
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="text-sm font-medium text-slate-600 mb-2">Summary:</div>
          <div className="text-lg font-bold text-slate-800">
            {selectedSuggestion?.text} - Impact Level: {intensity}/10
          </div>
          <div className="text-sm text-slate-600 mt-1">
            Category: {selectedCategory?.name}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">
            Additional details (optional):
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="When did you first notice this? What makes it better or worse? Any patterns you've observed..."
            className="min-h-[120px] border-blue-200 focus:border-blue-400 bg-white"
          />
        </div>
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
    <Card className={cn("w-full max-w-4xl mx-auto bg-gradient-to-br from-white to-slate-50 border-0 shadow-2xl", className)}>
      <CardHeader className="pb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center">
            <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
            System Changes
          </CardTitle>
          {currentStep !== 'categories' && (
            <Button variant="secondary" size="sm" onClick={goBack} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
        
        {/* Premium progress indicator */}
        <div className="flex space-x-2 mt-4">
          {['categories', 'symptoms', 'intensity', 'notes'].map((step, index) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                currentStep === step
                  ? 'bg-white shadow-lg'
                  : index < ['categories', 'symptoms', 'intensity', 'notes'].indexOf(currentStep)
                  ? 'bg-white/80'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-8 bg-gradient-to-b from-white to-slate-50">
        {renderCurrentStep()}

        {/* Premium action buttons */}
        {currentStep !== 'categories' && (
          <div className="flex justify-between pt-8 max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={goBack}
              className="px-8 py-3 border-slate-300 hover:bg-slate-100"
            >
              Back
            </Button>

            {currentStep === 'notes' ? (
              <Button
                onClick={handleSaveSymptom}
                disabled={!canProceed()}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemicSymptomLogger;