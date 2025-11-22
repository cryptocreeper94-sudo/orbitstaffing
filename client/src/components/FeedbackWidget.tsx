import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, X } from "lucide-react";
import { toast } from "sonner";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    // Mock verification check
    if (email.includes("@")) {
      setIsVerified(true);
      const feedback = {
        message,
        email,
        timestamp: new Date().toLocaleString(),
        verified: true
      };

      // Store in localStorage (mock persistence)
      const existing = JSON.parse(localStorage.getItem("orbitFeedback") || "[]");
      localStorage.setItem("orbitFeedback", JSON.stringify([...existing, feedback]));

      toast.success("Thank you for your feedback! We'll review it shortly.");
      setSubmitted(true);
      setTimeout(() => {
        setMessage("");
        setEmail("");
        setSubmitted(false);
        setIsOpen(false);
        setIsVerified(false);
      }, 2000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 z-40"
        aria-label="Send feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold font-heading">Send Feedback</h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <Badge className="bg-green-500/20 text-green-600 mb-4">✓ Design Captured</Badge>
                  <p className="text-sm text-muted-foreground">Your feedback has been captured for our development team. Thank you for helping shape ORBIT.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Early feedback helps us build better. This will be reviewed by our team.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Feedback</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What would help you? What features do you need? What's working well?"
                      className="w-full bg-background border border-border/50 rounded-md px-3 py-2 text-sm resize-none h-32"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmit} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Send className="w-4 h-4 mr-2" /> Submit
                    </Button>
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Your insights help us build the right features
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
