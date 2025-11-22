import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  FileText,
  Camera
} from "lucide-react";
import { useState } from "react";

export default function WorkerConfig() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">We need a few details before you can start receiving assignments.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6" onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-3 bg-card border border-border/50">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <span className="hidden md:inline">Profile</span>
              <CheckCircle2 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <span className="hidden md:inline">Documents</span>
              <FileText className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <span className="hidden md:inline">Skills</span>
              <Badge variant="outline" className="text-xs">Optional</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-heading">Personal Information</CardTitle>
                <CardDescription>This information is kept secure and used for legal/tax purposes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name *</label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name *</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input type="email" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input type="tel" placeholder="(615) 555-0123" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth *</label>
                  <Input type="date" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Social Security Number *</label>
                  <Input type="password" placeholder="XXX-XX-XXXX" />
                  <p className="text-xs text-muted-foreground">Encrypted and secure. Required for payroll & tax reporting.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Home Address *</label>
                  <Input placeholder="123 Main St" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input placeholder="Nashville" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Input placeholder="TN" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ZIP</label>
                    <Input placeholder="37210" />
                  </div>
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Next: Upload Documents
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Required Documents (I-9 Verification)
                </CardTitle>
                <CardDescription>Upload clear images of your identification documents. They're encrypted and stored securely.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                  <p>Your documents are required by U.S. law (I-9 Employment Eligibility Verification). We keep them secure and confidential.</p>
                </div>

                <div className="space-y-4">
                  <DocumentUpload 
                    title="Government-Issued ID"
                    desc="Driver's License, Passport, or State ID"
                    uploaded={false}
                  />
                  <DocumentUpload 
                    title="Social Security Card"
                    desc="Clear photo of both sides"
                    uploaded={false}
                  />
                  <DocumentUpload 
                    title="Proof of Address"
                    desc="Utility bill, lease, or bank statement (dated within 90 days)"
                    uploaded={false}
                  />
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-amber-600 mb-1">Privacy Guarantee</div>
                    <p className="text-amber-600/70">Your documents are stored in an encrypted vault. Only authorized personnel can access them, and only when legally required.</p>
                  </div>
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue to Skills
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-heading">Skills & Preferences</CardTitle>
                <CardDescription>Tell us about your experience (optional but recommended).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Trade / Job Category *</label>
                  <div className="space-y-2">
                    {["General Labor", "Electrician", "Carpenter", "Plumber", "Event Staff", "Warehouse", "Other"].map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="category" value={cat} className="w-4 h-4" />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Experience</label>
                  <Input type="number" placeholder="e.g., 5" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Certifications / Licenses</label>
                  <Textarea 
                    placeholder="e.g., Licensed Electrician (TN), OSHA 10, Forklift Certified..." 
                    className="min-h-24 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Available for day labor (same-day assignments)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Available for scheduled shifts (1+ week notice)</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg">
                  Finish & Start Receiving Assignments
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DocumentUpload({ title, desc, uploaded }: any) {
  return (
    <div className={`p-4 border-2 border-dashed rounded-lg transition-colors ${uploaded ? "bg-green-500/10 border-green-500/30" : "border-border hover:border-primary/50 hover:bg-primary/5"}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${uploaded ? "bg-green-500/20 text-green-500" : "bg-background/50 text-muted-foreground"}`}>
          {uploaded ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground mb-2">{desc}</p>
          {!uploaded && (
            <Button size="sm" variant="outline" className="h-7 text-xs">
              <Camera className="w-3 h-3 mr-1" /> Upload Photo
            </Button>
          )}
        </div>
        {uploaded && (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Uploaded
          </Badge>
        )}
      </div>
    </div>
  );
}