import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Upload,
  Edit,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Wallet,
  Building2,
  ChevronRight,
  Lock,
  Zap,
  RefreshCw,
  ExternalLink,
  DollarSign,
  User,
  Calendar,
  Shield
} from "lucide-react";

export default function TaxDocuments() {
  const [activeTab, setActiveTab] = useState("w4");
  const [w4EditMode, setW4EditMode] = useState(false);
  const { toast } = useToast();
  
  const [w4Form, setW4Form] = useState({
    fillingStatus: "single",
    dependents: 0,
    otherIncome: "",
    standardDeduction: true,
    claimableDeductions: "",
    extraWithheldPerPaycheck: "",
  });

  const mockW4Current = {
    id: "w4-2024-001",
    fillingStatus: "single",
    dependents: 0,
    otherIncome: "0",
    standardDeduction: true,
    claimableDeductions: "0",
    extraWithheldPerPaycheck: "0",
    effectiveYear: 2024,
    effectiveDate: "2024-01-15",
    isCurrentW4: true,
    updatedAt: "2024-01-15",
  };

  const mockTaxDocuments = [
    { id: 1, type: "W-2", year: 2023, status: "available", dateAvailable: "Jan 31, 2024", employer: "TechCorp Distribution" },
    { id: 2, type: "W-2", year: 2022, status: "available", dateAvailable: "Jan 31, 2023", employer: "TechCorp Distribution" },
    { id: 3, type: "1099-NEC", year: 2023, status: "available", dateAvailable: "Jan 31, 2024", employer: "Freelance Work" },
  ];

  const mockW4History = [
    { id: "w4-2024-001", effectiveDate: "2024-01-15", fillingStatus: "single", dependents: 0, isCurrent: true },
    { id: "w4-2023-002", effectiveDate: "2023-06-01", fillingStatus: "married", dependents: 1, isCurrent: false },
    { id: "w4-2023-001", effectiveDate: "2023-01-15", fillingStatus: "single", dependents: 0, isCurrent: false },
  ];

  const handleW4Submit = () => {
    toast({
      title: "W-4 Submitted",
      description: "Your W-4 form has been updated successfully. Changes take effect next pay period.",
    });
    setW4EditMode(false);
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Tax Documents & Payments</h1>
          <p className="text-muted-foreground">Manage your W-4, view tax forms, and set up direct deposit</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-1 bg-slate-800/50 p-1 h-auto" data-testid="tabs-list">
            <TabsTrigger value="w4" className="text-xs px-2 py-2" data-testid="tab-w4">
              <FileText className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">W-4 Form</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs px-2 py-2" data-testid="tab-documents">
              <Download className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Tax Documents</span>
            </TabsTrigger>
            <TabsTrigger value="direct-deposit" className="text-xs px-2 py-2" data-testid="tab-direct-deposit">
              <Building2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Direct Deposit</span>
            </TabsTrigger>
            <TabsTrigger value="pay-card" className="text-xs px-2 py-2" data-testid="tab-pay-card">
              <CreditCard className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">ORBIT Pay</span>
            </TabsTrigger>
          </TabsList>

          {/* W-4 TAB */}
          <TabsContent value="w4" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-400" />
                          W-4 Employee's Withholding Certificate
                        </CardTitle>
                        <CardDescription>Federal tax withholding preferences for {new Date().getFullYear()}</CardDescription>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Current
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!w4EditMode ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Filing Status</p>
                            <p className="font-medium capitalize" data-testid="text-filing-status">{mockW4Current.fillingStatus}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Dependents Claimed</p>
                            <p className="font-medium" data-testid="text-dependents">{mockW4Current.dependents}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Other Income</p>
                            <p className="font-medium" data-testid="text-other-income">${mockW4Current.otherIncome}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Extra Withholding</p>
                            <p className="font-medium" data-testid="text-extra-withholding">${mockW4Current.extraWithheldPerPaycheck}/paycheck</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Deduction Type</p>
                            <p className="font-medium" data-testid="text-deduction-type">{mockW4Current.standardDeduction ? "Standard Deduction" : "Itemized Deductions"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Effective Date</p>
                            <p className="font-medium" data-testid="text-effective-date">{mockW4Current.effectiveDate}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setW4EditMode(true)} 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          data-testid="button-edit-w4"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Update W-4 Information
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fillingStatus">Filing Status</Label>
                            <Select value={w4Form.fillingStatus} onValueChange={(v) => setW4Form({...w4Form, fillingStatus: v})}>
                              <SelectTrigger id="fillingStatus" data-testid="select-filing-status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Single or Married Filing Separately</SelectItem>
                                <SelectItem value="married">Married Filing Jointly</SelectItem>
                                <SelectItem value="HOH">Head of Household</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dependents">Number of Dependents</Label>
                            <Input 
                              id="dependents" 
                              type="number" 
                              min="0" 
                              value={w4Form.dependents}
                              onChange={(e) => setW4Form({...w4Form, dependents: parseInt(e.target.value) || 0})}
                              data-testid="input-dependents"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="otherIncome">Other Income (Annual)</Label>
                            <Input 
                              id="otherIncome" 
                              type="text" 
                              placeholder="$0.00"
                              value={w4Form.otherIncome}
                              onChange={(e) => setW4Form({...w4Form, otherIncome: e.target.value})}
                              data-testid="input-other-income"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="extraWithheld">Extra Withholding (Per Paycheck)</Label>
                            <Input 
                              id="extraWithheld" 
                              type="text" 
                              placeholder="$0.00"
                              value={w4Form.extraWithheldPerPaycheck}
                              onChange={(e) => setW4Form({...w4Form, extraWithheldPerPaycheck: e.target.value})}
                              data-testid="input-extra-withholding"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="standardDeduction" 
                            checked={w4Form.standardDeduction}
                            onCheckedChange={(checked) => setW4Form({...w4Form, standardDeduction: !!checked})}
                            data-testid="checkbox-standard-deduction"
                          />
                          <label htmlFor="standardDeduction" className="text-sm">
                            Use Standard Deduction (recommended for most filers)
                          </label>
                        </div>
                        {!w4Form.standardDeduction && (
                          <div className="space-y-2">
                            <Label htmlFor="claimableDeductions">Claimable Itemized Deductions</Label>
                            <Input 
                              id="claimableDeductions" 
                              type="text" 
                              placeholder="$0.00"
                              value={w4Form.claimableDeductions}
                              onChange={(e) => setW4Form({...w4Form, claimableDeductions: e.target.value})}
                              data-testid="input-itemized-deductions"
                            />
                          </div>
                        )}
                        <div className="flex gap-3">
                          <Button 
                            onClick={() => setW4EditMode(false)} 
                            variant="outline"
                            className="flex-1"
                            data-testid="button-cancel-w4"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleW4Submit} 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            data-testid="button-submit-w4"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Submit W-4
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      W-4 History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {mockW4History.map((w4) => (
                          <div 
                            key={w4.id} 
                            className={`p-3 rounded-lg border ${w4.isCurrent ? 'bg-blue-900/20 border-blue-500/30' : 'bg-slate-900/50 border-slate-700/50'}`}
                            data-testid={`card-w4-history-${w4.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium capitalize">{w4.fillingStatus}</p>
                                <p className="text-xs text-slate-400">{w4.effectiveDate}</p>
                              </div>
                              {w4.isCurrent && (
                                <Badge className="bg-blue-600/20 text-blue-400 text-xs">Current</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="bg-amber-900/20 border-amber-500/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-300">Important Notice</p>
                        <p className="text-xs text-amber-200/70 mt-1">
                          Changes to your W-4 will take effect on your next pay period. 
                          Consult a tax professional if you're unsure about your withholding.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAX DOCUMENTS TAB */}
          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-400" />
                      Available Tax Documents
                    </CardTitle>
                    <CardDescription>Download your W-2s, 1099s, and other tax forms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockTaxDocuments.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-green-500/30 transition-all"
                          data-testid={`card-tax-doc-${doc.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <span className="text-green-400 font-bold text-sm">{doc.type}</span>
                            </div>
                            <div>
                              <p className="font-medium">{doc.type} - {doc.year}</p>
                              <p className="text-xs text-slate-400">{doc.employer}</p>
                              <p className="text-xs text-slate-500">Available: {doc.dateAvailable}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-download-doc-${doc.id}`}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      Upcoming Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">W-2 for 2024</p>
                          <p className="text-xs text-slate-400">Expected by January 31, 2025</p>
                        </div>
                        <Badge className="bg-purple-600/20 text-purple-400">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      Document Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Lock className="w-4 h-4 text-green-400" />
                        <span>256-bit encryption</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span>IRS compliant</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span>ORBIT verified</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-500/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-300">Need a Prior Year?</p>
                        <p className="text-xs text-blue-200/70 mt-1">
                          Contact HR to request tax documents from previous years not shown here.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* DIRECT DEPOSIT TAB - PLAID PLACEHOLDER */}
          <TabsContent value="direct-deposit" className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-cyan-400" />
                      Direct Deposit Setup
                    </CardTitle>
                    <CardDescription>Securely connect your bank account for automatic payments</CardDescription>
                  </div>
                  <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Coming Soon
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Plaid Integration</h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-6">
                    We're integrating with Plaid to provide secure, instant bank account verification 
                    for direct deposit setup. No more routing number errors or delayed payments.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">Instant Verification</p>
                      <p className="text-xs text-slate-400">No more waiting days for micro-deposits</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <Lock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">Bank-Level Security</p>
                      <p className="text-xs text-slate-400">256-bit encryption protects your data</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <RefreshCw className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-medium">Auto-Updates</p>
                      <p className="text-xs text-slate-400">Account changes sync automatically</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button disabled className="bg-cyan-600/50 cursor-not-allowed" data-testid="button-connect-bank-disabled">
                      <Building2 className="w-4 h-4 mr-2" />
                      Connect Bank Account
                    </Button>
                    <Button variant="outline" disabled className="cursor-not-allowed" data-testid="button-manual-entry-disabled">
                      Manual Entry (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-900/50 border-t border-slate-700/50">
                <div className="w-full text-center">
                  <p className="text-xs text-slate-500">
                    Powered by Plaid - Trusted by 12,000+ financial institutions
                  </p>
                </div>
              </CardFooter>
            </Card>

            <Card className="bg-cyan-900/20 border-cyan-500/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-cyan-300">While You Wait...</p>
                    <p className="text-xs text-cyan-200/70 mt-1">
                      Consider signing up for the ORBIT Pay Card - get instant access to your earnings 
                      with no direct deposit wait times!
                    </p>
                    <Button 
                      variant="link" 
                      className="text-cyan-400 p-0 h-auto mt-2"
                      onClick={() => setActiveTab("pay-card")}
                      data-testid="button-go-to-pay-card"
                    >
                      Learn about ORBIT Pay <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORBIT PAY CARD TAB */}
          <TabsContent value="pay-card" className="space-y-4">
            <Card className="bg-gradient-to-br from-cyan-900/30 via-slate-800/50 to-purple-900/30 border-cyan-500/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CreditCard className="w-6 h-6 text-cyan-400" />
                      ORBIT Pay Card
                    </CardTitle>
                    <CardDescription className="text-base">Get paid instantly. No waiting. No fees.</CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-0">
                    Powered by Stripe
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-[1.586/1] max-w-sm rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden mb-6">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
                      <div className="relative h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded" />
                          <span className="text-cyan-400 font-bold text-lg">ORBIT</span>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Card Number</p>
                          <p className="text-xl font-mono tracking-wider">•••• •••• •••• 1234</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-400 text-xs">Valid Thru</p>
                            <p className="font-mono">12/27</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-xs">VISA</p>
                            <p className="font-bold text-lg">DEBIT</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="font-medium">Instant Access</p>
                          <p className="text-xs text-slate-400">Get paid the moment payroll runs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="font-medium">Zero Fees</p>
                          <p className="text-xs text-slate-400">No monthly fees, no hidden charges</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <Wallet className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="font-medium">55,000+ Free ATMs</p>
                          <p className="text-xs text-slate-400">Nationwide ATM network access</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <h3 className="text-lg font-bold mb-4">Join the Waitlist</h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Be among the first to get the ORBIT Pay Card when it launches. 
                        We're awaiting final Stripe Issuing approval.
                      </p>
                      <div className="space-y-3">
                        <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700" data-testid="button-join-waitlist">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Join Waitlist
                        </Button>
                        <p className="text-xs text-center text-slate-500">
                          1,247 workers already waiting
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30 text-center">
                        <p className="text-2xl font-bold text-green-400">1-2%</p>
                        <p className="text-xs text-slate-400">Cashback Rewards</p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30 text-center">
                        <p className="text-2xl font-bold text-blue-400">Apple/Google</p>
                        <p className="text-xs text-slate-400">Wallet Compatible</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-300">Coming Q1 2025</p>
                          <p className="text-xs text-amber-200/70">
                            Awaiting Stripe Issuing program approval. Virtual cards first, 
                            physical cards to follow.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-900/50 border-t border-slate-700/50">
                <div className="w-full flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    ORBIT Pay Card is a Visa debit card issued by Stripe Treasury
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Powered by ORBIT
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
