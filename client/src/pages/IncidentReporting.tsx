import React, { useState } from 'react';
import { AlertCircle, MapPin, Clock, User, FileText, Send, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { PageHeader } from '@/components/ui/section-header';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent } from '@/components/ui/orbit-card';

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

const severityOptions: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Minor Issue', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'medium', label: 'Moderate', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'high', label: 'Serious', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'critical', label: 'Emergency', color: 'bg-red-600/30 text-red-300 border-red-400/50' },
];

const incidentTypes = [
  'Safety Violation',
  'Injury or Medical Emergency',
  'Property Damage',
  'Worker Conduct Issue',
  'Equipment Malfunction',
  'Environmental Hazard',
  'Attendance/Attendance Issue',
  'Other',
];

export default function IncidentReporting() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    incidentType: '',
    severity: 'medium' as SeverityLevel,
    workerName: '',
    workerEmail: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().slice(0, 5),
    location: '',
    description: '',
    witnesses: '',
    actionTaken: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.incidentType || !formData.description || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Incident report submitted successfully');
        setFormData({
          incidentType: '',
          severity: 'medium',
          workerName: '',
          workerEmail: '',
          incidentDate: new Date().toISOString().split('T')[0],
          incidentTime: new Date().toTimeString().slice(0, 5),
          location: '',
          description: '',
          witnesses: '',
          actionTaken: '',
        });
      } else {
        toast.error('Failed to submit incident report');
      }
    } catch (error) {
      toast.error('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumb = (
    <button
      onClick={() => setLocation('/')}
      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
      data-testid="button-back"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Incident Reporting"
          subtitle="Report incidents for liability protection and worker safety compliance. All reports are confidential and documented."
          breadcrumb={breadcrumb}
          actions={
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          }
        />

        <form onSubmit={handleSubmit}>
          <BentoGrid cols={2} gap="md" className="mb-6">
            <BentoTile span={2} className="p-0">
              <OrbitCard hover={false} className="border-0 bg-transparent">
                <OrbitCardHeader icon={<AlertCircle className="w-5 h-5 text-red-400" />}>
                  <OrbitCardTitle>Incident Classification</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2">
                        Incident Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="incidentType"
                        value={formData.incidentType}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        required
                        data-testid="select-incident-type"
                      >
                        <option value="">Select incident type...</option>
                        {incidentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2">
                        Severity Level <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1 sm:gap-2">
                        {severityOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, severity: option.value }))}
                            className={`px-2 sm:px-3 py-2 rounded border text-xs sm:text-sm font-medium transition ${
                              formData.severity === option.value
                                ? option.color
                                : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-slate-500'
                            }`}
                            data-testid={`button-severity-${option.value}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            <BentoTile className="p-0">
              <OrbitCard hover={false} className="border-0 bg-transparent h-full">
                <OrbitCardHeader icon={<User className="w-5 h-5 text-cyan-400" />}>
                  <OrbitCardTitle>Worker Involved</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="workerName"
                      placeholder="Worker name (optional)"
                      value={formData.workerName}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      data-testid="input-worker-name"
                    />
                    <input
                      type="email"
                      name="workerEmail"
                      placeholder="Worker email (optional)"
                      value={formData.workerEmail}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      data-testid="input-worker-email"
                    />
                  </div>
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            <BentoTile className="p-0">
              <OrbitCard hover={false} className="border-0 bg-transparent h-full">
                <OrbitCardHeader icon={<Clock className="w-5 h-5 text-cyan-400" />}>
                  <OrbitCardTitle>Date & Time</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1">Date</label>
                      <input
                        type="date"
                        name="incidentDate"
                        value={formData.incidentDate}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        required
                        data-testid="input-incident-date"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1">Time</label>
                      <input
                        type="time"
                        name="incidentTime"
                        value={formData.incidentTime}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        data-testid="input-incident-time"
                      />
                    </div>
                  </div>
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            <BentoTile span={2} className="p-0">
              <OrbitCard hover={false} className="border-0 bg-transparent">
                <OrbitCardHeader icon={<MapPin className="w-5 h-5 text-cyan-400" />}>
                  <OrbitCardTitle>Location <span className="text-red-400">*</span></OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <input
                    type="text"
                    name="location"
                    placeholder="Job site address or location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                    data-testid="input-location"
                  />
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            <BentoTile span={2} className="p-0">
              <OrbitCard hover={false} className="border-0 bg-transparent">
                <OrbitCardHeader icon={<FileText className="w-5 h-5 text-cyan-400" />}>
                  <OrbitCardTitle>
                    Description <span className="text-red-400">*</span>
                  </OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <textarea
                    name="description"
                    placeholder="Detailed description of the incident. What happened? Who was involved? What were the consequences?"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                    data-testid="textarea-description"
                  />
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            <BentoTile className="p-0">
              <OrbitCard hover={false} className="border-0 bg-transparent h-full">
                <OrbitCardHeader>
                  <OrbitCardTitle>Witnesses</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <textarea
                    name="witnesses"
                    placeholder="Who witnessed this incident? (names/contacts)"
                    value={formData.witnesses}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    data-testid="textarea-witnesses"
                  />
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>

            <BentoTile className="p-0">
              <OrbitCard hover={false} className="border-0 bg-transparent h-full">
                <OrbitCardHeader>
                  <OrbitCardTitle>Immediate Action Taken</OrbitCardTitle>
                </OrbitCardHeader>
                <OrbitCardContent>
                  <textarea
                    name="actionTaken"
                    placeholder="What steps were taken to resolve?"
                    value={formData.actionTaken}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    data-testid="textarea-action-taken"
                  />
                </OrbitCardContent>
              </OrbitCard>
            </BentoTile>
          </BentoGrid>

          <OrbitCard variant="glass" className="mb-6 border-cyan-500/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-cyan-300">Liability Protection:</strong> This incident report is documented for worker safety compliance and liability protection. 
                All information is confidential and retained for legal purposes. ORBIT takes worker safety seriously.
              </p>
            </div>
          </OrbitCard>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
            data-testid="button-submit-incident"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
          </Button>
        </form>

        <OrbitCard variant="default" className="mt-6 border-amber-500/20 bg-gradient-to-br from-amber-900/20 to-slate-900">
          <OrbitCardHeader icon={<CheckCircle className="w-5 h-5 text-amber-400" />}>
            <OrbitCardTitle className="text-amber-300">Why Incident Reporting Matters</OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Protects workers and the company legally
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Creates a documented safety record
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Enables pattern recognition for hazard prevention
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Demonstrates commitment to compliance
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Supports insurance claims if needed
              </li>
            </ul>
          </OrbitCardContent>
        </OrbitCard>
      </div>
    </div>
  );
}
