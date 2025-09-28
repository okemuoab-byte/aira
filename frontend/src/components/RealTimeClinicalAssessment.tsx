import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Heart, 
  FileText, 
  Zap,
  TrendingUp,
  Target,
  Calendar,
  Shield,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Users,
  Phone,
  Ambulance
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { apiService } from '@/services/api';

interface AssessmentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  progress: number;
  icon: React.ComponentType<any>;
  estimatedTime: string;
}

interface ClinicalAssessment {
  assessment_id: string;
  timestamp: string;
  urgency_level: 'emergency' | 'urgent' | 'routine' | 'self-care';
  risk_level: 'critical' | 'high' | 'moderate' | 'low';
  classification: 'acute' | 'chronic' | 'acute-on-chronic';
  severity_score: number;
  primary_concern: string;
  clinical_summary: string;
  differential_diagnosis: string[];
  red_flags: string[];
  clinical_reasoning: string;
  recommendations: {
    immediate_actions: string[];
    short_term_plan: string[];
    long_term_plan: string[];
    monitoring_plan: string[];
  };
  next_steps: {
    healthcare_contact: string;
    timeframe: string;
    escalation_criteria: string[];
    follow_up_required: boolean;
    follow_up_timeframe: string;
  };
  patient_education: {
    condition_explanation: string;
    self_care_advice: string[];
    warning_signs: string[];
    lifestyle_advice: string[];
  };
  professional_review: {
    required: boolean;
    priority: 'immediate' | 'urgent' | 'routine';
    specialty_referral?: string;
    rationale: string;
  };
  nice_guidelines: string[];
  confidence_level: 'high' | 'moderate' | 'low';
  limitations: string[];
}

interface RealTimeClinicalAssessmentProps {
  symptomData: any;
  patientProfile: any;
  medicalHistory?: string[];
  currentMedications?: string[];
  onAssessmentComplete: (assessment: ClinicalAssessment) => void;
  className?: string;
}

