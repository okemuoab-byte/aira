export interface BodyPart {
  id: string;
  name: string;
  region: string;
  parentId?: string;
  children?: string[];
  commonSymptoms: string[];
  zoomLevel: 'overview' | 'detailed' | 'micro';
  coordinates?: { x: number; y: number; width: number; height: number };
}

export interface Symptom {
  id: string;
  bodyPartId: string;
  bodyPartName: string;
  type: string;
  intensity: number; // 1-10 scale
  notes?: string;
  timestamp: Date;
  coordinates?: { x: number; y: number };
  photos?: SymptomPhoto[];
  measurements?: SymptomMeasurement[];
  triggers?: string[];
  treatments?: string[];
  foodHistory?: string[]; // Foods consumed in last 24-48 hours
}

export interface SymptomPhoto {
  id: string;
  url: string;
  timestamp: Date;
  description?: string;
  measurements?: { width: number; height: number; unit: 'mm' | 'cm' };
}

export interface SymptomMeasurement {
  id: string;
  type: 'size' | 'temperature' | 'swelling' | 'range_of_motion';
  value: number;
  unit: string;
  timestamp: Date;
}

export interface SymptomProgression {
  symptomType: string;
  bodyPartId: string;
  entries: Symptom[];
  trend: 'improving' | 'worsening' | 'stable' | 'fluctuating';
  averageIntensity: number;
  frequencyPerWeek: number;
}

export interface HealthcareVisit {
  id: string;
  date: Date;
  providerType: 'GP' | 'A&E' | 'Hospital' | 'Specialist' | 'Urgent Care' | 'Walk-in Clinic';
  providerName?: string;
  reasonForVisit: string;
  summary: string;
  diagnosis?: string;
  treatmentPlan?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  prescriptions?: string[];
  referrals?: string[];
}

export interface FamilyHistoryCondition {
  id: string;
  condition: string;
  familyMember: string; // e.g., 'mother', 'father', 'maternal grandmother', 'brother'
  relationship: 'parent' | 'grandparent' | 'sibling' | 'aunt_uncle' | 'cousin';
  ageOfOnset?: number;
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
  isUserAffected: boolean; // Whether the user currently has this condition
  riskLevel: 'low' | 'moderate' | 'high'; // Calculated based on relationship and family pattern
}

export interface UserProfile {
  id: string;
  name: string;
  birthday: Date;
  gender: string; // e.g., 'female', 'male', 'non-binary', 'prefer not to say', etc.
  height: {
    value: number;
    unit: 'cm' | 'ft-in' | 'inches';
    feet?: number; // for ft-in format
    inches?: number; // for ft-in format
  };
  weight: {
    value: number;
    unit: 'kg' | 'lbs';
    lastWeighed: Date;
  };
  lastHealthcareVisit?: HealthcareVisit;
  conditions: string[];
  medications: Medication[];
  familyHistory: FamilyHistoryCondition[];
  createdAt: Date;
  preferences: {
    photoReminders: boolean;
    progressionAlerts: boolean;
    familySharing: boolean;
    medicationReminders: boolean;
    reminderTone: 'gentle' | 'standard' | 'urgent';
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times?: string[]; // Array of time strings like ["09:00", "21:00"]
  startDate: Date;
  endDate?: Date;
  notes?: string;
  pillPhoto?: string;
  reminderEnabled: boolean;
  sideEffects?: string[];
  effectiveness?: number; // 1-10 scale
  adherenceRate?: number; // Calculated percentage
  missedDoses?: MissedDose[];
}

export interface MissedDose {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  missedTime: Date;
  reason?: string;
  takenLater?: boolean;
  takenLaterTime?: Date;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  status: 'pending' | 'taken' | 'missed' | 'snoozed';
  takenTime?: Date;
  snoozedUntil?: Date;
  notes?: string;
}

export interface SymptomSuggestion {
  id: string;
  text: string;
  category: 'common' | 'condition-specific' | 'activity-related' | 'visual' | 'measurable';
  conditions?: string[];
  requiresPhoto?: boolean;
  requiresMeasurement?: boolean;
  requiresFoodHistory?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  email: string;
  accessLevel: 'view_only' | 'emergency_contact' | 'caregiver';
  sharedData: ('symptoms' | 'medications' | 'appointments' | 'photos')[];
  inviteStatus: 'pending' | 'accepted' | 'declined';
  invitedDate: Date;
  acceptedDate?: Date;
  lastAccess?: Date;
}

export interface FamilyNotification {
  id: string;
  type: 'symptom_alert' | 'medication_missed' | 'emergency' | 'improvement';
  message: string;
  timestamp: Date;
  read: boolean;
  familyMemberId: string;
  relatedData?: {
    symptomId?: string;
    medicationId?: string;
    severity?: 'low' | 'medium' | 'high';
  };
}

export interface ShareSettings {
  allowSymptomSharing: boolean;
  allowMedicationSharing: boolean;
  allowPhotoSharing: boolean;
  allowEmergencyAccess: boolean;
  requireApprovalForSharing: boolean;
  autoShareHighSeverity: boolean;
  emergencyContactIds: string[];
}