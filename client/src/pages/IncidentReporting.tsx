import React, { useState } from 'react';
import { AlertCircle, MapPin, Clock, User, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

const severityOptions: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Minor Issue', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'medium', label: 'Moderate', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'high', label: 'Serious', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'critical', label: 'Emergency', color: 'bg-red-200 text-red-900 border-red-400' },
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Incident Reporting</h1>
          </div>
          <p className="text-gray-600">
            Report incidents for liability protection and worker safety compliance. All reports are confidential and documented.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Incident Type & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Incident Type <span className="text-red-600">*</span>
              </label>
              <select
                name="incidentType"
                value={formData.incidentType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select incident type...</option>
                {incidentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Severity Level <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {severityOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, severity: option.value }))}
                    className={`px-3 py-2 rounded border text-sm font-medium transition ${
                      formData.severity === option.value
                        ? option.color
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Worker Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Worker Involved
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="workerName"
                placeholder="Worker name (optional)"
                value={formData.workerName}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="workerEmail"
                placeholder="Worker email (optional)"
                value={formData.workerEmail}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Incident Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Incident Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  name="incidentTime"
                  value={formData.incidentTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Location <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="location"
                  placeholder="Job site address or location"
                  value={formData.location}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-6">
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              placeholder="Detailed description of the incident. What happened? Who was involved? What were the consequences?"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Witnesses & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Witnesses (names/contacts)
              </label>
              <textarea
                name="witnesses"
                placeholder="Who witnessed this incident?"
                value={formData.witnesses}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Immediate Action Taken
              </label>
              <textarea
                name="actionTaken"
                placeholder="What steps were taken to resolve?"
                value={formData.actionTaken}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Liability Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Liability Protection:</strong> This incident report is documented for worker safety compliance and liability protection. 
              All information is confidential and retained for legal purposes. ORBIT takes worker safety seriously.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            data-testid="button-submit-incident"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
          </Button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-2">Why Incident Reporting Matters</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Protects workers and the company legally</li>
            <li>✓ Creates a documented safety record</li>
            <li>✓ Enables pattern recognition for hazard prevention</li>
            <li>✓ Demonstrates commitment to compliance</li>
            <li>✓ Supports insurance claims if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
