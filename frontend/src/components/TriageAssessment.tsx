import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Clock,
  Activity,
  Phone,
  Calendar,
  Stethoscope,
  Brain,
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Heart,
  Ambulance,
  UserCheck,
  FileText,
  ArrowRight,
  Sparkles,
  Target
} from 'lucide-react';
import { Symptom } from '@/types/health';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import ClinicalQuestions from './ClinicalQuestions';
import RealTimeClinicalAssessment from './RealTimeClinicalAssessment';

interface TriageAssessmentProps {
  symptom: Symptom;
  patientAge?: number;
  patientConditions?: string[];
  onRecommendationAccept: (recommendation: TriageRecommendation) => void;
  className?: string;
}

interface TriageRecommendation {
  id: string;
  urgency: 'emergency' | 'urgent' | 'routine' | 'self-care';
  classification: 'acute' | 'chronic' | 'acute-on-chronic';
  severity: 'critical' | 'high' | 'moderate' | 'low';
  riskLevel: 'immediate' | 'high' | 'medium' | 'low';
  timeframe: string;
  primaryConcern: string;
  differentialDiagnosis: string[];
  redFlags: string[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  reasoning: string;
  niceGuidelines: string[];
  professionalReview: {
    required: boolean;
    priority: 'immediate' | 'urgent' | 'routine';
    specialtyRequired?: string;
  };
  followUpRequired: boolean;
  followUpTimeframe?: string;
  patientEducation: string[];
  warningSignsToWatch: string[];
}

const TriageAssessment: React.FC<TriageAssessmentProps> = ({
  symptom,
  patientAge = 45,
  patientConditions = [],
  onRecommendationAccept,
  className
}) => {
  const [triageResult, setTriageResult] = useState<TriageRecommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [professionalReviewStatus, setProfessionalReviewStatus] = useState<'pending' | 'reviewed' | 'escalated'>('pending');
  const [assessmentMode, setAssessmentMode] = useState<'questions' | 'realtime' | 'complete'>('questions');
  const [clinicalQuestions, setClinicalQuestions] = useState<any[]>([]);
  const [enhancedAssessment, setEnhancedAssessment] = useState<any>(null);

  useEffect(() => {
    // Start with clinical questions for better symptom analysis
    setAssessmentMode('questions');
  }, [symptom]);

  const handleClinicalQuestionsComplete = (responses: any[]) => {
    setClinicalQuestions(responses);
    setAssessmentMode('realtime');
  };

  const handleEnhancedAssessmentComplete = (assessment: any) => {
    setEnhancedAssessment(assessment);
    setAssessmentMode('complete');
    
    // Auto-escalate emergencies
    if (assessment.urgency_level === 'emergency') {
      setProfessionalReviewStatus('escalated');
      showError('EMERGENCY DETECTED - Healthcare professional notified immediately');
    } else {
      showSuccess('Enhanced AI clinical assessment completed successfully');
    }
  };

  const performTriageAssessment = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const assessment = analyzeSymptom(symptom, patientAge, patientConditions);
    setTriageResult(assessment);
    setIsAnalyzing(false);

    // Auto-escalate emergencies
    if (assessment.urgency === 'emergency') {
      setProfessionalReviewStatus('escalated');
      showError('EMERGENCY DETECTED - Healthcare professional notified immediately');
    }
  };

