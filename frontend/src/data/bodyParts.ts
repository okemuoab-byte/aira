import { BodyPart, SymptomSuggestion } from '@/types/health';

export const bodyParts: BodyPart[] = [
  // Overview level - main body regions
  {
    id: 'head',
    name: 'Head',
    region: 'head-neck',
    children: ['forehead', 'left-eye', 'right-eye', 'nose', 'mouth', 'left-ear', 'right-ear', 'scalp', 'jaw'],
    commonSymptoms: ['headache', 'dizziness', 'fatigue'],
    zoomLevel: 'overview',
    coordinates: { x: 110, y: 20, width: 80, height: 90 }
  },
  {
    id: 'neck',
    name: 'Neck',
    region: 'head-neck',
    children: ['throat', 'left-neck-side', 'right-neck-side', 'back-neck'],
    commonSymptoms: ['neck-pain', 'stiffness', 'swollen-glands'],
    zoomLevel: 'overview',
    coordinates: { x: 125, y: 110, width: 50, height: 30 }
  },
  {
    id: 'chest',
    name: 'Chest',
    region: 'torso',
    children: ['upper-chest', 'lower-chest', 'left-breast', 'right-breast', 'sternum'],
    commonSymptoms: ['chest-pain', 'shortness-of-breath', 'heart-racing'],
    zoomLevel: 'overview',
    coordinates: { x: 110, y: 140, width: 80, height: 100 }
  },
  {
    id: 'abdomen',
    name: 'Abdomen',
    region: 'torso',
    children: ['upper-abdomen', 'lower-abdomen', 'left-side', 'right-side', 'navel'],
    commonSymptoms: ['abdominal-pain', 'nausea', 'bloating'],
    zoomLevel: 'overview',
    coordinates: { x: 115, y: 250, width: 70, height: 80 }
  },
  {
    id: 'back',
    name: 'Back',
    region: 'torso',
    children: ['upper-back', 'middle-back', 'lower-back', 'spine'],
    commonSymptoms: ['back-pain', 'muscle-tension', 'stiffness'],
    zoomLevel: 'overview',
    coordinates: { x: 120, y: 140, width: 60, height: 190 }
  },
  {
    id: 'left-arm',
    name: 'Left Arm',
    region: 'arms',
    children: ['left-shoulder', 'left-upper-arm', 'left-elbow', 'left-forearm', 'left-wrist', 'left-hand'],
    commonSymptoms: ['arm-pain', 'weakness', 'numbness'],
    zoomLevel: 'overview',
    coordinates: { x: 60, y: 140, width: 40, height: 200 }
  },
  {
    id: 'right-arm',
    name: 'Right Arm',
    region: 'arms',
    children: ['right-shoulder', 'right-upper-arm', 'right-elbow', 'right-forearm', 'right-wrist', 'right-hand'],
    commonSymptoms: ['arm-pain', 'weakness', 'numbness'],
    zoomLevel: 'overview',
    coordinates: { x: 200, y: 140, width: 40, height: 200 }
  },
  {
    id: 'left-leg',
    name: 'Left Leg',
    region: 'legs',
    children: ['left-hip', 'left-thigh', 'left-knee', 'left-calf', 'left-ankle', 'left-foot'],
    commonSymptoms: ['leg-pain', 'swelling', 'weakness'],
    zoomLevel: 'overview',
    coordinates: { x: 120, y: 340, width: 30, height: 200 }
  },
  {
    id: 'right-leg',
    name: 'Right Leg',
    region: 'legs',
    children: ['right-hip', 'right-thigh', 'right-knee', 'right-calf', 'right-ankle', 'right-foot'],
    commonSymptoms: ['leg-pain', 'swelling', 'weakness'],
    zoomLevel: 'overview',
    coordinates: { x: 150, y: 340, width: 30, height: 200 }
  },

  // Detailed level - head components
  {
    id: 'forehead',
    name: 'Forehead',
    region: 'head-neck',
    parentId: 'head',
    commonSymptoms: ['tension-headache', 'skin-irritation', 'wrinkles'],
    zoomLevel: 'detailed'
  },
  {
    id: 'left-eye',
    name: 'Left Eye',
    region: 'head-neck',
    parentId: 'head',
    children: ['left-eyelid', 'left-eyeball', 'left-eyebrow'],
    commonSymptoms: ['eye-pain', 'dryness', 'redness', 'vision-changes'],
    zoomLevel: 'detailed'
  },
  {
    id: 'right-eye',
    name: 'Right Eye',
    region: 'head-neck',
    parentId: 'head',
    children: ['right-eyelid', 'right-eyeball', 'right-eyebrow'],
    commonSymptoms: ['eye-pain', 'dryness', 'redness', 'vision-changes'],
    zoomLevel: 'detailed'
  },
  {
    id: 'nose',
    name: 'Nose',
    region: 'head-neck',
    parentId: 'head',
    children: ['nostrils', 'nasal-bridge', 'nasal-tip'],
    commonSymptoms: ['congestion', 'runny-nose', 'nosebleed', 'sinus-pressure'],
    zoomLevel: 'detailed'
  },
  {
    id: 'mouth',
    name: 'Mouth',
    region: 'head-neck',
    parentId: 'head',
    children: ['lips', 'teeth', 'gums', 'tongue', 'throat'],
    commonSymptoms: ['mouth-pain', 'dry-mouth', 'sores', 'bad-taste'],
    zoomLevel: 'detailed'
  },
  {
    id: 'left-ear',
    name: 'Left Ear',
    region: 'head-neck',
    parentId: 'head',
    children: ['left-outer-ear', 'left-ear-canal', 'left-eardrum'],
    commonSymptoms: ['ear-pain', 'hearing-loss', 'ringing', 'discharge'],
    zoomLevel: 'detailed'
  },
  {
    id: 'right-ear',
    name: 'Right Ear',
    region: 'head-neck',
    parentId: 'head',
    children: ['right-outer-ear', 'right-ear-canal', 'right-eardrum'],
    commonSymptoms: ['ear-pain', 'hearing-loss', 'ringing', 'discharge'],
    zoomLevel: 'detailed'
  },

  // Detailed level - hand components
  {
    id: 'left-hand',
    name: 'Left Hand',
    region: 'arms',
    parentId: 'left-arm',
    children: ['left-thumb', 'left-index', 'left-middle', 'left-ring', 'left-pinky', 'left-palm'],
    commonSymptoms: ['hand-pain', 'stiffness', 'numbness', 'swelling'],
    zoomLevel: 'detailed'
  },
  {
    id: 'right-hand',
    name: 'Right Hand',
    region: 'arms',
    parentId: 'right-arm',
    children: ['right-thumb', 'right-index', 'right-middle', 'right-ring', 'right-pinky', 'right-palm'],
    commonSymptoms: ['hand-pain', 'stiffness', 'numbness', 'swelling'],
    zoomLevel: 'detailed'
  },

  // Detailed level - foot components
  {
    id: 'left-foot',
    name: 'Left Foot',
    region: 'legs',
    parentId: 'left-leg',
    children: ['left-big-toe', 'left-toes', 'left-arch', 'left-heel', 'left-sole'],
    commonSymptoms: ['foot-pain', 'swelling', 'numbness', 'calluses'],
    zoomLevel: 'detailed'
  },
  {
    id: 'right-foot',
    name: 'Right Foot',
    region: 'legs',
    parentId: 'right-leg',
    children: ['right-big-toe', 'right-toes', 'right-arch', 'right-heel', 'right-sole'],
    commonSymptoms: ['foot-pain', 'swelling', 'numbness', 'calluses'],
    zoomLevel: 'detailed'
  },

  // Micro level - individual fingers/toes
  {
    id: 'left-thumb',
    name: 'Left Thumb',
    region: 'arms',
    parentId: 'left-hand',
    commonSymptoms: ['joint-pain', 'stiffness', 'trigger-finger'],
    zoomLevel: 'micro'
  },
  {
    id: 'left-big-toe',
    name: 'Left Big Toe',
    region: 'legs',
    parentId: 'left-foot',
    commonSymptoms: ['gout', 'ingrown-nail', 'joint-pain'],
    zoomLevel: 'micro'
  }
];

