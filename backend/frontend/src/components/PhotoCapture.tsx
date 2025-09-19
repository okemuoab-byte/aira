import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, X, Ruler } from 'lucide-react';
import { SymptomPhoto, SymptomMeasurement } from '@/types/health';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  onPhotoAdd: (photo: Omit<SymptomPhoto, 'id'>) => void;
  onMeasurementAdd: (measurement: Omit<SymptomMeasurement, 'id'>) => void;
  existingPhotos?: SymptomPhoto[];
  existingMeasurements?: SymptomMeasurement[];
  className?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoAdd,
  onMeasurementAdd,
  existingPhotos = [],
  existingMeasurements = [],
  className
}) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState<string>('');
  const [measurementType, setMeasurementType] = useState<'size' | 'temperature' | 'swelling' | 'range_of_motion'>('size');
  const [measurementValue, setMeasurementValue] = useState<string>('');
  const [measurementUnit, setMeasurementUnit] = useState<string>('mm');
  const [showMeasurement, setShowMeasurement] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState<boolean>(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file input
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsUsingCamera(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePhoto = () => {
    if (capturedPhoto) {
      const photo: Omit<SymptomPhoto, 'id'> = {
        url: capturedPhoto,
        timestamp: new Date(),
        description: photoDescription.trim() || undefined
      };
      
      onPhotoAdd(photo);
      setCapturedPhoto(null);
      setPhotoDescription('');
    }
  };

  const saveMeasurement = () => {
    if (measurementValue) {
      const measurement: Omit<SymptomMeasurement, 'id'> = {
        type: measurementType,
        value: parseFloat(measurementValue),
        unit: measurementUnit,
        timestamp: new Date()
      };
      
      onMeasurementAdd(measurement);
      setMeasurementValue('');
      setShowMeasurement(false);
    }
  };

  const getMeasurementTypeLabel = (type: string) => {
    switch (type) {
      case 'size': return 'Size/Diameter';
      case 'temperature': return 'Temperature';
      case 'swelling': return 'Swelling Level';
      case 'range_of_motion': return 'Range of Motion';
      default: return type;
    }
  };

  const getUnitOptions = (type: string) => {
    switch (type) {
      case 'size':
        return ['mm', 'cm', 'inches'];
      case 'temperature':
        return ['°F', '°C'];
      case 'swelling':
        return ['1-10 scale', '%'];
      case 'range_of_motion':
        return ['degrees', '%'];
      default:
        return ['units'];
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Photo Capture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Visual Documentation
          </CardTitle>
          <p className="text-sm text-gray-600">
            Take photos to track visual changes over time (especially important for skin conditions)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!capturedPhoto && !isUsingCamera && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={startCamera} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          )}

          {isUsingCamera && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button onClick={capturePhoto} size="lg" className="rounded-full">
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  stream?.getTracks().forEach(track => track.stop());
                  setIsUsingCamera(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}

          {capturedPhoto && (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={capturedPhoto} 
                  alt="Captured symptom" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCapturedPhoto(null)}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <Textarea
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  placeholder="Describe what you see... (e.g., 'rash is more red than yesterday', 'swelling has reduced')"
                  className="min-h-[80px]"
                />
              </div>
              
              <Button onClick={savePhoto} className="w-full">
                Save Photo
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Measurement Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Ruler className="h-5 w-5 mr-2" />
            Measurements
          </CardTitle>
          <p className="text-sm text-gray-600">
            Record objective measurements to track changes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showMeasurement && (
            <Button 
              variant="outline" 
              onClick={() => setShowMeasurement(true)}
              className="w-full"
            >
              <Ruler className="h-4 w-4 mr-2" />
              Add Measurement
            </Button>
          )}

          {showMeasurement && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Measurement Type
                  </label>
                  <select
                    value={measurementType}
                    onChange={(e) => setMeasurementType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="size">Size/Diameter</option>
                    <option value="temperature">Temperature</option>
                    <option value="swelling">Swelling Level</option>
                    <option value="range_of_motion">Range of Motion</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Unit
                  </label>
                  <select
                    value={measurementUnit}
                    onChange={(e) => setMeasurementUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {getUnitOptions(measurementType).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {getMeasurementTypeLabel(measurementType)} Value
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={measurementValue}
                  onChange={(e) => setMeasurementValue(e.target.value)}
                  placeholder="Enter measurement value"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={saveMeasurement} disabled={!measurementValue}>
                  Save Measurement
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMeasurement(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Photos & Measurements */}
      {(existingPhotos.length > 0 || existingMeasurements.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Previous Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {existingPhotos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <img 
                        src={photo.url} 
                        alt="Previous symptom photo" 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                        {new Date(photo.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingMeasurements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Measurements</h4>
                <div className="space-y-2">
                  {existingMeasurements.map((measurement) => (
                    <div key={measurement.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {getMeasurementTypeLabel(measurement.type)}: {measurement.value} {measurement.unit}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(measurement.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotoCapture;