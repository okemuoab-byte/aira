import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Mic, 
  Activity, 
  User, 
  Pill, 
  Users, 
  Volume2, 
  Palette, 
  Eye, 
  Navigation,
  ArrowRight,
  Play,
  Pause,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DesignPreview: React.FC = () => {
  const [currentView, setCurrentView] = useState<'before' | 'after'>('before');
  const [activeDemo, setActiveDemo] = useState<'colors' | 'terminology' | 'accessibility' | 'voice'>('colors');

  // Before/After Color Palettes
  const colorPalettes = {
    before: {
      primary: 'bg-blue-600',
      secondary: 'bg-gray-500',
      accent: 'bg-blue-500',
      success: 'bg-green-600',
      warning: 'bg-yellow-500',
      error: 'bg-red-600',
      background: 'bg-white',
      muted: 'bg-gray-100'
    },
    after: {
      primary: 'bg-emerald-500', // Sage green
      secondary: 'bg-purple-500', // Warm purple
      accent: 'bg-amber-500', // Sunset orange
      success: 'bg-emerald-600', // Warmer green
      warning: 'bg-amber-600', // Softer amber
      error: 'bg-rose-500', // Gentler red
      background: 'bg-stone-50', // Warm white
      muted: 'bg-stone-100' // Warm gray
    }
  };

  // Before/After Terminology
  const terminology = {
    before: [
      'Log Symptoms',
      'Medical Assessment', 
      'Clinical Data',
      'Patient Profile',
      'Medication Tracker',
      'Family Dashboard'
    ],
    after: [
      'How are you feeling today?',
      "Let's understand what's happening",
      'Your health story',
      'About you',
      'Your wellness support',
      'Your care circle'
    ]
  };

  const renderColorPalette = (palette: typeof colorPalettes.before, title: string) => (
    <div className="space-y-4">
      <h4 className="font-semibold text-center">{title}</h4>
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(palette).map(([name, className]) => (
          <div key={name} className="text-center">
            <div className={cn("w-12 h-12 rounded-lg mx-auto mb-2", className)}></div>
            <div className="text-xs font-medium capitalize">{name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNavigationExample = (type: 'before' | 'after') => {
    const isAfter = type === 'after';
    
    return (
      <div className={cn(
        "p-4 rounded-xl border-2 transition-all duration-300",
        isAfter 
          ? "bg-gradient-to-br from-emerald-50 to-purple-50 border-emerald-200" 
          : "bg-white border-gray-200"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn(
            "text-lg font-semibold",
            isAfter ? "text-emerald-800" : "text-gray-900"
          )}>
            {isAfter ? "Health Journey" : "Medical Tracker"}
          </h3>
          
          {isAfter && (
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {terminology[type].slice(0, 4).map((term, index) => (
            <Button
              key={index}
              variant={isAfter ? "ghost" : "outline"}
              size="sm"
              className={cn(
                "justify-start text-left h-auto p-3",
                isAfter 
                  ? "hover:bg-emerald-100 text-emerald-700 rounded-xl" 
                  : "hover:bg-gray-50 text-gray-700"
              )}
            >
              {term}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderAccessibilityFeatures = () => (
    <div className="space-y-6">
      {/* Screen Reader Example */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Screen Reader Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-white p-3 rounded-lg border">
            <Button className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              How are you feeling today?
              <span className="sr-only">
                Press Enter to start logging your symptoms. This will guide you through describing how you feel.
              </span>
            </Button>
          </div>
          <div className="text-xs text-blue-700">
            ✓ ARIA labels, ✓ Screen reader descriptions, ✓ Keyboard navigation
          </div>
        </CardContent>
      </Card>

      {/* High Contrast Mode */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Sun className="h-4 w-4 mr-2" />
            High Contrast & Text Scaling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">A</Button>
            <Button size="sm" variant="outline">A</Button>
            <Button size="sm" variant="outline">A</Button>
            <Button size="sm" variant="outline">
              <Sun className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline">
              <Moon className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-purple-700">
            ✓ Text size controls, ✓ High contrast mode, ✓ Reduced motion support
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Navigation */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Navigation className="h-4 w-4 mr-2" />
            Keyboard Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Badge variant="outline">Tab ↹</Badge>
            <Badge variant="outline">Enter ↵</Badge>
            <Badge variant="outline">Space ␣</Badge>
            <Badge variant="outline">↑ ↓ ← →</Badge>
            <Badge variant="outline">Esc</Badge>
            <Badge variant="outline">H, C, A, L</Badge>
          </div>
          <div className="text-xs text-green-700 mt-2">
            ✓ Full keyboard navigation, ✓ Body part shortcuts, ✓ Focus indicators
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVoiceFeatures = () => (
    <div className="space-y-6">
      {/* Voice Commands */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Mic className="h-4 w-4 mr-2" />
            Voice Commands
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>"How am I feeling today?"</span>
              <ArrowRight className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">Opens symptom logger</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>"My medications"</span>
              <ArrowRight className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-600">Shows medication list</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>"Emergency" / "Call doctor"</span>
              <ArrowRight className="h-3 w-3 text-red-600" />
              <span className="text-red-600">Calls emergency services</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice-Guided Logging */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Voice-Guided Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-400 to-purple-500 rounded-full flex items-center justify-center">
            <Mic className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">"Hi! I'm here to help you track how you're feeling."</p>
            <p className="text-xs text-purple-700">AI speaks prompts, you respond naturally</p>
          </div>
          <div className="flex justify-center space-x-2">
            <Button size="sm" className="bg-emerald-500">
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
            <Button size="sm" variant="outline">
              <Pause className="h-3 w-3 mr-1" />
              Pause
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audio Feedback */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Audio Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded border text-center">
              <div className="text-green-600 font-medium">Success</div>
              <div>Gentle chime + "Saved"</div>
            </div>
            <div className="p-2 bg-white rounded border text-center">
              <div className="text-blue-600 font-medium">Navigation</div>
              <div>Soft tone + "Moving"</div>
            </div>
            <div className="p-2 bg-white rounded border text-center">
              <div className="text-amber-600 font-medium">Attention</div>
              <div>Warm tone + guidance</div>
            </div>
            <div className="p-2 bg-white rounded border text-center">
              <div className="text-purple-600 font-medium">Ready</div>
              <div>"Ready when you are"</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStreamlinedFlow = () => (
    <div className="space-y-6">
      {/* Smart Onboarding */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm">Personalized Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm mb-4">Which best describes you?</p>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="justify-start p-4 h-auto">
                <div className="text-left">
                  <div className="font-medium">New to health tracking</div>
                  <div className="text-xs text-gray-600">Just getting started</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start p-4 h-auto">
                <div className="text-left">
                  <div className="font-medium">Managing chronic conditions</div>
                  <div className="text-xs text-gray-600">Need ongoing support</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start p-4 h-auto">
                <div className="text-left">
                  <div className="font-medium">Family caregiver</div>
                  <div className="text-xs text-gray-600">Caring for someone else</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute right-0 top-0 flex flex-col space-y-2">
              <Button size="sm" className="bg-red-500 text-white rounded-full shadow-lg">
                <Activity className="h-3 w-3 mr-1" />
                Quick pain check
              </Button>
              <Button size="sm" className="bg-green-500 text-white rounded-full shadow-lg">
                <Pill className="h-3 w-3 mr-1" />
                Took medication
              </Button>
              <Button size="sm" className="bg-blue-500 text-white rounded-full shadow-lg">
                <Heart className="h-3 w-3 mr-1" />
                Feeling better
              </Button>
            </div>
            <div className="text-xs text-emerald-700 mt-16">
              ✓ One-tap common actions, ✓ Contextual suggestions, ✓ Smart defaults
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Intensity */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-sm">Simplified Intensity Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <p className="text-sm">How much is this bothering you right now?</p>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="h-auto p-3 flex flex-col">
                <span className="text-lg">😊</span>
                <span className="text-xs">Barely noticeable</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col">
                <span className="text-lg">😐</span>
                <span className="text-xs">Getting in the way</span>
              </Button>
              <Button variant="outline" className="h-auto p-3 flex flex-col">
                <span className="text-lg">😣</span>
                <span className="text-xs">Hard to ignore</span>
              </Button>
            </div>
            <div className="text-xs text-purple-700">
              ✓ Everyday language, ✓ Visual cues, ✓ Reduced cognitive load
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          UX/UI Refinements Preview
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          See how your health journey platform will transform with warmer design, 
          better accessibility, streamlined flows, and voice-first navigation.
        </p>
        
        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg">
            <Button
              size="sm"
              variant={currentView === 'before' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('before')}
            >
              Current Design
            </Button>
            <Button
              size="sm"
              variant={currentView === 'after' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('after')}
            >
              New Design
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Warmer Design</span>
          </TabsTrigger>
          <TabsTrigger value="terminology" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Friendly Language</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Accessibility</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center space-x-2">
            <Mic className="h-4 w-4" />
            <span>Voice Features</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderColorPalette(colorPalettes.before, "Current Clinical Palette")}
            {renderColorPalette(colorPalettes.after, "New Healing Palette")}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderNavigationExample('before')}
            {renderNavigationExample('after')}
          </div>
          
          <Card className="bg-gradient-to-r from-emerald-50 to-purple-50 border-emerald-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Color Psychology Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-emerald-700">Sage Green</div>
                  <div>Healing, growth, balance</div>
                </div>
                <div>
                  <div className="font-medium text-purple-700">Warm Purple</div>
                  <div>Comfort, wisdom, support</div>
                </div>
                <div>
                  <div className="font-medium text-amber-700">Sunset Orange</div>
                  <div>Energy, optimism, warmth</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminology" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">❌ Clinical Language</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {terminology.before.map((term, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded border text-gray-700">
                    {term}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-600">✅ Human-Centered Language</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {terminology.after.map((term, index) => (
                  <div key={index} className="p-2 bg-emerald-50 rounded border text-emerald-700">
                    {term}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Language Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-red-700">Clinical Approach</div>
                  <div>• Creates distance</div>
                  <div>• Feels institutional</div>
                  <div>• May increase anxiety</div>
                </div>
                <div>
                  <div className="font-medium text-emerald-700">Human-Centered Approach</div>
                  <div>• Builds connection</div>
                  <div>• Feels supportive</div>
                  <div>• Reduces intimidation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          {renderAccessibilityFeatures()}
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Accessibility Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Who Benefits</div>
                  <div>• Vision impaired users</div>
                  <div>• Motor disability users</div>
                  <div>• Cognitive accessibility needs</div>
                  <div>• Temporary limitations</div>
                </div>
                <div>
                  <div className="font-medium">Universal Benefits</div>
                  <div>• Better for everyone</div>
                  <div>• Clearer navigation</div>
                  <div>• Reduced errors</div>
                  <div>• Faster task completion</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          {renderVoiceFeatures()}
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Voice-First Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Accessibility</div>
                  <div>• Hands-free operation</div>
                  <div>• Vision-independent</div>
                  <div>• Natural interaction</div>
                  <div>• Reduced typing</div>
                </div>
                <div>
                  <div className="font-medium">User Experience</div>
                  <div>• Faster symptom logging</div>
                  <div>• More natural expression</div>
                  <div>• Emergency accessibility</div>
                  <div>• Multitasking friendly</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Streamlined Flow Demo */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Streamlined Patient Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStreamlinedFlow()}
        </CardContent>
      </Card>

      {/* Implementation Decision */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Ready to Transform Your Platform?</h3>
          <p className="text-gray-700 mb-6">
            These changes will make your health journey platform more welcoming, accessible, 
            and easier to use for all patients and caregivers.
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              ✅ Implement All Changes
            </Button>
            <Button variant="outline">
              🎨 Customize Further
            </Button>
            <Button variant="ghost">
              ❌ Keep Current Design
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignPreview;