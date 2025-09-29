
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Pill, Clock, AlertCircle, Camera, Star, Shield, Phone, AlertTriangle, Info, Zap, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { Medication } from '@/types/health';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

interface MedicationTrackerProps {
  medications: Medication[];
  onMedicationAdd: (medication: Omit<Medication, 'id'>) => void;
  onMedicationUpdate: (id: string, updates: Partial<Medication>) => void;
  className?: string;
}

// AI Response Interfaces
interface MedicationSuggestion {
  name: string;
  generic_name: string;
  purpose: string;
  reasoning: string;
  confidence_score: number;
}

interface SafetyInformation {
  medication_name: string;
  emergency_warnings: string[];
  common_side_effects: string[];
  serious_side_effects: string[];
  drug_interactions: string[];
  contraindications: string[];
  special_precautions: string[];
  dosage_considerations: string[];
}

interface AIResponse<T> {
  success: boolean;
  data?: T;
  suggestions?: MedicationSuggestion[];
  safety_info?: SafetyInformation;
  disclaimer: string;
  ai_generated: boolean;
  error?: string;
}

interface MedicationPurpose {
  medication_name: string;
  primary_purpose: string;
  secondary_purposes: string[];
  mechanism_of_action: string;
  therapeutic_class: string;
}

const API_BASE_URL = 'http://localhost:8000/api/v1';

