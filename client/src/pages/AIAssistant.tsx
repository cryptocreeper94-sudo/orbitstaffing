import { useState, useRef, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Zap, 
  MapPin, 
  TrendingUp,
  MessageCircle,
  Search,
  ExternalLink,
  Building2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface LocalNews {
  title: string;
  category: "construction" | "government" | "local";
  location: string;
  urgency: "high" | "medium" | "low";
  relevance: "high" | "medium" | "low";
  description: string;
  link?: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hey! I'm ORBIT's AI Assistant. I can help you with staffing questions, local project updates, job searches, and general information. What can I help with?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("Nashville, TN");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I understand you're asking: "${inputValue}". This is a demo response. In production, I'll provide real answers about staffing, local projects, job opportunities, and more!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const localNews: LocalNews[] = [
    {
      title: "Nissan Stadium Expansion Project",
      category: "construction",
      location: "Nashville, TN",
      urgency: "high",
      relevance: "high",
      description: "Large-scale event staffing opportunity. 250-300 temporary workers needed for stadium expansion and events.",
      link: "https://example.com/nissan-stadium",
    },
    {
      title: "Downtown Nashville Infrastructure Initiative",
      category: "government",
      location: "Nashville, TN",
      urgency: "medium",
      relevance: "high",
      description: "Metro Nashville approves $500M infrastructure project. Construction hiring expected Q1 2026.",
    },
    {
      title: "New Tech Hub Opening in East Nashville",
      category: "local",
      location: "Nashville, TN",
      urgency: "medium",
      relevance: "medium",
      description: "Local startup accelerator opening. Potential office staffing needs.",
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "construction":
        return <Building2 className="w-5 h-5 text-orange-600" />;
      case "government":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-primary" />
          ORBIT AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Ask about staffing, local projects, job opportunities, and more
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 flex flex-col h-[600px]">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg">Ask Anything</CardTitle>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto space-y-4 pt-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                  data-testid={`message-${msg.type}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card border border-border/50 text-foreground rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border/50 px-4 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t border-border/50 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask me anything about staffing, jobs, local news..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="input-ai-chat"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  size="sm"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Info Panels */}
        <div className="lg:col-span-1 space-y-4">
          {/* Location */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Your Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{location}</p>
              <Button
                variant="outline"
                className="text-xs w-full"
                data-testid="button-change-location"
              >
                Change Location
              </Button>
            </CardContent>
          </Card>

          {/* Quick Search */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                Quick Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="text-xs w-full justify-start"
                data-testid="button-search-jobs"
              >
                Search Available Jobs
              </Button>
              <Button
                variant="outline"
                className="text-xs w-full justify-start"
                data-testid="button-search-projects"
              >
                Local Projects & Events
              </Button>
              <Button
                variant="outline"
                className="text-xs w-full justify-start"
                data-testid="button-verify-employment"
              >
                Verify Employment
              </Button>
            </CardContent>
          </Card>

          {/* Indeed Integration */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                Job Search Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                Search Indeed, LinkedIn, and other job boards directly from ORBIT
              </p>
              <Button
                className="text-xs w-full bg-primary/20 text-primary hover:bg-primary/30"
                data-testid="button-search-indeed"
              >
                🔍 Search Indeed Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Local News Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold font-heading mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Local News & Opportunities in {location}
        </h2>

        <div className="space-y-4">
          {localNews.map((news, idx) => (
            <Card key={idx} className="border-border/50 hover:border-primary/50 transition-colors" data-testid={`news-card-${idx}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getCategoryIcon(news.category)}
                    <div>
                      <h3 className="font-bold text-sm">{news.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{news.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      className={
                        news.urgency === "high"
                          ? "bg-red-500/20 text-red-600"
                          : news.urgency === "medium"
                          ? "bg-yellow-500/20 text-yellow-600"
                          : "bg-green-500/20 text-green-600"
                      }
                    >
                      {news.urgency}
                    </Badge>
                    <Badge
                      className={
                        news.relevance === "high"
                          ? "bg-blue-500/20 text-blue-600"
                          : "bg-gray-500/20 text-gray-600"
                      }
                    >
                      {news.relevance} match
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{news.description}</p>

                {news.link && (
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() => window.open(news.link, "_blank")}
                    data-testid={`button-news-link-${idx}`}
                  >
                    Learn More →
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Overview */}
      <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/30">
        <h2 className="text-xl font-bold font-heading mb-4">What I Can Help With</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-2">💼 Staffing Questions</p>
            <p className="text-muted-foreground">Ask about your shifts, worker status, pay rates, benefits, and more</p>
          </div>
          <div>
            <p className="font-semibold mb-2">📍 Local Opportunities</p>
            <p className="text-muted-foreground">Get alerts about construction projects, events, and local job openings</p>
          </div>
          <div>
            <p className="font-semibold mb-2">🔍 Job Search</p>
            <p className="text-muted-foreground">Search Indeed, LinkedIn, and other platforms for permanent positions</p>
          </div>
          <div>
            <p className="font-semibold mb-2">✅ Verification</p>
            <p className="text-muted-foreground">Cross-reference employer info, verify ORBIT staff, check employment</p>
          </div>
        </div>
      </div>
    </Shell>
  );
}
