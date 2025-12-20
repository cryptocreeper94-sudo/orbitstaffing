import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Check,
  Copy,
  Loader2,
  Mail,
  User,
  Building2,
  Key,
  Shield,
  AlertTriangle,
  Rocket,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface DeveloperRegistrationProps {
  trigger?: React.ReactNode;
}

type Step = "info" | "verify" | "success";

export default function DeveloperRegistration({ trigger }: DeveloperRegistrationProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    acceptTerms: false,
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [developerId, setDeveloperId] = useState("");
  
  const [apiCredentials, setApiCredentials] = useState({
    apiKey: "",
    apiSecret: "",
  });

  const handleRegister = async () => {
    if (!formData.email || !formData.name || !formData.acceptTerms) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and accept the terms.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/developers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          company: formData.company,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setDeveloperId(data.developerId);
      setStep("verify");
      toast({
        title: "Verification Code Sent",
        description: "Check your email for the 6-digit verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/developers/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developerId,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setApiCredentials({
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
      });
      setStep("success");
      toast({
        title: "Account Verified!",
        description: "Your API credentials have been generated.",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Please check your code and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "key" | "secret") => {
    await navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
    toast({
      title: "Copied!",
      description: `API ${type === "key" ? "Key" : "Secret"} copied to clipboard.`,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("info");
      setFormData({ email: "", name: "", company: "", acceptTerms: false });
      setVerificationCode("");
      setDeveloperId("");
      setApiCredentials({ apiKey: "", apiSecret: "" });
    }, 300);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8" data-testid="step-indicator">
      {[
        { id: "info", label: "Register", icon: User },
        { id: "verify", label: "Verify", icon: Mail },
        { id: "success", label: "Get Keys", icon: Key },
      ].map((s, idx) => {
        const isActive = s.id === step;
        const isComplete = 
          (step === "verify" && s.id === "info") ||
          (step === "success" && (s.id === "info" || s.id === "verify"));
        const Icon = s.icon;
        
        return (
          <div key={s.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  : isComplete
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-slate-800/50 text-gray-500 border border-slate-700"
              }`}
              data-testid={`step-${s.id}`}
            >
              {isComplete ? (
                <Check className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            </div>
            {idx < 2 && (
              <ArrowRight className="w-4 h-4 text-gray-600 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderInfoStep = () => (
    <div className="space-y-6" data-testid="form-info">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">
            Full Name <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="pl-10 bg-slate-800/80 border-slate-600 text-white placeholder:text-gray-500"
              data-testid="input-name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">
            Email Address <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@company.com"
              className="pl-10 bg-slate-800/80 border-slate-600 text-white placeholder:text-gray-500"
              data-testid="input-email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-gray-300">
            Company Name
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Acme Inc."
              className="pl-10 bg-slate-800/80 border-slate-600 text-white placeholder:text-gray-500"
              data-testid="input-company"
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <Checkbox
          id="terms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, acceptTerms: checked as boolean })
          }
          className="mt-1"
          data-testid="checkbox-terms"
        />
        <Label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer leading-relaxed">
          I agree to the{" "}
          <a href="/terms" className="text-cyan-400 hover:underline" target="_blank">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-cyan-400 hover:underline" target="_blank">
            Privacy Policy
          </a>
          . I understand that API usage is subject to rate limits and acceptable use policies.
        </Label>
      </div>

      <Button
        onClick={handleRegister}
        disabled={isLoading || !formData.email || !formData.name || !formData.acceptTerms}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold py-6"
        data-testid="button-register"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Rocket className="w-5 h-5 mr-2" />
        )}
        Create Developer Account
      </Button>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6" data-testid="form-verify">
      <div className="text-center p-6 rounded-xl bg-slate-800/50 border border-slate-700">
        <Mail className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
        <p className="text-gray-400 text-sm">
          We've sent a 6-digit verification code to{" "}
          <span className="text-cyan-400 font-medium">{formData.email}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-gray-300">
          Verification Code
        </Label>
        <Input
          id="code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          className="text-center text-2xl tracking-widest bg-slate-800/80 border-slate-600 text-white font-mono"
          data-testid="input-verification-code"
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep("info")}
          className="flex-1 border-slate-600 text-white hover:bg-slate-700"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleVerify}
          disabled={isLoading || verificationCode.length !== 6}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold"
          data-testid="button-verify"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Shield className="w-5 h-5 mr-2" />
          )}
          Verify & Generate Keys
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Didn't receive the code?{" "}
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className="text-cyan-400 hover:underline"
          data-testid="button-resend"
        >
          Resend
        </button>
      </p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6" data-testid="form-success">
      <div className="text-center p-6 rounded-xl bg-green-500/10 border border-green-500/30">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Welcome to the Orbit Ecosystem!</h3>
        <p className="text-gray-400 text-sm">
          Your developer account is now active. Save your API credentials below.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 font-semibold text-sm">Important: Save Your API Secret</p>
          <p className="text-amber-300/80 text-xs mt-1">
            Your API Secret will only be shown once. Copy and store it securely.
            You won't be able to see it again after closing this dialog.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-300">API Key (Public)</Label>
          <div className="flex gap-2">
            <Input
              value={apiCredentials.apiKey}
              readOnly
              className="bg-slate-800/80 border-slate-600 text-cyan-400 font-mono text-sm"
              data-testid="text-api-key"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(apiCredentials.apiKey, "key")}
              className="border-slate-600 hover:bg-slate-700"
              data-testid="button-copy-key"
            >
              {copiedKey ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">API Secret (Private)</Label>
          <div className="flex gap-2">
            <Input
              value={apiCredentials.apiSecret}
              readOnly
              className="bg-slate-800/80 border-slate-600 text-amber-400 font-mono text-sm"
              data-testid="text-api-secret"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(apiCredentials.apiSecret, "secret")}
              className="border-slate-600 hover:bg-slate-700"
              data-testid="button-copy-secret"
            >
              {copiedSecret ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <h4 className="font-semibold text-white mb-2">What's Next?</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            Read the API documentation to get started
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            Use sandbox mode for testing (1,000 calls/month)
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            Upgrade to Pro for production access
          </li>
        </ul>
      </div>

      <Button
        onClick={handleClose}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold py-6"
        data-testid="button-done"
      >
        I've Saved My Credentials
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 font-bold"
            data-testid="button-open-registration"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Register as Developer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700 text-white max-h-[90vh] overflow-y-auto"
        data-testid="dialog-registration"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Developer Registration
          </DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        {step === "info" && renderInfoStep()}
        {step === "verify" && renderVerifyStep()}
        {step === "success" && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}