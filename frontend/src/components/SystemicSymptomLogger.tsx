import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, Sparkles, Camera, AlertTriangle } from 'lucide-react';
import { systemicSymptoms, SystemicCategory, colorChangingFoods } from '@/data/systemicSymptoms';
import { SymptomSuggestion, Symptom, SymptomPhoto, SymptomMeasurement } from '@/types/health';
import IntensitySelector from './IntensitySelector';
import PhotoCapture from './PhotoCapture';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface SystemicSymptomLoggerProps {
  onSymptomAdd: (symptom: Omit<Symptom, 'id'>) => void;
  userConditions?: string[];
  className?: string;
}

type LoggingStep = 'categories' | 'symptoms' | 'intensity' | 'photos' | 'food-history' | 'notes';

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
  const [photos, setPhotos] = useState<SymptomPhoto[]>([]);
  const [measurements, setMeasurements] = useState<SymptomMeasurement[]>([]);
  const [consumedFoods, setConsumedFoods] = useState<string[]>([]);
  const [customFoods, setCustomFoods] = useState<string>('');

  const handleCategorySelect = (category: SystemicCategory) => {
    setSelectedCategory(category);
    setCurrentStep('symptoms');
  };

  const handleSuggestionSelect = (suggestion: SymptomSuggestion) => {
    setSelectedSuggestion(suggestion);
    setCurrentStep('intensity');
  };

  const handleIntensitySelect = (selectedIntensity: number) => {
    setIntensity(selectedIntensity);
    
    // Determine next step based on symptom requirements
    if (selectedSuggestion?.requiresPhoto) {
      setCurrentStep('photos');
    } else if (selectedSuggestion?.requiresFoodHistory) {
      setCurrentStep('food-history');
    } else {
      setCurrentStep('notes');
    }
  };

  const handlePhotosComplete = () => {
    if (selectedSuggestion?.requiresFoodHistory) {
      setCurrentStep('food-history');
    } else {
      setCurrentStep('notes');
    }
  };

  const handleFoodHistoryComplete = () => {
    setCurrentStep('notes');
  };

  const handlePhotoAdd = (photo: Omit<SymptomPhoto, 'id'>) => {
    const newPhoto: SymptomPhoto = {
      ...photo,
      id: Date.now().toString()
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  const handleMeasurementAdd = (measurement: Omit<SymptomMeasurement, 'id'>) => {
    const newMeasurement: SymptomMeasurement = {
      ...measurement,
      id: Date.now().toString()
    };
    setMeasurements(prev => [...prev, newMeasurement]);
  };

  const handleFoodToggle = (food: string, checked: boolean) => {
    if (checked) {
      setConsumedFoods(prev => [...prev, food]);
    } else {
      setConsumedFoods(prev => prev.filter(f => f !== food));
    }
  };

  const handleSaveSymptom = () => {
    if (!selectedCategory || !selectedSuggestion || intensity === 0) return;

    const symptomType = selectedSuggestion.id === 'custom' ? customSymptom : selectedSuggestion.text;
    
    // Combine consumed foods with custom foods
    const allFoods = [...consumedFoods];
    if (customFoods.trim()) {
      allFoods.push(...customFoods.split(',').map(f => f.trim()).filter(f => f));
    }
    
    const newSymptom: Omit<Symptom, 'id'> = {
      bodyPartId: selectedCategory.id,
      bodyPartName: selectedCategory.name,
      type: symptomType,
      intensity,
      notes: notes.trim() || undefined,
      timestamp: new Date(),
      photos: photos.length > 0 ? photos : undefined,
      measurements: measurements.length > 0 ? measurements : undefined,
      foodHistory: allFoods.length > 0 ? allFoods : undefined
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
    setPhotos([]);
    setMeasurements([]);
    setConsumedFoods([]);
    setCustomFoods('');
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
      case 'photos':
        setCurrentStep('intensity');
        setIntensity(0);
        break;
      case 'food-history':
        if (selectedSuggestion?.requiresPhoto) {
          setCurrentStep('photos');
        } else {
          setCurrentStep('intensity');
        }
        break;
      case 'notes':
        if (selectedSuggestion?.requiresFoodHistory) {
          setCurrentStep('food-history');
        } else if (selectedSuggestion?.requiresPhoto) {
          setCurrentStep('photos');
        } else {
          setCurrentStep('intensity');
        }
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
                    {suggestion.requiresFoodHistory && (
                      <Badge variant="secondary" className="text-xs bg-white/80">🍽️</Badge>
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

  const renderPhotos = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Camera className="h-8 w-8 text-blue-500 mr-3" />
          <h3 className="text-2xl font-bold text-slate-800">
            Visual Documentation
          </h3>
        </div>
        <p className="text-slate-600 max-w-md mx-auto">
          Take photos to help track changes over time. This is especially important for skin conditions.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <PhotoCapture
          onPhotoAdd={handlePhotoAdd}
          onMeasurementAdd={handleMeasurementAdd}
          existingPhotos={photos}
          existingMeasurements={measurements}
        />
      </div>
    </div>
  );

  const renderFoodHistory = () => {
    const isUrineSymptom = selectedSuggestion?.id === 'blood-in-urine';
    const isStoolSymptom = selectedSuggestion?.id === 'blood-in-stool';
    const relevantFoods = isUrineSymptom ? colorChangingFoods.urine : colorChangingFoods.stool;
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-3" />
            <h3 className="text-2xl font-bold text-slate-800">
              Food & Medication History
            </h3>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Some foods and medications can cause color changes that might look like blood. 
            Have you consumed any of these in the last 24-48 hours?
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
            <h4 className="font-semibold text-orange-800 mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Important: This information helps distinguish between food coloring and actual blood
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantFoods.map((food) => (
                <div key={food} className="flex items-center space-x-3 p-2 bg-white/50 rounded-lg">
                  <Checkbox
                    id={food}
                    checked={consumedFoods.includes(food)}
                    onCheckedChange={(checked) => handleFoodToggle(food, checked as boolean)}
                  />
                  <label htmlFor={food} className="text-sm font-medium text-slate-700 cursor-pointer">
                    {food}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Other foods or medications not listed:
            </label>
            <Textarea
              value={customFoods}
              onChange={(e) => setCustomFoods(e.target.value)}
              placeholder="List any other foods, drinks, or medications you've had recently (separate with commas)..."
              className="min-h-[80px] border-orange-200 focus:border-orange-400"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Remember:</strong> Even if you've consumed these foods, it's still important to mention any 
              concerning changes to your healthcare provider, especially if symptoms persist or worsen.
            </p>
          </div>
        </div>
      </div>
    );
  };

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
          {photos.length > 0 && (
            <div className="text-sm text-slate-600 mt-1">
              📷 {photos.length} photo{photos.length > 1 ? 's' : ''} attached
            </div>
          )}
          {consumedFoods.length > 0 && (
            <div className="text-sm text-slate-600 mt-1">
              🍽️ Food history recorded ({consumedFoods.length} items)
            </div>
          )}
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
      case 'photos':
        return renderPhotos();
      case 'food-history':
        return renderFoodHistory();
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
      case 'photos':
        return true; // Photos are optional
      case 'food-history':
        return true; // Food history is optional
      case 'notes':
        return true;
    }
  };

  const getNextStep = () => {
    switch (currentStep) {
      case 'symptoms':
        return 'intensity';
      case 'intensity':
        if (selectedSuggestion?.requiresPhoto) return 'photos';
        if (selectedSuggestion?.requiresFoodHistory) return 'food-history';
        return 'notes';
      case 'photos':
        if (selectedSuggestion?.requiresFoodHistory) return 'food-history';
        return 'notes';
      case 'food-history':
        return 'notes';
      default:
        return 'notes';
    }
  };

  const handleNext = () => {
    const nextStep = getNextStep();
    if (nextStep === 'photos') {
      setCurrentStep('photos');
    } else if (nextStep === 'food-history') {
      setCurrentStep('food-history');
    } else {
      setCurrentStep('notes');
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
        
        <div className="flex space-x-2 mt-4">
          {['categories', 'symptoms', 'intensity', 'photos', 'food-history', 'notes'].map((step, index) => {
            // Skip steps that aren't needed for this symptom
            if (step === 'photos' && !selectedSuggestion?.requiresPhoto) return null;
            if (step === 'food-history' && !selectedSuggestion?.requiresFoodHistory) return null;
            
            return (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  currentStep === step
                    ? 'bg-white shadow-lg'
                    : index < ['categories', 'symptoms', 'intensity', 'photos', 'food-history', 'notes'].indexOf(currentStep)
                    ? 'bg-white/80'
                    : 'bg-white/30'
                }`}
              />
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-8 bg-gradient-to-b from-white to-slate-50">
        {renderCurrentStep()}

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
            ) : currentStep === 'photos' ? (
              <Button
                onClick={handlePhotosComplete}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue
              </Button>
            ) : currentStep === 'food-history' ? (
              <Button
                onClick={handleFoodHistoryComplete}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleNext}
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