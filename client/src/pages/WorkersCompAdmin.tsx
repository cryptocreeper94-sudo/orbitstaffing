import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function WorkersCompAdmin() {
  const [incidentClaims] = useState([
    {
      id: '1',
      employeeName: 'John Doe',
      incidentDate: new Date(Date.now() - 604800000),
      injuryType: 'Cut/Laceration',
      severity: 'moderate',
      claimNumber: 'WC-2024-001',
      status: 'approved',
      drugTestStatus: 'passed',
      estimatedCost: 2500,
      medicalProvider: 'Dr. Smith Medical'
    }
  ]);

  const [carrierSetup, setCarrierSetup] = useState({
    carrierName: 'State Mutual Insurance',
    accountNumber: 'WC-TN-123456',
    groupNumber: 'GROUP-789',
    policyNumber: 'POLICY-456',
    effectiveDate: '2024-01-01',
    coverageType: 'General Liability + Workers Compensation',
    contactName: 'Jane Smith',
    contactPhone: '(615) 555-9999'
  });

  const [setupComplete, setSetupComplete] = useState(true);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Workers Compensation Admin</h1>
        <p className="text-muted-foreground">
          Manage incidents, claims, and carrier information
        </p>
      </div>

      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="incidents">Incident Claims</TabsTrigger>
          <TabsTrigger value="documentation">Required Documentation</TabsTrigger>
          <TabsTrigger value="carrier">Carrier Setup</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Checklist</TabsTrigger>
        </TabsList>

        {/* Incident Claims */}
        <TabsContent value="incidents" className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Active & Recent Claims</h2>

          {incidentClaims.map(claim => (
            <Card key={claim.id} className="border-l-4 border-l-orange-500 bg-card/50" data-testid={`claim-card-${claim.id}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{claim.employeeName}</h3>
                    <p className="text-sm text-muted-foreground">{claim.injuryType}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      claim.status === 'approved'
                        ? 'bg-green-900/30 text-green-300'
                        : claim.status === 'pending'
                        ? 'bg-yellow-900/30 text-yellow-300'
                        : 'bg-blue-900/30 text-blue-300'
                    }
                  >
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-border/50">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Claim Number</p>
                    <p className="font-bold text-foreground">{claim.claimNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Incident Date</p>
                    <p className="text-sm text-foreground">{claim.incidentDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Drug Test</p>
                    <Badge
                      variant="outline"
                      className={
                        claim.drugTestStatus === 'passed'
                          ? 'bg-green-900/30 text-green-300'
                          : 'bg-yellow-900/30 text-yellow-300'
                      }
                    >
                      {claim.drugTestStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Est. Cost</p>
                    <p className="font-bold text-orange-400">${claim.estimatedCost.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Medical Provider: {claim.medicalProvider}</p>
                  <Button variant="outline" size="sm" data-testid={`button-view-claim-${claim.id}`}>
                    View Full Claim Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Required Documentation */}
        <TabsContent value="documentation" className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Required Documentation for Workman's Comp Claims</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Initial Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>First Report of Injury (FROI)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Medical certifications</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Incident investigation report</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Witness statements</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Medical & Claims
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Drug test results & chain of custody</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Medical treatment records</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Wage statements & payroll</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Authorization for medical treatment</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Ongoing Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Medical provider progress notes</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Return-to-work documents</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Correspondence with carrier</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Settlement/closure documents</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Carrier Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Notify carrier within 24 hours</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Proof of notice filing</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Carrier adjudication status</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Appeals if claim denied</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Carrier Setup */}
        <TabsContent value="carrier" className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Workers Compensation Carrier Information</h2>

          {setupComplete ? (
            <Card className="border-green-700/50 bg-green-900/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">Carrier Information Configured</p>
                    <p className="text-sm text-muted-foreground">All required information is on file</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-6 border-t border-b border-border/50">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Carrier Name</p>
                    <p className="font-bold text-foreground">{carrierSetup.carrierName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Account Number</p>
                    <p className="font-bold text-foreground">{carrierSetup.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Group Number</p>
                    <p className="font-bold text-foreground">{carrierSetup.groupNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Policy Number</p>
                    <p className="font-bold text-foreground">{carrierSetup.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Coverage Type</p>
                    <p className="text-sm text-foreground">{carrierSetup.coverageType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Effective Date</p>
                    <p className="font-bold text-foreground">{carrierSetup.effectiveDate}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">
                    <strong>Primary Contact:</strong> {carrierSetup.contactName} • {carrierSetup.contactPhone}
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-edit-carrier">
                    Edit Carrier Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-yellow-700/50 bg-yellow-900/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-foreground mb-2">Carrier Information Not Configured</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need to set up your workers compensation carrier information before you can file claims.
                    </p>
                    <Button className="bg-primary hover:bg-primary/90" data-testid="button-setup-carrier">
                      Setup Carrier Information
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Compliance Checklist */}
        <TabsContent value="compliance" className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Workman's Comp Compliance Checklist</h2>

          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <input type="checkbox" checked className="mt-1 w-4 h-4" disabled />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Employee Coverage</p>
                    <p className="text-xs text-gray-400">All employees classified correctly for WC coverage</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <input type="checkbox" checked className="mt-1 w-4 h-4" disabled />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Carrier Setup</p>
                    <p className="text-xs text-gray-400">Active workers comp carrier with valid policy</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <input type="checkbox" checked className="mt-1 w-4 h-4" disabled />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Incident Reporting</p>
                    <p className="text-xs text-gray-400">Documented incident reporting procedures in place</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <input type="checkbox" checked className="mt-1 w-4 h-4" disabled />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Drug Testing</p>
                    <p className="text-xs text-gray-400">Post-incident drug testing procedures established</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <input type="checkbox" checked className="mt-1 w-4 h-4" disabled />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Chain of Custody</p>
                    <p className="text-xs text-gray-400">Compliant chain of custody documentation system</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <input type="checkbox" checked className="mt-1 w-4 h-4" disabled />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Record Retention</p>
                    <p className="text-xs text-gray-400">All incident & claim records retained per state law</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-6">
              <p className="text-sm text-foreground">
                <strong>✓ Your system is configured for full workman's comp compliance:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-3 space-y-1 ml-4">
                <li>• Incident reporting with immediate drug testing</li>
                <li>• Multi-clinic network (Concentra, Fast Pace, Busy Bee, etc.)</li>
                <li>• GPS verification at testing facility</li>
                <li>• Chain of custody documentation</li>
                <li>• Secure encrypted result delivery</li>
                <li>• Complete audit trails for DOL/OSHA</li>
                <li>• Medical Review Officer (MRO) integration</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}
