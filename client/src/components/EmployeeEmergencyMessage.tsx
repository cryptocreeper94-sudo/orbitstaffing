/**
 * Employee Emergency Messaging
 * For employees to contact admins with job-related emergencies
 * Includes qualifying questions to ensure job-related context
 */
import React, { useState } from 'react';
import { AlertTriangle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmergencyMessageProps {
  employeeId: string;
  employeeName: string;
}

export default function EmployeeEmergencyMessage({ employeeId, employeeName }: EmergencyMessageProps) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [jobRelated, setJobRelated] = useState<boolean | null>(null);
  const [jobDetails, setJobDetails] = useState('');
  const [issueType, setIssueType] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emergencyReasons = [
    'Safety hazard on job site',
    'Equipment malfunction',
    'Injury or medical emergency',
    'Wage/payment issue',
    'Schedule conflict',
    'Transportation problem',
    'Other job-related issue',
  ];

  const handleSubmit = async () => {
    if (!message.trim() || jobRelated === null || !issueType) {
      alert('Please complete all fields');
      return;
    }

    if (jobRelated && !jobDetails.trim()) {
      alert('Please provide job details for job-related emergencies');
      return;
    }

    try {
      const res = await fetch('/api/employee/emergency-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          message,
          isJobRelated: jobRelated,
          qualifyingResponses: {
            issueType,
            jobDetails: jobRelated ? jobDetails : undefined,
          },
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setMessage('');
        setJobRelated(null);
        setJobDetails('');
        setIssueType('');
        
        setTimeout(() => {
          setSubmitted(false);
          setShowForm(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit emergency message:', error);
      alert('Failed to submit message. Please try again.');
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
        data-testid="button-emergency-message"
      >
        <AlertTriangle className="w-4 h-4" />
        Emergency Message
      </Button>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 text-green-300">
        <p className="font-bold">✓ Emergency message submitted</p>
        <p className="text-sm">An admin will review your request shortly.</p>
      </div>
    );
  }

  return (
    <Card className="bg-slate-800 border-red-700">
      <CardHeader className="bg-red-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="w-5 h-5" />
            Emergency Message
          </CardTitle>
          <button
            onClick={() => setShowForm(false)}
            className="p-1 hover:bg-red-800 rounded"
            data-testid="button-close-emergency"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <p className="text-sm text-gray-300">
          Use this for urgent, job-related issues only. This message will be reviewed by an admin.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">What's the issue?</label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            data-testid="select-issue-type"
          >
            <option value="">Select issue type...</option>
            {emergencyReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Is this job-related?</label>
          <div className="flex gap-3">
            <Button
              onClick={() => setJobRelated(true)}
              variant={jobRelated === true ? 'default' : 'outline'}
              className="flex-1"
              data-testid="button-job-related-yes"
            >
              Yes
            </Button>
            <Button
              onClick={() => setJobRelated(false)}
              variant={jobRelated === false ? 'default' : 'outline'}
              className="flex-1"
              data-testid="button-job-related-no"
            >
              No
            </Button>
          </div>
        </div>

        {jobRelated && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Details:</label>
            <textarea
              value={jobDetails}
              onChange={(e) => setJobDetails(e.target.value)}
              placeholder="Which job/assignment? What happened?"
              rows={2}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
              data-testid="textarea-job-details"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your emergency..."
            rows={4}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 resize-none"
            data-testid="textarea-emergency-message"
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
          data-testid="button-submit-emergency"
        >
          <Send className="w-4 h-4" />
          Submit Emergency Message
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Response time: Within 1 hour during business hours
        </p>
      </CardContent>
    </Card>
  );
}
