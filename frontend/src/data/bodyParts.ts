import { BodyPart, SymptomSuggestion } from '@/types/health';

export const bodyParts: BodyPart[] = [
  // HEAD & NECK SYSTEM
  {
    id: 'head',
    name: 'Head',
    region: 'head-neck',
    children: ['forehead', 'left-temple', 'right-temple', 'crown', 'back-head'],
    commonSymptoms: ['headache', 'dizziness', 'fatigue'],
    zoomLevel: 'overview',
    coordinates: { x: 110, y: 20, width: 80, height: 90 }
  },
  {
    id: 'forehead',
    name: 'Forehead',
    region: 'head-neck',
    parentId: 'head',
    commonSymptoms: ['tension-headache', 'sinus-pressure', 'skin-irritation'],
    zoomLevel: 'detailed'
  },
  {
    id: 'left-temple',
    name: 'Left Temple',
    region: 'head-neck',
    parentId: 'head',
    commonSymptoms: ['migraine', 'tension', 'throbbing-pain'],
    zoomLevel: 'detailed'
  },
  {
    id: 'right-temple',
    name: 'Right Temple',
    region: 'head-neck',
    parentId: 'head',
    commonSymptoms: ['migraine', 'tension', 'throbbing-pain'],
    zoomLevel: 'detailed'
  },

  // EYE SYSTEM
  {
    id: 'left-eye',
    name: 'Left Eye',
    region: 'head-neck',
    children: ['left-eyelid', 'left-eyeball', 'left-eyebrow'],
    commonSymptoms: ['eye-pain', 'dryness', 'redness', 'vision-changes'],
    zoomLevel: 'overview',
    coordinates: { x: 125, y: 45, width: 15, height: 10 }
  },
  {
    id: 'right-eye',
    name: 'Right Eye',
    region: 'head-neck',
    children: ['right-eyelid', 'right-eyeball', 'right-eyebrow'],
    commonSymptoms: ['eye-pain', 'dryness', 'redness', 'vision-changes'],
    zoomLevel: 'overview',
    coordinates: { x: 160, y: 45, width: 15, height: 10 }
  },

  // EAR SYSTEM
  {
    id: 'left-ear',
    name: 'Left Ear',
    region: 'head-neck',
    children: ['left-outer-ear', 'left-ear-canal', 'left-inner-ear'],
    commonSymptoms: ['ear-pain', 'hearing-loss', 'ringing', 'discharge'],
    zoomLevel: 'overview',
    coordinates: { x: 95, y: 50, width: 20, height: 25 }
  },
  {
    id: 'right-ear',
    name: 'Right Ear',
    region: 'head-neck',
    children: ['right-outer-ear', 'right-ear-canal', 'right-inner-ear'],
    commonSymptoms: ['ear-pain', 'hearing-loss', 'ringing', 'discharge'],
    zoomLevel: 'overview',
    coordinates: { x: 185, y: 50, width: 20, height: 25 }
  },

  // NOSE & SINUS SYSTEM
  {
    id: 'nose',
    name: 'Nose',
    region: 'head-neck',
    children: ['nostrils', 'nasal-bridge', 'sinuses'],
    commonSymptoms: ['congestion', 'runny-nose', 'nosebleed', 'sinus-pressure'],
    zoomLevel: 'overview',
    coordinates: { x: 145, y: 60, width: 10, height: 20 }
  },

  // MOUTH & THROAT SYSTEM
  {
    id: 'mouth',
    name: 'Mouth',
    region: 'head-neck',
    children: ['lips', 'teeth', 'gums', 'tongue', 'jaw'],
    commonSymptoms: ['mouth-pain', 'dry-mouth', 'sores', 'bad-taste'],
    zoomLevel: 'overview',
    coordinates: { x: 140, y: 80, width: 20, height: 10 }
  },
  {
    id: 'throat',
    name: 'Throat',
    region: 'head-neck',
    children: ['pharynx', 'larynx', 'tonsils'],
    commonSymptoms: ['sore-throat', 'difficulty-swallowing', 'hoarseness'],
    zoomLevel: 'overview',
    coordinates: { x: 145, y: 95, width: 10, height: 15 }
  },

  // NECK SYSTEM
  {
    id: 'neck',
    name: 'Neck',
    region: 'head-neck',
    children: ['front-neck', 'back-neck', 'left-neck', 'right-neck', 'lymph-nodes'],
    commonSymptoms: ['neck-pain', 'stiffness', 'swollen-glands'],
    zoomLevel: 'overview',
    coordinates: { x: 125, y: 110, width: 50, height: 30 }
  },

  // SHOULDER SYSTEM
  {
    id: 'left-shoulder',
    name: 'Left Shoulder',
    region: 'arms',
    children: ['left-shoulder-blade', 'left-shoulder-joint', 'left-collarbone'],
    commonSymptoms: ['shoulder-pain', 'stiffness', 'limited-range'],
    zoomLevel: 'overview',
    coordinates: { x: 75, y: 130, width: 35, height: 25 }
  },
  {
    id: 'right-shoulder',
    name: 'Right Shoulder',
    region: 'arms',
    children: ['right-shoulder-blade', 'right-shoulder-joint', 'right-collarbone'],
    commonSymptoms: ['shoulder-pain', 'stiffness', 'limited-range'],
    zoomLevel: 'overview',
    coordinates: { x: 190, y: 130, width: 35, height: 25 }
  },

  // CHEST & RESPIRATORY SYSTEM
  {
    id: 'chest',
    name: 'Chest',
    region: 'torso',
    children: ['upper-chest', 'lower-chest', 'sternum', 'ribs', 'lungs', 'heart'],
    commonSymptoms: ['chest-pain', 'shortness-of-breath', 'heart-racing'],
    zoomLevel: 'overview',
    coordinates: { x: 110, y: 140, width: 80, height: 100 }
  },
  {
    id: 'heart',
    name: 'Heart',
    region: 'torso',
    parentId: 'chest',
    commonSymptoms: ['chest-pain', 'palpitations', 'irregular-heartbeat'],
    zoomLevel: 'detailed'
  },
  {
    id: 'lungs',
    name: 'Lungs',
    region: 'torso',
    parentId: 'chest',
    children: ['left-lung', 'right-lung'],
    commonSymptoms: ['shortness-of-breath', 'cough', 'wheezing'],
    zoomLevel: 'detailed'
  },

  // ARM SYSTEM
  {
    id: 'left-arm',
    name: 'Left Arm',
    region: 'arms',
    children: ['left-upper-arm', 'left-elbow', 'left-forearm'],
    commonSymptoms: ['arm-pain', 'weakness', 'numbness'],
    zoomLevel: 'overview',
    coordinates: { x: 60, y: 155, width: 25, height: 120 }
  },
  {
    id: 'right-arm',
    name: 'Right Arm',
    region: 'arms',
    children: ['right-upper-arm', 'right-elbow', 'right-forearm'],
    commonSymptoms: ['arm-pain', 'weakness', 'numbness'],
    zoomLevel: 'overview',
    coordinates: { x: 215, y: 155, width: 25, height: 120 }
  },
  {
    id: 'left-elbow',
    name: 'Left Elbow',
    region: 'arms',
    parentId: 'left-arm',
    commonSymptoms: ['elbow-pain', 'tennis-elbow', 'stiffness'],
    zoomLevel: 'detailed'
  },
  {
    id: 'right-elbow',
    name: 'Right Elbow',
    region: 'arms',
    parentId: 'right-arm',
    commonSymptoms: ['elbow-pain', 'tennis-elbow', 'stiffness'],
    zoomLevel: 'detailed'
  },

  // WRIST SYSTEM
  {
    id: 'left-wrist',
    name: 'Left Wrist',
    region: 'arms',
    children: ['left-wrist-joint', 'left-wrist-tendons'],
    commonSymptoms: ['wrist-pain', 'carpal-tunnel', 'stiffness'],
    zoomLevel: 'overview',
    coordinates: { x: 55, y: 275, width: 15, height: 10 }
  },
  {
    id: 'right-wrist',
    name: 'Right Wrist',
    region: 'arms',
    children: ['right-wrist-joint', 'right-wrist-tendons'],
    commonSymptoms: ['wrist-pain', 'carpal-tunnel', 'stiffness'],
    zoomLevel: 'overview',
    coordinates: { x: 230, y: 275, width: 15, height: 10 }
  },

  // HAND SYSTEM
  {
    id: 'left-hand',
    name: 'Left Hand',
    region: 'arms',
    children: ['left-thumb', 'left-index', 'left-middle', 'left-ring', 'left-pinky', 'left-palm'],
    commonSymptoms: ['hand-pain', 'stiffness', 'numbness', 'swelling'],
    zoomLevel: 'overview',
    coordinates: { x: 45, y: 285, width: 25, height: 35 }
  },
  {
    id: 'right-hand',
    name: 'Right Hand',
    region: 'arms',
    children: ['right-thumb', 'right-index', 'right-middle', 'right-ring', 'right-pinky', 'right-palm'],
    commonSymptoms: ['hand-pain', 'stiffness', 'numbness', 'swelling'],
    zoomLevel: 'overview',
    coordinates: { x: 230, y: 285, width: 25, height: 35 }
  },

  // ABDOMEN & DIGESTIVE SYSTEM
  {
    id: 'abdomen',
    name: 'Abdomen',
    region: 'torso',
    children: ['upper-abdomen', 'lower-abdomen', 'stomach', 'liver', 'intestines'],
    commonSymptoms: ['abdominal-pain', 'nausea', 'bloating'],
    zoomLevel: 'overview',
    coordinates: { x: 115, y: 250, width: 70, height: 80 }
  },
  {
    id: 'stomach',
    name: 'Stomach',
    region: 'torso',
    parentId: 'abdomen',
    commonSymptoms: ['stomach-pain', 'nausea', 'heartburn', 'indigestion'],
    zoomLevel: 'detailed'
  },

  // BACK SYSTEM
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
    id: 'lower-back',
    name: 'Lower Back',
    region: 'torso',
    parentId: 'back',
    commonSymptoms: ['lower-back-pain', 'sciatica', 'muscle-spasm'],
    zoomLevel: 'detailed'
  },

  // HIP & PELVIS SYSTEM
  {
    id: 'left-hip',
    name: 'Left Hip',
    region: 'legs',
    children: ['left-hip-joint', 'left-hip-flexor'],
    commonSymptoms: ['hip-pain', 'stiffness', 'limited-mobility'],
    zoomLevel: 'overview',
    coordinates: { x: 115, y: 330, width: 20, height: 15 }
  },
  {
    id: 'right-hip',
    name: 'Right Hip',
    region: 'legs',
    children: ['right-hip-joint', 'right-hip-flexor'],
    commonSymptoms: ['hip-pain', 'stiffness', 'limited-mobility'],
    zoomLevel: 'overview',
    coordinates: { x: 165, y: 330, width: 20, height: 15 }
  },

  // LEG SYSTEM
  {
    id: 'left-leg',
    name: 'Left Leg',
    region: 'legs',
    children: ['left-thigh', 'left-knee', 'left-calf', 'left-shin'],
    commonSymptoms: ['leg-pain', 'swelling', 'weakness'],
    zoomLevel: 'overview',
    coordinates: { x: 120, y: 345, width: 25, height: 180 }
  },
  {
    id: 'right-leg',
    name: 'Right Leg',
    region: 'legs',
    children: ['right-thigh', 'right-knee', 'right-calf', 'right-shin'],
    commonSymptoms: ['leg-pain', 'swelling', 'weakness'],
    zoomLevel: 'overview',
    coordinates: { x: 155, y: 345, width: 25, height: 180 }
  },

  // KNEE SYSTEM
  {
    id: 'left-knee',
    name: 'Left Knee',
    region: 'legs',
    parentId: 'left-leg',
    children: ['left-kneecap', 'left-knee-joint'],
    commonSymptoms: ['knee-pain', 'stiffness', 'swelling', 'clicking'],
    zoomLevel: 'detailed'
  },
  {
    id: 'right-knee',
    name: 'Right Knee',
    region: 'legs',
    parentId: 'right-leg',
    children: ['right-kneecap', 'right-knee-joint'],
    commonSymptoms: ['knee-pain', 'stiffness', 'swelling', 'clicking'],
    zoomLevel: 'detailed'
  },

  // ANKLE SYSTEM
  {
    id: 'left-ankle',
    name: 'Left Ankle',
    region: 'legs',
    children: ['left-ankle-joint', 'left-achilles'],
    commonSymptoms: ['ankle-pain', 'swelling', 'instability', 'stiffness'],
    zoomLevel: 'overview',
    coordinates: { x: 125, y: 510, width: 15, height: 15 }
  },
  {
    id: 'right-ankle',
    name: 'Right Ankle',
    region: 'legs',
    children: ['right-ankle-joint', 'right-achilles'],
    commonSymptoms: ['ankle-pain', 'swelling', 'instability', 'stiffness'],
    zoomLevel: 'overview',
    coordinates: { x: 160, y: 510, width: 15, height: 15 }
  },

  // FOOT SYSTEM
  {
    id: 'left-foot',
    name: 'Left Foot',
    region: 'legs',
    children: ['left-big-toe', 'left-toes', 'left-arch', 'left-heel', 'left-sole'],
    commonSymptoms: ['foot-pain', 'swelling', 'numbness', 'calluses'],
    zoomLevel: 'overview',
    coordinates: { x: 115, y: 525, width: 25, height: 40 }
  },
  {
    id: 'right-foot',
    name: 'Right Foot',
    region: 'legs',
    children: ['right-big-toe', 'right-toes', 'right-arch', 'right-heel', 'right-sole'],
    commonSymptoms: ['foot-pain', 'swelling', 'numbness', 'calluses'],
    zoomLevel: 'overview',
    coordinates: { x: 160, y: 525, width: 25, height: 40 }
  },

  // DETAILED FINGER SYSTEM
  {
    id: 'left-thumb',
    name: 'Left Thumb',
    region: 'arms',
    parentId: 'left-hand',
    commonSymptoms: ['joint-pain', 'stiffness', 'trigger-finger', 'arthritis'],
    zoomLevel: 'micro'
  },
  {
    id: 'left-index',
    name: 'Left Index Finger',
    region: 'arms',
    parentId: 'left-hand',
    commonSymptoms: ['joint-pain', 'stiffness', 'trigger-finger'],
    zoomLevel: 'micro'
  },
  {
    id: 'right-thumb',
    name: 'Right Thumb',
    region: 'arms',
    parentId: 'right-hand',
    commonSymptoms: ['joint-pain', 'stiffness', 'trigger-finger', 'arthritis'],
    zoomLevel: 'micro'
  },

  // DETAILED TOE SYSTEM
  {
    id: 'left-big-toe',
    name: 'Left Big Toe',
    region: 'legs',
    parentId: 'left-foot',
    commonSymptoms: ['gout', 'ingrown-nail', 'joint-pain', 'bunion'],
    zoomLevel: 'micro'
  },
  {
    id: 'right-big-toe',
    name: 'Right Big Toe',
    region: 'legs',
    parentId: 'right-foot',
    commonSymptoms: ['gout', 'ingrown-nail', 'joint-pain', 'bunion'],
    zoomLevel: 'micro'
  }
];

