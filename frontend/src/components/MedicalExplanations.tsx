import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, BookOpen, Image, Lightbulb, Heart, Brain, Stethoscope, Pill, Activity, AlertCircle, Mic, MicOff, Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface MedicalTerm {
  term: string;
  category: 'procedure' | 'condition' | 'medication' | 'anatomy' | 'test';
  simpleDefinition: string;
  detailedExplanation: string;
  commonNames: string[];
  relatedTerms: string[];
  illustration?: string;
}

interface IllustrationData {
  title: string;
  description: string;
  svgContent: string;
}

const MedicalExplanations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<MedicalTerm | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Audio functionality states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState('');
  
  // Refs for speech functionality
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Sample medical terms database
  const medicalTerms: MedicalTerm[] = [
    {
      term: 'Hypertension',
      category: 'condition',
      simpleDefinition: 'High blood pressure',
      detailedExplanation: 'Hypertension means your blood is pushing too hard against the walls of your blood vessels (arteries). Think of it like water flowing through a garden hose - if the pressure is too high, it can damage the hose over time. High blood pressure can damage your heart, brain, kidneys, and other organs if not treated.',
      commonNames: ['High blood pressure', 'High BP'],
      relatedTerms: ['Systolic pressure', 'Diastolic pressure', 'Blood pressure medication', 'Cardiovascular disease']
    },
    {
      term: 'Myocardial Infarction',
      category: 'condition',
      simpleDefinition: 'Heart attack',
      detailedExplanation: 'A myocardial infarction happens when blood flow to part of your heart muscle is blocked, usually by a blood clot. The heart muscle needs oxygen from blood to work properly. When it doesn\'t get enough oxygen, that part of the heart muscle can be damaged or die. This is what we commonly call a heart attack.',
      commonNames: ['Heart attack', 'MI'],
      relatedTerms: ['Coronary artery', 'Chest pain', 'Angina', 'Cardiac catheterization']
    },
    {
      term: 'Endoscopy',
      category: 'procedure',
      simpleDefinition: 'Looking inside your body with a tiny camera',
      detailedExplanation: 'An endoscopy is a procedure where doctors use a thin, flexible tube with a tiny camera and light on the end to look inside your body. It\'s like having a very small telescope that can see inside you. The tube can go through your mouth to look at your stomach, or through other openings to examine different parts of your body.',
      commonNames: ['Scope', 'Camera test'],
      relatedTerms: ['Colonoscopy', 'Upper endoscopy', 'Biopsy', 'Sedation']
    },
    {
      term: 'Diabetes Mellitus',
      category: 'condition',
      simpleDefinition: 'Your body has trouble controlling blood sugar',
      detailedExplanation: 'Diabetes happens when your body can\'t properly control the amount of sugar (glucose) in your blood. Think of insulin as a key that opens doors in your cells to let sugar in for energy. In diabetes, either your body doesn\'t make enough keys (insulin) or the keys don\'t work properly, so sugar builds up in your blood instead of getting into your cells.',
      commonNames: ['Diabetes', 'Sugar diabetes'],
      relatedTerms: ['Insulin', 'Blood glucose', 'HbA1c', 'Glucose meter']
    },
    {
      term: 'Antibiotic',
      category: 'medication',
      simpleDefinition: 'Medicine that fights bacterial infections',
      detailedExplanation: 'Antibiotics are medicines that kill bacteria or stop them from growing. Think of bacteria as tiny invaders that can make you sick. Antibiotics are like soldiers that fight these invaders. They only work against bacteria, not viruses (like the common cold or flu). It\'s important to take them exactly as prescribed to make sure all the bacteria are defeated.',
      commonNames: ['Germ-fighting medicine', 'Infection medicine'],
      relatedTerms: ['Bacteria', 'Infection', 'Resistance', 'Penicillin']
    },
    {
      term: 'Osteoarthritis',
      category: 'condition',
      simpleDefinition: 'Wear and tear of joint cartilage',
      detailedExplanation: 'Osteoarthritis happens when the smooth, slippery tissue (cartilage) that covers the ends of your bones wears away over time. Think of cartilage like the smooth surface of an ice rink - it helps your bones glide smoothly against each other. When this surface becomes rough or wears away, your bones rub together, causing pain, stiffness, and swelling.',
      commonNames: ['Arthritis', 'Joint wear', 'Degenerative joint disease'],
      relatedTerms: ['Cartilage', 'Joint pain', 'Inflammation', 'Physical therapy']
    }
  ];

  // Initialize speech functionality
  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceInput(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        speakText('Sorry, I couldn\'t understand that. Please try again.');
      };
    }
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Enhanced voice input processing with intelligent question analysis
  const handleVoiceInput = (transcript: string) => {
    setVoicePrompt(transcript);
    
    // Analyze the question intent and extract key information
    const questionAnalysis = analyzeQuestion(transcript);
    
    // Process based on question intent
    switch (questionAnalysis.intent) {
      case 'definition':
        handleDefinitionRequest(questionAnalysis);
        break;
      case 'symptoms':
        handleSymptomsRequest(questionAnalysis);
        break;
      case 'treatment':
        handleTreatmentRequest(questionAnalysis);
        break;
      case 'causes':
        handleCausesRequest(questionAnalysis);
        break;
      case 'comparison':
        handleComparisonRequest(questionAnalysis);
        break;
      case 'procedure':
        handleProcedureRequest(questionAnalysis);
        break;
      case 'help':
        handleHelpRequest();
        break;
      case 'search':
        handleSearchRequest(questionAnalysis);
        break;
      default:
        handleUnknownRequest(transcript);
    }
  };

  // Analyze question to determine intent and extract entities
  const analyzeQuestion = (transcript: string): {
    intent: string;
    medicalTerm?: MedicalTerm;
    keywords: string[];
    questionType: string;
  } => {
    const lowerTranscript = transcript.toLowerCase();
    const keywords = lowerTranscript.split(' ').filter(word => word.length > 2);
    
    // Find relevant medical term
    const medicalTerm = medicalTerms.find(term =>
      lowerTranscript.includes(term.term.toLowerCase()) ||
      term.commonNames.some(name => lowerTranscript.includes(name.toLowerCase())) ||
      keywords.some(keyword => term.term.toLowerCase().includes(keyword))
    );

    // Determine question intent based on patterns
    if (lowerTranscript.includes('what is') || lowerTranscript.includes('define') || lowerTranscript.includes('explain')) {
      return { intent: 'definition', medicalTerm, keywords, questionType: 'definition' };
    }
    
    if (lowerTranscript.includes('symptom') || lowerTranscript.includes('sign') || lowerTranscript.includes('feel like')) {
      return { intent: 'symptoms', medicalTerm, keywords, questionType: 'symptoms' };
    }
    
    if (lowerTranscript.includes('treat') || lowerTranscript.includes('cure') || lowerTranscript.includes('medicine') || lowerTranscript.includes('medication')) {
      return { intent: 'treatment', medicalTerm, keywords, questionType: 'treatment' };
    }
    
    if (lowerTranscript.includes('cause') || lowerTranscript.includes('why') || lowerTranscript.includes('reason')) {
      return { intent: 'causes', medicalTerm, keywords, questionType: 'causes' };
    }
    
    if (lowerTranscript.includes('difference') || lowerTranscript.includes('compare') || lowerTranscript.includes('versus') || lowerTranscript.includes('vs')) {
      return { intent: 'comparison', medicalTerm, keywords, questionType: 'comparison' };
    }
    
    if (lowerTranscript.includes('procedure') || lowerTranscript.includes('surgery') || lowerTranscript.includes('operation') || lowerTranscript.includes('how is it done')) {
      return { intent: 'procedure', medicalTerm, keywords, questionType: 'procedure' };
    }
    
    if (lowerTranscript.includes('help') || lowerTranscript.includes('how to use') || lowerTranscript.includes('commands')) {
      return { intent: 'help', keywords, questionType: 'help' };
    }
    
    if (lowerTranscript.includes('search') || lowerTranscript.includes('find') || lowerTranscript.includes('look for')) {
      return { intent: 'search', medicalTerm, keywords, questionType: 'search' };
    }
    
    return { intent: 'unknown', medicalTerm, keywords, questionType: 'unknown' };
  };

  // Handle definition requests
  const handleDefinitionRequest = (analysis: any) => {
    if (analysis.medicalTerm) {
      const term = analysis.medicalTerm;
      setSelectedTerm(term);
      setSearchTerm(term.term);
      
      let response = `${term.term} is ${term.simpleDefinition}. `;
      response += `Let me explain this in more detail: ${term.detailedExplanation}`;
      
      if (term.commonNames.length > 0) {
        response += ` You might also hear this called ${term.commonNames.join(' or ')}.`;
      }
      
      speakText(response);
    } else {
      const searchTerm = analysis.keywords.join(' ');
      setSearchTerm(searchTerm);
      speakText(`I'm looking for information about ${searchTerm}. I don't have specific details about that term in my database, but let me search for related terms.`);
    }
  };

  // Handle symptoms requests
  const handleSymptomsRequest = (analysis: any) => {
    if (analysis.medicalTerm) {
      const term = analysis.medicalTerm;
      setSelectedTerm(term);
      
      let response = `You asked about symptoms of ${term.term}. `;
      
      if (term.category === 'condition') {
        response += `${term.term}, which is ${term.simpleDefinition}, `;
        response += `can present in different ways. ${term.detailedExplanation} `;
        response += `For specific symptoms and how they might affect you personally, it's important to consult with your healthcare provider.`;
      } else {
        response += `${term.term} is ${term.simpleDefinition}. ${term.detailedExplanation}`;
      }
      
      speakText(response);
    } else {
      speakText(`You're asking about symptoms. While I can explain medical conditions and their general characteristics, for specific symptoms you're experiencing, please consult with a healthcare professional for proper evaluation.`);
    }
  };

  // Handle treatment requests
  const handleTreatmentRequest = (analysis: any) => {
    if (analysis.medicalTerm) {
      const term = analysis.medicalTerm;
      setSelectedTerm(term);
      
      let response = `You asked about treatment for ${term.term}. `;
      response += `${term.term} is ${term.simpleDefinition}. ${term.detailedExplanation} `;
      response += `Treatment options vary greatly depending on individual circumstances, severity, and other health factors. `;
      response += `It's essential to work with your healthcare provider to determine the best treatment approach for your specific situation.`;
      
      speakText(response);
    } else {
      speakText(`You're asking about treatment options. While I can provide general information about medical conditions, treatment decisions should always be made in consultation with qualified healthcare professionals who can evaluate your specific situation.`);
    }
  };

  // Handle causes requests
  const handleCausesRequest = (analysis: any) => {
    if (analysis.medicalTerm) {
      const term = analysis.medicalTerm;
      setSelectedTerm(term);
      
      let response = `You asked about what causes ${term.term}. `;
      response += `${term.term} is ${term.simpleDefinition}. ${term.detailedExplanation} `;
      
      // Add specific cause information based on the condition
      if (term.term.toLowerCase().includes('hypertension')) {
        response += `High blood pressure can be caused by various factors including genetics, diet, lifestyle, stress, and underlying health conditions.`;
      } else if (term.term.toLowerCase().includes('diabetes')) {
        response += `Diabetes occurs when your body cannot properly process blood sugar, which can be due to genetic factors, lifestyle, or autoimmune responses.`;
      } else {
        response += `The causes can be complex and vary from person to person. Your healthcare provider can help identify specific risk factors and causes relevant to your situation.`;
      }
      
      speakText(response);
    } else {
      speakText(`You're asking about causes of a medical condition. While I can provide general information, understanding the specific causes of health conditions often requires professional medical evaluation.`);
    }
  };

  // Handle comparison requests
  const handleComparisonRequest = (analysis: any) => {
    const terms = medicalTerms.filter(term =>
      analysis.keywords.some(keyword =>
        term.term.toLowerCase().includes(keyword) ||
        term.commonNames.some(name => name.toLowerCase().includes(keyword))
      )
    );
    
    if (terms.length >= 2) {
      const term1 = terms[0];
      const term2 = terms[1];
      
      let response = `You asked me to compare ${term1.term} and ${term2.term}. `;
      response += `${term1.term} is ${term1.simpleDefinition}, while ${term2.term} is ${term2.simpleDefinition}. `;
      response += `These are different medical concepts, and understanding their specific differences is important for your health knowledge.`;
      
      setSelectedTerm(term1);
      speakText(response);
    } else if (analysis.medicalTerm) {
      setSelectedTerm(analysis.medicalTerm);
      speakText(`You asked about comparing ${analysis.medicalTerm.term}. ${analysis.medicalTerm.term} is ${analysis.medicalTerm.simpleDefinition}. To make meaningful comparisons, please specify what you'd like to compare it with.`);
    } else {
      speakText(`You're asking for a comparison. Please specify which medical terms or conditions you'd like me to compare.`);
    }
  };

  // Handle procedure requests
  const handleProcedureRequest = (analysis: any) => {
    if (analysis.medicalTerm && analysis.medicalTerm.category === 'procedure') {
      const term = analysis.medicalTerm;
      setSelectedTerm(term);
      
      let response = `You asked about the ${term.term} procedure. `;
      response += `${term.term} is ${term.simpleDefinition}. ${term.detailedExplanation} `;
      response += `Your healthcare provider can explain the specific steps, preparation, and what to expect during this procedure.`;
      
      speakText(response);
    } else if (analysis.medicalTerm) {
      const term = analysis.medicalTerm;
      setSelectedTerm(term);
      speakText(`${term.term} is ${term.simpleDefinition}, which is a ${term.category}, not a procedure. ${term.detailedExplanation}`);
    } else {
      speakText(`You're asking about a medical procedure. I can provide general information about various procedures. Please specify which procedure you'd like to know about.`);
    }
  };

  // Handle help requests
  const handleHelpRequest = () => {
    const helpText = `I'm your medical explanation assistant. I can help you understand medical terms in simple language. Here are some ways you can ask me questions:
    
    Say "What is" followed by a medical term for definitions.
    Ask about "symptoms of" a condition.
    Ask "what causes" a medical condition.
    Ask about "treatment for" a condition.
    Ask me to "compare" two medical terms.
    Ask about medical "procedures".
    
    For example, you can say "What is diabetes?" or "What are the symptoms of hypertension?" I'll provide simple explanations and detailed information to help you understand.`;
    
    speakText(helpText);
  };

  // Handle search requests
  const handleSearchRequest = (analysis: any) => {
    const searchTerm = analysis.keywords.filter(word =>
      !['search', 'find', 'look', 'for'].includes(word)
    ).join(' ');
    
    setSearchTerm(searchTerm);
    
    const matchingTerms = medicalTerms.filter(term =>
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.commonNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      term.simpleDefinition.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingTerms.length > 0) {
      const term = matchingTerms[0];
      setSelectedTerm(term);
      speakText(`I found ${matchingTerms.length} result${matchingTerms.length > 1 ? 's' : ''} for "${searchTerm}". The top result is ${term.term}, which is ${term.simpleDefinition}. ${term.detailedExplanation}`);
    } else {
      speakText(`I searched for "${searchTerm}" but couldn't find any matching medical terms in my database. Try asking about common conditions like diabetes, hypertension, or medical procedures.`);
    }
  };

  // Handle unknown requests
  const handleUnknownRequest = (transcript: string) => {
    // Try to find any medical term mentioned
    const foundTerm = medicalTerms.find(term =>
      transcript.toLowerCase().includes(term.term.toLowerCase()) ||
      term.commonNames.some(name => transcript.toLowerCase().includes(name.toLowerCase()))
    );
    
    if (foundTerm) {
      setSelectedTerm(foundTerm);
      speakText(`I heard you mention ${foundTerm.term}. ${foundTerm.term} is ${foundTerm.simpleDefinition}. ${foundTerm.detailedExplanation} Is there something specific you'd like to know about this condition?`);
    } else {
      speakText(`I'm not sure exactly what you're asking about. I can help explain medical terms, conditions, procedures, and medications in simple language. Try asking "What is" followed by a medical term, or say "help" to learn more about what I can do.`);
    }
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    if (!speechSynthesisRef.current || !audioEnabled) return;
    
    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesisRef.current.speak(utterance);
  };

  // Start voice recognition
  const startListening = () => {
    if (!recognitionRef.current || !audioEnabled) return;
    
    setIsListening(true);
    setVoicePrompt('');
    recognitionRef.current.start();
    speakText('I\'m listening. What medical term would you like to know about?');
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  // Toggle audio mode
  const toggleAudioMode = () => {
    const newAudioEnabled = !audioEnabled;
    setAudioEnabled(newAudioEnabled);
    
    if (newAudioEnabled) {
      speakText('Audio mode enabled. You can now ask me questions about medical terms using your voice. Click the microphone button or say "help" to get started.');
    } else {
      stopSpeaking();
      stopListening();
    }
  };

  // Speak selected term information
  const speakTermInfo = (term: MedicalTerm) => {
    if (!audioEnabled) return;
    
    const text = `${term.term}. ${term.simpleDefinition}. ${term.detailedExplanation}`;
    speakText(text);
  };

  // Generate simple illustrations using SVG
  const generateIllustration = (term: MedicalTerm): IllustrationData => {
    switch (term.term.toLowerCase()) {
      case 'hypertension':
        return {
          title: 'Blood Pressure in Arteries',
          description: 'Normal vs. High Blood Pressure',
          svgContent: `
            <svg viewBox="0 0 400 200" className="w-full h-48">
              <defs>
                <pattern id="normalFlow" patternUnits="userSpaceOnUse" width="10" height="10">
                  <circle cx="5" cy="5" r="2" fill="#3b82f6" opacity="0.6"/>
                </pattern>
                <pattern id="highFlow" patternUnits="userSpaceOnUse" width="8" height="8">
                  <circle cx="4" cy="4" r="2.5" fill="#ef4444" opacity="0.8"/>
                </pattern>
              </defs>
              
              <!-- Normal Blood Pressure -->
              <g>
                <text x="100" y="30" text-anchor="middle" class="text-sm font-semibold fill-green-600">Normal Pressure</text>
                <ellipse cx="100" cy="80" rx="80" ry="25" fill="none" stroke="#10b981" stroke-width="3"/>
                <ellipse cx="100" cy="80" rx="70" ry="20" fill="url(#normalFlow)"/>
                <text x="100" y="130" text-anchor="middle" class="text-xs fill-gray-600">Gentle flow</text>
                <text x="100" y="145" text-anchor="middle" class="text-xs fill-gray-600">120/80 mmHg</text>
              </g>
              
              <!-- High Blood Pressure -->
              <g>
                <text x="300" y="30" text-anchor="middle" class="text-sm font-semibold fill-red-600">High Pressure</text>
                <ellipse cx="300" cy="80" rx="80" ry="25" fill="none" stroke="#ef4444" stroke-width="4"/>
                <ellipse cx="300" cy="80" rx="70" ry="20" fill="url(#highFlow)"/>
                <text x="300" y="130" text-anchor="middle" class="text-xs fill-gray-600">Forceful flow</text>
                <text x="300" y="145" text-anchor="middle" class="text-xs fill-gray-600">140/90+ mmHg</text>
              </g>
              
              <!-- Arrow showing progression -->
              <path d="M 180 80 L 220 80" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowhead)"/>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b"/>
                </marker>
              </defs>
            </svg>
          `
        };
      
      case 'myocardial infarction':
        return {
          title: 'Heart Attack Explanation',
          description: 'How a blocked artery affects the heart',
          svgContent: `
            <svg viewBox="0 0 400 250" className="w-full h-48">
              <!-- Heart outline -->
              <path d="M200 50 C180 30, 140 30, 140 70 C140 110, 200 170, 200 170 C200 170, 260 110, 260 70 C260 30, 220 30, 200 50 Z" 
                    fill="#fca5a5" stroke="#dc2626" stroke-width="2"/>
              
              <!-- Normal artery -->
              <g>
                <text x="100" y="200" text-anchor="middle" class="text-sm font-semibold fill-green-600">Normal Artery</text>
                <rect x="60" y="210" width="80" height="15" rx="7" fill="#10b981" opacity="0.3"/>
                <rect x="65" y="213" width="70" height="9" rx="4" fill="#3b82f6"/>
                <text x="100" y="240" text-anchor="middle" class="text-xs fill-gray-600">Blood flows freely</text>
              </g>
              
              <!-- Blocked artery -->
              <g>
                <text x="300" y="200" text-anchor="middle" class="text-sm font-semibold fill-red-600">Blocked Artery</text>
                <rect x="260" y="210" width="80" height="15" rx="7" fill="#ef4444" opacity="0.3"/>
                <rect x="265" y="213" width="25" height="9" rx="4" fill="#3b82f6"/>
                <circle cx="300" cy="217.5" r="8" fill="#7f1d1d"/>
                <rect x="315" y="213" width="20" height="9" rx="4" fill="#3b82f6"/>
                <text x="300" y="240" text-anchor="middle" class="text-xs fill-gray-600">Blood flow blocked</text>
              </g>
              
              <!-- Affected heart area -->
              <circle cx="220" cy="100" r="15" fill="#dc2626" opacity="0.7"/>
              <text x="220" y="135" text-anchor="middle" class="text-xs fill-red-600">Damaged area</text>
            </svg>
          `
        };
      
      default:
        return {
          title: 'Medical Concept',
          description: 'Visual representation',
          svgContent: `
            <svg viewBox="0 0 400 200" className="w-full h-48">
              <circle cx="200" cy="100" r="60" fill="#ddd6fe" stroke="#7c3aed" stroke-width="2"/>
              <text x="200" y="105" text-anchor="middle" class="text-lg font-semibold fill-purple-700">${term.term}</text>
            </svg>
          `
        };
    }
  };

  const filteredTerms = medicalTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.simpleDefinition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.commonNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || term.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'condition': return <Heart className="h-4 w-4" />;
      case 'procedure': return <Stethoscope className="h-4 w-4" />;
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'anatomy': return <Brain className="h-4 w-4" />;
      case 'test': return <Activity className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'condition': return 'bg-red-100 text-red-800 border-red-200';
      case 'procedure': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medication': return 'bg-green-100 text-green-800 border-green-200';
      case 'anatomy': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'test': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Medical Explanations
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Understanding medical terms in simple language with helpful illustrations
        </p>
        
        {/* Audio Controls */}
        <div className="flex justify-center items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleAudioMode}
              variant={audioEnabled ? "default" : "outline"}
              size="sm"
              className={audioEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
              {audioEnabled ? "Audio On" : "Audio Off"}
            </Button>
            
            {audioEnabled && speechSupported && (
              <>
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant={isListening ? "destructive" : "secondary"}
                  size="sm"
                  disabled={isSpeaking}
                >
                  {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {isListening ? "Stop Listening" : "Ask Question"}
                </Button>
                
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    size="sm"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Speaking
                  </Button>
                )}
              </>
            )}
          </div>
          
          {audioEnabled && (
            <div className="text-sm text-blue-700">
              {isListening && <span className="animate-pulse">🎤 Listening...</span>}
              {isSpeaking && <span className="animate-pulse">🔊 Speaking...</span>}
              {!isListening && !isSpeaking && speechSupported && <span>Click "Ask Question" to use voice</span>}
              {!speechSupported && <span className="text-orange-600">Voice recognition not supported in this browser</span>}
            </div>
          )}
        </div>
        
        {voicePrompt && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-sm text-green-800">
              <strong>You asked:</strong> "{voicePrompt}"
            </p>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for medical terms, conditions, or procedures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory('all')}
              >
                All Terms
              </Button>
              {['condition', 'procedure', 'medication', 'anatomy', 'test'].map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="capitalize"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1">{category}s</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terms List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Medical Terms</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTerms.map((term) => (
              <Card
                key={term.term}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTerm?.term === term.term ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => {
                  setSelectedTerm(term);
                  if (audioEnabled) {
                    speakTermInfo(term);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{term.term}</h4>
                        <Badge className={`${getCategoryColor(term.category)} text-xs`}>
                          {getCategoryIcon(term.category)}
                          <span className="ml-1 capitalize">{term.category}</span>
                        </Badge>
                        {audioEnabled && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakTermInfo(term);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{term.simpleDefinition}</p>
                      {term.commonNames.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {term.commonNames.map((name) => (
                            <span
                              key={name}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-4">
          {selectedTerm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(selectedTerm.category)}
                    {selectedTerm.term}
                    {audioEnabled && (
                      <Button
                        onClick={() => speakTermInfo(selectedTerm)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                  <Badge className={getCategoryColor(selectedTerm.category)}>
                    {selectedTerm.category}
                  </Badge>
                </div>
                <CardDescription>{selectedTerm.simpleDefinition}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="explanation" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="explanation" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Explanation
                    </TabsTrigger>
                    <TabsTrigger value="illustration" className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Illustration
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="explanation" className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Detailed Explanation</h4>
                        {audioEnabled && (
                          <Button
                            onClick={() => speakText(selectedTerm.detailedExplanation)}
                            variant="outline"
                            size="sm"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Listen
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{selectedTerm.detailedExplanation}</p>
                    </div>
                    
                    {selectedTerm.commonNames.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Also Known As</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTerm.commonNames.map((name) => (
                            <Badge key={name} variant="secondary">{name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedTerm.relatedTerms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Related Terms</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTerm.relatedTerms.map((relatedTerm) => (
                            <Badge key={relatedTerm} variant="outline" className="cursor-pointer hover:bg-gray-100">
                              {relatedTerm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="illustration" className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      {(() => {
                        const illustration = generateIllustration(selectedTerm);
                        return (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{illustration.title}</h4>
                            <p className="text-sm text-gray-600 mb-4">{illustration.description}</p>
                            <div 
                              className="bg-white rounded border p-4"
                              dangerouslySetInnerHTML={{ __html: illustration.svgContent }}
                            />
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-blue-900">Remember</h5>
                            {audioEnabled && (
                              <Button
                                onClick={() => speakText('These illustrations are simplified for educational purposes. Always consult with your healthcare provider for personalized medical advice.')}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-blue-700 mt-1">
                            These illustrations are simplified for educational purposes.
                            Always consult with your healthcare provider for personalized medical advice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Medical Term</h3>
                <p className="text-gray-600 mb-4">
                  Choose a medical term from the list to see its simple explanation and helpful illustration.
                </p>
                {audioEnabled && speechSupported && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Voice Commands:</strong>
                    </p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• "What is [medical term]?"</li>
                      <li>• "Tell me about diabetes"</li>
                      <li>• "Search for hypertension"</li>
                      <li>• "Help" - for more information</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalExplanations;