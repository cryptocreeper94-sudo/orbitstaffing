import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, Download, ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { ORBITLetterhead, WelcomeLetter } from '@/components/ORBITLetterhead';
import { WELCOME_LETTER_TEMPLATES } from '@/components/WelcomeLetterTemplates';

export default function SendWelcomeLetters() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<'employee' | 'owner' | 'admin' | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientInfo, setRecipientInfo] = useState('');
  const [preview, setPreview] = useState(false);

  const roles = [
    { id: 'employee', label: 'Employee', color: 'bg-cyan-600' },
    { id: 'owner', label: 'Company Owner', color: 'bg-purple-600' },
    { id: 'admin', label: 'Administrator', color: 'bg-amber-600' },
  ];

  const getLetterBody = () => {
    if (!selectedRole) return '';
    if (selectedRole === 'employee') return WELCOME_LETTER_TEMPLATES.employee(recipientName, recipientInfo || 'Staffing Professional');
    if (selectedRole === 'owner') return WELCOME_LETTER_TEMPLATES.owner(recipientInfo || recipientName);
    if (selectedRole === 'admin') return WELCOME_LETTER_TEMPLATES.admin(recipientName);
    return '';
  };

  const handleSendLetter = async () => {
    if (!recipientName || !selectedRole) {
      alert('Please enter recipient name and select a role');
      return;
    }

    try {
      const response = await fetch('/api/communications/send-welcome-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          recipientInfo,
          role: selectedRole,
          letterBody: getLetterBody(),
        }),
      });

      if (response.ok) {
        alert('Welcome letter sent successfully!');
        setRecipientName('');
        setRecipientInfo('');
        setSelectedRole(null);
      } else {
        alert('Failed to send letter');
      }
    } catch (error) {
      console.error('Error sending letter:', error);
      alert('Error sending letter');
    }
  };

  if (preview && selectedRole) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => setPreview(false)}
            variant="outline"
            className="mb-4 text-slate-300"
            data-testid="button-back-from-preview"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>

          <WelcomeLetter
            recipientName={recipientName}
            role={selectedRole}
            letterBody={getLetterBody()}
          />

          <div className="flex gap-3 mt-6 justify-center">
            <Button
              onClick={handleSendLetter}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-send-letter"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Letter
            </Button>
            <Button
              variant="outline"
              className="text-slate-300"
              data-testid="button-download-letter"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={() => setLocation('/admin')}
          variant="outline"
          className="mb-6 text-slate-300"
          data-testid="button-back-to-admin"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>

        <Card className="bg-slate-800 border border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <Mail className="w-5 h-5" />
              Send Welcome Letters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Select Recipient Role
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id as any)}
                    className={`p-3 rounded-lg font-semibold transition ${
                      selectedRole === role.id
                        ? `${role.color} text-white`
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    data-testid={`button-role-${role.id}`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedRole && (
              <>
                {/* Recipient Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    data-testid="input-recipient-name"
                  />
                </div>

                {/* Additional Info */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    {selectedRole === 'employee' ? 'Position' : 'Company Name / Info'}
                  </label>
                  <input
                    type="text"
                    value={recipientInfo}
                    onChange={(e) => setRecipientInfo(e.target.value)}
                    placeholder={selectedRole === 'employee' ? 'e.g., Field Technician' : 'e.g., ABC Staffing'}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    data-testid="input-recipient-info"
                  />
                </div>

                {/* Preview & Send */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setPreview(true)}
                    variant="outline"
                    className="flex-1 text-slate-300"
                    data-testid="button-preview-letter"
                  >
                    Preview Letter
                  </Button>
                  <Button
                    onClick={handleSendLetter}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                    data-testid="button-send-direct"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Now
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
