export interface BodyPart {
  id: string;
  name: string;
  region: string;
  commonSymptoms: string[];
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
}

export interface UserProfile {
  id: string;
  name: string;
  conditions: string[];
  medications: string[];
  createdAt: Date;
}

export interface SymptomSuggestion {
  id: string;
  text: string;
  category: 'common' | 'condition-specific' | 'activity-related';
  conditions?: string[];
}