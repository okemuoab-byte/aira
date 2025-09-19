import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Users, Shield, Heart, Pill, Calendar, Share2, Plus, Settings } from 'lucide-react';
import { FamilyMember, Symptom, Medication } from '@/types/health';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

interface FamilyDashboardProps {
  familyMembers: FamilyMember[];
  symptoms: Symptom[];
  medications: Medication[];
  onFamilyMemberAdd: (member: Omit<FamilyMember, 'id'>) => void;
  onFamilyMemberUpdate: (id: string, updates: Partial<FamilyMember>) => void;
  onShareSettingsUpdate: (settings: any) => void;
  className?: string;
}

const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  familyMembers,
  symptoms,
  medications,
  onFamilyMemberAdd,
  onFamilyMemberUpdate,
  onShareSettingsUpdate,
  className
}) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    relationship: 'family',
    accessLevel: 'view_only' as 'view_only' | 'emergency_contact' | 'caregiver',
    sharedData: ['symptoms'] as ('symptoms' | 'medications' | 'appointments' | 'photos')[]
  });

  const [shareSettings, setShareSettings] = useState({
    allowSymptomSharing: true,
    allowMedicationSharing: true,
    allowPhotoSharing: false,
    allowEmergencyAccess: true,
    requireApprovalForSharing: true
  });

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'family', label: 'Other Family' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'friend', label: 'Friend' }
  ];

  const accessLevelOptions = [
    { 
      value: 'view_only', 
      label: 'View Only', 
      description: 'Can see shared health information but cannot make changes' 
    },
    { 
      value: 'emergency_contact', 
      label: 'Emergency Contact', 
      description: 'View access plus emergency notifications and medical history' 
    },
    { 
      value: 'caregiver', 
      label: 'Caregiver', 
      description: 'Full access including medication reminders and appointment scheduling' 
    }
  ];

  const dataTypeOptions = [
    { value: 'symptoms', label: 'Symptoms & Health Status', icon: Heart },
    { value: 'medications', label: 'Medications & Reminders', icon: Pill },
    { value: 'appointments', label: 'Appointments & Schedule', icon: Calendar },
    { value: 'photos', label: 'Health Photos & Progress', icon: Share2 }
  ];

  const handleInvite = () => {
    if (!inviteData.name || !inviteData.email) return;

    const newMember: Omit<FamilyMember, 'id'> = {
      name: inviteData.name,
      email: inviteData.email,
      relationship: inviteData.relationship,
      accessLevel: inviteData.accessLevel,
      sharedData: inviteData.sharedData
    };

    onFamilyMemberAdd(newMember);
    showSuccess(`Invitation sent to ${inviteData.name}`);
    
    setInviteData({
      name: '',
      email: '',
      relationship: 'family',
      accessLevel: 'view_only',
      sharedData: ['symptoms']
    });
    setShowInviteForm(false);
  };

  const toggleSharedData = (memberId: string, dataType: 'symptoms' | 'medications' | 'appointments' | 'photos') => {
    const member = familyMembers.find(m => m.id === memberId);
    if (!member) return;

    const newSharedData = member.sharedData.includes(dataType)
      ? member.sharedData.filter(d => d !== dataType)
      : [...member.sharedData, dataType];

    onFamilyMemberUpdate(memberId, { sharedData: newSharedData });
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'caregiver': return 'bg-green-100 text-green-800';
      case 'emergency_contact': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const generateFamilySummary = () => {
    const recentSymptoms = symptoms.filter(s => {
      const daysDiff = (Date.now() - s.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const activeMedications = medications.filter(m => !m.endDate || m.endDate > new Date());

    return {
      weeklySymptoms: recentSymptoms.length,
      averageIntensity: recentSymptoms.length > 0 
        ? Math.round(recentSymptoms.reduce((sum, s) => sum + s.intensity, 0) / recentSymptoms.length)
        : 0,
      activeMedications: activeMedications.length,
      adherenceRate: 85 // This would be calculated from actual data
    };
  };

  const summary = generateFamilySummary();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Family Care Team
          </h2>
          <p className="text-gray-600">Share your health journey with loved ones</p>
        </div>
        <Button onClick={() => setShowInviteForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Invite Family
        </Button>
      </div>

      {/* Family Summary for Sharing */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Health Summary for Family</CardTitle>
          <p className="text-sm text-gray-600">What your family members can see</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.weeklySymptoms}</div>
              <div className="text-sm text-gray-600">Symptoms This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.averageIntensity}/10</div>
              <div className="text-sm text-gray-600">Average Intensity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.activeMedications}</div>
              <div className="text-sm text-gray-600">Active Medications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.adherenceRate}%</div>
              <div className="text-sm text-gray-600">Medication Adherence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Family Member</CardTitle>
            <p className="text-sm text-gray-600">
              Choose what health information to share and their access level
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter their name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter their email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Relationship</label>
                <select
                  value={inviteData.relationship}
                  onChange={(e) => setInviteData(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {relationshipOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Access Level</label>
                <select
                  value={inviteData.accessLevel}
                  onChange={(e) => setInviteData(prev => ({ ...prev, accessLevel: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {accessLevelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">What to Share</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dataTypeOptions.map(option => {
                  const Icon = option.icon;
                  const isChecked = inviteData.sharedData.includes(option.value);
                  
                  return (
                    <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const newSharedData = e.target.checked
                            ? [...inviteData.sharedData, option.value]
                            : inviteData.sharedData.filter(d => d !== option.value);
                          setInviteData(prev => ({ ...prev, sharedData: newSharedData }));
                        }}
                        className="rounded"
                      />
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{option.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleInvite} disabled={!inviteData.name || !inviteData.email}>
                Send Invitation
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Members List */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Family Members ({familyMembers.length})</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {familyMembers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No family members added yet</p>
                <p className="text-sm text-gray-500">Invite your loved ones to join your health journey</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline">{member.relationship}</Badge>
                          <Badge className={getAccessLevelColor(member.accessLevel)}>
                            {accessLevelOptions.find(opt => opt.value === member.accessLevel)?.label}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">Shared Information:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {dataTypeOptions.map(option => {
                          const Icon = option.icon;
                          const isShared = member.sharedData.includes(option.value);
                          
                          return (
                            <div key={option.value} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                <Icon className="h-4 w-4 text-gray-600" />
                                <span className="text-sm">{option.label}</span>
                              </div>
                              <Switch
                                checked={isShared}
                                onCheckedChange={() => toggleSharedData(member.id, option.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Sharing Settings
              </CardTitle>
              <p className="text-sm text-gray-600">
                Control how your health information is shared with family members
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Allow Symptom Sharing</div>
                    <div className="text-sm text-gray-600">Share symptom logs and health status</div>
                  </div>
                  <Switch
                    checked={shareSettings.allowSymptomSharing}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, allowSymptomSharing: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Allow Medication Sharing</div>
                    <div className="text-sm text-gray-600">Share medication schedules and adherence</div>
                  </div>
                  <Switch
                    checked={shareSettings.allowMedicationSharing}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, allowMedicationSharing: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Allow Photo Sharing</div>
                    <div className="text-sm text-gray-600">Share health photos and visual progress</div>
                  </div>
                  <Switch
                    checked={shareSettings.allowPhotoSharing}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, allowPhotoSharing: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Emergency Access</div>
                    <div className="text-sm text-gray-600">Allow emergency contacts full access during emergencies</div>
                  </div>
                  <Switch
                    checked={shareSettings.allowEmergencyAccess}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, allowEmergencyAccess: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Require Approval for Sharing</div>
                    <div className="text-sm text-gray-600">Get notified before new information is shared</div>
                  </div>
                  <Switch
                    checked={shareSettings.requireApprovalForSharing}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, requireApprovalForSharing: checked }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => onShareSettingsUpdate(shareSettings)}
                className="w-full"
              >
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyDashboard;