import { SymptomSuggestion } from '@/types/health';

export interface SystemicCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  suggestions: SymptomSuggestion[];
}

export const systemicSymptoms: SystemicCategory[] = [
  {
    id: 'skin',
    name: 'Skin Changes',
    description: 'Changes in skin appearance, texture, or sensation',
    icon: '🌡️',
    suggestions: [
      { id: 'rash', text: 'New rash or skin irritation', category: 'visual', requiresPhoto: true },
      { id: 'skin-color-change', text: 'Change in skin color', category: 'visual', requiresPhoto: true },
      { id: 'dry-skin', text: 'Unusually dry or flaky skin', category: 'visual', requiresPhoto: true },
      { id: 'itching', text: 'Itching or scratching', category: 'common' },
      { id: 'skin-sensitivity', text: 'Increased skin sensitivity', category: 'common' },
      { id: 'bruising', text: 'Easy bruising or unusual bruises', category: 'visual', requiresPhoto: true },
      { id: 'skin-lesions', text: 'New spots, moles, or lesions', category: 'visual', requiresPhoto: true },
      { id: 'skin-texture', text: 'Change in skin texture or thickness', category: 'visual', requiresPhoto: true },
      { id: 'sweating-changes', text: 'Changes in sweating patterns', category: 'common' },
      { id: 'skin-temperature', text: 'Skin feels unusually hot or cold', category: 'common' }
    ]
  },
  {
    id: 'mood',
    name: 'Mood & Mental Changes',
    description: 'Changes in mood, thinking, or mental well-being',
    icon: '🧠',
    suggestions: [
      { id: 'anxiety', text: 'Increased anxiety or worry', category: 'common' },
      { id: 'depression', text: 'Feeling down or depressed', category: 'common' },
      { id: 'irritability', text: 'More irritable than usual', category: 'common' },
      { id: 'mood-swings', text: 'Sudden mood changes', category: 'common' },
      { id: 'brain-fog', text: 'Difficulty concentrating or thinking clearly', category: 'condition-specific', conditions: ['diabetes', 'chronic-fatigue'] },
      { id: 'memory-issues', text: 'Memory problems or forgetfulness', category: 'common' },
      { id: 'sleep-changes', text: 'Changes in sleep patterns', category: 'common' },
      { id: 'energy-changes', text: 'Unusual fatigue or energy levels', category: 'common' },
      { id: 'stress-levels', text: 'Increased stress or overwhelm', category: 'common' },
      { id: 'emotional-numbness', text: 'Feeling emotionally numb or disconnected', category: 'common' }
    ]
  },
  {
    id: 'urine',
    name: 'Urinary Changes',
    description: 'Changes in urination patterns, color, or sensation',
    icon: '💧',
    suggestions: [
      { id: 'urine-color', text: 'Change in urine color', category: 'visual', requiresPhoto: true },
      { id: 'frequent-urination', text: 'Urinating more often than usual', category: 'condition-specific', conditions: ['diabetes', 'uti'] },
      { id: 'painful-urination', text: 'Pain or burning when urinating', category: 'common' },
      { id: 'urgent-urination', text: 'Sudden urgent need to urinate', category: 'common' },
      { id: 'difficulty-urinating', text: 'Difficulty starting or stopping urination', category: 'common' },
      { id: 'urine-smell', text: 'Strong or unusual urine odor', category: 'common' },
      { id: 'blood-in-urine', text: 'Blood in urine', category: 'visual', requiresPhoto: true, requiresFoodHistory: true },
      { id: 'cloudy-urine', text: 'Cloudy or foamy urine', category: 'visual', requiresPhoto: true },
      { id: 'incontinence', text: 'Loss of bladder control', category: 'common' },
      { id: 'reduced-urination', text: 'Urinating less than usual', category: 'common' }
    ]
  },
  {
    id: 'bowel',
    name: 'Bowel Changes',
    description: 'Changes in bowel movements, consistency, or patterns',
    icon: '🚽',
    suggestions: [
      { id: 'constipation', text: 'Constipation or difficulty passing stool', category: 'common' },
      { id: 'diarrhea', text: 'Loose or watery stools', category: 'common' },
      { id: 'stool-color', text: 'Change in stool color', category: 'visual', requiresPhoto: true },
      { id: 'stool-consistency', text: 'Change in stool consistency', category: 'common' },
      { id: 'bowel-frequency', text: 'Change in bowel movement frequency', category: 'common' },
      { id: 'blood-in-stool', text: 'Blood in stool', category: 'visual', requiresPhoto: true, requiresFoodHistory: true },
      { id: 'mucus-in-stool', text: 'Mucus in stool', category: 'visual', requiresPhoto: true },
      { id: 'bowel-urgency', text: 'Sudden urgent need for bowel movement', category: 'common' },
      { id: 'incomplete-evacuation', text: 'Feeling of incomplete bowel movement', category: 'common' },
      { id: 'bowel-incontinence', text: 'Loss of bowel control', category: 'common' }
    ]
  },
  {
    id: 'sleep',
    name: 'Sleep Changes',
    description: 'Changes in sleep quality, duration, or patterns',
    icon: '😴',
    suggestions: [
      { id: 'insomnia', text: 'Difficulty falling asleep', category: 'common' },
      { id: 'frequent-waking', text: 'Waking up frequently during night', category: 'common' },
      { id: 'early-waking', text: 'Waking up too early', category: 'common' },
      { id: 'excessive-sleepiness', text: 'Feeling excessively sleepy during day', category: 'common' },
      { id: 'sleep-quality', text: 'Poor sleep quality or unrefreshing sleep', category: 'common' },
      { id: 'nightmares', text: 'Increased nightmares or vivid dreams', category: 'common' },
      { id: 'sleep-schedule', text: 'Changes in sleep schedule', category: 'common' },
      { id: 'snoring-changes', text: 'New or worsened snoring', category: 'common' },
      { id: 'sleep-apnea', text: 'Stopping breathing during sleep', category: 'condition-specific', conditions: ['sleep-apnea'] },
      { id: 'restless-sleep', text: 'Restless or fidgety sleep', category: 'common' }
    ]
  },
  {
    id: 'appetite',
    name: 'Appetite & Weight Changes',
    description: 'Changes in appetite, eating patterns, or weight',
    icon: '🍽️',
    suggestions: [
      { id: 'appetite-loss', text: 'Loss of appetite', category: 'common' },
      { id: 'increased-appetite', text: 'Increased appetite or cravings', category: 'condition-specific', conditions: ['diabetes'] },
      { id: 'weight-loss', text: 'Unintentional weight loss', category: 'measurable', requiresMeasurement: true },
      { id: 'weight-gain', text: 'Unintentional weight gain', category: 'measurable', requiresMeasurement: true },
      { id: 'nausea', text: 'Nausea or feeling sick', category: 'common' },
      { id: 'food-aversions', text: 'New food aversions or dislikes', category: 'common' },
      { id: 'taste-changes', text: 'Changes in taste or smell', category: 'condition-specific', conditions: ['covid', 'medication-side-effects'] },
      { id: 'eating-patterns', text: 'Changes in eating patterns or timing', category: 'common' },
      { id: 'thirst-changes', text: 'Increased or decreased thirst', category: 'condition-specific', conditions: ['diabetes'] },
      { id: 'swallowing-difficulty', text: 'Difficulty swallowing', category: 'common' }
    ]
  }
];

// Food items that can cause color changes in urine or stool
export const colorChangingFoods = {
  urine: [
    'Beetroot', 'Blackberries', 'Rhubarb', 'Fava beans', 'Aloe vera',
    'Food coloring (red/pink)', 'Certain medications', 'Vitamin B supplements',
    'Carrots (large amounts)', 'Asparagus', 'Artificial food dyes'
  ],
  stool: [
    'Beetroot', 'Tomatoes', 'Red peppers', 'Cranberries', 'Red food coloring',
    'Iron supplements', 'Bismuth medications (Pepto-Bismol)', 'Blueberries',
    'Black licorice', 'Dark leafy greens', 'Red meat', 'Artificial food dyes',
    'Certain antibiotics', 'Blood sausage/black pudding'
  ]
};