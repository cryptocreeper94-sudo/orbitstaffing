import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, DollarSign, Shield, Zap } from "lucide-react";

export default function AdminPayoutOnboarding() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">Stripe Connect Setup</h1>
        <p className="text-slate-400 mt-2">Enable automated worker payouts for your franchise</p>
      </div>

      {/* Setup Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { num: 1, title: "Connect Account", desc: "Link your Stripe account" },
          { num: 2, title: "Enable Payouts", desc: "Configure payout settings" },
          { num: 3, title: "Verify Workers", desc: "Onboard workers to receive" },
        ].map((item) => (
          <Card
            key={item.num}
            className={`p-4 cursor-pointer border-2 transition-all ${
              step === item.num
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-slate-700 bg-slate-900/50"
            }`}
            onClick={() => setStep(item.num)}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step === item.num ? "bg-cyan-500 text-black" : "bg-slate-700 text-slate-300"
              }`}>
                {item.num}
              </div>
              <h3 className="font-semibold">{item.title}</h3>
            </div>
            <p className="text-sm text-slate-400">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-8 bg-slate-900/50 border-slate-700">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-200">Connect Your Stripe Account</h2>
            <p className="text-slate-400">
              You'll need a Stripe account to manage payouts. If you don't have one, create one at stripe.com.
            </p>
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Stripe account created</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <span>Business details verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-400" />
                <span>Bank account added</span>
              </div>
            </div>
            <Button className="mt-6 bg-cyan-600 hover:bg-cyan-700 w-full">
              Link Stripe Account
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-200">Enable Payout Settings</h2>
            <Alert className="border-cyan-500/50 bg-cyan-500/10">
              <Zap className="h-4 w-4 text-cyan-400" />
              <AlertDescription>
                <p className="font-semibold text-cyan-300">Automatic Payouts Ready</p>
                <p className="text-sm text-cyan-200 mt-1">
                  Set workers to receive payouts on specific days or after completing assignments.
                </p>
              </AlertDescription>
            </Alert>
            <div className="space-y-4 mt-6">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="font-semibold text-slate-200 mb-2">Payout Frequency</p>
                <p className="text-sm text-slate-400">Weekly (every Friday) - Recommended</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="font-semibold text-slate-200 mb-2">Minimum Payout</p>
                <p className="text-sm text-slate-400">$5.00</p>
              </div>
            </div>
            <Button className="mt-6 bg-cyan-600 hover:bg-cyan-700 w-full">
              Save Settings
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-200">Invite Workers</h2>
            <p className="text-slate-400">
              Workers will receive a notification to set up their Stripe Connect account.
            </p>
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg mt-6">
              <p className="text-green-400 font-semibold">✓ All systems ready</p>
              <p className="text-sm text-green-200 mt-1">
                Your franchise is fully configured for automated payouts.
              </p>
            </div>
            <Button className="mt-6 bg-green-600 hover:bg-green-700 w-full">
              Complete Setup
            </Button>
          </div>
        )}
      </Card>

      {/* Features */}
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <h3 className="font-bold text-slate-200 mb-4">What You Get</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Instant Payouts</p>
              <p className="text-sm text-slate-400">Get money to workers in real-time</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Full Compliance</p>
              <p className="text-sm text-slate-400">PCI-DSS & SOC2 compliant</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Automation</p>
              <p className="text-sm text-slate-400">Scheduled payouts on your terms</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">Real-time Reporting</p>
              <p className="text-sm text-slate-400">Track every transaction</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
