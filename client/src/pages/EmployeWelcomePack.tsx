import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Shield, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';

export default function EmployeeWelcomePack() {
  const [, setLocation] = useLocation();
  const [acknowledged, setAcknowledged] = useState({
    handbook: false,
    drinkDriving: false,
    preEmployment: false,
    accident: false,
    tennessee: false,
  });

  const allAcknowledged = Object.values(acknowledged).every(v => v);

  const handleDownload = (docName: string) => {
    alert(`${docName} would be downloaded as PDF`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Employee Welcome Pack</h1>
          <p className="text-gray-400">Please review and acknowledge all documents before starting work</p>
        </div>

        {/* Documents */}
        <div className="space-y-6">
          {/* Employee Handbook */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader className="border-b border-slate-700 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <FileText className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="text-white">Employee Handbook</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">Company policies, procedures, and expectations</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-300 text-sm mb-4">
                This handbook contains essential information about working with ORBIT Staffing, including:
              </p>
              <ul className="text-sm text-gray-400 space-y-2 mb-4">
                <li>• Code of conduct and professional behavior</li>
                <li>• Attendance and punctuality requirements</li>
                <li>• Safety protocols and procedures</li>
                <li>• Compensation and benefits information</li>
                <li>• Dispute resolution procedures</li>
              </ul>
              <Button
                onClick={() => handleDownload('Employee Handbook')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                data-testid="button-download-handbook"
              >
                Download Handbook (PDF)
              </Button>
              <div className="mt-4 flex items-start gap-3">
                <Checkbox
                  checked={acknowledged.handbook}
                  onCheckedChange={(checked) => setAcknowledged(prev => ({ ...prev, handbook: !!checked }))}
                  data-testid="checkbox-handbook-ack"
                />
                <label className="text-sm text-gray-300">
                  I have reviewed and understand the Employee Handbook
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Drug Testing Policy */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700 pb-4">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <CardTitle className="text-white">Drug Testing Policy</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">Pre-employment and accident-related testing</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {/* Pre-Employment */}
              <div className="border-b border-slate-700 pb-4">
                <h3 className="text-white font-semibold mb-2">Pre-Employment Drug Testing</h3>
                <p className="text-sm text-gray-400 mb-4">
                  All applicants must pass a pre-employment drug screening before beginning work. Testing is conducted by a certified third-party laboratory and includes screening for controlled substances.
                </p>
                <div className="flex items-start gap-3 bg-slate-700/30 p-3 rounded">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    Failure to pass pre-employment screening will result in termination of the employment relationship.
                  </p>
                </div>
              </div>

              {/* Accident Testing */}
              <div>
                <h3 className="text-white font-semibold mb-2">Accident-Related Drug Testing</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Employees may be required to submit to drug testing following any workplace accident or injury. This testing is conducted to determine if impairment was a factor.
                </p>
                <div className="flex items-start gap-3 bg-slate-700/30 p-3 rounded">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    Refusal to submit to accident-related testing may result in disciplinary action or termination.
                  </p>
                </div>
              </div>

              {/* Acknowledgments */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={acknowledged.preEmployment}
                    onCheckedChange={(checked) => setAcknowledged(prev => ({ ...prev, preEmployment: !!checked }))}
                    data-testid="checkbox-preemployment-drug"
                  />
                  <label className="text-sm text-gray-300">
                    I consent to pre-employment drug testing
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={acknowledged.accident}
                    onCheckedChange={(checked) => setAcknowledged(prev => ({ ...prev, accident: !!checked }))}
                    data-testid="checkbox-accident-drug"
                  />
                  <label className="text-sm text-gray-300">
                    I understand accident-related drug testing may be required and consent to such testing
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tennessee Right-to-Work */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700 pb-4">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <CardTitle className="text-white">Tennessee Right-to-Work Statement</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">Your employment rights in Tennessee</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="bg-slate-700/30 p-4 rounded mb-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Tennessee is a right-to-work state. This means that no person can be denied employment or required to join a labor union as a condition of employment. You have the right to:
                </p>
                <ul className="text-sm text-gray-300 space-y-2 mt-3 ml-4">
                  <li>• Work without being required to join a union</li>
                  <li>• Leave a union without jeopardizing employment</li>
                  <li>• Make voluntary contributions to union activities</li>
                  <li>• Work in any industry without mandatory union membership</li>
                </ul>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                This is in accordance with Tennessee Code Annotated § 49-5-201. No employment agreement, union security agreement, or other requirement shall make union membership a condition of employment in Tennessee.
              </p>
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={acknowledged.tennessee}
                  onCheckedChange={(checked) => setAcknowledged(prev => ({ ...prev, tennessee: !!checked }))}
                  data-testid="checkbox-tennessee-rfw"
                />
                <label className="text-sm text-gray-300">
                  I acknowledge my right-to-work status in Tennessee and understand these protections
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => setLocation('/employee-pre-app')}
              variant="outline"
              className="flex-1"
              data-testid="button-back"
            >
              Back to Application
            </Button>
            <Button
              onClick={() => {
                if (allAcknowledged) {
                  alert('All documents acknowledged! Your welcome pack will be saved to your employee file.');
                  setLocation('/');
                }
              }}
              disabled={!allAcknowledged}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
              data-testid="button-acknowledge-all"
            >
              {allAcknowledged ? 'Continue' : 'Acknowledge All Documents'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