export const symptomSuggestions: Record<string, SymptomSuggestion[]> = {
  'head': [
    { id: 'headache', text: 'Headache', category: 'common' },
    { id: 'migraine', text: 'Migraine', category: 'condition-specific', conditions: ['migraines'] },
    { id: 'dizziness', text: 'Dizziness', category: 'common' },
    { id: 'brain-fog', text: 'Brain fog', category: 'condition-specific', conditions: ['diabetes', 'chronic-fatigue'] }
  ],
  'left-eye': [
    { id: 'eye-pain', text: 'Eye pain', category: 'common' },
    { id: 'dryness', text: 'Dry eyes', category: 'common' },
    { id: 'redness', text: 'Redness', category: 'visual', requiresPhoto: true },
    { id: 'vision-changes', text: 'Vision changes', category: 'common' },
    { id: 'diabetic-retinopathy', text: 'Vision concerns', category: 'condition-specific', conditions: ['diabetes'] }
  ],
  'right-eye': [
    { id: 'eye-pain', text: 'Eye pain', category: 'common' },
    { id: 'dryness', text: 'Dry eyes', category: 'common' },
    { id: 'redness', text: 'Redness', category: 'visual', requiresPhoto: true },
    { id: 'vision-changes', text: 'Vision changes', category: 'common' },
    { id: 'diabetic-retinopathy', text: 'Vision concerns', category: 'condition-specific', conditions: ['diabetes'] }
  ],
  'nose': [
    { id: 'congestion', text: 'Congestion', category: 'common' },
    { id: 'runny-nose', text: 'Runny nose', category: 'common' },
    { id: 'nosebleed', text: 'Nosebleed', category: 'common' },
    { id: 'sinus-pressure', text: 'Sinus pressure', category: 'common' },
    { id: 'loss-of-smell', text: 'Loss of smell', category: 'condition-specific', conditions: ['covid', 'allergies'] }
  ],
  'left-ear': [
    { id: 'ear-pain', text: 'Ear pain', category: 'common' },
    { id: 'hearing-loss', text: 'Hearing loss', category: 'common' },
    { id: 'ringing', text: 'Ringing (tinnitus)', category: 'common' },
    { id: 'discharge', text: 'Discharge', category: 'visual', requiresPhoto: true },
    { id: 'vertigo', text: 'Vertigo', category: 'condition-specific', conditions: ['inner-ear-disorder'] }
  ],
  'right-ear': [
    { id: 'ear-pain', text: 'Ear pain', category: 'common' },
    { id: 'hearing-loss', text: 'Hearing loss', category: 'common' },
    { id: 'ringing', text: 'Ringing (tinnitus)', category: 'common' },
    { id: 'discharge', text: 'Discharge', category: 'visual', requiresPhoto: true },
    { id: 'vertigo', text: 'Vertigo', category: 'condition-specific', conditions: ['inner-ear-disorder'] }
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
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'clicking-sound', text: 'Clicking sound', category: 'common' },
    { id: 'morning-stiffness', text: 'Morning stiffness', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'weather-sensitivity', text: 'Weather sensitivity', category: 'condition-specific', conditions: ['arthritis'] }
  ],
  'right-knee': [
    { id: 'knee-pain', text: 'Knee pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
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
  ],
  'left-hand': [
    { id: 'hand-pain', text: 'Hand pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'tingling', text: 'Tingling', category: 'common' },
    { id: 'carpal-tunnel', text: 'Carpal tunnel symptoms', category: 'condition-specific', conditions: ['carpal-tunnel'] },
    { id: 'arthritis-hands', text: 'Joint stiffness', category: 'condition-specific', conditions: ['arthritis'] }
  ],
  'right-hand': [
    { id: 'hand-pain', text: 'Hand pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'tingling', text: 'Tingling', category: 'common' },
    { id: 'carpal-tunnel', text: 'Carpal tunnel symptoms', category: 'condition-specific', conditions: ['carpal-tunnel'] },
    { id: 'arthritis-hands', text: 'Joint stiffness', category: 'condition-specific', conditions: ['arthritis'] }
  ],
  'left-foot': [
    { id: 'foot-pain', text: 'Foot pain', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'calluses', text: 'Calluses', category: 'visual', requiresPhoto: true },
    { id: 'diabetic-foot', text: 'Foot concerns', category: 'condition-specific', conditions: ['diabetes'] },
    { id: 'plantar-fasciitis', text: 'Heel pain', category: 'condition-specific', conditions: ['plantar-fasciitis'] }
  ],
  'right-foot': [
    { id: 'foot-pain', text: 'Foot pain', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'calluses', text: 'Calluses', category: 'visual', requiresPhoto: true },
    { id: 'diabetic-foot', text: 'Foot concerns', category: 'condition-specific', conditions: ['diabetes'] },
    { id: 'plantar-fasciitis', text: 'Heel pain', category: 'condition-specific', conditions: ['plantar-fasciitis'] }
  ]
};