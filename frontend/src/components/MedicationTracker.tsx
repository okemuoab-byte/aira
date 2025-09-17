import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Pill, Clock, AlertCircle, Camera, Star, Shield, Phone, AlertTriangle, Info, Zap } from 'lucide-react';
import { Medication } from '@/types/health';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface MedicationTrackerProps {
  medications: Medication[];
  onMedicationAdd: (medication: Omit<Medication, 'id'>) => void;
  onMedicationUpdate: (id: string, updates: Partial<Medication>) => void;
  className?: string;
}

// Common drug interactions and safety information database
const DRUG_SAFETY_INFO: Record<string, {
  commonInteractions: string[];
  foodInteractions: string[];
  sideEffects: string[];
  emergencySignsImmediate: string[];
  emergencySignsUrgent: string[];
  contraindications: string[];
  specialWarnings: string[];
}> = {
  'metformin': {
    commonInteractions: ['Alcohol (increases lactic acidosis risk)', 'Contrast dyes (kidney damage)', 'Diuretics', 'Corticosteroids'],
    foodInteractions: ['Limit alcohol consumption', 'Take with food to reduce stomach upset'],
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset', 'Metallic taste', 'Vitamin B12 deficiency (long-term)'],
    emergencySignsImmediate: ['Severe stomach pain', 'Muscle pain/weakness', 'Trouble breathing', 'Unusual drowsiness', 'Cold/blue skin'],
    emergencySignsUrgent: ['Persistent vomiting', 'Severe diarrhea', 'Signs of dehydration', 'Unusual fatigue'],
    contraindications: ['Kidney disease', 'Liver disease', 'Heart failure', 'Recent heart attack'],
    specialWarnings: ['Stop before surgery or medical procedures', 'Monitor kidney function regularly']
  },
  'lisinopril': {
    commonInteractions: ['NSAIDs (ibuprofen, naproxen)', 'Potassium supplements', 'Diuretics', 'Lithium'],
    foodInteractions: ['Avoid salt substitutes with potassium', 'Limit alcohol'],
    sideEffects: ['Dry cough', 'Dizziness', 'Headache', 'Fatigue', 'Nausea'],
    emergencySignsImmediate: ['Swelling of face/lips/tongue/throat', 'Difficulty breathing', 'Severe dizziness/fainting', 'Chest pain'],
    emergencySignsUrgent: ['Persistent dry cough', 'Signs of high potassium (muscle weakness)', 'Kidney problems (decreased urination)'],
    contraindications: ['Pregnancy', 'History of angioedema', 'Bilateral renal artery stenosis'],
    specialWarnings: ['Can cause birth defects - notify doctor if pregnant', 'Monitor blood pressure regularly']
  },
  'warfarin': {
    commonInteractions: ['Aspirin', 'NSAIDs', 'Antibiotics', 'Antifungals', 'Many herbal supplements'],
    foodInteractions: ['Consistent vitamin K intake (leafy greens)', 'Limit alcohol', 'Avoid cranberry juice'],
    sideEffects: ['Easy bruising', 'Bleeding gums', 'Nosebleeds', 'Heavy menstrual periods'],
    emergencySignsImmediate: ['Severe bleeding', 'Blood in urine/stool', 'Coughing up blood', 'Severe headache', 'Vision changes'],
    emergencySignsUrgent: ['Unusual bruising', 'Prolonged bleeding from cuts', 'Black/tarry stools', 'Pink/red urine'],
    contraindications: ['Active bleeding', 'Severe liver disease', 'Recent surgery', 'Pregnancy'],
    specialWarnings: ['Regular INR monitoring required', 'Carry medical alert card', 'Inform all healthcare providers']
  }
};

