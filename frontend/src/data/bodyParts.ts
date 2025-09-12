import { BodyPart, SymptomSuggestion } from '@/types/health';

export const bodyParts: BodyPart[] = [
  {
    id: 'head',
    name: 'Head',
    region: 'head-neck',
    commonSymptoms: ['headache', 'dizziness', 'fatigue']
  },
  {
    id: 'chest',
    name: 'Chest',
    region: 'torso',
    commonSymptoms: ['chest-pain', 'shortness-of-breath', 'heart-racing']
  },
  {
    id: 'left-knee',
    name: 'Left Knee',
    region: 'legs',
    commonSymptoms: ['knee-pain', 'stiffness', 'swelling']
  },
  {
    id: 'right-knee',
    name: 'Right Knee',
    region: 'legs',
    commonSymptoms: ['knee-pain', 'stiffness', 'swelling']
  },
  {
    id: 'abdomen',
    name: 'Abdomen',
    region: 'torso',
    commonSymptoms: ['abdominal-pain', 'nausea', 'bloating']
  },
  {
    id: 'back',
    name: 'Back',
    region: 'torso',
    commonSymptoms: ['back-pain', 'muscle-tension', 'stiffness']
  }
];

export const symptomSuggestions: Record<string, SymptomSuggestion[]> = {
  'head': [
    { id: 'headache', text: 'Headache', category: 'common' },
    { id: 'dizziness', text: 'Dizziness', category: 'common' },
    { id: 'fatigue', text: 'Fatigue', category: 'common' },
    { id: 'migraine', text: 'Migraine', category: 'condition-specific', conditions: ['migraines'] },
    { id: 'brain-fog', text: 'Brain fog', category: 'condition-specific', conditions: ['diabetes', 'chronic-fatigue'] }
  ],
  'chest': [
    { id: 'chest-pain', text: 'Chest pain', category: 'common' },
    { id: 'shortness-of-breath', text: 'Shortness of breath', category: 'common' },
    { id: 'heart-racing', text: 'Heart racing', category: 'common' },
    { id: 'chest-tightness', text: 'Chest tightness', category: 'common' },
    { id: 'irregular-heartbeat', text: 'Irregular heartbeat', category: 'condition-specific', conditions: ['heart-disease'] }
  ],
  'left-knee': [
    { id: 'knee-pain', text: 'Knee pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'common' },
    { id: 'clicking-sound', text: 'Clicking sound', category: 'common' },
    { id: 'morning-stiffness', text: 'Morning stiffness', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'weather-sensitivity', text: 'Weather sensitivity', category: 'condition-specific', conditions: ['arthritis'] }
  ],
  'right-knee': [
    { id: 'knee-pain', text: 'Knee pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'common' },
    { id: 'clicking-sound', text: 'Clicking sound', category: 'common' },
    { id: 'morning-stiffness', text: 'Morning stiffness', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'weather-sensitivity', text: 'Weather sensitivity', category: 'condition-specific', conditions: ['arthritis'] }
  ],
  'abdomen': [
    { id: 'abdominal-pain', text: 'Abdominal pain', category: 'common' },
    { id: 'nausea', text: 'Nausea', category: 'common' },
    { id: 'bloating', text: 'Bloating', category: 'common' },
    { id: 'cramping', text: 'Cramping', category: 'common' },
    { id: 'digestive-issues', text: 'Digestive issues', category: 'condition-specific', conditions: ['diabetes', 'ibs'] }
  ],
  'back': [
    { id: 'back-pain', text: 'Back pain', category: 'common' },
    { id: 'muscle-tension', text: 'Muscle tension', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'sharp-pain', text: 'Sharp pain', category: 'common' },
    { id: 'chronic-ache', text: 'Chronic ache', category: 'condition-specific', conditions: ['chronic-pain'] }
  ]
};