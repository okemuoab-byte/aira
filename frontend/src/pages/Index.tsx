import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Activity, User, BookOpen } from 'lucide-react';
import HealthDashboard from '@/components/HealthDashboard';
import SymptomLogger from '@/components/SymptomLogger';
import { Symptom, UserProfile } from '@/types/health';

const Index = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userProfile] = useState<UserProfile>({
    id: '1',
    name: 'Sarah',
    conditions: ['diabetes', 'arthritis'],
    medications: ['Metformin', 'Ibuprofen'],
    createdAt: new Date()
  });

  const handleSymptomAdd = (newSymptom: Omit<Symptom, 'id'>) => {
    const symptom: Symptom = {
      ...newSymptom,
      id: Date.now().toString()
    };
    setSymptoms(prev => [symptom, ...prev]);
    setActiveTab('dashboard'); // Return to dashboard after logging
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Health Journey</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {getGreeting()}, {userProfile.name}
              </span>
              <Button
                onClick={() => setActiveTab('log-symptoms')}
                className="bg-blue-600 hover:bg-blue-700"
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
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="log-symptoms" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Learn</span>
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
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Medical Insights Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're building an AI-powered system to help you understand your symptoms and conditions in plain language.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{userProfile.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Health Conditions</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userProfile.conditions.map((condition) => (
                        <span
                          key={condition}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Medications</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userProfile.medications.map((medication) => (
                        <span
                          key={medication}
                          className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {medication}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-gray-900">
                      {userProfile.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Quick Action Floating Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          onClick={() => setActiveTab('log-symptoms')}
          size="lg"
          className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Index;