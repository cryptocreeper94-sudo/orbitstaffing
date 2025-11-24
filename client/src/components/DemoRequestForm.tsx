import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function DemoRequestForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    consent: false,
  });
  const [success, setSuccess] = useState(false);

  const demoMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/demo/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          consentToEmails: formData.consent,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to request demo");
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.consent) {
      return;
    }
    demoMutation.mutate();
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-background rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Demo Code Sent!</h2>
          <p className="text-muted-foreground mb-4">
            Check your email for your demo access code. It's valid for 7 days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">Request Free Demo</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Get your personalized demo code. Valid for 7 days. Join our mailing list for updates and official communications about your account.
        </p>

        {demoMutation.isError && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200 text-sm">{demoMutation.error instanceof Error ? demoMutation.error.message : "Failed to request demo"}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-4 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground"
              data-testid="input-demo-name"
              disabled={demoMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground"
              data-testid="input-demo-email"
              disabled={demoMutation.isPending}
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1"
              data-testid="checkbox-demo-consent"
              disabled={demoMutation.isPending}
            />
            <label htmlFor="consent" className="text-xs text-muted-foreground">
              I consent to receive messages from ORBIT regarding account updates and official communications. We'll only email you about important updates—never spam.
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!formData.name || !formData.email || !formData.consent || demoMutation.isPending}
              className="flex-1"
              data-testid="button-demo-submit"
            >
              {demoMutation.isPending ? "Sending..." : "Get My Demo Code"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={demoMutation.isPending}
              data-testid="button-demo-cancel"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