const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  medications,
  onMedicationAdd,
  onMedicationUpdate,
  className
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<string | null>(null);
  const [selectedMedForSafety, setSelectedMedForSafety] = useState<string | null>(null);
  
  // AI-related state
  const [suggestions, setSuggestions] = useState<MedicationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingSafety, setLoadingSafety] = useState(false);
  const [safetyInfo, setSafetyInfo] = useState<SafetyInformation | null>(null);
  const [medicationPurpose, setMedicationPurpose] = useState<MedicationPurpose | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once-daily',
    times: ['09:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    purpose: '', // New purpose field
    pillPhoto: '',
    reminderEnabled: true,
    sideEffects: [] as string[],
    effectiveness: 0
  });

  // Refs for debouncing
  const suggestionTimeoutRef = useRef<NodeJS.Timeout>();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const frequencyOptions = [
    { value: 'once-daily', label: 'Once daily', times: 1 },
    { value: 'twice-daily', label: 'Twice daily', times: 2 },
    { value: 'three-times-daily', label: 'Three times daily', times: 3 },
    { value: 'four-times-daily', label: 'Four times daily', times: 4 },
    { value: 'as-needed', label: 'As needed', times: 0 },
    { value: 'weekly', label: 'Weekly', times: 1 },
    { value: 'custom', label: 'Custom schedule', times: 0 }
  ];

  // Get auth token from localStorage
  const getAuthToken = () => localStorage.getItem('auth_token');

  // API call to get medication suggestions
  const fetchMedicationSuggestions = useCallback(async (query: string, purpose?: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const token = getAuthToken();
      const url = new URL(`${API_BASE_URL}/medications/suggestions`);
      url.searchParams.append('query', query);
      if (purpose) {
        url.searchParams.append('purpose', purpose);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: AIResponse<MedicationSuggestion[]> = await response.json();
        if (data.success && data.suggestions) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error fetching medication suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // API call to get AI-powered safety information
  const fetchSafetyInformation = useCallback(async (medicationId: string) => {
    setLoadingSafety(true);
    setSafetyInfo(null);
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/medications/${medicationId}/safety`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.safety_info) {
          setSafetyInfo(data.safety_info);
        }
      }
    } catch (error) {
      console.error('Error fetching safety information:', error);
      showError('Failed to load AI-powered safety information');
    } finally {
      setLoadingSafety(false);
    }
  }, []);

  // API call to get medication purpose analysis
  const fetchMedicationPurpose = useCallback(async (medicationName: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/medications/${encodeURIComponent(medicationName)}/purpose`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: MedicationPurpose = await response.json();
        setMedicationPurpose(data);
      }
    } catch (error) {
      console.error('Error fetching medication purpose:', error);
    }
  }, []);

  // Debounced medication name input handler
  const handleNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    
    // Clear existing timeout
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    // Set new timeout for debounced API call
    suggestionTimeoutRef.current = setTimeout(() => {
      fetchMedicationSuggestions(value, formData.purpose || undefined);
    }, 300); // 300ms debounce
  }, [fetchMedicationSuggestions, formData.purpose]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: MedicationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      purpose: suggestion.purpose
    }));
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Fetch detailed purpose information
    fetchMedicationPurpose(suggestion.name);
  }, [fetchMedicationPurpose]);

  // Handle purpose field change
  const handlePurposeChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, purpose: value }));
    
    // Re-fetch suggestions if name exists
    if (formData.name.length >= 2) {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      suggestionTimeoutRef.current = setTimeout(() => {
        fetchMedicationSuggestions(formData.name, value || undefined);
      }, 300);
    }
  }, [fetchMedicationSuggestions, formData.name]);

  const getDefaultTimes = (frequency: string) => {
    switch (frequency) {
      case 'once-daily': return ['09:00'];
      case 'twice-daily': return ['09:00', '21:00'];
      case 'three-times-daily': return ['08:00', '14:00', '20:00'];
      case 'four-times-daily': return ['08:00', '12:00', '16:00', '20:00'];
      default: return ['09:00'];
    }
  };

  const handleFrequencyChange = (frequency: string) => {
    setFormData(prev => ({
      ...prev,
      frequency,
      times: getDefaultTimes(frequency)
    }));
  };

  const handleTimeChange = (index: number, time: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t)
    }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, '09:00']
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.dosage) return;

    const medication: Omit<Medication, 'id'> = {
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: formData.times,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      notes: formData.notes || undefined,
      pillPhoto: formData.pillPhoto || undefined,
      reminderEnabled: formData.reminderEnabled,
      sideEffects: formData.sideEffects,
      effectiveness: formData.effectiveness || undefined
    };

    if (editingMed) {
      onMedicationUpdate(editingMed, medication);
      showSuccess(`${formData.name} updated successfully`);
    } else {
      onMedicationAdd(medication);
      showSuccess(`${formData.name} added to your medications`);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'once-daily',
      times: ['09:00'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      purpose: '',
      pillPhoto: '',
      reminderEnabled: true,
      sideEffects: [],
      effectiveness: 0
    });
    setShowAddForm(false);
    setEditingMed(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setMedicationPurpose(null);
  };

  const startEdit = (medication: Medication) => {
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      times: medication.times || ['09:00'],
      startDate: medication.startDate.toISOString().split('T')[0],
      endDate: medication.endDate?.toISOString().split('T')[0] || '',
      notes: medication.notes || '',
      purpose: '', // Will be fetched from AI
      pillPhoto: medication.pillPhoto || '',
      reminderEnabled: medication.reminderEnabled ?? true,
      sideEffects: medication.sideEffects || [],
      effectiveness: medication.effectiveness || 0
    });
    setEditingMed(medication.id);
    setShowAddForm(true);
    
    // Fetch purpose information for existing medication
    fetchMedicationPurpose(medication.name);
  };

  const getFrequencyDisplay = (medication: Medication) => {
    const option = frequencyOptions.find(opt => opt.value === medication.frequency);
    return option?.label || medication.frequency;
  };

  const getNextDoseTime = (medication: Medication) => {
    if (!medication.times || medication.times.length === 0) return null;
    
    const now = new Date();
    const today = now.toDateString();
    
    for (const time of medication.times) {
      const doseTime = new Date(`${today} ${time}`);
      if (doseTime > now) {
        return doseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
    
    // Next dose is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();
    const firstDose = new Date(`${tomorrowStr} ${medication.times[0]}`);
    return `Tomorrow ${firstDose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Handle safety info modal
  const handleSafetyInfoClick = (medication: Medication) => {
    setSelectedMedForSafety(medication.id);
    fetchSafetyInformation(medication.id);
  };

  // Render AI-powered safety information
  const renderAISafetyInformation = (medication: Medication) => {
    if (loadingSafety) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Loading AI-powered safety information...</span>
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    if (!safetyInfo) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load safety information</p>
          <Button 
            variant="outline" 
            onClick={() => fetchSafetyInformation(medication.id)}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* AI-Generated Badge */}
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Safety Information
          </Badge>
        </div>

        {/* Emergency Warnings */}
        {safetyInfo.emergency_warnings.length > 0 && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-semibold mb-2">🚨 EMERGENCY - Seek immediate medical attention if you experience:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {safetyInfo.emergency_warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Drug Interactions */}
        {safetyInfo.drug_interactions.length > 0 && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-yellow-800">
                <Zap className="h-5 w-5 mr-2" />
                Drug Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {safetyInfo.drug_interactions.map((interaction, index) => (
                  <li key={index}>{interaction}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Side Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyInfo.common_side_effects.length > 0 && (
            <Card className="border-blue-300 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center text-blue-800">
                  <Info className="h-4 w-4 mr-2" />
                  Common Side Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                  {safetyInfo.common_side_effects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {safetyInfo.serious_side_effects.length > 0 && (
            <Card className="border-orange-300 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center text-orange-800">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Serious Side Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                  {safetyInfo.serious_side_effects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contraindications */}
        {safetyInfo.contraindications.length > 0 && (
          <Card className="border-purple-300 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-purple-800">
                <Shield className="h-5 w-5 mr-2" />
                Contraindications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                {safetyInfo.contraindications.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Special Precautions */}
        {safetyInfo.special_precautions.length > 0 && (
          <Card className="border-gray-300 bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-gray-800">
                <Info className="h-5 w-5 mr-2" />
                Special Precautions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {safetyInfo.special_precautions.map((precaution, index) => (
                  <li key={index}>{precaution}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Medical Disclaimer */}
        <Alert className="border-gray-400 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            <strong>AI-Generated Medical Information:</strong> This information is generated by AI and is for educational purposes only. 
            It does not replace professional medical advice, diagnosis, or treatment. Always consult your healthcare provider 
            or pharmacist for complete medication information and personalized medical advice.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  const activeMedications = medications.filter(med => 
    !med.endDate || med.endDate > new Date()
  );

  const pastMedications = medications.filter(med => 
    med.endDate && med.endDate <= new Date()
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Pill className="h-6 w-6 mr-2" />
            Medications
            <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Enhanced
            </Badge>
          </h2>
          <p className="text-gray-600">Track your medications with AI-powered assistance</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {editingMed ? 'Edit Medication' : 'Add New Medication'}
              <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Assisted
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Medication Name with AI Suggestions */}
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Medication Name
                  <Sparkles className="h-3 w-3 ml-1 text-blue-500" />
                </label>
                <div className="relative">
                  <Input
                    ref={nameInputRef}
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Start typing medication name..."
                    className="pr-8"
                  />
                  {loadingSuggestions && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
                
                {/* AI Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <Card className="absolute z-10 w-full mt-1 border-blue-200 bg-white shadow-lg">
                    <CardContent className="p-2">
                      <div className="text-xs text-blue-600 mb-2 flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI-Powered Suggestions
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-blue-50 cursor-pointer rounded border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <div className="font-medium text-sm">{suggestion.name}</div>
                          <div className="text-xs text-gray-600">{suggestion.purpose}</div>
                          <div className="text-xs text-blue-600 mt-1">
                            Confidence: {Math.round(suggestion.confidence_score * 100)}%
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Dosage</label>
                <Input
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="e.g., 500mg, 10mg, 1 tablet"
                />
              </div>
            </div>

            {/* Purpose/Indication Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Purpose/Indication (Optional)
                <Sparkles className="h-3 w-3 ml-1 text-blue-500" />
              </label>
              <Input
                value={formData.purpose}
                onChange={(e) => handlePurposeChange(e.target.value)}
                placeholder="e.g., High blood pressure, Diabetes, Pain relief..."
              />
              {medicationPurpose && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-1">
                    AI Analysis: {medicationPurpose.primary_purpose}
                  </div>
                  <div className="text-xs text-blue-600">
                    Class: {medicationPurpose.therapeutic_class}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {frequencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.frequency !== 'as-needed' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Reminder Times</label>
                <div className="space-y-2">
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {formData.times.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTimeSlot}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date (optional)</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Take with food, avoid alcohol, etc."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reminderEnabled"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="reminderEnabled" className="text-sm text-gray-700">
                Enable friendly reminders
              </label>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.dosage}>
                {editingMed ? 'Update Medication' : 'Add Medication'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Information Modal */}
      {selectedMedForSafety && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="bg-red-100 border-b border-red-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center text-red-800">
                <Shield className="h-6 w-6 mr-2" />
                AI Safety Information: {medications.find(m => m.id === selectedMedForSafety)?.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMedForSafety(null);
                  setSafetyInfo(null);
                }}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {renderAISafetyInformation(medications.find(m => m.id === selectedMedForSafety)!)}
          </CardContent>
        </Card>
      )}

      {/* Medications List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeMedications.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastMedications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeMedications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active medications</p>
                <p className="text-sm text-gray-500">Add your first medication to get started with AI assistance</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMedications.map((medication) => (
                <Card key={medication.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{medication.name}</CardTitle>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getFrequencyDisplay(medication)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {medication.reminderEnabled && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">Next dose:</span>
                        <span className="font-medium text-blue-600">
                          {getNextDoseTime(medication)}
                        </span>
                      </div>
                    )}

                    {medication.times && medication.times.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {medication.times.map((time, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {new Date(`2000-01-01 ${time}`).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {medication.effectiveness && medication.effectiveness > 0 && (
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          Effectiveness: {medication.effectiveness}/10
                        </span>
                      </div>
                    )}

                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">
                          {medication.sideEffects.length} side effect{medication.sideEffects.length > 1 ? 's' : ''} tracked
                        </span>
                      </div>
                    )}

                    {medication.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {medication.notes}
                      </p>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(medication)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSafetyInfoClick(medication)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        AI Safety
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMedications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No past medications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastMedications.map((medication) => (
                <Card key={medication.id} className="opacity-75">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{medication.name}</h4>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} • {getFrequencyDisplay(medication)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ended: {medication.endDate?.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {medication.effectiveness && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{medication.effectiveness}/10</span>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSafetyInfoClick(medication)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicationTracker;