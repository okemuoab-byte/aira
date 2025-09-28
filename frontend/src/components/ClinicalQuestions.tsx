import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Brain, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Clock,
  Activity,
  AlertTriangle,
  Thermometer,
  Heart,
  Zap,
  Target,
  FileText,
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicalQuestion {
  id: string;
  type: 'multiple_choice' | 'scale' | 'yes_no' | 'text' | 'multi_select' | 'duration';
  category: 'symptom_details' | 'onset_pattern' | 'severity' | 'associated_symptoms' | 'medical_history' | 'risk_factors';
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
  relevance_score: number;
  clinical_significance: 'high' | 'medium' | 'low';
  nice_guideline_reference?: string;
}

interface QuestionResponse {
  question_id: string;
  answer: string | string[] | number;
  confidence: number;
  timestamp: Date;
}

interface ClinicalQuestionsProps {
  symptomData: any;
  patientProfile: any;
  onQuestionsComplete: (responses: QuestionResponse[]) => void;
  className?: string;
}

const ClinicalQuestions: React.FC<ClinicalQuestionsProps> = ({
  symptomData,
  patientProfile,
  onQuestionsComplete,
  className
}) => {
  const [questions, setQuestions] = useState<ClinicalQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | number>('');
  const [confidence, setConfidence] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    generateClinicalQuestions();
  }, [symptomData]);

  const generateClinicalQuestions = async () => {
    setIsLoading(true);
    
    // Generate contextual questions based on symptom and patient data
    const generatedQuestions = await generateQuestionsForSymptom(symptomData, patientProfile);
    setQuestions(generatedQuestions);
    setIsLoading(false);
  };

  const generateQuestionsForSymptom = async (symptom: any, profile: any): Promise<ClinicalQuestion[]> => {
    // This would typically call an AI service to generate contextual questions
    // For now, we'll use a comprehensive set of clinical questions
    
    const baseQuestions: ClinicalQuestion[] = [
      // Onset and Duration
      {
        id: 'onset_timing',
        type: 'multiple_choice',
        category: 'onset_pattern',
        question: 'When did this symptom first start?',
        description: 'Understanding the timeline helps determine urgency and potential causes',
        options: [
          'Less than 1 hour ago',
          '1-6 hours ago',
          '6-24 hours ago',
          '1-3 days ago',
          '3-7 days ago',
          'More than 1 week ago',
          'Gradual onset over weeks/months'
        ],
        required: true,
        relevance_score: 9,
        clinical_significance: 'high',
        nice_guideline_reference: 'NICE CG95 - Chest pain assessment'
      },
      
      {
        id: 'onset_pattern',
        type: 'multiple_choice',
        category: 'onset_pattern',
        question: 'How did the symptom start?',
        options: [
          'Suddenly and severely',
          'Gradually over minutes',
          'Gradually over hours',
          'Came and went initially',
          'Started mild and got worse',
          'Been constant since it started'
        ],
        required: true,
        relevance_score: 8,
        clinical_significance: 'high'
      },

      // Severity and Character
      {
        id: 'pain_character',
        type: 'multi_select',
        category: 'symptom_details',
        question: 'How would you describe the sensation? (Select all that apply)',
        options: [
          'Sharp/stabbing',
          'Dull ache',
          'Burning',
          'Throbbing/pulsating',
          'Cramping',
          'Pressure/squeezing',
          'Tingling/pins and needles',
          'Numbness',
          'Stiffness',
          'Swelling'
        ],
        required: true,
        relevance_score: 8,
        clinical_significance: 'high'
      },

      {
        id: 'severity_change',
        type: 'multiple_choice',
        category: 'severity',
        question: 'Has the intensity changed since it started?',
        options: [
          'Getting much worse',
          'Getting slightly worse',
          'Staying the same',
          'Getting slightly better',
          'Getting much better',
          'Comes and goes in waves'
        ],
        required: true,
        relevance_score: 7,
        clinical_significance: 'medium'
      },

      // Triggers and Relieving Factors
      {
        id: 'triggers',
        type: 'multi_select',
        category: 'symptom_details',
        question: 'What makes it worse? (Select all that apply)',
        options: [
          'Movement/activity',
          'Deep breathing',
          'Coughing/sneezing',
          'Eating',
          'Lying down',
          'Standing up',
          'Stress/anxiety',
          'Cold weather',
          'Hot weather',
          'Touch/pressure',
          'Nothing specific'
        ],
        required: false,
        relevance_score: 6,
        clinical_significance: 'medium'
      },

      {
        id: 'relieving_factors',
        type: 'multi_select',
        category: 'symptom_details',
        question: 'What makes it better? (Select all that apply)',
        options: [
          'Rest',
          'Movement/gentle exercise',
          'Heat application',
          'Cold application',
          'Pain medication',
          'Specific position',
          'Deep breathing',
          'Massage',
          'Nothing helps',
          'Haven\'t tried anything yet'
        ],
        required: false,
        relevance_score: 6,
        clinical_significance: 'medium'
      },

      // Associated Symptoms
      {
        id: 'associated_symptoms',
        type: 'multi_select',
        category: 'associated_symptoms',
        question: 'Are you experiencing any of these additional symptoms? (Select all that apply)',
        options: [
          'Fever/chills',
          'Nausea/vomiting',
          'Dizziness/lightheadedness',
          'Shortness of breath',
          'Rapid heartbeat',
          'Sweating',
          'Fatigue/weakness',
          'Headache',
          'Changes in vision',
          'Difficulty speaking',
          'Confusion',
          'Skin changes/rash'
        ],
        required: true,
        relevance_score: 9,
        clinical_significance: 'high'
      },

      // Red Flag Symptoms
      {
        id: 'red_flags',
        type: 'yes_no',
        category: 'risk_factors',
        question: 'Have you experienced any sudden, severe symptoms that feel different from anything you\'ve had before?',
        description: 'This helps identify potentially serious conditions requiring immediate attention',
        required: true,
        relevance_score: 10,
        clinical_significance: 'high'
      },

      // Previous Episodes
      {
        id: 'previous_episodes',
        type: 'multiple_choice',
        category: 'medical_history',
        question: 'Have you had similar symptoms before?',
        options: [
          'Never',
          'Once before',
          'A few times',
          'Many times',
          'This is ongoing/chronic'
        ],
        required: true,
        relevance_score: 7,
        clinical_significance: 'medium'
      },

      // Impact on Function
      {
        id: 'functional_impact',
        type: 'scale',
        category: 'severity',
        question: 'How much is this affecting your daily activities?',
        description: 'Rate from 0 (no impact) to 10 (completely unable to function)',
        required: true,
        relevance_score: 6,
        clinical_significance: 'medium'
      },

      // Sleep Impact
      {
        id: 'sleep_impact',
        type: 'yes_no',
        category: 'severity',
        question: 'Is this symptom preventing you from sleeping or waking you up?',
        required: false,
        relevance_score: 5,
        clinical_significance: 'medium'
      }
    ];

    // Filter and customize questions based on symptom type and body part
    return customizeQuestionsForSymptom(baseQuestions, symptom, profile);
  };

  const customizeQuestionsForSymptom = (
    baseQuestions: ClinicalQuestion[], 
    symptom: any, 
    profile: any
  ): ClinicalQuestion[] => {
    // Customize questions based on body part and symptom type
    let customizedQuestions = [...baseQuestions];

    // Add specific questions for chest symptoms
    if (symptom.bodyPartName?.toLowerCase().includes('chest')) {
      customizedQuestions.push({
        id: 'chest_radiation',
        type: 'multi_select',
        category: 'symptom_details',
        question: 'Does the chest discomfort spread to any other areas?',
        options: [
          'Left arm',
          'Right arm',
          'Both arms',
          'Neck',
          'Jaw',
          'Back',
          'Shoulder blades',
          'Upper abdomen',
          'No radiation'
        ],
        required: true,
        relevance_score: 9,
        clinical_significance: 'high',
        nice_guideline_reference: 'NICE CG95 - Chest pain assessment'
      });
    }

    // Add specific questions for head symptoms
    if (symptom.bodyPartName?.toLowerCase().includes('head')) {
      customizedQuestions.push({
        id: 'headache_location',
        type: 'multiple_choice',
        category: 'symptom_details',
        question: 'Where exactly is the head pain located?',
        options: [
          'All over the head',
          'One side only',
          'Forehead/front',
          'Back of head',
          'Top of head',
          'Around the eyes',
          'Temple area',
          'Base of skull/neck'
        ],
        required: true,
        relevance_score: 8,
        clinical_significance: 'high'
      });
    }

    // Sort by relevance and clinical significance
    return customizedQuestions
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 12); // Limit to most relevant questions
  };

  const handleAnswerChange = (answer: string | string[] | number) => {
    setCurrentAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (currentAnswer !== '' && currentAnswer !== null) {
      const response: QuestionResponse = {
        question_id: questions[currentQuestionIndex].id,
        answer: currentAnswer,
        confidence: confidence,
        timestamp: new Date()
      };

      setResponses(prev => [...prev, response]);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setConfidence(5);
      } else {
        setShowSummary(true);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Restore previous answer
      const previousResponse = responses[currentQuestionIndex - 1];
      if (previousResponse) {
        setCurrentAnswer(previousResponse.answer);
        setConfidence(previousResponse.confidence);
        // Remove the response we're going back to edit
        setResponses(prev => prev.slice(0, -1));
      }
    }
  };

  const handleComplete = () => {
    onQuestionsComplete(responses);
  };

  const renderQuestion = (question: ClinicalQuestion) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <RadioGroup 
            value={currentAnswer as string} 
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-sm cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multi_select':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={(currentAnswer as string[])?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentAnswers = (currentAnswer as string[]) || [];
                    if (checked) {
                      handleAnswerChange([...currentAnswers, option]);
                    } else {
                      handleAnswerChange(currentAnswers.filter(a => a !== option));
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`} className="text-sm cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <RadioGroup 
            value={currentAnswer as string} 
            onValueChange={handleAnswerChange}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="px-3">
              <Slider
                value={[currentAnswer as number || 0]}
                onValueChange={(value) => handleAnswerChange(value[0])}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 - No impact</span>
              <span className="font-medium text-blue-600">
                {currentAnswer || 0}/10
              </span>
              <span>10 - Severe impact</span>
            </div>
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={currentAnswer as string}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Please describe in detail..."
            className="min-h-[100px]"
          />
        );

      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'symptom_details': return Stethoscope;
      case 'onset_pattern': return Clock;
      case 'severity': return Activity;
      case 'associated_symptoms': return Heart;
      case 'medical_history': return FileText;
      case 'risk_factors': return AlertTriangle;
      default: return HelpCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'symptom_details': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'onset_pattern': return 'text-green-600 bg-green-50 border-green-200';
      case 'severity': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'associated_symptoms': return 'text-red-600 bg-red-50 border-red-200';
      case 'medical_history': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'risk_factors': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50", className)}>
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Brain className="h-12 w-12 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-blue-800 mb-2">
            Generating Clinical Questions
          </h3>
          <p className="text-blue-700">
            Creating personalized questions based on your symptoms...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showSummary) {
    return (
      <Card className={cn("border-green-200 bg-gradient-to-br from-green-50 to-blue-50", className)}>
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="h-6 w-6 mr-2" />
            Clinical Questions Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white/70 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Questions Answered:</span>
                <span className="font-medium ml-2">{responses.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Average Confidence:</span>
                <span className="font-medium ml-2">
                  {Math.round(responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length)}/10
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-green-800">Key Information Collected:</h4>
            {responses.slice(0, 5).map((response, index) => {
              const question = questions.find(q => q.id === response.question_id);
              return (
                <div key={index} className="bg-white/50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    {question?.question}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Array.isArray(response.answer) 
                      ? response.answer.join(', ') 
                      : response.answer.toString()}
                  </div>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={handleComplete}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Target className="h-4 w-4 mr-2" />
            Proceed to AI Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const CategoryIcon = getCategoryIcon(currentQuestion.category);
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className={cn("border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-blue-800">
            <Brain className="h-6 w-6 mr-2" />
            Clinical Assessment Questions
          </CardTitle>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-blue-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Category */}
        <div className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
          getCategoryColor(currentQuestion.category)
        )}>
          <CategoryIcon className="h-4 w-4 mr-2" />
          {currentQuestion.category.replace('_', ' ').toUpperCase()}
        </div>

        {/* Clinical Significance */}
        <div className="flex items-center space-x-2">
          <Badge 
            variant={currentQuestion.clinical_significance === 'high' ? 'destructive' : 
                    currentQuestion.clinical_significance === 'medium' ? 'default' : 'secondary'}
          >
            {currentQuestion.clinical_significance.toUpperCase()} PRIORITY
          </Badge>
          {currentQuestion.nice_guideline_reference && (
            <Badge variant="outline" className="text-xs">
              {currentQuestion.nice_guideline_reference}
            </Badge>
          )}
        </div>

        {/* Question */}
        <div className="bg-white/70 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {currentQuestion.question}
          </h3>
          
          {currentQuestion.description && (
            <p className="text-sm text-gray-600 mb-4 italic">
              {currentQuestion.description}
            </p>
          )}

          {renderQuestion(currentQuestion)}
        </div>

        {/* Confidence Slider */}
        <div className="bg-white/50 rounded-lg p-4 border border-blue-100">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            How confident are you in this answer?
          </Label>
          <div className="space-y-2">
            <Slider
              value={[confidence]}
              onValueChange={(value) => setConfidence(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 - Not sure</span>
              <span className="font-medium text-blue-600">{confidence}/10</span>
              <span>10 - Very confident</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNextQuestion}
            disabled={!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Question Requirements */}
        <div className="text-xs text-gray-500 text-center">
          {currentQuestion.required ? (
            <span className="text-red-600">* This question is required</span>
          ) : (
            <span>This question is optional</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClinicalQuestions;