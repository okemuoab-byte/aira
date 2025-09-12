import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Activity, User, BookOpen, Pill, Users, Bell, Brain } from 'lucide-react';
import HealthDashboard from '@/components/HealthDashboard';
import SymptomLogger from '@/components/SymptomLogger';
import MedicationTracker from '@/components/MedicationTracker';
import MedicationReminder from '@/components/MedicationReminder';
import FamilyDashboard from '@/components/FamilyDashboard';
import HealthInsights from '@/components/HealthInsights';
import { Symptom, UserProfile, Medication, FamilyMember, MedicationReminder as MedicationReminderType } from '@/types/health';

const Index = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [medicationReminders, setMedicationReminders] = useState<MedicationReminderType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userProfile] = useState<UserProfile>({
    id: '1',
    name: 'Sarah',
    conditions: ['diabetes', 'arthritis'],
    medications: [],
    createdAt: new Date(),
    preferences: {
      photoReminders: true,
      progressionAlerts: true,
      familySharing: true,
      medicationReminders: true,
      reminderTone: 'gentle'
    }
  });

  const handleSymptomAdd = (newSymptom: Omit<Symptom, 'id'>) => {
    const symptom: Symptom = {
      ...newSymptom,
      id: Date.now().toString()
    };
    setSymptoms(prev => [symptom, ...prev]);
    setActiveTab('dashboard');
  };

  const handleMedicationAdd = (newMedication: Omit<Medication, 'id'>) => {
    const medication: Medication = {
      ...newMedication,
      id: Date.now().toString(),
      adherenceRate: 100,
      missedDoses: []
    };
    setMedications(prev => [medication, ...prev]);
  };

  const handleMedicationUpdate = (id: string, updates: Partial<Medication>) => {
    setMedications(prev => prev.map(med => 
      med.id === id ? { ...med, ...updates } : med
    ));
  };

  const handleFamilyMemberAdd = (newMember: Omit<FamilyMember, 'id'>) => {
    const member: FamilyMember = {
      ...newMember,
      id: Date.now().toString(),
      inviteStatus: 'pending',
      invitedDate: new Date()
    };
    setFamilyMembers(prev => [member, ...prev]);
  };

  const handleFamilyMemberUpdate = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));
  };

  const handleDoseTaken = (medicationId: string, timestamp: Date) => {
    console.log(`Dose taken for medication ${medicationId} at ${timestamp}`);
  };

  const handleDoseMissed = (medicationId: string, timestamp: Date) => {
    console.log(`Dose missed for medication ${medicationId} at ${timestamp}`);
  };

  const handleSnoozeReminder = (medicationId: string, minutes: number) => {
    console.log(`Reminder snoozed for medication ${medicationId} for ${minutes} minutes`);
  };

  const handleShareSettingsUpdate = (settings: any) => {
    console.log('Share settings updated:', settings);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const hasActiveReminders = medications.some(med => med.reminderEnabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Health Journey
                  </h1>
                  <div className="text-xs text-slate-500">AI-Powered Health Tracking</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                {getGreeting()}, {userProfile.name}
              </span>
              {hasActiveReminders && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('reminders')}
                  className="relative bg-white/50 backdrop-blur-sm hover:bg-white/80"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                </Button>
              )}
              <Button
                onClick={() => setActiveTab('log-symptoms')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Symptoms
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-[700px] bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="log-symptoms" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center space-x-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Meds</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center space-x-2 relative">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Reminders</span>
              {hasActiveReminders && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Family</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <HealthDashboard 
              symptoms={symptoms} 
              userName={userProfile.name}
            />
          </TabsContent>

          <TabsContent value="log-symptoms" className="space-y-6">
            <div className="flex justify-center">
              <SymptomLogger
                symptoms={symptoms}
                onSymptomAdd={handleSymptomAdd}
                userConditions={userProfile.conditions}
              />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <HealthInsights symptoms={symptoms} />
          </TabsContent>

          <TabsContent value="medications" className="space-y-6">
            <MedicationTracker
              medications={medications}
              onMedicationAdd={handleMedicationAdd}
              onMedicationUpdate={handleMedicationUpdate}
            />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <MedicationReminder
              medications={medications}
              onDoseTaken={handleDoseTaken}
              onDoseMissed={handleDoseMissed}
              onSnoozeReminder={handleSnoozeReminder}
            />
          </TabsContent>

          <TabsContent value="family" className="space-y-6">
            <FamilyDashboard
              familyMembers={familyMembers}
              symptoms={symptoms}
              medications={medications}
              onFamilyMemberAdd={handleFamilyMemberAdd}
              onFamilyMemberUpdate={handleFamilyMemberUpdate}
              onShareSettingsUpdate={handleShareSettingsUpdate}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="h-6 w-6 mr-2 text-blue-600" />
                  Your Profile
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Name</label>
                    <p className="text-lg text-gray-900 font-medium">{userProfile.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Health Conditions</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userProfile.conditions.map((condition) => (
                        <span
                          key={condition}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Active Medications</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {medications.filter(med => !med.endDate || med.endDate > new Date()).map((medication) => (
                        <span
                          key={medication.id}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium"
                        >
                          {medication.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Family Members</label>
                    <div className="text-sm text-gray-600 mt-1">
                      {familyMembers.length} family member{familyMembers.length !== 1 ? 's' : ''} connected
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Member Since</label>
                    <p className="text-gray-900 font-medium">
                      {userProfile.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Enhanced Quick Action Floating Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          onClick={() => setActiveTab('log-symptoms')}
          size="lg"
          className="rounded-full h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Index;