const RealTimeClinicalAssessment: React.FC<RealTimeClinicalAssessmentProps> = ({
  symptomData,
  patientProfile,
  medicalHistory = [],
  currentMedications = [],
  onAssessmentComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState<ClinicalAssessment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessmentSteps: AssessmentStep[] = [
    {
      id: 'data_collection',
      name: 'Data Collection',
      description: 'Gathering symptom and patient information',
      status: 'completed',
      progress: 100,
      icon: FileText,
      estimatedTime: '1 min'
    },
    {
      id: 'symptom_analysis',
      name: 'Symptom Analysis',
      description: 'Analyzing symptoms using clinical algorithms',
      status: 'in_progress',
      progress: 0,
      icon: Brain,
      estimatedTime: '2 min'
    },
    {
      id: 'risk_assessment',
      name: 'Risk Assessment',
      description: 'Evaluating urgency and severity levels',
      status: 'pending',
      progress: 0,
      icon: AlertTriangle,
      estimatedTime: '1 min'
    },
    {
      id: 'differential_diagnosis',
      name: 'Differential Diagnosis',
      description: 'Identifying possible conditions',
      status: 'pending',
      progress: 0,
      icon: Stethoscope,
      estimatedTime: '2 min'
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Generating personalized action plan',
      status: 'pending',
      progress: 0,
      icon: Target,
      estimatedTime: '1 min'
    },
    {
      id: 'professional_review',
      name: 'Professional Review',
      description: 'Determining need for healthcare oversight',
      status: 'pending',
      progress: 0,
      icon: Shield,
      estimatedTime: '30 sec'
    }
  ];

  const [steps, setSteps] = useState(assessmentSteps);

  useEffect(() => {
    startAssessment();
  }, []);

  const startAssessment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate step-by-step processing
      for (let i = 1; i < steps.length; i++) {
        await processStep(i);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      }

      // Generate final assessment
      await generateComprehensiveAssessment();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
      showError('Assessment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processStep = async (stepIndex: number) => {
    setCurrentStep(stepIndex);
    
    // Update step status
    setSteps(prevSteps => 
      prevSteps.map((step, index) => {
        if (index < stepIndex) {
          return { ...step, status: 'completed', progress: 100 };
        } else if (index === stepIndex) {
          return { ...step, status: 'in_progress', progress: 0 };
        }
        return step;
      })
    );

    // Simulate progress within the step
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSteps(prevSteps => 
        prevSteps.map((step, index) => 
          index === stepIndex ? { ...step, progress } : step
        )
      );
    }

    // Mark step as completed
    setSteps(prevSteps => 
      prevSteps.map((step, index) => 
        index === stepIndex ? { ...step, status: 'completed', progress: 100 } : step
      )
    );
  };

  const generateComprehensiveAssessment = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/clinical-ai/comprehensive-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          symptoms: [symptomData],
          patient_profile: patientProfile,
          medical_history: medicalHistory,
          current_medications: currentMedications
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate assessment');
      }

      const data = await response.json();
      
      if (data.success) {
        setAssessment(data.assessment);
        onAssessmentComplete(data.assessment);
        showSuccess('Clinical assessment completed successfully');
      } else {
        throw new Error(data.error || 'Assessment generation failed');
      }
    } catch (err) {
      throw new Error(`Assessment API error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'from-red-500 to-red-600';
      case 'urgent': return 'from-orange-500 to-orange-600';
      case 'routine': return 'from-blue-500 to-blue-600';
      case 'self-care': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return Ambulance;
      case 'urgent': return AlertTriangle;
      case 'routine': return Calendar;
      case 'self-care': return Heart;
      default: return Activity;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (error) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="p-6">
          <Alert className="border-red-300 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Assessment Error:</strong> {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={startAssessment} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Retry Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className={cn("border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50", className)}>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Brain className="h-6 w-6 mr-2 animate-pulse" />
            AI Clinical Assessment in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-white/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                Overall Progress
              </span>
              <span className="text-sm text-blue-600">
                {Math.round((currentStep / (steps.length - 1)) * 100)}%
              </span>
            </div>
            <Progress 
              value={(currentStep / (steps.length - 1)) * 100} 
              className="h-2"
            />
          </div>

          {/* Step Details */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center space-x-4 p-3 rounded-lg transition-all duration-300",
                    step.status === 'completed' && "bg-green-50 border border-green-200",
                    step.status === 'in_progress' && "bg-blue-50 border border-blue-200 shadow-sm",
                    step.status === 'pending' && "bg-gray-50 border border-gray-200"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    step.status === 'completed' && "bg-green-100",
                    step.status === 'in_progress' && "bg-blue-100",
                    step.status === 'pending' && "bg-gray-100"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      step.status === 'completed' && "text-green-600",
                      step.status === 'in_progress' && "text-blue-600 animate-pulse",
                      step.status === 'pending' && "text-gray-400"
                    )} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        "font-medium",
                        step.status === 'completed' && "text-green-800",
                        step.status === 'in_progress' && "text-blue-800",
                        step.status === 'pending' && "text-gray-600"
                      )}>
                        {step.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {step.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {step.status === 'in_progress' && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {step.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <p className={cn(
                      "text-sm mt-1",
                      step.status === 'completed' && "text-green-700",
                      step.status === 'in_progress' && "text-blue-700",
                      step.status === 'pending' && "text-gray-500"
                    )}>
                      {step.description}
                    </p>
                    
                    {step.status === 'in_progress' && (
                      <div className="mt-2">
                        <Progress value={step.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Activity */}
          <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-700">
              <Sparkles className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">
                {currentStep < steps.length ? steps[currentStep]?.description : 'Finalizing assessment...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render completed assessment
  const UrgencyIcon = getUrgencyIcon(assessment.urgency_level);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Emergency Alert */}
      {assessment.urgency_level === 'emergency' && (
        <Alert className="border-red-500 bg-red-50 animate-pulse">
          <Ambulance className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800 font-semibold text-lg">
            🚨 MEDICAL EMERGENCY DETECTED - CALL 999 IMMEDIATELY
          </AlertDescription>
        </Alert>
      )}

      {/* Main Assessment Card */}
      <Card className="border-0 shadow-2xl overflow-hidden">
        <CardHeader className={cn("text-white bg-gradient-to-r", getUrgencyColor(assessment.urgency_level))}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              <UrgencyIcon className="h-6 w-6 mr-3" />
              Clinical Assessment Complete
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className="bg-white/20 text-white border-white/30">
                AI + NICE Guidelines
              </Badge>
              <Badge className={cn("border", getRiskBadgeColor(assessment.confidence_level))}>
                {assessment.confidence_level.toUpperCase()} CONFIDENCE
              </Badge>
            </div>
          </div>
          <p className="text-blue-100 mt-2">
            Assessment ID: {assessment.assessment_id}
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{assessment.urgency_level.toUpperCase()}</div>
              <div className="text-sm text-red-600">Urgency Level</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{assessment.classification.toUpperCase()}</div>
              <div className="text-sm text-orange-600">Classification</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <Badge className={cn("text-lg font-bold", getRiskBadgeColor(assessment.risk_level))}>
                {assessment.risk_level.toUpperCase()}
              </Badge>
              <div className="text-sm text-yellow-600 mt-1">Risk Level</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-700">{assessment.severity_score}/10</div>
              <div className="text-sm text-blue-600">Severity Score</div>
            </div>
          </div>

          {/* Clinical Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Primary Clinical Concern
            </h4>
            <p className="text-purple-700 text-lg font-medium mb-4">{assessment.primary_concern}</p>
            <div className="bg-white/50 rounded-lg p-4">
              <h5 className="font-medium text-purple-800 mb-2">Clinical Summary</h5>
              <p className="text-purple-700 text-sm leading-relaxed">{assessment.clinical_summary}</p>
            </div>
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="immediate" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="immediate">Immediate Actions</TabsTrigger>
              <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
              <TabsTrigger value="education">Patient Education</TabsTrigger>
              <TabsTrigger value="followup">Follow-up Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="immediate" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Immediate Actions
                  </h5>
                  <ul className="space-y-2">
                    {assessment.recommendations.immediate_actions.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-red-700">
                        <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Next Steps ({assessment.next_steps.timeframe})
                  </h5>
                  <div className="space-y-2">
                    <p className="text-sm text-orange-700">
                      <strong>Contact:</strong> {assessment.next_steps.healthcare_contact}
                    </p>
                    {assessment.next_steps.follow_up_required && (
                      <p className="text-sm text-orange-700">
                        <strong>Follow-up:</strong> {assessment.next_steps.follow_up_timeframe}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-3">Differential Diagnosis</h5>
                  <ul className="space-y-1">
                    {assessment.differential_diagnosis.map((diagnosis, index) => (
                      <li key={index} className="text-blue-700 text-sm">• {diagnosis}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-3">NICE Guidelines</h5>
                  <ul className="space-y-1">
                    {assessment.nice_guidelines.map((guideline, index) => (
                      <li key={index} className="text-green-700 text-sm">• {guideline}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {assessment.red_flags.length > 0 && (
                <Alert className="border-red-300 bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertDescription>
                    <div className="font-semibold text-red-800 mb-2">⚠️ Clinical Red Flags:</div>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      {assessment.red_flags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="education" className="space-y-4 mt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-semibold text-yellow-800 mb-3">Condition Explanation</h5>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  {assessment.patient_education.condition_explanation}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-3">Self-Care Advice</h5>
                  <ul className="space-y-2">
                    {assessment.patient_education.self_care_advice.map((advice, index) => (
                      <li key={index} className="flex items-start space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-800 mb-3">Warning Signs</h5>
                  <ul className="space-y-2">
                    {assessment.patient_education.warning_signs.map((sign, index) => (
                      <li key={index} className="flex items-start space-x-2 text-red-700">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="followup" className="space-y-4 mt-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h5 className="font-semibold text-indigo-800 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Professional Review Status
                </h5>
                <div className="space-y-2">
                  <p className="text-indigo-700">
                    <strong>Required:</strong> {assessment.professional_review.required ? 'Yes' : 'No'}
                  </p>
                  {assessment.professional_review.required && (
                    <>
                      <p className="text-indigo-700">
                        <strong>Priority:</strong> {assessment.professional_review.priority}
                      </p>
                      {assessment.professional_review.specialty_referral && (
                        <p className="text-indigo-700">
                          <strong>Specialty:</strong> {assessment.professional_review.specialty_referral}
                        </p>
                      )}
                      <p className="text-indigo-700 text-sm">
                        <strong>Rationale:</strong> {assessment.professional_review.rationale}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-semibold text-purple-800 mb-3">Monitoring Plan</h5>
                <ul className="space-y-2">
                  {assessment.recommendations.monitoring_plan.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2 text-purple-700">
                      <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={() => onAssessmentComplete(assessment)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept Assessment
            </Button>
            
            {assessment.urgency_level === 'emergency' && (
              <Button
                onClick={() => window.open('tel:999')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white animate-pulse"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call 999 Now
              </Button>
            )}
            
            {assessment.urgency_level === 'urgent' && (
              <Button
                onClick={() => window.open('tel:111')}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call NHS 111
              </Button>
            )}
          </div>

          {/* Disclaimer */}
          <Alert className="border-gray-300 bg-gray-50">
            <Shield className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700 text-sm">
              <strong>Medical Disclaimer:</strong> This AI assessment is based on NICE guidelines and clinical decision support tools. 
              It does not replace professional medical judgment. Always seek immediate medical attention for emergencies.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeClinicalAssessment;