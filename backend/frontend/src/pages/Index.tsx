import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Activity, User, BookOpen, Pill, Users, Bell, Brain, Stethoscope, Calendar, FileText, Heart } from 'lucide-react';
import CombinedDashboard from '@/components/CombinedDashboard';
import SymptomLogger from '@/components/SymptomLogger';
import MedicationTracker from '@/components/MedicationTracker';
import MedicationReminder from '@/components/MedicationReminder';
import FamilyDashboard from '@/components/FamilyDashboard';
import FamilyHistorySection from '@/components/FamilyHistorySection';
import { Symptom, UserProfile, Medication, FamilyMember, MedicationReminder as MedicationReminderType, FamilyHistoryCondition } from '@/types/health';

const Index = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [medicationReminders, setMedicationReminders] = useState<MedicationReminderType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('log-symptoms'); // Changed default to log-symptoms
  const [userProfile] = useState<UserProfile>({
    id: '1',
    name: 'Sarah',
    birthday: new Date('1978-03-15'),
    gender: 'female',
    height: {
      value: 165,
      unit: 'cm'
    },
    weight: {
      value: 68,
      unit: 'kg',
      lastWeighed: new Date('2024-01-15')
    },
    lastHealthcareVisit: {
      id: '1',
      date: new Date('2024-01-08'),
      providerType: 'GP',
      providerName: 'Dr. Smith - Riverside Medical Centre',
      reasonForVisit: 'Routine diabetes check-up and joint pain assessment',
      summary: 'Discussed ongoing management of Type 2 diabetes. HbA1c levels stable at 7.2%. Patient reported increased joint stiffness in hands and knees, particularly in the morning. Blood pressure slightly elevated (145/90). Reviewed current medications and adjusted metformin dosage.',
      diagnosis: 'Type 2 Diabetes (stable), Osteoarthritis (hands, knees), Mild hypertension',
      treatmentPlan: 'Continue current diabetes management. Increase metformin to 1000mg twice daily. Start gentle exercise program for joint mobility. Monitor blood pressure at home.',
      followUpRequired: true,
      followUpDate: new Date('2024-04-08'),
      prescriptions: ['Metformin 1000mg twice daily', 'Ibuprofen gel for joint pain'],
      referrals: ['Physiotherapy for joint mobility exercises']
    },
    conditions: ['diabetes', 'arthritis'],
    medications: [],
    familyHistory: [
      {
        id: '1',
        condition: 'Type 2 Diabetes',
        familyMember: 'Mother',
        relationship: 'parent',
        ageOfOnset: 52,
        severity: 'moderate',
        notes: 'Managed with medication and diet',
        isUserAffected: true,
        riskLevel: 'high'
      },
      {
        id: '2',
        condition: 'Type 2 Diabetes',
        familyMember: 'Maternal Grandfather',
        relationship: 'grandparent',
        ageOfOnset: 65,
        severity: 'severe',
        notes: 'Required insulin in later years',
        isUserAffected: true,
        riskLevel: 'high'
      },
      {
        id: '3',
        condition: 'Heart Disease',
        familyMember: 'Father',
        relationship: 'parent',
        ageOfOnset: 58,
        severity: 'moderate',
        notes: 'Had bypass surgery at 62',
        isUserAffected: false,
        riskLevel: 'high'
      },
      {
        id: '4',
        condition: 'Osteoarthritis',
        familyMember: 'Mother',
        relationship: 'parent',
        ageOfOnset: 48,
        severity: 'mild',
        notes: 'Mainly affects hands and knees',
        isUserAffected: true,
        riskLevel: 'moderate'
      },
      {
        id: '5',
        condition: 'High Blood Pressure',
        familyMember: 'Father',
        relationship: 'parent',
        ageOfOnset: 45,
        severity: 'moderate',
        notes: 'Well controlled with medication',
        isUserAffected: false,
        riskLevel: 'moderate'
      },
      {
        id: '6',
        condition: 'High Blood Pressure',
        familyMember: 'Paternal Grandmother',
        relationship: 'grandparent',
        ageOfOnset: 55,
        severity: 'mild',
        isUserAffected: false,
        riskLevel: 'moderate'
      },
      {
        id: '7',
        condition: 'Breast Cancer',
        familyMember: 'Maternal Aunt',
        relationship: 'aunt_uncle',
        ageOfOnset: 42,
        severity: 'severe',
        notes: 'BRCA2 positive, successful treatment',
        isUserAffected: false,
        riskLevel: 'moderate'
      },
      {
        id: '8',
        condition: 'Glaucoma',
        familyMember: 'Maternal Grandmother',
        relationship: 'grandparent',
        ageOfOnset: 70,
        severity: 'mild',
        notes: 'Detected during routine eye exam',
        isUserAffected: false,
        riskLevel: 'low'
      }
    ],
    createdAt: new Date('2023-06-01'),
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
    setActiveTab('overview'); // Switch to overview after logging
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

  const calculateAge = (birthday: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatHeight = (height: UserProfile['height']): string => {
    if (height.unit === 'cm') {
      return `${height.value} cm`;
    } else if (height.unit === 'ft-in' && height.feet && height.inches !== undefined) {
      return `${height.feet}'${height.inches}"`;
    } else if (height.unit === 'inches') {
      return `${height.value} inches`;
    }
    return `${height.value} ${height.unit}`;
  };

  const formatWeight = (weight: UserProfile['weight']): string => {
    return `${weight.value} ${weight.unit}`;
  };

  const getDaysSinceWeighed = (lastWeighed: Date): number => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastWeighed.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysSinceVisit = (visitDate: Date): number => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - visitDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProviderIcon = (providerType: string) => {
    switch (providerType) {
      case 'GP': return '👨‍⚕️';
      case 'A&E': return '🚨';
      case 'Hospital': return '🏥';
      case 'Specialist': return '🩺';
      case 'Urgent Care': return '⚡';
      case 'Walk-in Clinic': return '🚶‍♂️';
      default: return '🏥';
    }
  };

  const getProviderColor = (providerType: string) => {
    switch (providerType) {
      case 'GP': return 'from-blue-50 to-blue-100 border-blue-200 text-blue-800';
      case 'A&E': return 'from-red-50 to-red-100 border-red-200 text-red-800';
      case 'Hospital': return 'from-purple-50 to-purple-100 border-purple-200 text-purple-800';
      case 'Specialist': return 'from-green-50 to-green-100 border-green-200 text-green-800';
      case 'Urgent Care': return 'from-orange-50 to-orange-100 border-orange-200 text-orange-800';
      case 'Walk-in Clinic': return 'from-teal-50 to-teal-100 border-teal-200 text-teal-800';
      default: return 'from-gray-50 to-gray-100 border-gray-200 text-gray-800';
    }
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
                variant="outline"
                onClick={() => setActiveTab('profile')}
                className="bg-white/50 backdrop-blur-sm hover:bg-white/80 border-gray-200"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
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
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px] bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="log-symptoms" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
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
          </TabsList>

          <TabsContent value="log-symptoms" className="space-y-6">
            <div className="flex justify-center">
              <SymptomLogger
                symptoms={symptoms}
                onSymptomAdd={handleSymptomAdd}
                userConditions={userProfile.conditions}
              />
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <CombinedDashboard 
              symptoms={symptoms}
              medications={medications}
              userName={userProfile.name}
            />
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
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{userProfile.name}</h3>
                      <p className="text-blue-100">
                        {calculateAge(userProfile.birthday)} years old • {userProfile.gender}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-8 space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                        <label className="text-sm font-semibold text-blue-700">Birthday</label>
                        <p className="text-lg text-blue-900 font-medium">
                          {userProfile.birthday.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-blue-600">Age: {calculateAge(userProfile.birthday)}</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                        <label className="text-sm font-semibold text-purple-700">Height</label>
                        <p className="text-lg text-purple-900 font-medium">
                          {formatHeight(userProfile.height)}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <label className="text-sm font-semibold text-green-700">Weight</label>
                        <p className="text-lg text-green-900 font-medium">
                          {formatWeight(userProfile.weight)}
                        </p>
                        <p className="text-sm text-green-600">
                          Last weighed: {userProfile.weight.lastWeighed.toLocaleDateString()} 
                          ({getDaysSinceWeighed(userProfile.weight.lastWeighed)} days ago)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Family History Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-600" />
                      Family Health History
                    </h4>
                    <FamilyHistorySection 
                      familyHistory={userProfile.familyHistory}
                      userConditions={userProfile.conditions}
                    />
                  </div>

                  {/* Last Healthcare Visit */}
                  {userProfile.lastHealthcareVisit && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Stethoscope className="h-5 w-5 mr-2 text-red-600" />
                        Recent Healthcare Visit
                      </h4>
                      <div className={`bg-gradient-to-br ${getProviderColor(userProfile.lastHealthcareVisit.providerType)} p-6 rounded-lg border`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{getProviderIcon(userProfile.lastHealthcareVisit.providerType)}</div>
                            <div>
                              <h5 className="font-semibold text-lg">{userProfile.lastHealthcareVisit.providerType}</h5>
                              {userProfile.lastHealthcareVisit.providerName && (
                                <p className="text-sm opacity-80">{userProfile.lastHealthcareVisit.providerName}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{userProfile.lastHealthcareVisit.date.toLocaleDateString()}</p>
                            <p className="text-sm opacity-80">{getDaysSinceVisit(userProfile.lastHealthcareVisit.date)} days ago</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h6 className="font-semibold mb-2 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Reason for Visit
                            </h6>
                            <p className="text-sm leading-relaxed">{userProfile.lastHealthcareVisit.reasonForVisit}</p>
                          </div>

                          <div>
                            <h6 className="font-semibold mb-2">Visit Summary</h6>
                            <p className="text-sm leading-relaxed">{userProfile.lastHealthcareVisit.summary}</p>
                          </div>

                          {userProfile.lastHealthcareVisit.diagnosis && (
                            <div>
                              <h6 className="font-semibold mb-2">Diagnosis</h6>
                              <p className="text-sm leading-relaxed">{userProfile.lastHealthcareVisit.diagnosis}</p>
                            </div>
                          )}

                          {userProfile.lastHealthcareVisit.treatmentPlan && (
                            <div>
                              <h6 className="font-semibold mb-2">Treatment Plan</h6>
                              <p className="text-sm leading-relaxed">{userProfile.lastHealthcareVisit.treatmentPlan}</p>
                            </div>
                          )}

                          {userProfile.lastHealthcareVisit.prescriptions && userProfile.lastHealthcareVisit.prescriptions.length > 0 && (
                            <div>
                              <h6 className="font-semibold mb-2">New Prescriptions</h6>
                              <ul className="text-sm space-y-1">
                                {userProfile.lastHealthcareVisit.prescriptions.map((prescription, index) => (
                                  <li key={index} className="flex items-center">
                                    <Pill className="h-3 w-3 mr-2" />
                                    {prescription}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {userProfile.lastHealthcareVisit.referrals && userProfile.lastHealthcareVisit.referrals.length > 0 && (
                            <div>
                              <h6 className="font-semibold mb-2">Referrals</h6>
                              <ul className="text-sm space-y-1">
                                {userProfile.lastHealthcareVisit.referrals.map((referral, index) => (
                                  <li key={index} className="flex items-center">
                                    <Stethoscope className="h-3 w-3 mr-2" />
                                    {referral}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {userProfile.lastHealthcareVisit.followUpRequired && userProfile.lastHealthcareVisit.followUpDate && (
                            <div className="bg-white/50 p-3 rounded-lg border border-white/50">
                              <h6 className="font-semibold mb-1 flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Follow-up Required
                              </h6>
                              <p className="text-sm">
                                Next appointment: {userProfile.lastHealthcareVisit.followUpDate.toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Health Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-600" />
                      Health Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Health Conditions</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {userProfile.conditions.map((condition) => (
                            <span
                              key={condition}
                              className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium border border-orange-200"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Active Medications</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {medications.filter(med => !med.endDate || med.endDate > new Date()).length === 0 ? (
                            <span className="text-gray-500 text-sm">No active medications</span>
                          ) : (
                            medications.filter(med => !med.endDate || med.endDate > new Date()).map((medication) => (
                              <span
                                key={medication.id}
                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium border border-blue-200"
                              >
                                {medication.name}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-600" />
                      Account Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                        <label className="text-sm font-semibold text-gray-700">Member Since</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {userProfile.createdAt.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                        <label className="text-sm font-semibold text-indigo-700">Family Members</label>
                        <p className="text-lg text-indigo-900 font-medium">
                          {familyMembers.length} connected
                        </p>
                        <p className="text-sm text-indigo-600">
                          {familyMembers.filter(m => m.inviteStatus === 'accepted').length} active
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Health Stats */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-pink-600" />
                      Health Journey Stats
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200 text-center">
                        <div className="text-2xl font-bold text-pink-800">{symptoms.length}</div>
                        <div className="text-sm text-pink-600">Total Symptoms Logged</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 text-center">
                        <div className="text-2xl font-bold text-yellow-800">{medications.length}</div>
                        <div className="text-sm text-yellow-600">Medications Tracked</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200 text-center">
                        <div className="text-2xl font-bold text-teal-800">
                          {Math.ceil((Date.now() - userProfile.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-sm text-teal-600">Days on Health Journey</div>
                      </div>
                    </div>
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