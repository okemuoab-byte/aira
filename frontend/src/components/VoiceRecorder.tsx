import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Download,
  Volume2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

interface VoiceRecorderProps {
  onAudioSave: (audioBlob: Blob, duration: number, transcript?: string) => void;
  existingAudio?: { blob: Blob; duration: number; transcript?: string };
  maxDuration?: number; // in seconds
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
type PlaybackState = 'idle' | 'playing' | 'paused';

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAudioSave,
  existingAudio,
  maxDuration = 300, // 5 minutes default
  className
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [duration, setDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(existingAudio?.blob || null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>(existingAudio?.transcript || '');
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize existing audio
  useEffect(() => {
    if (existingAudio?.blob) {
      const url = URL.createObjectURL(existingAudio.blob);
      setAudioUrl(url);
      setDuration(existingAudio.duration);
      return () => URL.revokeObjectURL(url);
    }
  }, [existingAudio]);

  // Check microphone permission
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setHasPermission(false);
      console.error('Microphone permission denied:', error);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
      showSuccess('Microphone access granted!');
    } catch (error) {
      setHasPermission(false);
      showError('Microphone access is required for voice recording');
    }
  };

  const setupAudioVisualization = (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateWaveform = () => {
        if (analyserRef.current && recordingState === 'recording') {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setWaveformData(prev => [...prev.slice(-50), average / 255]); // Keep last 50 samples
          animationRef.current = requestAnimationFrame(updateWaveform);
        }
      };
      
      updateWaveform();
    } catch (error) {
      console.error('Audio visualization setup failed:', error);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await requestMicrophonePermission();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      setupAudioVisualization(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setRecordingState('recording');
      setDuration(0);
      setWaveformData([]);

      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);

      showSuccess('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      showError('Failed to start recording. Please check your microphone.');
      setHasPermission(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      
      // Resume timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);

      // Resume visualization
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        const updateWaveform = () => {
          if (analyserRef.current && recordingState === 'recording') {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            setWaveformData(prev => [...prev.slice(-50), average / 255]);
            animationRef.current = requestAnimationFrame(updateWaveform);
          }
        };
        updateWaveform();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      showSuccess(`Recording completed (${formatTime(duration)})`);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setPlaybackState('playing');
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaybackState('paused');
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setPlaybackTime(0);
    setRecordingState('idle');
    setPlaybackState('idle');
    setTranscript('');
    setWaveformData([]);
    showSuccess('Recording deleted');
  };

  const saveRecording = () => {
    if (audioBlob) {
      onAudioSave(audioBlob, duration, transcript);
      showSuccess('Voice recording saved with your symptom');
    }
  };

  const downloadRecording = () => {
    if (audioBlob && audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `symptom-recording-${new Date().toISOString().slice(0, 10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showSuccess('Recording downloaded');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStatusColor = () => {
    switch (recordingState) {
      case 'recording': return 'text-red-600';
      case 'paused': return 'text-yellow-600';
      case 'stopped': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderWaveform = () => {
    if (waveformData.length === 0) return null;

    return (
      <div className="flex items-center justify-center h-16 bg-gray-50 rounded-lg p-2">
        <div className="flex items-end space-x-1 h-12">
          {waveformData.map((amplitude, index) => (
            <div
              key={index}
              className="bg-blue-500 rounded-sm transition-all duration-100"
              style={{
                width: '3px',
                height: `${Math.max(2, amplitude * 48)}px`,
                opacity: index > waveformData.length - 10 ? 1 : 0.6
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (hasPermission === false) {
    return (
      <Card className={cn("border-orange-200 bg-orange-50", className)}>
        <CardContent className="p-6 text-center">
          <MicOff className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-800 mb-2">Microphone Access Required</h3>
          <p className="text-orange-700 mb-4">
            To use voice recording, please allow microphone access in your browser.
          </p>
          <Button onClick={requestMicrophonePermission} className="bg-orange-600 hover:bg-orange-700">
            <Mic className="h-4 w-4 mr-2" />
            Enable Microphone
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Volume2 className="h-5 w-5 mr-2 text-blue-600" />
          Voice Description
        </CardTitle>
        <p className="text-sm text-gray-600">
          Describe your symptoms in your own words - sometimes it's easier to talk than type
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Status */}
        <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-3 h-3 rounded-full",
              recordingState === 'recording' ? "bg-red-500 animate-pulse" :
              recordingState === 'paused' ? "bg-yellow-500" :
              recordingState === 'stopped' ? "bg-green-500" : "bg-gray-400"
            )} />
            <div>
              <div className={cn("font-medium", getRecordingStatusColor())}>
                {recordingState === 'recording' ? 'Recording...' :
                 recordingState === 'paused' ? 'Paused' :
                 recordingState === 'stopped' ? 'Recording Complete' : 'Ready to Record'}
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(duration)} / {formatTime(maxDuration)}
              </div>
            </div>
          </div>
          
          {(recordingState === 'recording' || recordingState === 'paused') && (
            <Badge variant="outline" className="text-xs">
              {Math.round((duration / maxDuration) * 100)}% used
            </Badge>
          )}
        </div>

        {/* Waveform Visualization */}
        {recordingState === 'recording' && renderWaveform()}

        {/* Recording Controls */}
        <div className="flex justify-center space-x-3">
          {recordingState === 'idle' && (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8"
              disabled={hasPermission === null}
            >
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </Button>
          )}

          {recordingState === 'recording' && (
            <>
              <Button
                onClick={pauseRecording}
                size="lg"
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
              <Button
                onClick={stopRecording}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            </>
          )}

          {recordingState === 'paused' && (
            <>
              <Button
                onClick={resumeRecording}
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Mic className="h-5 w-5 mr-2" />
                Resume
              </Button>
              <Button
                onClick={stopRecording}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Playback Controls */}
        {audioUrl && (
          <div className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">Your Recording</h4>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {formatTime(duration)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                {playbackState === 'playing' ? (
                  <Button
                    onClick={pauseAudio}
                    size="sm"
                    variant="outline"
                    className="border-blue-300"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={playAudio}
                    size="sm"
                    variant="outline"
                    className="border-blue-300"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                
                <div className="flex-1 text-sm text-gray-600">
                  Click play to review your recording
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={downloadRecording}
                    size="sm"
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={deleteRecording}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Recording */}
            <div className="flex justify-center">
              <Button
                onClick={saveRecording}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Voice Description
              </Button>
            </div>
          </div>
        )}

        {/* Hidden audio element for playback */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setPlaybackState('idle')}
            onTimeUpdate={(e) => setPlaybackTime((e.target as HTMLAudioElement).currentTime)}
            className="hidden"
          />
        )}

        {/* Tips */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Tips for better recordings:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Find a quiet space to minimize background noise</li>
              <li>Speak clearly and at a normal pace</li>
              <li>Describe when symptoms started, what they feel like, and what makes them better or worse</li>
              <li>Mention any patterns you've noticed</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;