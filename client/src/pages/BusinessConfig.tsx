import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  DollarSign, 
  Users, 
  FileText,
  ToggleLeft
} from "lucide-react";
import { useState } from "react";

export default function BusinessConfig() {
  const [companyName, setCompanyName] = useState("TechCorp Industries");
  const [minWorkers, setMinWorkers] = useState(4);
  const [hourlyBase, setHourlyBase] = useState(20);
  const [markup, setMarkup] = useState(1.35);

  return (
    <Shell>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Business Configuration</h1>
          <p className="text-muted-foreground">Customize your account settings and staffing parameters.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="rates">Rate Configuration</TabsTrigger>
          <TabsTrigger value="gov">Government Jobs</TabsTrigger>
          <TabsTrigger value="documents">Document Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Company Profile</CardTitle>
              <CardDescription>Update your business information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business License #</label>
                  <Input placeholder="TN-2024-12345" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Contact Email</label>
                  <Input type="email" placeholder="contact@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Phone</label>
                  <Input placeholder="(615) 555-0123" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Headquarters Address</label>
                <Input placeholder="123 Main St, Nashville, TN 37210" />
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" /> Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Rate Configuration
              </CardTitle>
              <CardDescription>Set your base hourly rates and markup structure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-medium block mb-3">Base Hourly Rates</label>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded border border-border/50">
                      <span className="text-sm">General Labor</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">$18.00</span>
                        <Button size="sm" variant="ghost">/hr</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded border border-border/50">
                      <span className="text-sm">Skilled Trades (Electrician)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">$28.50</span>
                        <Button size="sm" variant="ghost">/hr</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded border border-border/50">
                      <span className="text-sm">Event Staff</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">$16.00</span>
                        <Button size="sm" variant="ghost">/hr</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-3">Your Markup</label>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Current Multiplier</div>
                      <div className="text-3xl font-bold font-mono text-primary">{markup}x</div>
                      <div className="text-xs text-muted-foreground mt-2">You bill clients {(markup * 100 - 100).toFixed(0)}% above worker wage</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Adjust Markup</label>
                      <Input 
                        type="number" 
                        step="0.05" 
                        value={markup}
                        onChange={(e) => setMarkup(parseFloat(e.target.value))}
                        className="font-mono"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground p-2 bg-background/50 rounded">
                      Lower markup = more competitive. Industry standard is 1.6x.
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="w-4 h-4 mr-2" /> Save Rate Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gov" className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Government Job Compliance
              </CardTitle>
              <CardDescription>Configure prevailing wage rates for government contracts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Government jobs (federal, state, local contracts) often require <strong>prevailing wage</strong> compliance. 
                  This means workers must be paid at least the government-mandated rate for their trade in your region.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm">Tennessee Prevailing Wage Rates (Sample)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-background/50 rounded border border-border/50">
                    <span className="text-sm">Electrician</span>
                    <span className="font-mono font-bold">$45.25/hr</span>
                  </div>
                  <div className="flex justify-between p-3 bg-background/50 rounded border border-border/50">
                    <span className="text-sm">Carpenter</span>
                    <span className="font-mono font-bold">$38.75/hr</span>
                  </div>
                  <div className="flex justify-between p-3 bg-background/50 rounded border border-border/50">
                    <span className="text-sm">General Laborer</span>
                    <span className="font-mono font-bold">$28.50/hr</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <ToggleLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Auto-apply prevailing wage for government jobs</span>
                </label>
                <p className="text-xs text-muted-foreground ml-7">When a job is tagged as "government", rates will automatically comply.</p>
              </div>

              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Save Government Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Document Requirements</CardTitle>
              <CardDescription>Specify which documents your workers need to provide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border border-border/50 rounded-lg flex items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="mt-1">
                    <input type="checkbox" checked disabled className="cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">I-9 Form & Identity Verification</div>
                    <div className="text-xs text-muted-foreground mt-1">Required for all workers (legal requirement)</div>
                  </div>
                </div>

                <div className="p-4 border border-border/50 rounded-lg flex items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="mt-1">
                    <input type="checkbox" checked disabled className="cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">W-4 & Tax Forms</div>
                    <div className="text-xs text-muted-foreground mt-1">IRS tax withholding (required)</div>
                  </div>
                </div>

                <div className="p-4 border border-border/50 rounded-lg flex items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="mt-1">
                    <input type="checkbox" defaultChecked className="cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Driver's License Copy</div>
                    <div className="text-xs text-muted-foreground mt-1">For on-site identification</div>
                  </div>
                </div>

                <div className="p-4 border border-border/50 rounded-lg flex items-start gap-4 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="mt-1">
                    <input type="checkbox" defaultChecked className="cursor-pointer" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Background Check Authorization</div>
                    <div className="text-xs text-muted-foreground mt-1">For safety-sensitive roles</div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Save Document Requirements
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}