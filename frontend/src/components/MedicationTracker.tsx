import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pill, Clock, AlertCircle, Camera, Star } from 'lucide-react';
import { Medication } from '@/types/health';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface MedicationTrackerProps {
  medications: Medication[];
  onMedicationAdd: (medication: Omit<Medication, 'id'>) => void;
  onMedicationUpdate: (id: string, updates: Partial<Medication>) => void;
  className?: string;
}

const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  medications,
  onMedicationAdd,
  onMedicationUpdate,
  className
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMed, setEditingMed] = useState<string | null>(null);
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
                        onClick={() => {
                          const effectiveness = prompt('Rate effectiveness (1-10):');
                          if (effectiveness) {
                            onMedicationUpdate(medication.id, { 
                              effectiveness: parseInt(effectiveness) 
                            });
                          }
                        }}
                        className="flex-1"
                      >
                        Rate
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
                      {medication.effectiveness && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{medication.effectiveness}/10</span>
                        </div>
                      )}
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