export const symptomSuggestions: Record<string, SymptomSuggestion[]> = {
  // HEAD SYSTEM
  'head': [
    { id: 'headache', text: 'Headache', category: 'common' },
    { id: 'migraine', text: 'Migraine', category: 'condition-specific', conditions: ['migraines'] },
    { id: 'dizziness', text: 'Dizziness', category: 'common' },
    { id: 'brain-fog', text: 'Brain fog', category: 'condition-specific', conditions: ['diabetes', 'chronic-fatigue'] },
    { id: 'pressure', text: 'Pressure sensation', category: 'common' }
  ],
  'left-temple': [
    { id: 'throbbing-pain', text: 'Throbbing pain', category: 'common' },
    { id: 'migraine', text: 'Migraine', category: 'condition-specific', conditions: ['migraines'] },
    { id: 'tension', text: 'Tension', category: 'common' },
    { id: 'sharp-pain', text: 'Sharp pain', category: 'common' }
  ],
  'right-temple': [
    { id: 'throbbing-pain', text: 'Throbbing pain', category: 'common' },
    { id: 'migraine', text: 'Migraine', category: 'condition-specific', conditions: ['migraines'] },
    { id: 'tension', text: 'Tension', category: 'common' },
    { id: 'sharp-pain', text: 'Sharp pain', category: 'common' }
  ],

  // EYE SYSTEM
  'left-eye': [
    { id: 'eye-pain', text: 'Eye pain', category: 'common' },
    { id: 'dryness', text: 'Dry eyes', category: 'common' },
    { id: 'redness', text: 'Redness', category: 'visual', requiresPhoto: true },
    { id: 'vision-changes', text: 'Vision changes', category: 'common' },
    { id: 'diabetic-retinopathy', text: 'Vision concerns', category: 'condition-specific', conditions: ['diabetes'] },
    { id: 'twitching', text: 'Eye twitching', category: 'common' },
    { id: 'discharge', text: 'Discharge', category: 'visual', requiresPhoto: true }
  ],
  'right-eye': [
    { id: 'eye-pain', text: 'Eye pain', category: 'common' },
    { id: 'dryness', text: 'Dry eyes', category: 'common' },
    { id: 'redness', text: 'Redness', category: 'visual', requiresPhoto: true },
    { id: 'vision-changes', text: 'Vision changes', category: 'common' },
    { id: 'diabetic-retinopathy', text: 'Vision concerns', category: 'condition-specific', conditions: ['diabetes'] },
    { id: 'twitching', text: 'Eye twitching', category: 'common' },
    { id: 'discharge', text: 'Discharge', category: 'visual', requiresPhoto: true }
  ],

  // EAR SYSTEM
  'left-ear': [
    { id: 'ear-pain', text: 'Ear pain', category: 'common' },
    { id: 'hearing-loss', text: 'Hearing loss', category: 'common' },
    { id: 'ringing', text: 'Ringing (tinnitus)', category: 'common' },
    { id: 'discharge', text: 'Discharge', category: 'visual', requiresPhoto: true },
    { id: 'vertigo', text: 'Vertigo', category: 'condition-specific', conditions: ['inner-ear-disorder'] },
    { id: 'fullness', text: 'Feeling of fullness', category: 'common' },
    { id: 'itching', text: 'Itching', category: 'common' }
  ],
  'right-ear': [
    { id: 'ear-pain', text: 'Ear pain', category: 'common' },
    { id: 'hearing-loss', text: 'Hearing loss', category: 'common' },
    { id: 'ringing', text: 'Ringing (tinnitus)', category: 'common' },
    { id: 'discharge', text: 'Discharge', category: 'visual', requiresPhoto: true },
    { id: 'vertigo', text: 'Vertigo', category: 'condition-specific', conditions: ['inner-ear-disorder'] },
    { id: 'fullness', text: 'Feeling of fullness', category: 'common' },
    { id: 'itching', text: 'Itching', category: 'common' }
  ],

  // NOSE & SINUS SYSTEM
  'nose': [
    { id: 'congestion', text: 'Congestion', category: 'common' },
    { id: 'runny-nose', text: 'Runny nose', category: 'common' },
    { id: 'nosebleed', text: 'Nosebleed', category: 'common' },
    { id: 'sinus-pressure', text: 'Sinus pressure', category: 'common' },
    { id: 'loss-of-smell', text: 'Loss of smell', category: 'condition-specific', conditions: ['covid', 'allergies'] },
    { id: 'post-nasal-drip', text: 'Post-nasal drip', category: 'common' }
  ],

  // THROAT SYSTEM
  'throat': [
    { id: 'sore-throat', text: 'Sore throat', category: 'common' },
    { id: 'difficulty-swallowing', text: 'Difficulty swallowing', category: 'common' },
    { id: 'hoarseness', text: 'Hoarseness', category: 'common' },
    { id: 'throat-clearing', text: 'Throat clearing', category: 'common' },
    { id: 'lump-sensation', text: 'Lump in throat', category: 'common' }
  ],

  // NECK SYSTEM
  'neck': [
    { id: 'neck-pain', text: 'Neck pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'swollen-glands', text: 'Swollen lymph nodes', category: 'common' },
    { id: 'muscle-spasm', text: 'Muscle spasm', category: 'common' },
    { id: 'limited-range', text: 'Limited range of motion', category: 'common' }
  ],

  // SHOULDER SYSTEM
  'left-shoulder': [
    { id: 'shoulder-pain', text: 'Shoulder pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'limited-range', text: 'Limited range of motion', category: 'common' },
    { id: 'frozen-shoulder', text: 'Frozen shoulder', category: 'condition-specific', conditions: ['diabetes'] },
    { id: 'rotator-cuff', text: 'Rotator cuff pain', category: 'common' },
    { id: 'weakness', text: 'Weakness', category: 'common' }
  ],
  'right-shoulder': [
    { id: 'shoulder-pain', text: 'Shoulder pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'limited-range', text: 'Limited range of motion', category: 'common' },
    { id: 'frozen-shoulder', text: 'Frozen shoulder', category: 'condition-specific', conditions: ['diabetes'] },
    { id: 'rotator-cuff', text: 'Rotator cuff pain', category: 'common' },
    { id: 'weakness', text: 'Weakness', category: 'common' }
  ],

  // CHEST & HEART SYSTEM
  'chest': [
    { id: 'chest-pain', text: 'Chest pain', category: 'common' },
    { id: 'shortness-of-breath', text: 'Shortness of breath', category: 'common' },
    { id: 'heart-racing', text: 'Heart racing', category: 'common' },
    { id: 'chest-tightness', text: 'Chest tightness', category: 'common' },
    { id: 'irregular-heartbeat', text: 'Irregular heartbeat', category: 'condition-specific', conditions: ['heart-disease'] },
    { id: 'cough', text: 'Cough', category: 'common' },
    { id: 'wheezing', text: 'Wheezing', category: 'common' }
  ],
  'heart': [
    { id: 'chest-pain', text: 'Chest pain', category: 'common' },
    { id: 'palpitations', text: 'Palpitations', category: 'common' },
    { id: 'irregular-heartbeat', text: 'Irregular heartbeat', category: 'condition-specific', conditions: ['heart-disease'] },
    { id: 'racing-heart', text: 'Racing heart', category: 'common' },
    { id: 'skipped-beats', text: 'Skipped beats', category: 'common' }
  ],

  // ARM SYSTEM
  'left-arm': [
    { id: 'arm-pain', text: 'Arm pain', category: 'common' },
    { id: 'weakness', text: 'Weakness', category: 'common' },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'tingling', text: 'Tingling', category: 'common' },
    { id: 'muscle-cramp', text: 'Muscle cramp', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true }
  ],
  'right-arm': [
    { id: 'arm-pain', text: 'Arm pain', category: 'common' },
    { id: 'weakness', text: 'Weakness', category: 'common' },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'tingling', text: 'Tingling', category: 'common' },
    { id: 'muscle-cramp', text: 'Muscle cramp', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true }
  ],

  // ELBOW SYSTEM
  'left-elbow': [
    { id: 'elbow-pain', text: 'Elbow pain', category: 'common' },
    { id: 'tennis-elbow', text: 'Tennis elbow', category: 'condition-specific', conditions: ['tennis-elbow'] },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'clicking', text: 'Clicking sound', category: 'common' }
  ],
  'right-elbow': [
    { id: 'elbow-pain', text: 'Elbow pain', category: 'common' },
    { id: 'tennis-elbow', text: 'Tennis elbow', category: 'condition-specific', conditions: ['tennis-elbow'] },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'clicking', text: 'Clicking sound', category: 'common' }
  ],

  // WRIST SYSTEM
  'left-wrist': [
    { id: 'wrist-pain', text: 'Wrist pain', category: 'common' },
    { id: 'carpal-tunnel', text: 'Carpal tunnel symptoms', category: 'condition-specific', conditions: ['carpal-tunnel'] },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'tingling', text: 'Tingling', category: 'common' },
    { id: 'weakness', text: 'Weakness', category: 'common' }
  ],
  'right-wrist': [
    { id: 'wrist-pain', text: 'Wrist pain', category: 'common' },
    { id: 'carpal-tunnel', text: 'Carpal tunnel symptoms', category: 'condition-specific', conditions: ['carpal-tunnel'] },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'tingling', text: 'Tingling', category: 'common' },
    { id: 'weakness', text: 'Weakness', category: 'common' }
  ],

  // HAND SYSTEM
  'left-hand': [
    { id: 'hand-pain', text: 'Hand pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'tingling', text: 'Tingling', category: 'common' },
    { id: 'carpal-tunnel', text: 'Carpal tunnel symptoms', category: 'condition-specific', conditions: ['carpal-tunnel'] },
    { id: 'arthritis-hands', text: 'Joint stiffness', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true }
  ],
  'right-hand': [
    { id: 'hand-pain', text: 'Hand pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'tingling', text: 'Tingling', category: 'common' },
    { id: 'carpal-tunnel', text: 'Carpal tunnel symptoms', category: 'condition-specific', conditions: ['carpal-tunnel'] },
    { id: 'arthritis-hands', text: 'Joint stiffness', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true }
  ],

  // ABDOMEN & DIGESTIVE SYSTEM
  'abdomen': [
    { id: 'abdominal-pain', text: 'Abdominal pain', category: 'common' },
    { id: 'nausea', text: 'Nausea', category: 'common' },
    { id: 'bloating', text: 'Bloating', category: 'common' },
    { id: 'cramping', text: 'Cramping', category: 'common' },
    { id: 'digestive-issues', text: 'Digestive issues', category: 'condition-specific', conditions: ['diabetes', 'ibs'] },
    { id: 'gas', text: 'Gas', category: 'common' },
    { id: 'constipation', text: 'Constipation', category: 'common' },
    { id: 'diarrhea', text: 'Diarrhea', category: 'common' }
  ],
  'stomach': [
    { id: 'stomach-pain', text: 'Stomach pain', category: 'common' },
    { id: 'nausea', text: 'Nausea', category: 'common' },
    { id: 'heartburn', text: 'Heartburn', category: 'common' },
    { id: 'indigestion', text: 'Indigestion', category: 'common' },
    { id: 'acid-reflux', text: 'Acid reflux', category: 'common' },
    { id: 'burning-sensation', text: 'Burning sensation', category: 'common' }
  ],

  // BACK SYSTEM
  'back': [
    { id: 'back-pain', text: 'Back pain', category: 'common' },
    { id: 'muscle-tension', text: 'Muscle tension', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'sharp-pain', text: 'Sharp pain', category: 'common' },
    { id: 'chronic-ache', text: 'Chronic ache', category: 'condition-specific', conditions: ['chronic-pain'] },
    { id: 'muscle-spasm', text: 'Muscle spasm', category: 'common' }
  ],
  'lower-back': [
    { id: 'lower-back-pain', text: 'Lower back pain', category: 'common' },
    { id: 'sciatica', text: 'Sciatica', category: 'condition-specific', conditions: ['sciatica'] },
    { id: 'muscle-spasm', text: 'Muscle spasm', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'radiating-pain', text: 'Radiating pain', category: 'common' }
  ],

  // HIP SYSTEM
  'left-hip': [
    { id: 'hip-pain', text: 'Hip pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'limited-mobility', text: 'Limited mobility', category: 'common' },
    { id: 'arthritis-hip', text: 'Hip arthritis', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'clicking', text: 'Clicking sound', category: 'common' }
  ],
  'right-hip': [
    { id: 'hip-pain', text: 'Hip pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'limited-mobility', text: 'Limited mobility', category: 'common' },
    { id: 'arthritis-hip', text: 'Hip arthritis', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'clicking', text: 'Clicking sound', category: 'common' }
  ],

  // KNEE SYSTEM
  'left-knee': [
    { id: 'knee-pain', text: 'Knee pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'clicking-sound', text: 'Clicking sound', category: 'common' },
    { id: 'morning-stiffness', text: 'Morning stiffness', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'weather-sensitivity', text: 'Weather sensitivity', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'instability', text: 'Instability', category: 'common' },
    { id: 'locking', text: 'Knee locking', category: 'common' }
  ],
  'right-knee': [
    { id: 'knee-pain', text: 'Knee pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'clicking-sound', text: 'Clicking sound', category: 'common' },
    { id: 'morning-stiffness', text: 'Morning stiffness', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'weather-sensitivity', text: 'Weather sensitivity', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'instability', text: 'Instability', category: 'common' },
    { id: 'locking', text: 'Knee locking', category: 'common' }
  ],

  // ANKLE SYSTEM
  'left-ankle': [
    { id: 'ankle-pain', text: 'Ankle pain', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'instability', text: 'Instability', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'achilles-pain', text: 'Achilles tendon pain', category: 'common' },
    { id: 'weakness', text: 'Weakness', category: 'common' }
  ],
  'right-ankle': [
    { id: 'ankle-pain', text: 'Ankle pain', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'instability', text: 'Instability', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'achilles-pain', text: 'Achilles tendon pain', category: 'common' },
    { id: 'weakness', text: 'Weakness', category: 'common' }
  ],

  // FOOT SYSTEM
  'left-foot': [
    { id: 'foot-pain', text: 'Foot pain', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'calluses', text: 'Calluses', category: 'visual', requiresPhoto: true },
    { id: 'diabetic-foot', text: 'Foot concerns', category: 'condition-specific', conditions: ['diabetes'] },
    { id: 'plantar-fasciitis', text: 'Heel pain', category: 'condition-specific', conditions: ['plantar-fasciitis'] },
    { id: 'arch-pain', text: 'Arch pain', category: 'common' },
    { id: 'burning-sensation', text: 'Burning sensation', category: 'common' }
  ],
  'right-foot': [
    { id: 'foot-pain', text: 'Foot pain', category: 'common' },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true },
    { id: 'numbness', text: 'Numbness', category: 'common' },
    { id: 'calluses', text: 'Calluses', category: 'visual', requiresPhoto: true },
    { id: 'diabetic-foot', text: 'Foot concerns', category: 'condition-specific', conditions: ['diabetes'] },
    { id: 'plantar-fasciitis', text: 'Heel pain', category: 'condition-specific', conditions: ['plantar-fasciitis'] },
    { id: 'arch-pain', text: 'Arch pain', category: 'common' },
    { id: 'burning-sensation', text: 'Burning sensation', category: 'common' }
  ],

  // FINGER SYSTEM
  'left-thumb': [
    { id: 'joint-pain', text: 'Joint pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'trigger-finger', text: 'Trigger finger', category: 'condition-specific', conditions: ['trigger-finger'] },
    { id: 'arthritis', text: 'Arthritis pain', category: 'condition-specific', conditions: ['arthritis'] },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true }
  ],
  'left-index': [
    { id: 'joint-pain', text: 'Joint pain', category: 'common' },
    { id: 'stiffness', text: 'Stiffness', category: 'common' },
    { id: 'trigger-finger', text: 'Trigger finger', category: 'condition-specific', conditions: ['trigger-finger'] },
    { id: 'numbness', text: 'Numbness', category: 'common' }
  ],

  // TOE SYSTEM
  'left-big-toe': [
    { id: 'gout', text: 'Gout attack', category: 'condition-specific', conditions: ['gout'] },
    { id: 'ingrown-nail', text: 'Ingrown toenail', category: 'visual', requiresPhoto: true },
    { id: 'joint-pain', text: 'Joint pain', category: 'common' },
    { id: 'bunion', text: 'Bunion pain', category: 'condition-specific', conditions: ['bunions'] },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true }
  ],
  'right-big-toe': [
    { id: 'gout', text: 'Gout attack', category: 'condition-specific', conditions: ['gout'] },
    { id: 'ingrown-nail', text: 'Ingrown toenail', category: 'visual', requiresPhoto: true },
    { id: 'joint-pain', text: 'Joint pain', category: 'common' },
    { id: 'bunion', text: 'Bunion pain', category: 'condition-specific', conditions: ['bunions'] },
    { id: 'swelling', text: 'Swelling', category: 'measurable', requiresMeasurement: true }
  ]
};