const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  medications,
  onMedicationAdd,
  onMedicationUpdate,
  className
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<string | null>(null);
  const [selectedMedForSafety, setSelectedMedForSafety] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'once-daily',
    times: ['09:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    pillPhoto: '',
    reminderEnabled: true,
    sideEffects: [] as string[],
    effectiveness: 0
  });

  const frequencyOptions = [
    { value: 'once-daily', label: 'Once daily', times: 1 },
    { value: 'twice-daily', label: 'Twice daily', times: 2 },
    { value: 'three-times-daily', label: 'Three times daily', times: 3 },
    { value: 'four-times-daily', label: 'Four times daily', times: 4 },
    { value: 'as-needed', label: 'As needed', times: 0 },
    { value: 'weekly', label: 'Weekly', times: 1 },
    { value: 'custom', label: 'Custom schedule', times: 0 }
  ];

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
      pillPhoto: '',
      reminderEnabled: true,
      sideEffects: [],
      effectiveness: 0
    });
    setShowAddForm(false);
    setEditingMed(null);
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
      pillPhoto: medication.pillPhoto || '',
      reminderEnabled: medication.reminderEnabled ?? true,
      sideEffects: medication.sideEffects || [],
      effectiveness: medication.effectiveness || 0
    });
    setEditingMed(medication.id);
    setShowAddForm(true);
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

  const getSafetyInfo = (medicationName: string) => {
    const drugName = medicationName.toLowerCase();
    for (const [key, info] of Object.entries(DRUG_SAFETY_INFO)) {
      if (drugName.includes(key)) {
        return info;
      }
    }
    return null;
  };

  const renderSafetyInformation = (medication: Medication) => {
    const safetyInfo = getSafetyInfo(medication.name);
    
    return (
      <div className="space-y-6">
        {/* Emergency Warning - Always show */}
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">🚨 EMERGENCY - Call 911 or go to ER immediately if you experience:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Severe allergic reaction (difficulty breathing, swelling of face/throat)</li>
              <li>Chest pain or heart problems</li>
              <li>Severe bleeding that won't stop</li>
              <li>Loss of consciousness or severe confusion</li>
              <li>Signs of overdose or poisoning</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Contact Healthcare Provider */}
        <Alert className="border-orange-500 bg-orange-50">
          <Phone className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-semibold mb-2">📞 Contact your healthcare provider if you experience:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>New or worsening side effects</li>
              <li>Signs of infection (fever, chills)</li>
              <li>Unusual symptoms or changes in health</li>
              <li>Questions about your medication</li>
            </ul>
          </AlertDescription>
        </Alert>

        {safetyInfo ? (
          <>
            {/* Drug Interactions */}
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-yellow-800">
                  <Zap className="h-5 w-5 mr-2" />
                  Drug Interactions to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Do NOT take with:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    {safetyInfo.commonInteractions.map((interaction, index) => (
                      <li key={index}>{interaction}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">🍽️ Food & Drink Interactions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    {safetyInfo.foodInteractions.map((interaction, index) => (
                      <li key={index}>{interaction}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Signs - Medication Specific */}
            <Card className="border-red-400 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-red-800">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Emergency Warning Signs for {medication.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">🚨 IMMEDIATE EMERGENCY (Call 911):</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {safetyInfo.emergencySignsImmediate.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ URGENT (Contact doctor immediately):</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {safetyInfo.emergencySignsUrgent.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Side Effects */}
            <Card className="border-blue-300 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-blue-800">
                  <Info className="h-5 w-5 mr-2" />
                  Common Side Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 mb-3">These are usually mild and may improve over time:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                  {safetyInfo.sideEffects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contraindications */}
            <Card className="border-purple-300 bg-purple-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-purple-800">
                  <Shield className="h-5 w-5 mr-2" />
                  Important Warnings & Contraindications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">🚫 Do NOT use if you have:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                    {safetyInfo.contraindications.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-purple-800 mb-2">⚠️ Special Warnings:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                    {safetyInfo.specialWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-gray-300 bg-gray-50">
            <CardContent className="p-6 text-center">
              <Info className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                Specific safety information for "{medication.name}" is not available in our database.
              </p>
              <Alert className="border-blue-500 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Important:</strong> Always consult your pharmacist or healthcare provider for complete 
                  safety information, drug interactions, and proper usage instructions for this medication.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* General Disclaimer */}
        <Alert className="border-gray-400 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only and does not 
            replace professional medical advice. Always consult your healthcare provider or pharmacist for 
            complete medication information, proper dosing, and personalized medical advice.
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

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medications</h2>
          <p className="text-gray-600">Track your medications and never miss a dose</p>
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
            <CardTitle>{editingMed ? 'Edit Medication' : 'Add New Medication'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Medication Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Metformin, Lisinopril"
                />
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
                Safety Information: {medications.find(m => m.id === selectedMedForSafety)?.name}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedMedForSafety(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {renderSafetyInformation(medications.find(m => m.id === selectedMedForSafety)!)}
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
                <p className="text-sm text-gray-500">Add your first medication to get started</p>
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
                        onClick={() => setSelectedMedForSafety(medication.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Safety Info
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
                          onClick={() => setSelectedMedForSafety(medication.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        >
                          <Shield className="h-4 w-4" />
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