import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Pill, CheckCircle, Snooze, X } from 'lucide-react';
import { Medication } from '@/types/health';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';

interface MedicationReminderProps {
  medications: Medication[];
  onDoseTaken: (medicationId: string, timestamp: Date) => void;
  onDoseMissed: (medicationId: string, timestamp: Date) => void;
  onSnoozeReminder: (medicationId: string, minutes: number) => void;
  className?: string;
}

interface PendingReminder {
  medicationId: string;
  medication: Medication;
  scheduledTime: Date;
  isOverdue: boolean;
  snoozedUntil?: Date;
}

const MedicationReminder: React.FC<MedicationReminderProps> = ({
  medications,
  onDoseTaken,
  onDoseMissed,
  onSnoozeReminder,
  className
}) => {
  const [pendingReminders, setPendingReminders] = useState<PendingReminder[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate pending reminders
  useEffect(() => {
    const now = new Date();
    const reminders: PendingReminder[] = [];

    medications.forEach(medication => {
      if (!medication.reminderEnabled || !medication.times) return;

      medication.times.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Check if this reminder should be shown (within 15 minutes of scheduled time)
        const timeDiff = now.getTime() - scheduledTime.getTime();
        const isWithinWindow = timeDiff >= 0 && timeDiff <= 15 * 60 * 1000; // 15 minutes
        const isOverdue = timeDiff > 15 * 60 * 1000 && timeDiff <= 2 * 60 * 60 * 1000; // Up to 2 hours overdue

        if (isWithinWindow || isOverdue) {
          reminders.push({
            medicationId: medication.id,
            medication,
            scheduledTime,
            isOverdue
          });
        }
      });
    });

    setPendingReminders(reminders);
  }, [medications, currentTime]);

  const handleTakeDose = (reminder: PendingReminder) => {
    onDoseTaken(reminder.medicationId, new Date());
    setPendingReminders(prev => prev.filter(r => r !== reminder));
    showSuccess(`Great! ${reminder.medication.name} dose recorded`);
  };

  const handleSnooze = (reminder: PendingReminder, minutes: number) => {
    onSnoozeReminder(reminder.medicationId, minutes);
    setPendingReminders(prev => prev.filter(r => r !== reminder));
    showSuccess(`Reminder snoozed for ${minutes} minutes`);
  };

  const handleDismiss = (reminder: PendingReminder) => {
    onDoseMissed(reminder.medicationId, reminder.scheduledTime);
    setPendingReminders(prev => prev.filter(r => r !== reminder));
    showError(`${reminder.medication.name} dose marked as missed`);
  };

  const getFriendlyMessage = (reminder: PendingReminder) => {
    const hour = new Date().getHours();
    const medication = reminder.medication;
    
    let greeting = '';
    if (hour < 12) greeting = 'Good morning!';
    else if (hour < 17) greeting = 'Good afternoon!';
    else greeting = 'Good evening!';

    const messages = [
      `${greeting} Time for your ${medication.name} (${medication.dosage}).`,
      `Hey there! Don't forget your ${medication.name} dose.`,
      `Friendly reminder: ${medication.name} time! 💊`,
      `Your ${medication.name} is ready when you are.`,
      `Time to take care of yourself with ${medication.name}.`
    ];

    if (reminder.isOverdue) {
      return `You missed your ${medication.name} dose. It's okay - take it now if it's safe to do so.`;
    }

    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const upcoming: Array<{ medication: Medication; nextTime: Date }> = [];

    medications.forEach(medication => {
      if (!medication.reminderEnabled || !medication.times) return;

      const nextTimes = medication.times.map(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const nextTime = new Date();
        nextTime.setHours(hours, minutes, 0, 0);
        
        // If time has passed today, set for tomorrow
        if (nextTime <= now) {
          nextTime.setDate(nextTime.getDate() + 1);
        }
        
        return nextTime;
      });

      const nextTime = nextTimes.reduce((earliest, current) => 
        current < earliest ? current : earliest
      );

      upcoming.push({ medication, nextTime });
    });

    return upcoming.sort((a, b) => a.nextTime.getTime() - b.nextTime.getTime());
  };

  const formatTimeUntil = (targetTime: Date) => {
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    }
    return `in ${minutes}m`;
  };

  const upcomingReminders = getUpcomingReminders();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Active Reminders */}
      {pendingReminders.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-600" />
            Medication Reminders
          </h3>
          
          {pendingReminders.map((reminder, index) => (
            <Card key={`${reminder.medicationId}-${index}`} className={cn(
              "border-l-4 shadow-lg",
              reminder.isOverdue ? "border-l-red-500 bg-red-50" : "border-l-blue-500 bg-blue-50"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Pill className={cn(
                        "h-5 w-5",
                        reminder.isOverdue ? "text-red-600" : "text-blue-600"
                      )} />
                      <h4 className="font-semibold text-gray-900">
                        {reminder.medication.name}
                      </h4>
                      <Badge variant={reminder.isOverdue ? "destructive" : "default"}>
                        {reminder.isOverdue ? "Overdue" : "Due Now"}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-2">
                      {getFriendlyMessage(reminder)}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Dosage: {reminder.medication.dosage}</span>
                      <span>
                        Scheduled: {reminder.scheduledTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    {reminder.medication.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded border">
                        💡 {reminder.medication.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleTakeDose(reminder)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I took it
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSnooze(reminder, 15)}
                  >
                    <Snooze className="h-4 w-4 mr-2" />
                    Snooze 15m
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleSnooze(reminder, 30)}
                  >
                    Snooze 30m
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => handleDismiss(reminder)}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingReminders.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              No upcoming medication reminders
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.slice(0, 5).map((item, index) => (
                <div key={`${item.medication.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Pill className="h-4 w-4 text-gray-600" />
                    <div>
                      <span className="font-medium">{item.medication.name}</span>
                      <span className="text-gray-600 ml-2">({item.medication.dosage})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {item.nextTime.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatTimeUntil(item.nextTime)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medication Adherence Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {/* This would be calculated from actual dose tracking */}
                85%
              </div>
              <div className="text-sm text-green-700">Adherence Rate</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {medications.filter(m => m.reminderEnabled).length}
              </div>
              <div className="text-sm text-blue-700">Active Medications</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {upcomingReminders.length}
              </div>
              <div className="text-sm text-purple-700">Upcoming Today</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationReminder;