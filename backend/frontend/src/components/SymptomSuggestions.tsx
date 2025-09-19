import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SymptomSuggestion } from '@/types/health';
import { cn } from '@/lib/utils';

interface SymptomSuggestionsProps {
  suggestions: SymptomSuggestion[];
  onSuggestionSelect: (suggestion: SymptomSuggestion) => void;
  selectedSuggestion?: SymptomSuggestion;
  bodyPartName: string;
  className?: string;
}

const SymptomSuggestions: React.FC<SymptomSuggestionsProps> = ({
  suggestions,
  onSuggestionSelect,
  selectedSuggestion,
  bodyPartName,
  className
}) => {
  const commonSuggestions = suggestions.filter(s => s.category === 'common');
  const conditionSpecific = suggestions.filter(s => s.category === 'condition-specific');
  const activityRelated = suggestions.filter(s => s.category === 'activity-related');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'common':
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800';
      case 'condition-specific':
        return 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800';
      case 'activity-related':
        return 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const renderSuggestionGroup = (groupSuggestions: SymptomSuggestion[], title: string) => {
    if (groupSuggestions.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {groupSuggestions.map((suggestion) => (
            <Button
              key={suggestion.id}
              variant="outline"
              onClick={() => onSuggestionSelect(suggestion)}
              className={cn(
                "justify-start text-left h-auto p-3 transition-all duration-200",
                getCategoryColor(suggestion.category),
                selectedSuggestion?.id === suggestion.id && "ring-2 ring-offset-1 ring-gray-800 scale-102"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{suggestion.text}</span>
                {suggestion.conditions && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Condition-specific
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          What's bothering your {bodyPartName.toLowerCase()}?
        </h3>
        <p className="text-sm text-gray-600">
          Tap the symptom that best describes what you're experiencing
        </p>
      </div>

      <div className="space-y-4">
        {renderSuggestionGroup(commonSuggestions, 'Common Symptoms')}
        {renderSuggestionGroup(conditionSpecific, 'Based on Your Conditions')}
        {renderSuggestionGroup(activityRelated, 'Activity Related')}
      </div>

      <div className="pt-2 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={() => onSuggestionSelect({ id: 'custom', text: 'Something else...', category: 'common' })}
          className="w-full text-gray-600 hover:text-gray-800"
        >
          + Something else...
        </Button>
      </div>
    </div>
  );
};

export default SymptomSuggestions;