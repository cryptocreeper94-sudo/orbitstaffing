import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, Upload, Send } from 'lucide-react';
import { toast } from 'sonner';

interface BugReportWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export function BugReportWidget({ 
  isOpen, 
  onClose, 
  userEmail = 'developer@orbitstaffing.io',
  userName = 'Developer'
}: BugReportWidgetProps) {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [category, setCategory] = useState<'ui' | 'api' | 'performance' | 'data' | 'other'>('ui');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [stackTrace, setStackTrace] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshot(event.target?.result as string);
        toast.success('Screenshot captured');
      };
      reader.readAsDataURL(file);
    }
  };

  const captureConsoleError = () => {
    // Capture browser console
    try {
      const logs = (window as any).orbitConsoleLogs || [];
      setStackTrace(logs.join('\n'));
      toast.success('Console errors captured');
    } catch (err) {
      toast.error('Could not capture console');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in title and description');
      return;
    }

    try {
      const response = await fetch('/api/bugs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          errorMessage,
          stackTrace,
          severity,
          category,
          screenshotBase64: screenshot,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          reportedByEmail: userEmail,
          reportedByName: userName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Bug report #${data.bugId} submitted!`);
        setTitle('');
        setDescription('');
        setErrorMessage('');
        setStackTrace('');
        setScreenshot(null);
        setStep('form');
        onClose();
      } else {
        toast.error('Failed to submit bug report');
      }
    } catch (error) {
      console.error('Bug submission error:', error);
      toast.error('Network error submitting bug report');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border-amber-600/50 bg-amber-950/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-amber-600/20">
          <CardTitle className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-5 h-5" />
            Report a Bug
          </CardTitle>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {step === 'form' ? (
            <>
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Bug Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the bug"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:border-amber-500"
                  data-testid="input-bug-title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? How can we reproduce it?"
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:border-amber-500"
                  data-testid="textarea-bug-description"
                />
              </div>

              {/* Severity & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:border-amber-500"
                    data-testid="select-severity"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:border-amber-500"
                    data-testid="select-category"
                  >
                    <option value="ui">UI/UX</option>
                    <option value="api">API/Backend</option>
                    <option value="performance">Performance</option>
                    <option value="data">Data/Database</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Error Details */}
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Error Message (if any)
                </label>
                <textarea
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="Paste any error messages you see"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:border-amber-500"
                  data-testid="textarea-error-message"
                />
              </div>

              {/* Screenshot */}
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">
                  Screenshot
                </label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                    data-testid="input-screenshot"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid="button-upload-screenshot"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Screenshot
                  </Button>
                  <Button
                    onClick={captureConsoleError}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    data-testid="button-capture-console"
                  >
                    Capture Console
                  </Button>
                </div>
                {screenshot && (
                  <div className="mt-2 text-xs text-green-400">✓ Screenshot attached</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel-bug"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('review')}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  data-testid="button-review-bug"
                >
                  Review & Submit
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Title:</span>
                  <p className="text-white font-semibold">{title}</p>
                </div>
                <div>
                  <span className="text-gray-400">Description:</span>
                  <p className="text-white whitespace-pre-wrap">{description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-amber-900/50 text-amber-200">{severity}</Badge>
                  <Badge className="bg-slate-700/50 text-slate-200">{category}</Badge>
                </div>
                {screenshot && <div className="text-green-400 text-xs">✓ Screenshot included</div>}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setStep('form')}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-back-to-form"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  data-testid="button-submit-bug"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
