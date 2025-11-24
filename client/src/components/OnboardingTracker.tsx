import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Clock, User } from 'lucide-react';

export function OnboardingTracker() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkersNeedingOnboarding();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWorkersNeedingOnboarding, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkersNeedingOnboarding = async () => {
    try {
      const response = await fetch('/api/admin/onboarding-tracker');
      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error('Failed to fetch onboarding data:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveWorker = async (workerId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-onboarding/${workerId}`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchWorkersNeedingOnboarding();
      }
    } catch (err) {
      console.error('Failed to approve worker:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Worker Onboarding Tracker</h2>
        <p className="text-sm text-muted-foreground">Monitor and approve new worker onboarding</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : workers.length === 0 ? (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <p className="text-center text-green-700 dark:text-green-400">
              All workers are properly onboarded!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workers.map((worker) => (
            <Card key={worker.id} className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-lg">{worker.fullName}</CardTitle>
                      <Badge variant="outline" className="ml-auto">
                        {worker.onboardingProgress}% Complete
                      </Badge>
                    </div>
                    <CardDescription>
                      Created {new Date(worker.createdAt).toLocaleDateString()} • No employee number yet
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Onboarding Progress</span>
                    <span className="font-medium">{worker.onboardingProgress}%</span>
                  </div>
                  <Progress value={worker.onboardingProgress} className="h-2" data-testid={`progress-${worker.id}`} />
                </div>

                {/* Checklist Items */}
                <div className="grid grid-cols-2 gap-2">
                  <ChecklistItem
                    label="Profile Photo"
                    completed={worker.checklist?.profilePhotoUploaded}
                  />
                  <ChecklistItem
                    label="I-9 Documents"
                    completed={worker.checklist?.i9DocumentsSubmitted}
                  />
                  <ChecklistItem
                    label="Background Check"
                    completed={worker.checklist?.backgroundCheckConsented}
                  />
                  <ChecklistItem
                    label="Bank Details"
                    completed={worker.checklist?.bankDetailsSubmitted}
                  />
                  <ChecklistItem
                    label="I-9 Verified"
                    completed={worker.checklist?.i9Verified}
                    warning={worker.checklist?.i9DocumentsSubmitted && !worker.checklist?.i9Verified}
                  />
                  <ChecklistItem
                    label="NDA Accepted"
                    completed={worker.checklist?.nDAAccepted}
                  />
                </div>

                {/* Status Warnings */}
                {worker.checklist?.i9DocumentsSubmitted && !worker.checklist?.i9Verified && (
                  <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-600">Waiting for I-9 verification</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {worker.onboardingProgress === 100 ? (
                    <Button
                      onClick={() => approveWorker(worker.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      data-testid={`button-approve-${worker.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve & Activate
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="flex-1"
                      variant="outline"
                      data-testid={`button-pending-${worker.id}`}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Waiting for Completion...
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ChecklistItem({
  label,
  completed,
  warning,
}: {
  label: string;
  completed?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded text-xs ${
        completed
          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
          : warning
            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
            : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
      }`}
    >
      <div className={`w-3 h-3 rounded-full ${completed ? 'bg-green-600' : warning ? 'bg-amber-600' : 'bg-gray-400'}`} />
      <span>{label}</span>
    </div>
  );
}
