import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

const AI_RESPONSES: Record<string, string> = {
  "compliance": "ORBIT handles I-9 verification, background checks, prevailing wage compliance, tax filings (941, W-2), workers' comp management, and OSHA safety documentation. Everything is audit-ready.",
  "pricing": "Our pricing is 1.35x markup (35% below industry standard 1.6x), saving you money while remaining competitive. Markup scales by industry: Healthcare 1.5x, Trades 1.5x, Events 1.4x.",
  "features": "ORBIT includes: Talent pool management, smart matching, mobile timesheets, payroll processing, auto-invoicing, real-time analytics, compliance docs, E-Verify integration, and multi-state tax handling.",
  "automation": "We eliminate manual data entry with rules-based workflows. Timesheets auto-populate, payroll processes automatically, invoices generate instantly, and tax filings are handled systematically.",
  "support": "We offer 24/7 support, comprehensive onboarding, industry-specific configurations, and a feedback system where verified customers help shape the platform.",
  "integration": "ORBIT integrates with payroll systems, accounting software (QuickBooks, Xero), Stripe for payments, Twilio/SendGrid for communications, and government compliance systems (E-Verify).",
  "demo": "You can request a demo from the landing page or dashboard. For a personalized walkthrough, reach out to our team with your industry and specific needs.",
};

const AI_SUGGESTIONS = [
  "What compliance requirements do you cover?",
  "How is pricing calculated?",
  "What are the main features?",
  "Can you automate our workflows?",
  "How do I get support?",
];

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hi! I'm the ORBIT AI Assistant. I can help answer questions about our platform. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response with slight delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let aiResponse = "I'm not sure about that. Could you rephrase or ask about compliance, pricing, features, automation, support, or integrations?";

    const lowerText = text.toLowerCase();
    for (const [key, response] of Object.entries(AI_RESPONSES)) {
      if (lowerText.includes(key)) {
        aiResponse = response;
        break;
      }
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: aiResponse
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleSuggestion = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 p-3 bg-primary/80 text-primary-foreground rounded-full hover:bg-primary transition-all hover:scale-110 z-40"
        aria-label="Open AI chat"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-96 h-[600px] md:h-[600px] bg-background border border-border/50 rounded-t-lg md:rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-border/50 bg-card/50">
            <div>
              <h3 className="font-bold font-heading">ORBIT AI Assistant</h3>
              <Badge className="mt-1 bg-green-500/20 text-green-600 text-xs">Online</Badge>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-card border border-border/50 text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border/50 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-border/50 bg-card/30">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {AI_SUGGESTIONS.slice(0, 3).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(suggestion)}
                    className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded transition-colors"
                  >
                    {suggestion.split("?")[0]}?
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/50 p-4 bg-card/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about ORBIT..."
                className="flex-1 bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading}
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
