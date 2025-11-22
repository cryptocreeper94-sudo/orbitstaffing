import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Clock, MapPin, FileText, Zap } from 'lucide-react';

interface BackgroundCheckRecord {
  id: string;
  employeeName: string;
  checkType: 'minimal' | 'full';
  status: 'pending' | 'in_progress' | 'completed' | 'flagged';
  clearanceStatus: 'clear' | 'flagged' | 'denied';
  requestedAt: Date;
  completedAt?: Date;
  issues?: string[];
}

interface DrugTestRecord {
  id: string;
  employeeName: string;
  testType: '5_panel' | '10_panel' | '14_panel' | 'hair_sample';
  reason: 'pre_employment' | 'random' | 'post_incident' | 'workman_comp';
  status: 'pending' | 'scheduled' | 'completed' | 'passed' | 'failed';
  result?: 'passed' | 'failed' | 'inconclusive';
  testingFacility?: string;
  scheduledDate?: Date;
  completedAt?: Date;
}

export default function ComplianceVerification() {
  const [bgChecks, setBgChecks] = useState<BackgroundCheckRecord[]>([
    {
      id: '1',
      employeeName: 'John Doe',
      checkType: 'minimal',
      status: 'completed',
      clearanceStatus: 'clear',
      requestedAt: new Date(Date.now() - 604800000),
      completedAt: new Date(Date.now() - 259200000),
      issues: []
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      checkType: 'full',
      status: 'in_progress',
      clearanceStatus: 'pending',
      requestedAt: new Date(Date.now() - 172800000),
      issues: []
    }
  ]);

  const [drugTests, setDrugTests] = useState<DrugTestRecord[]>([
    {
      id: '1',
      employeeName: 'John Doe',
      testType: '5_panel',
      reason: 'pre_employment',
      status: 'completed',
      result: 'passed',
      testingFacility: 'LabCorp Downtown',
      completedAt: new Date(Date.now() - 345600000)
    },
    {
      id: '2',
      employeeName: 'Mike Wilson',
      testType: '10_panel',
      reason: 'workman_comp',
      status: 'scheduled',
      testingFacility: 'Quest Diagnostics',
      scheduledDate: new Date(Date.now() + 86400000)
    }
  ]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-gray-900/30 text-gray-300 border-gray-700/50',
      'in_progress': 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
      'completed': 'bg-blue-900/30 text-blue-300 border-blue-700/50',
      'passed': 'bg-green-900/30 text-green-300 border-green-700/50',
      'failed': 'bg-red-900/30 text-red-300 border-red-700/50',
      'flagged': 'bg-orange-900/30 text-orange-300 border-orange-700/50',
      'clear': 'bg-green-900/30 text-green-300 border-green-700/50',
      'denied': 'bg-red-900/30 text-red-300 border-red-700/50',
      'inconclusive': 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
    };
    return colors[status] || colors['pending'];
  };

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Compliance & Verification</h1>
        <p className="text-muted-foreground">
          Manage background checks and drug testing for pre-employment compliance
        </p>
      </div>

      <Tabs defaultValue="background" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="background">Background Checks</TabsTrigger>
          <TabsTrigger value="drugtest">Drug Testing</TabsTrigger>
          <TabsTrigger value="settings">Verification Settings</TabsTrigger>
        </TabsList>

        {/* Background Checks Tab */}
        <TabsContent value="background" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Background Checks</h2>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-request-bg-check">
              Request Background Check
            </Button>
          </div>

          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Employee</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Check Type</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Clearance</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Requested</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bgChecks.map(check => (
                    <tr key={check.id} className="border-b border-border/50 hover:bg-card/50" data-testid={`bg-check-row-${check.id}`}>
                      <td className="px-6 py-3 font-medium text-foreground">{check.employeeName}</td>
                      <td className="px-6 py-3 text-sm capitalize">{check.checkType === 'minimal' ? 'Minimal' : 'Full'}</td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={getStatusColor(check.status)}>
                          {check.status === 'in_progress' ? 'In Progress' : check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={getStatusColor(check.clearanceStatus)}>
                          {check.clearanceStatus.charAt(0).toUpperCase() + check.clearanceStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {check.requestedAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <Button variant="ghost" size="sm" data-testid={`button-view-bg-check-${check.id}`}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Minimal vs Full Comparison */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Background Check Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-blue-700/50 rounded-lg p-4">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    Minimal Background Check
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Employment history verification</li>
                    <li>✓ Criminal record check (last 7 years)</li>
                    <li>✓ SSN verification</li>
                    <li>✓ Address history</li>
                    <li>✓ Completed in 24-48 hours</li>
                    <li>✓ Free/included</li>
                  </ul>
                </div>

                <div className="border border-orange-700/50 rounded-lg p-4">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    Full Background Check
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>✓ Everything in Minimal, plus:</li>
                    <li>✓ Driving record</li>
                    <li>✓ Full 10-year criminal history</li>
                    <li>✓ Court records search</li>
                    <li>✓ Professional reference checks</li>
                    <li>✓ Completed in 3-5 business days</li>
                    <li>✓ Cost: $50-100 per check</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drug Testing Tab */}
        <TabsContent value="drugtest" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Drug Testing</h2>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-schedule-drug-test">
              Schedule Drug Test
            </Button>
          </div>

          <Card className="border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Employee</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Test Type</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Reason</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Facility</th>
                    <th className="px-6 py-3 text-left font-bold text-foreground">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {drugTests.map(test => (
                    <tr key={test.id} className="border-b border-border/50 hover:bg-card/50" data-testid={`drug-test-row-${test.id}`}>
                      <td className="px-6 py-3 font-medium text-foreground">{test.employeeName}</td>
                      <td className="px-6 py-3 text-sm">
                        <Badge variant="outline">
                          {test.testType === '5_panel' ? '5-Panel' : test.testType === '10_panel' ? '10-Panel' : test.testType === '14_panel' ? '14-Panel' : 'Hair Sample'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm capitalize">
                        {test.reason.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={getStatusColor(test.status)}>
                          {test.status === 'in_progress' ? 'In Progress' : test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">{test.testingFacility || '—'}</td>
                      <td className="px-6 py-3">
                        {test.result ? (
                          <Badge variant="outline" className={getStatusColor(test.result)}>
                            {test.result.charAt(0).toUpperCase() + test.result.slice(1)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Drug Test Types */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Drug Test Types & Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-bold text-foreground mb-2">5-Panel Test</h4>
                  <p className="text-xs text-muted-foreground mb-2">Standard pre-employment</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Marijuana (THC)</li>
                    <li>• Cocaine</li>
                    <li>• Amphetamines</li>
                    <li>• Opiates</li>
                    <li>• Phencyclidine (PCP)</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-bold text-foreground mb-2">10-Panel Test</h4>
                  <p className="text-xs text-muted-foreground mb-2">5-Panel + Extended</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• All 5-panel substances</li>
                    <li>• Benzodiazepines</li>
                    <li>• Barbiturates</li>
                    <li>• Methadone</li>
                    <li>• Tricyclic antidepressants</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-bold text-foreground mb-2">14-Panel Test</h4>
                  <p className="text-xs text-muted-foreground mb-2">Comprehensive screening</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• All 10-panel substances</li>
                    <li>• MDMA (Ecstasy)</li>
                    <li>• Propoxyphene</li>
                    <li>• Tramadol</li>
                    <li>• Synthetic cannabinoids</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-bold text-foreground mb-2">Hair Sample Test</h4>
                  <p className="text-xs text-muted-foreground mb-2">90-day history</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Detects up to 90 days</li>
                    <li>• Higher detection threshold</li>
                    <li>• Less likely false positives</li>
                    <li>• Often paired with urine test</li>
                    <li>• Premium option</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPS Tracking for Tests */}
          <Card className="border-l-4 border-l-cyan-500 bg-cyan-900/10 border-cyan-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                GPS Verification for Drug Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Similar to check-in verification, employees receive a text/email with a location-verified link when it's time for their drug test.
              </p>
              <p>
                They must be within geofence (300ft) of the testing facility to confirm they completed the test.
              </p>
              <p>
                <strong>Audit Trail:</strong> GPS coordinates, timestamp, and facility confirmation logged for workman's comp & compliance records.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Verification Settings</h2>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Pre-Employment Requirements by Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border border-border/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-foreground">ABC Manufacturing</h3>
                    <Button variant="outline" size="sm" data-testid="button-edit-client-1">
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked disabled className="w-4 h-4" />
                      <span className="text-muted-foreground">Minimal Background Check (required)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked disabled className="w-4 h-4" />
                      <span className="text-muted-foreground">5-Panel Drug Test (required)</span>
                    </div>
                  </div>
                </div>

                <div className="border border-border/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-foreground">XYZ Construction</h3>
                    <Button variant="outline" size="sm" data-testid="button-edit-client-2">
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked disabled className="w-4 h-4" />
                      <span className="text-muted-foreground">Full Background Check (required)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked disabled className="w-4 h-4" />
                      <span className="text-muted-foreground">10-Panel Drug Test (required)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Info */}
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-6">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Compliance Notes
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• All tests results stored with audit trails for DOL/OSHA compliance</li>
                <li>• GPS verification provides proof of test completion for workman's comp claims</li>
                <li>• Automatic flagging if employee fails to appear for scheduled test</li>
                <li>• Results stored separately from personnel files (HIPAA compliant)</li>
                <li>• Random drug testing capability for ongoing compliance programs</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
