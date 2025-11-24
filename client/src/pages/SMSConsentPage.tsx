import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Phone, Mail, Bell } from "lucide-react";
import { useLocation } from "wouter";

export function SMSConsentPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"consent" | "checklist" | "complete">("consent");
  const [consents, setConsents] = useState({
    sms: false,
    email: false,
    push: false,
  });
  const [checklist, setChecklist] = useState({
    phoneVerified: false,
    addressVerified: false,
    documentsReady: false,
    termsRead: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleConsentChange = (key: string) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChecklistChange = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitConsent = async () => {
    if (!consents.sms && !consents.email) {
      alert("Please select at least one communication method");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/sms/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentSms: consents.sms,
          consentEmail: consents.email,
          consentPush: consents.push,
          ipAddress: await fetch("https://api.ipify.org?format=json").then(r => r.json()).then(d => d.ip),
        }),
      });

      if (response.ok) {
        setStep("checklist");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitChecklist = async () => {
    if (!Object.values(checklist).every(v => v)) {
      alert("Please complete all checklist items before proceeding");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/sms/onboarding-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        setStep("complete");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Step 1: SMS & Email Consent */}
        {step === "consent" && (
          <Card className="border-cyan-500/30 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Communication Preferences</CardTitle>
              <CardDescription>Choose how you'd like to receive updates about your assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200">
                  We recommend enabling SMS for real-time shift notifications and critical alerts. You'll receive important updates about your assignments starting tomorrow.
                </p>
              </div>

              <div className="space-y-4">
                {/* SMS Option */}
                <div className="flex items-start gap-3 p-4 border border-slate-700 rounded-lg hover:border-cyan-500/50 cursor-pointer transition-colors"
                  onClick={() => handleConsentChange("sms")}
                >
                  <Checkbox
                    checked={consents.sms}
                    onCheckedChange={() => handleConsentChange("sms")}
                    className="mt-1"
                    data-testid="checkbox-consent-sms"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <label className="font-bold text-white cursor-pointer">SMS Text Messages</label>
                    </div>
                    <p className="text-sm text-gray-400">
                      Get shift offers, start reminders, and urgent alerts via text. Standard SMS rates may apply.
                    </p>
                  </div>
                </div>

                {/* Email Option */}
                <div className="flex items-start gap-3 p-4 border border-slate-700 rounded-lg hover:border-cyan-500/50 cursor-pointer transition-colors"
                  onClick={() => handleConsentChange("email")}
                >
                  <Checkbox
                    checked={consents.email}
                    onCheckedChange={() => handleConsentChange("email")}
                    className="mt-1"
                    data-testid="checkbox-consent-email"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <label className="font-bold text-white cursor-pointer">Email Notifications</label>
                    </div>
                    <p className="text-sm text-gray-400">
                      Receive detailed assignment information and documentation via email.
                    </p>
                  </div>
                </div>

                {/* Push Option */}
                <div className="flex items-start gap-3 p-4 border border-slate-700 rounded-lg hover:border-cyan-500/50 cursor-pointer transition-colors"
                  onClick={() => handleConsentChange("push")}
                >
                  <Checkbox
                    checked={consents.push}
                    onCheckedChange={() => handleConsentChange("push")}
                    className="mt-1"
                    data-testid="checkbox-consent-push"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="w-4 h-4 text-purple-400" />
                      <label className="font-bold text-white cursor-pointer">App Push Notifications</label>
                    </div>
                    <p className="text-sm text-gray-400">
                      Get instant notifications in the ORBIT worker app on your mobile device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-2">📋 Privacy Notice:</p>
                <p className="text-xs text-gray-400">
                  Your contact information is used only for work-related communications. You can unsubscribe anytime by replying STOP to any SMS.
                </p>
              </div>

              <Button
                onClick={handleSubmitConsent}
                disabled={submitting || (!consents.sms && !consents.email)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 min-h-[44px]"
                data-testid="button-consent-agree"
              >
                {submitting ? "Processing..." : "Continue to Onboarding Checklist"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Onboarding Checklist */}
        {step === "checklist" && (
          <Card className="border-emerald-500/30 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-400">Ready for Your First Assignment?</CardTitle>
              <CardDescription>Complete these items to confirm you're 100% prepared</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border border-slate-700 rounded-lg"
                  onClick={() => handleChecklistChange("phoneVerified")}
                >
                  <Checkbox
                    checked={checklist.phoneVerified}
                    onCheckedChange={() => handleChecklistChange("phoneVerified")}
                    className="mt-1"
                    data-testid="checkbox-phone-verified"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-white">✓ Phone Number Verified</p>
                    <p className="text-sm text-gray-400">We'll use this for shift notifications and urgent alerts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border border-slate-700 rounded-lg"
                  onClick={() => handleChecklistChange("addressVerified")}
                >
                  <Checkbox
                    checked={checklist.addressVerified}
                    onCheckedChange={() => handleChecklistChange("addressVerified")}
                    className="mt-1"
                    data-testid="checkbox-address-verified"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-white">✓ Work Address Confirmed</p>
                    <p className="text-sm text-gray-400">Your assignment location details are correct</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border border-slate-700 rounded-lg"
                  onClick={() => handleChecklistChange("documentsReady")}
                >
                  <Checkbox
                    checked={checklist.documentsReady}
                    onCheckedChange={() => handleChecklistChange("documentsReady")}
                    className="mt-1"
                    data-testid="checkbox-documents-ready"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-white">✓ Documents Ready</p>
                    <p className="text-sm text-gray-400">You have your ID and any required certifications</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border border-slate-700 rounded-lg"
                  onClick={() => handleChecklistChange("termsRead")}
                >
                  <Checkbox
                    checked={checklist.termsRead}
                    onCheckedChange={() => handleChecklistChange("termsRead")}
                    className="mt-1"
                    data-testid="checkbox-terms-read"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-white">✓ Terms & Policies Reviewed</p>
                    <p className="text-sm text-gray-400">You understand the assignment terms and ORBIT policies</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitChecklist}
                disabled={submitting || !Object.values(checklist).every(v => v)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 min-h-[44px]"
                data-testid="button-checklist-complete"
              >
                {submitting ? "Confirming..." : "I'm Ready! Start Receiving Notifications"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Complete */}
        {step === "complete" && (
          <Card className="border-emerald-500/50 bg-emerald-500/10">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="w-20 h-20 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-emerald-400 mb-2">You're All Set! 🎉</h2>
                <p className="text-gray-300">
                  Your preferences are saved. Starting tomorrow, you'll receive SMS notifications about your new assignments.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-emerald-500/30 rounded-lg p-4 space-y-3">
                <p className="font-bold text-white">What to Expect:</p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>📅 <strong>Tomorrow:</strong> "Your assignment starts January 13th at 8 AM at Client Site"</li>
                  <li>✓ <strong>Confirmation:</strong> Reply YES to confirm you'll be there</li>
                  <li>⏰ <strong>Reminder:</strong> 30 minutes before start time</li>
                  <li>💰 <strong>Bonus:</strong> Notifications about available bonuses and referrals</li>
                </ul>
              </div>

              <Button
                onClick={() => setLocation("/dashboard")}
                className="w-full bg-cyan-600 hover:bg-cyan-700 min-h-[44px]"
                data-testid="button-go-to-dashboard"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
