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

export interface UserProfile {
  id: string;
  name: string;
  conditions: string[];
  medications: Medication[];
  createdAt: Date;
  preferences: {
    photoReminders: boolean;
    progressionAlerts: boolean;
    familySharing: boolean;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  sideEffects?: string[];
  effectiveness?: number; // 1-10 scale
}

export interface SymptomSuggestion {
  id: string;
  text: string;
  category: 'common' | 'condition-specific' | 'activity-related' | 'visual' | 'measurable';
  conditions?: string[];
  requiresPhoto?: boolean;
  requiresMeasurement?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  email: string;
  accessLevel: 'view_only' | 'emergency_contact' | 'caregiver';
  sharedData: ('symptoms' | 'medications' | 'appointments' | 'photos')[];
}