  const analyzeSymptom = (symptom: Symptom, age: number, conditions: string[]): TriageRecommendation => {
    const bodyPart = symptom.bodyPartName.toLowerCase();
    const symptomType = symptom.type.toLowerCase();
    const intensity = symptom.intensity;
    
    // Emergency Detection Patterns (Based on NICE Guidelines)
    const emergencyPatterns = [
      // Cardiovascular emergencies
      { pattern: /chest.*pain|heart.*pain|cardiac/i, bodyParts: ['chest', 'heart'], minIntensity: 7 },
      { pattern: /crushing|squeezing|pressure.*chest/i, bodyParts: ['chest'], minIntensity: 6 },
      { pattern: /shortness.*breath|difficulty.*breathing|can't.*breathe/i, bodyParts: ['chest', 'lungs'], minIntensity: 6 },
      
      // Neurological emergencies
      { pattern: /severe.*headache|worst.*headache|thunderclap/i, bodyParts: ['head'], minIntensity: 8 },
      { pattern: /sudden.*weakness|paralysis|can't.*move/i, bodyParts: ['arm', 'leg'], minIntensity: 7 },
      { pattern: /confusion|altered.*consciousness|dizzy.*severe/i, bodyParts: ['head'], minIntensity: 7 },
      
      // Abdominal emergencies
      { pattern: /severe.*abdominal|excruciating.*stomach/i, bodyParts: ['abdomen', 'stomach'], minIntensity: 8 },
      { pattern: /appendicitis|right.*lower.*pain/i, bodyParts: ['abdomen'], minIntensity: 6 },
      
      // Other emergencies
      { pattern: /severe.*bleeding|hemorrhage|blood.*loss/i, bodyParts: [], minIntensity: 5 },
      { pattern: /anaphylaxis|severe.*allergic|can't.*swallow/i, bodyParts: ['throat'], minIntensity: 6 }
    ];

    // Check for emergency patterns
    const isEmergency = emergencyPatterns.some(pattern => {
      const matchesPattern = pattern.pattern.test(symptomType) || pattern.pattern.test(symptom.notes || '');
      const matchesBodyPart = pattern.bodyParts.length === 0 || pattern.bodyParts.some(part => bodyPart.includes(part));
      const meetsIntensity = intensity >= pattern.minIntensity;
      return matchesPattern && matchesBodyPart && meetsIntensity;
    });

    if (isEmergency) {
      return createEmergencyAssessment(symptom, age, conditions);
    }

    // High-risk conditions requiring urgent care
    const urgentPatterns = [
      { pattern: /chest.*pain/i, bodyParts: ['chest'], minIntensity: 5 },
      { pattern: /severe.*pain/i, bodyParts: [], minIntensity: 7 },
      { pattern: /sudden.*onset/i, bodyParts: [], minIntensity: 6 },
      { pattern: /getting.*worse|worsening/i, bodyParts: [], minIntensity: 5 }
    ];

    const isUrgent = urgentPatterns.some(pattern => {
      const matchesPattern = pattern.pattern.test(symptomType) || pattern.pattern.test(symptom.notes || '');
      const matchesBodyPart = pattern.bodyParts.length === 0 || pattern.bodyParts.some(part => bodyPart.includes(part));
      const meetsIntensity = intensity >= pattern.minIntensity;
      return matchesPattern && matchesBodyPart && meetsIntensity;
    });

    if (isUrgent) {
      return createUrgentAssessment(symptom, age, conditions);
    }

    // Chronic condition management
    const hasChronicConditions = conditions.some(condition => 
      ['diabetes', 'arthritis', 'hypertension', 'heart disease'].includes(condition.toLowerCase())
    );

    if (hasChronicConditions && intensity >= 4) {
      return createChronicManagementAssessment(symptom, age, conditions);
    }

    // Routine/self-care assessment
    return createRoutineAssessment(symptom, age, conditions);
  };

  const createEmergencyAssessment = (symptom: Symptom, age: number, conditions: string[]): TriageRecommendation => ({
    id: `emergency-${Date.now()}`,
    urgency: 'emergency',
    classification: 'acute',
    severity: 'critical',
    riskLevel: 'immediate',
    timeframe: 'IMMEDIATE - Call 999 now',
    primaryConcern: determineEmergencyConcern(symptom),
    differentialDiagnosis: getEmergencyDifferentials(symptom),
    redFlags: getRedFlags(symptom, 'emergency'),
    recommendations: {
      immediate: [
        '🚨 CALL 999 IMMEDIATELY',
        'Do not drive yourself to hospital',
        'Stay with someone if possible',
        'Take list of current medications',
        'Note exact time symptoms started'
      ],
      shortTerm: [
        'Follow paramedic/A&E instructions exactly',
        'Inform them of all current medications',
        'Mention any allergies or medical conditions'
      ],
      longTerm: [
        'Follow up with GP after discharge',
        'Attend all follow-up appointments',
        'Consider cardiac rehabilitation if heart-related'
      ]
    },
    reasoning: `High-intensity symptoms (${symptom.intensity}/10) in ${symptom.bodyPartName} with pattern matching emergency criteria. Immediate medical intervention required to rule out life-threatening conditions.`,
    niceGuidelines: [
      'NICE CG95 - Chest pain of recent onset',
      'NICE CG68 - Stroke and transient ischaemic attack',
      'NICE CG141 - Acute upper gastrointestinal bleeding'
    ],
    professionalReview: {
      required: true,
      priority: 'immediate',
      specialtyRequired: determineSpecialty(symptom)
    },
    followUpRequired: true,
    followUpTimeframe: '24-48 hours post-discharge',
    patientEducation: [
      'Emergency symptoms require immediate medical attention',
      'Never ignore severe, sudden-onset symptoms',
      'Keep emergency contact numbers readily available'
    ],
    warningSignsToWatch: [
      'Worsening of current symptoms',
      'New symptoms developing',
      'Difficulty breathing or speaking',
      'Loss of consciousness',
      'Severe bleeding'
    ]
  });

  const createUrgentAssessment = (symptom: Symptom, age: number, conditions: string[]): TriageRecommendation => ({
    id: `urgent-${Date.now()}`,
    urgency: 'urgent',
    classification: determineClassification(symptom, conditions),
    severity: 'high',
    riskLevel: 'high',
    timeframe: 'Within 4-6 hours',
    primaryConcern: determineUrgentConcern(symptom),
    differentialDiagnosis: getUrgentDifferentials(symptom),
    redFlags: getRedFlags(symptom, 'urgent'),
    recommendations: {
      immediate: [
        'Contact GP for urgent same-day appointment',
        'If GP unavailable, visit Urgent Care Centre',
        'Consider NHS 111 for guidance',
        'Monitor symptoms closely'
      ],
      shortTerm: [
        'Follow prescribed treatment plan',
        'Return if symptoms worsen',
        'Keep symptom diary',
        'Avoid known triggers'
      ],
      longTerm: [
        'Schedule follow-up appointment',
        'Consider specialist referral if needed',
        'Lifestyle modifications as advised'
      ]
    },
    reasoning: `Moderate to high intensity symptoms (${symptom.intensity}/10) requiring prompt medical evaluation. Pattern suggests condition that could deteriorate without timely intervention.`,
    niceGuidelines: getNiceGuidelines(symptom),
    professionalReview: {
      required: true,
      priority: 'urgent',
      specialtyRequired: determineSpecialty(symptom)
    },
    followUpRequired: true,
    followUpTimeframe: '1-2 weeks',
    patientEducation: getPatientEducation(symptom, 'urgent'),
    warningSignsToWatch: getWarningSignsToWatch(symptom)
  });

  const createChronicManagementAssessment = (symptom: Symptom, age: number, conditions: string[]): TriageRecommendation => ({
    id: `chronic-${Date.now()}`,
    urgency: 'routine',
    classification: 'acute-on-chronic',
    severity: 'moderate',
    riskLevel: 'medium',
    timeframe: 'Within 1-2 weeks',
    primaryConcern: 'Exacerbation of chronic condition',
    differentialDiagnosis: getChronicDifferentials(symptom, conditions),
    redFlags: getRedFlags(symptom, 'chronic'),
    recommendations: {
      immediate: [
        'Review current medication compliance',
        'Implement symptom management strategies',
        'Monitor blood pressure/glucose if relevant',
        'Contact GP if symptoms persist >48 hours'
      ],
      shortTerm: [
        'Schedule routine GP appointment',
        'Review chronic disease management plan',
        'Consider medication adjustment',
        'Lifestyle modification review'
      ],
      longTerm: [
        'Regular chronic disease monitoring',
        'Annual health checks',
        'Specialist review as needed',
        'Patient education reinforcement'
      ]
    },
    reasoning: `Symptoms consistent with exacerbation of known chronic condition. Requires monitoring and possible treatment adjustment.`,
    niceGuidelines: getChronicNiceGuidelines(conditions),
    professionalReview: {
      required: true,
      priority: 'routine'
    },
    followUpRequired: true,
    followUpTimeframe: '2-4 weeks',
    patientEducation: getChronicPatientEducation(conditions),
    warningSignsToWatch: getChronicWarningSignsToWatch(conditions)
  });

  const createRoutineAssessment = (symptom: Symptom, age: number, conditions: string[]): TriageRecommendation => ({
    id: `routine-${Date.now()}`,
    urgency: 'routine',
    classification: 'acute',
    severity: 'low',
    riskLevel: 'low',
    timeframe: 'Within 2-4 weeks or as convenient',
    primaryConcern: 'Minor acute condition',
    differentialDiagnosis: getRoutineDifferentials(symptom),
    redFlags: [],
    recommendations: {
      immediate: [
        'Self-care measures appropriate',
        'Over-the-counter pain relief if needed',
        'Rest and gentle activity as tolerated',
        'Monitor for any worsening'
      ],
      shortTerm: [
        'Contact GP if no improvement in 1-2 weeks',
        'Continue symptom monitoring',
        'Gradual return to normal activities'
      ],
      longTerm: [
        'Routine health maintenance',
        'Consider preventive measures',
        'Lifestyle optimization'
      ]
    },
    reasoning: `Low-intensity symptoms (${symptom.intensity}/10) likely representing minor acute condition. Self-care appropriate with monitoring.`,
    niceGuidelines: ['NICE CG59 - Osteoarthritis', 'NICE CG88 - Low back pain'],
    professionalReview: {
      required: false,
      priority: 'routine'
    },
    followUpRequired: false,
    patientEducation: [
      'Most minor conditions resolve with time and self-care',
      'Gradual increase in activity as symptoms improve',
      'Seek medical advice if symptoms persist or worsen'
    ],
    warningSignsToWatch: [
      'Significant worsening of symptoms',
      'Development of new symptoms',
      'Symptoms persisting beyond expected timeframe'
    ]
  });

  // Helper functions
  const determineEmergencyConcern = (symptom: Symptom): string => {
    const bodyPart = symptom.bodyPartName.toLowerCase();
    const type = symptom.type.toLowerCase();
    
    if (bodyPart.includes('chest') || bodyPart.includes('heart')) return 'Possible cardiac emergency';
    if (bodyPart.includes('head') && symptom.intensity >= 8) return 'Possible neurological emergency';
    if (bodyPart.includes('abdomen') && symptom.intensity >= 8) return 'Possible surgical emergency';
    return 'Severe acute condition requiring immediate assessment';
  };

  const determineUrgentConcern = (symptom: Symptom): string => {
    const bodyPart = symptom.bodyPartName.toLowerCase();
    if (bodyPart.includes('chest')) return 'Chest pain requiring urgent evaluation';
    if (bodyPart.includes('abdomen')) return 'Abdominal pain requiring assessment';
    if (bodyPart.includes('head')) return 'Headache requiring medical review';
    return `${symptom.bodyPartName} symptoms requiring prompt medical attention`;
  };

  const determineClassification = (symptom: Symptom, conditions: string[]): 'acute' | 'chronic' | 'acute-on-chronic' => {
    const hasRelevantChronicCondition = conditions.some(condition => {
      const bodyPart = symptom.bodyPartName.toLowerCase();
      if (condition.includes('arthritis') && (bodyPart.includes('joint') || bodyPart.includes('knee'))) return true;
      if (condition.includes('diabetes') && bodyPart.includes('foot')) return true;
      if (condition.includes('heart') && bodyPart.includes('chest')) return true;
      return false;
    });
    
    return hasRelevantChronicCondition ? 'acute-on-chronic' : 'acute';
  };

  const determineSpecialty = (symptom: Symptom): string => {
    const bodyPart = symptom.bodyPartName.toLowerCase();
    if (bodyPart.includes('chest') || bodyPart.includes('heart')) return 'Cardiology';
    if (bodyPart.includes('head') || bodyPart.includes('brain')) return 'Neurology';
    if (bodyPart.includes('abdomen') || bodyPart.includes('stomach')) return 'Gastroenterology';
    return 'General Medicine';
  };

  const getEmergencyDifferentials = (symptom: Symptom): string[] => {
    const bodyPart = symptom.bodyPartName.toLowerCase();
    if (bodyPart.includes('chest')) {
      return ['Myocardial infarction', 'Pulmonary embolism', 'Aortic dissection', 'Pneumothorax'];
    }
    if (bodyPart.includes('head')) {
      return ['Stroke', 'Subarachnoid hemorrhage', 'Meningitis', 'Severe migraine'];
    }
    if (bodyPart.includes('abdomen')) {
      return ['Appendicitis', 'Bowel obstruction', 'Perforated viscus', 'Ectopic pregnancy'];
    }
    return ['Severe acute condition requiring immediate assessment'];
  };

  const getUrgentDifferentials = (symptom: Symptom): string[] => {
    const bodyPart = symptom.bodyPartName.toLowerCase();
    if (bodyPart.includes('chest')) {
      return ['Angina', 'Costochondritis', 'Gastroesophageal reflux', 'Musculoskeletal pain'];
    }
    if (bodyPart.includes('head')) {
      return ['Tension headache', 'Migraine', 'Sinusitis', 'Medication overuse headache'];
    }
    if (bodyPart.includes('abdomen')) {
      return ['Gastroenteritis', 'Peptic ulcer', 'Gallbladder disease', 'Urinary tract infection'];
    }
    return [`${symptom.bodyPartName} pain - various causes requiring assessment`];
  };

  const getChronicDifferentials = (symptom: Symptom, conditions: string[]): string[] => {
    return [
      'Exacerbation of known chronic condition',
      'Medication side effects',
      'Disease progression',
      'Comorbid acute condition'
    ];
  };

  const getRoutineDifferentials = (symptom: Symptom): string[] => {
    const bodyPart = symptom.bodyPartName.toLowerCase();
    if (bodyPart.includes('joint') || bodyPart.includes('muscle')) {
      return ['Muscle strain', 'Minor joint inflammation', 'Overuse injury', 'Viral myalgia'];
    }
    return ['Minor acute condition', 'Self-limiting illness', 'Benign musculoskeletal pain'];
  };

  const getRedFlags = (symptom: Symptom, urgency: string): string[] => {
    const common = [
      'Sudden severe onset',
      'Progressive worsening',
      'Associated systemic symptoms',
      'Neurological symptoms'
    ];
    
    if (urgency === 'emergency') {
      return [
        ...common,
        'Loss of consciousness',
        'Severe breathing difficulty',
        'Chest pain with sweating',
        'Sudden severe headache'
      ];
    }
    
    return common;
  };

  const getNiceGuidelines = (symptom: Symptom): string[] => {
    const bodyPart = symptom.bodyPartName.toLowerCase();
    if (bodyPart.includes('chest')) {
      return ['NICE CG95 - Chest pain of recent onset', 'NICE CG126 - Stable angina'];
    }
    if (bodyPart.includes('head')) {
      return ['NICE CG150 - Headaches in over 12s', 'NICE CG68 - Stroke and TIA'];
    }
    return ['NICE guidance relevant to presenting symptoms'];
  };

  const getChronicNiceGuidelines = (conditions: string[]): string[] => {
    const guidelines = [];
    if (conditions.includes('diabetes')) guidelines.push('NICE NG28 - Type 2 diabetes in adults');
    if (conditions.includes('arthritis')) guidelines.push('NICE CG59 - Osteoarthritis');
    if (conditions.includes('hypertension')) guidelines.push('NICE NG136 - Hypertension in adults');
    return guidelines.length > 0 ? guidelines : ['NICE guidance for chronic disease management'];
  };

  const getPatientEducation = (symptom: Symptom, urgency: string): string[] => {
    return [
      'Understanding your symptoms and when to seek help',
      'Appropriate use of pain relief medications',
      'Activity modification and rest principles',
      'When to return for further medical assessment'
    ];
  };

  const getChronicPatientEducation = (conditions: string[]): string[] => {
    return [
      'Chronic disease self-management principles',
      'Medication compliance importance',
      'Lifestyle modifications for your conditions',
      'Regular monitoring and follow-up importance'
    ];
  };

  const getWarningSignsToWatch = (symptom: Symptom): string[] => {
    return [
      'Significant worsening of pain or symptoms',
      'Development of fever or systemic symptoms',
      'New neurological symptoms',
      'Breathing difficulties',
      'Persistent vomiting'
    ];
  };

  const getChronicWarningSignsToWatch = (conditions: string[]): string[] => {
    const signs = ['Significant change in usual symptoms'];
    if (conditions.includes('diabetes')) signs.push('Signs of high/low blood sugar');
    if (conditions.includes('heart disease')) signs.push('New chest pain or breathlessness');
    return signs;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'from-red-500 to-red-600';
      case 'urgent': return 'from-orange-500 to-orange-600';
      case 'routine': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return Ambulance;
      case 'urgent': return AlertTriangle;
      case 'routine': return Calendar;
      default: return Info;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleAcceptRecommendation = () => {
    if (enhancedAssessment) {
      onRecommendationAccept(enhancedAssessment);
      showSuccess('Enhanced AI assessment accepted and saved to your health record');
    } else if (triageResult) {
      onRecommendationAccept(triageResult);
      showSuccess('Triage recommendations accepted and saved to your health record');
    }
  };

  // Render based on current assessment mode
  if (assessmentMode === 'questions') {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Brain className="h-6 w-6 mr-2" />
              Enhanced AI Clinical Assessment
            </CardTitle>
            <p className="text-blue-700">
              Let's gather detailed information about your symptoms for a more accurate assessment
            </p>
          </CardHeader>
        </Card>
        
        <ClinicalQuestions
          symptomData={symptom}
          patientProfile={{ age: patientAge, conditions: patientConditions }}
          onQuestionsComplete={handleClinicalQuestionsComplete}
        />
      </div>
    );
  }

  if (assessmentMode === 'realtime') {
    return (
      <div className={cn("space-y-6", className)}>
        <RealTimeClinicalAssessment
          symptomData={symptom}
          patientProfile={{ age: patientAge, conditions: patientConditions }}
          medicalHistory={patientConditions}
          onAssessmentComplete={handleEnhancedAssessmentComplete}
        />
      </div>
    );
  }

  if (assessmentMode === 'complete' && enhancedAssessment) {
    const UrgencyIcon = getUrgencyIcon(enhancedAssessment.urgency_level);
    
    return (
      <div className={cn("space-y-6", className)}>
        {/* Emergency Alert */}
        {enhancedAssessment.urgency_level === 'emergency' && (
          <Alert className="border-red-500 bg-red-50 animate-pulse">
            <Ambulance className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-semibold text-lg">
              🚨 MEDICAL EMERGENCY DETECTED - CALL 999 IMMEDIATELY
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Assessment Results */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          <CardHeader className={cn("text-white bg-gradient-to-r", getUrgencyColor(enhancedAssessment.urgency_level))}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <UrgencyIcon className="h-6 w-6 mr-3" />
                Enhanced Clinical Assessment Complete
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI + NICE Guidelines
                </Badge>
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-blue-100 mt-2">
              Professional healthcare oversight: {professionalReviewStatus === 'escalated' ? 'ESCALATED' : 'Pending review'}
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Key Assessment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">{enhancedAssessment.urgency_level?.toUpperCase()}</div>
                <div className="text-sm text-red-600">Urgency Level</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">{enhancedAssessment.classification?.toUpperCase()}</div>
                <div className="text-sm text-orange-600">Classification</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <Badge className={cn("text-lg font-bold", getSeverityBadge(enhancedAssessment.risk_level))}>
                  {enhancedAssessment.risk_level?.toUpperCase()}
                </Badge>
                <div className="text-sm text-yellow-600 mt-1">Risk Level</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-700">{enhancedAssessment.severity_score || 'N/A'}/10</div>
                <div className="text-sm text-blue-600">Severity Score</div>
              </div>
            </div>

            {/* Primary Concern */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Primary Clinical Concern
              </h4>
              <p className="text-purple-700 text-lg font-medium">{enhancedAssessment.primary_concern}</p>
              {enhancedAssessment.clinical_summary && (
                <div className="mt-4 bg-white/50 rounded-lg p-4">
                  <h5 className="font-medium text-purple-800 mb-2">Clinical Summary</h5>
                  <p className="text-purple-700 text-sm leading-relaxed">{enhancedAssessment.clinical_summary}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleAcceptRecommendation}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Enhanced Assessment
              </Button>
              
              {enhancedAssessment.urgency_level === 'emergency' && (
                <Button
                  onClick={() => window.open('tel:999')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white animate-pulse"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call 999 Now
                </Button>
              )}
              
              {enhancedAssessment.urgency_level === 'urgent' && (
                <Button
                  onClick={() => window.open('tel:111')}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call NHS 111
                </Button>
              )}
            </div>

            {/* Medical Disclaimer */}
            <Alert className="border-gray-300 bg-gray-50">
              <Info className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-700 text-sm">
                <strong>Medical Disclaimer:</strong> This enhanced AI assessment uses advanced clinical reasoning and NICE guidelines.
                It does not replace professional medical judgment. Always seek immediate medical attention for emergencies.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback to original triage assessment
  if (isAnalyzing) {
    return (
      <Card className={cn("border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50", className)}>
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Brain className="h-12 w-12 text-blue-600 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-blue-800 mb-2">AI Clinical Assessment in Progress</h3>
          <p className="text-blue-700 mb-4">
            Analyzing your symptoms using NICE clinical guidelines...
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
            <Zap className="h-4 w-4 animate-bounce" />
            <span>Checking for emergency indicators</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 mt-2">
            <Activity className="h-4 w-4 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span>Assessing severity and urgency</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 mt-2">
            <FileText className="h-4 w-4 animate-bounce" style={{ animationDelay: '0.4s' }} />
            <span>Generating clinical recommendations</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!triageResult) return null;

  const UrgencyIcon = getUrgencyIcon(triageResult.urgency);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Emergency Alert */}
      {triageResult.urgency === 'emergency' && (
        <Alert className="border-red-500 bg-red-50 animate-pulse">
          <Ambulance className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-semibold text-lg">
            🚨 MEDICAL EMERGENCY DETECTED - CALL 999 IMMEDIATELY
          </AlertDescription>
        </Alert>
      )}

      {/* Main Triage Card */}
      <Card className="border-0 shadow-2xl overflow-hidden">
        <CardHeader className={cn("text-white bg-gradient-to-r", getUrgencyColor(triageResult.urgency))}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <UrgencyIcon className="h-6 w-6 mr-3" />
              Clinical Assessment Complete
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-white/20 text-white border-white/30">
                AI + NICE Guidelines
              </Badge>
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-blue-100 mt-2">
            Professional healthcare oversight: {professionalReviewStatus === 'escalated' ? 'ESCALATED' : 'Pending review'}
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Key Assessment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{triageResult.urgency.toUpperCase()}</div>
              <div className="text-sm text-red-600">Urgency Level</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{triageResult.classification.toUpperCase()}</div>
              <div className="text-sm text-orange-600">Classification</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <Badge className={cn("text-lg font-bold", getSeverityBadge(triageResult.severity))}>
                {triageResult.severity.toUpperCase()}
              </Badge>
              <div className="text-sm text-yellow-600 mt-1">Severity</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-700">{triageResult.timeframe}</div>
              <div className="text-sm text-blue-600">Action Timeframe</div>
            </div>
          </div>

          {/* Primary Concern */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Primary Clinical Concern
            </h4>
            <p className="text-purple-700 text-lg font-medium">{triageResult.primaryConcern}</p>
          </div>

          {/* Red Flags */}
          {triageResult.redFlags.length > 0 && (
            <Alert className="border-red-300 bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertDescription>
                <div className="font-semibold text-red-800 mb-2">⚠️ Clinical Red Flags Identified:</div>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  {triageResult.redFlags.map((flag, index) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Recommendations */}
          <Tabs defaultValue="immediate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="immediate" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Immediate</span>
              </TabsTrigger>
              <TabsTrigger value="clinical" className="flex items-center space-x-2">
                <Stethoscope className="h-4 w-4" />
                <span>Clinical Details</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Patient Education</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="immediate" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Immediate Actions Required
                  </h5>
                  <ul className="space-y-2">
                    {triageResult.recommendations.immediate.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-red-700">
                        <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Short-term Actions (Next 24-48 hours)
                  </h5>
                  <ul className="space-y-2">
                    {triageResult.recommendations.shortTerm.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-orange-700">
                        <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-3">Differential Diagnosis</h5>
                  <ul className="space-y-1">
                    {triageResult.differentialDiagnosis.map((diagnosis, index) => (
                      <li key={index} className="text-blue-700 text-sm">• {diagnosis}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-3">NICE Guidelines Applied</h5>
                  <ul className="space-y-1">
                    {triageResult.niceGuidelines.map((guideline, index) => (
                      <li key={index} className="text-green-700 text-sm">• {guideline}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-semibold text-purple-800 mb-3">Clinical Reasoning</h5>
                <p className="text-purple-700 text-sm leading-relaxed">{triageResult.reasoning}</p>
              </div>
            </TabsContent>

            <TabsContent value="education" className="space-y-4 mt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-800 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Warning Signs to Watch For
                </h5>
                <ul className="space-y-2">
                  {triageResult.warningSignsToWatch.map((sign, index) => (
                    <li key={index} className="flex items-start space-x-2 text-yellow-700">
                      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Patient Education Points
                </h5>
                <ul className="space-y-2">
                  {triageResult.patientEducation.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2 text-green-700">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Professional Review Status */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-indigo-800 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Healthcare Professional Oversight
              </h4>
              <Badge className={cn(
                "border",
                professionalReviewStatus === 'escalated' ? "bg-red-100 text-red-800 border-red-300" :
                professionalReviewStatus === 'reviewed' ? "bg-green-100 text-green-800 border-green-300" :
                "bg-yellow-100 text-yellow-800 border-yellow-300"
              )}>
                {professionalReviewStatus.toUpperCase()}
              </Badge>
            </div>
            <div className="text-indigo-700">
              {triageResult.professionalReview.required ? (
                <div>
                  <p className="mb-2">
                    <strong>Review Required:</strong> {triageResult.professionalReview.priority} priority
                  </p>
                  {triageResult.professionalReview.specialtyRequired && (
                    <p className="mb-2">
                      <strong>Specialty:</strong> {triageResult.professionalReview.specialtyRequired}
                    </p>
                  )}
                  <p className="text-sm">
                    A qualified healthcare professional will review this assessment and may contact you directly if needed.
                  </p>
                </div>
              ) : (
                <p>This assessment is suitable for self-management with the provided guidance.</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleAcceptRecommendation}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept Recommendations
            </Button>
            
            {triageResult.urgency === 'emergency' && (
              <Button
                onClick={() => window.open('tel:999')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white animate-pulse"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call 999 Now
              </Button>
            )}
            
            {triageResult.urgency === 'urgent' && (
              <Button
                onClick={() => window.open('tel:111')}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call NHS 111
              </Button>
            )}
          </div>

          {/* Medical Disclaimer */}
          <Alert className="border-gray-300 bg-gray-50">
            <Info className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700 text-sm">
              <strong>Medical Disclaimer:</strong> This AI assessment is based on NICE guidelines and clinical decision support tools. 
              It does not replace professional medical judgment. Always seek immediate medical attention for emergencies. 
              Healthcare professionals supervise all assessments and may override AI recommendations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default TriageAssessment;