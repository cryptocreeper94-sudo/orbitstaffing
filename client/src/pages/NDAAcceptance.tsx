import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function NDAAcceptance() {
  const [scrolled, setScrolled] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [checkboxes, setCheckboxes] = useState({
    read: false,
    understand: false,
    agree: false,
    acknowledge: false,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isScrolledToBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    if (isScrolledToBottom) {
      setScrolled(true);
    }
  };

  const allCheckboxesChecked = Object.values(checkboxes).every((v) => v);
  const allFieldsFilled = fullName && email && title;
  const canSign = scrolled && allCheckboxesChecked && allFieldsFilled;

  const handleSign = () => {
    if (!canSign) {
      toast.error("Please complete all requirements before signing");
      return;
    }

    toast.success("NDA accepted and digitally signed!");
    console.log("NDA Signed:", { fullName, email, title, timestamp: new Date() });
    // Here you would send the signed NDA to the server
  };

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-2 flex items-center gap-2">
          <Lock className="w-8 h-8" />
          Non-Disclosure Agreement (NDA)
        </h1>
        <p className="text-muted-foreground">
          Please read and accept the NDA before proceeding as an ORBIT representative, employee, or contractor.
        </p>
      </div>

      {/* Info Banner */}
      <Alert className="mb-6 border-blue-500/50 bg-blue-500/5">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          This NDA protects ORBIT's proprietary information, client data, pricing, and business strategies. By signing, you agree to maintain strict confidentiality.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* NDA Content */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="sticky top-0 bg-card border-b border-border/50 z-10">
              <CardTitle className="text-lg">Non-Disclosure Agreement</CardTitle>
              <CardDescription>Read the complete agreement below</CardDescription>
            </CardHeader>

            <CardContent
              className="pt-6 max-h-[600px] overflow-y-auto prose prose-sm dark:prose-invert text-foreground"
              onScroll={handleScroll}
              data-testid="scroll-nda-content"
            >
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h3 className="font-bold text-sm mb-2">1. PARTIES</h3>
                  <p className="text-muted-foreground">
                    This agreement is between DarkWave Studios LLC / ORBIT Staffing OS ("Company") and you, the Recipient.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-2">2. CONFIDENTIAL INFORMATION</h3>
                  <p className="text-muted-foreground mb-2">
                    Confidential Information includes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Business information: pricing, client lists, financial data, strategies</li>
                    <li>Technology: platform code, architecture, API specifications</li>
                    <li>Worker & Client Data: profiles, contact info, payment terms</li>
                    <li>Legal & Compliance: CSA terms, conversion policies, procedures</li>
                    <li>Other proprietary information labeled as confidential</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-2">3. PERMITTED USE & RESTRICTIONS</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>You CAN use Confidential Information for:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-2">
                    <li>Performing your duties as employee, representative, or contractor</li>
                    <li>Internal business purposes directly related to disclosed information</li>
                  </ul>
                  <p className="text-muted-foreground mb-2">
                    <strong>You CANNOT:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Disclose information to third parties without approval</li>
                    <li>Copy or share information with family or colleagues</li>
                    <li>Post on social media or public platforms</li>
                    <li>Solicit ORBIT clients or workers for competing services</li>
                    <li>Reverse-engineer technology or systems</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-2">4. TERM & DURATION</h3>
                  <p className="text-muted-foreground">
                    This NDA is effective upon signing and survives indefinitely for trade secrets. Other confidential information is protected for 3 years after your relationship with ORBIT ends.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-2">5. PENALTIES FOR BREACH</h3>
                  <p className="text-muted-foreground mb-2">
                    Breach of this NDA may result in:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>$10,000 liquidated damages per breach incident</li>
                    <li>Court injunction to stop further disclosure</li>
                    <li>Three times actual damages (treble damages)</li>
                    <li>All legal costs and attorney fees</li>
                    <li>Criminal prosecution for trade secret theft</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-2">6. DATA SECURITY</h3>
                  <p className="text-muted-foreground">
                    You agree to store information securely, use strong passwords, enable two-factor authentication, and report any security breaches within 2 hours. ORBIT commits to encrypting data and maintaining secure systems.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-2">7. RETURN OF INFORMATION</h3>
                  <p className="text-muted-foreground">
                    Upon request or end of relationship, you must return or securely destroy all Confidential Information within 5 business days (24 hours for trade secrets). You will provide written certification of destruction.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-sm mb-2">8. DISPUTE RESOLUTION</h3>
                  <p className="text-muted-foreground">
                    Disputes will be resolved through binding arbitration in Tennessee, governed by Tennessee law. ORBIT may seek injunctive relief and civil damages.
                  </p>
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded mt-4">
                  <p className="text-xs text-yellow-600 font-medium">
                    <strong>Legal Notice:</strong> This NDA is a functional framework. ORBIT will refine this agreement with legal counsel to ensure full enforceability. By signing, you agree to execute updated versions if requested.
                  </p>
                </div>

                {!scrolled && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <p className="text-xs text-blue-600">
                      👇 Please scroll to the bottom to enable the signature button
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signature Section */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 sticky top-[60px]">
            <CardHeader>
              <CardTitle className="text-lg">Sign NDA</CardTitle>
              <CardDescription>Complete to accept</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status Checklist */}
              <div className="space-y-2 p-3 bg-card/50 rounded border border-border/30">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Requirements:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {scrolled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-xs">Scroll to bottom of agreement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {allCheckboxesChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-xs">Confirm all checkboxes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {allFieldsFilled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-xs">Fill in all fields</span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full legal name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-border/50 bg-background text-sm"
                    data-testid="input-nda-fullname"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-border/50 bg-background text-sm"
                    data-testid="input-nda-email"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title/Role</label>
                  <input
                    type="text"
                    placeholder="e.g., Sales Representative, Employee"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-border/50 bg-background text-sm"
                    data-testid="input-nda-title"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-3 border-t border-border/30">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="nda-read"
                    checked={checkboxes.read}
                    onCheckedChange={(checked) =>
                      setCheckboxes({ ...checkboxes, read: checked === true })
                    }
                    data-testid="checkbox-nda-read"
                  />
                  <label htmlFor="nda-read" className="text-xs cursor-pointer">
                    I have read the entire NDA
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="nda-understand"
                    checked={checkboxes.understand}
                    onCheckedChange={(checked) =>
                      setCheckboxes({ ...checkboxes, understand: checked === true })
                    }
                    data-testid="checkbox-nda-understand"
                  />
                  <label htmlFor="nda-understand" className="text-xs cursor-pointer">
                    I understand my obligations and responsibilities
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="nda-agree"
                    checked={checkboxes.agree}
                    onCheckedChange={(checked) =>
                      setCheckboxes({ ...checkboxes, agree: checked === true })
                    }
                    data-testid="checkbox-nda-agree"
                  />
                  <label htmlFor="nda-agree" className="text-xs cursor-pointer">
                    I agree to keep ORBIT's information strictly confidential
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="nda-acknowledge"
                    checked={checkboxes.acknowledge}
                    onCheckedChange={(checked) =>
                      setCheckboxes({ ...checkboxes, acknowledge: checked === true })
                    }
                    data-testid="checkbox-nda-acknowledge"
                  />
                  <label htmlFor="nda-acknowledge" className="text-xs cursor-pointer">
                    I acknowledge this is a binding legal agreement with serious consequences
                  </label>
                </div>
              </div>

              {/* Sign Button */}
              <Button
                onClick={handleSign}
                disabled={!canSign}
                className={`w-full h-10 ${
                  canSign
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                data-testid="button-sign-nda"
              >
                <Lock className="w-4 h-4 mr-2" />
                Digitally Sign NDA
              </Button>

              {!canSign && (
                <p className="text-xs text-muted-foreground text-center">
                  {!scrolled
                    ? "Scroll to bottom of agreement"
                    : "Complete all fields and checkboxes"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Download & Print */}
      <div className="mt-8 p-4 rounded border border-border/30 bg-card/30">
        <p className="text-sm font-semibold mb-3">Download & Print</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="text-xs" data-testid="button-download-pdf">
            📄 Download as PDF
          </Button>
          <Button variant="outline" className="text-xs" data-testid="button-print-nda">
            🖨️ Print Agreement
          </Button>
          <Button variant="outline" className="text-xs" data-testid="button-email-nda">
            ✉️ Email to Self
          </Button>
        </div>
      </div>

      {/* Footer Legal Notice */}
      <div className="mt-8 p-4 rounded border border-yellow-500/30 bg-yellow-500/5">
        <p className="text-xs text-muted-foreground mb-2">
          <strong>Legal Notice:</strong> This NDA is a functional framework created on November 22, 2025. ORBIT will engage legal counsel to ensure full enforceability under Tennessee and federal law. Future updates may be required. By signing, you agree to execute updated versions if requested.
        </p>
        <p className="text-xs text-muted-foreground">
          Questions? Contact legal@orbitstaffing.io before signing.
        </p>
      </div>
    </Shell>
  );
}
