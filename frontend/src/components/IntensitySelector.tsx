import React from 'react';
import { cn } from '@/lib/utils';

interface IntensitySelectorProps {
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  className?: string;
}

const IntensitySelector: React.FC<IntensitySelectorProps> = ({
  intensity,
  onIntensityChange,
  className
}) => {
  const intensityLevels = [
    { value: 1, label: 'Mild', color: 'bg-green-200 hover:bg-green-300', textColor: 'text-green-800' },
    { value: 2, label: 'Mild', color: 'bg-green-300 hover:bg-green-400', textColor: 'text-green-800' },
    { value: 3, label: 'Light', color: 'bg-yellow-200 hover:bg-yellow-300', textColor: 'text-yellow-800' },
    { value: 4, label: 'Light', color: 'bg-yellow-300 hover:bg-yellow-400', textColor: 'text-yellow-800' },
    { value: 5, label: 'Moderate', color: 'bg-orange-200 hover:bg-orange-300', textColor: 'text-orange-800' },
    { value: 6, label: 'Moderate', color: 'bg-orange-300 hover:bg-orange-400', textColor: 'text-orange-800' },
    { value: 7, label: 'Strong', color: 'bg-red-200 hover:bg-red-300', textColor: 'text-red-800' },
    { value: 8, label: 'Strong', color: 'bg-red-300 hover:bg-red-400', textColor: 'text-red-800' },
    { value: 9, label: 'Severe', color: 'bg-red-400 hover:bg-red-500', textColor: 'text-red-900' },
    { value: 10, label: 'Severe', color: 'bg-red-500 hover:bg-red-600', textColor: 'text-white' }
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-medium text-gray-700 mb-2">
        How intense is this symptom?
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {intensityLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => onIntensityChange(level.value)}
            className={cn(
              "relative h-12 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center text-xs font-medium",
              level.color,
              level.textColor,
              intensity === level.value
                ? "border-gray-800 ring-2 ring-gray-800 ring-offset-1 scale-105"
                : "border-transparent hover:scale-102"
            )}
          >
            <span className="text-xs font-bold">{level.value}</span>
            <span className="text-[10px] opacity-80">{level.label}</span>
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>Mild</span>
        <span>Severe</span>
      </div>
      
      {intensity > 0 && (
        <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
          Selected intensity: <span className="font-semibold">{intensity}/10</span>
        </div>
      )}
    </div>
  );
};

export default IntensitySelector;