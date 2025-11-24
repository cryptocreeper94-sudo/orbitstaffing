import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, Send, Code, Zap, Clock } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

export function DevSMSPanel() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"test" | "templates" | "logs">("test");
  const [phoneNumber, setPhoneNumber] = useState("+1");
  const [messageContent, setMessageContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  const templates = [
    {
      id: "assignment_tomorrow",
      name: "Assignment Tomorrow",
      template: "Hi {firstName}, your assignment starts tomorrow, {assignmentDate} at {startTime} at {clientName}. Reply CONFIRM or DECLINE.",
    },
    {
      id: "verification",
      name: "Verification Code",
      template: "Your ORBIT verification code is: {code}. Valid for 10 minutes.",
    },
    {
      id: "shift_reminder",
      name: "Shift Reminder",
      template: "Reminder: Your shift starts in 30 minutes at {clientName}. See you soon!",
    },
    {
      id: "bonus_earned",
      name: "Bonus Notification",
      template: "Great work! You earned {bonusAmount} in bonuses today. Check the app for details.",
    },
    {
      id: "onboarding",
      name: "Onboarding Checklist",
      template: "Complete your onboarding: {checklistItems}. Visit {link} to finish setup.",
    },
  ];

  const mockLogs = [
    { id: 1, time: "14:32:15", phone: "+1 615-555-0124", status: "success", message: "Assignment reminder sent", response: { sid: "SM123abc..." } },
    { id: 2, time: "14:31:02", phone: "+1 615-555-0198", status: "success", message: "Verification code sent", response: { sid: "SM456def..." } },
    { id: 3, time: "14:29:45", phone: "+1 615-555-0156", status: "failed", message: "Invalid phone number", response: { error: "Invalid phone format" } },
    { id: 4, time: "14:28:20", phone: "+1 615-555-0142", status: "success", message: "Bonus notification sent", response: { sid: "SM789ghi..." } },
    { id: 5, time: "14:27:03", phone: "+1 615-555-0111", status: "queued", message: "Pending delivery", response: { status: "queued" } },
  ];

  const handleSendTest = async () => {
    if (!phoneNumber || !messageContent) {
      alert("Please enter phone number and message");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          message: messageContent,
          messageType: "test",
          isDev: true,
        }),
      });

      const result = await response.json();
      setSendResult({
        success: response.ok,
        data: result,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setSending(false);
    }
  };

  const handleApplyTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      setMessageContent(template.template);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => setLocation("/")}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          data-testid="button-back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-400">SMS Developer Panel</h1>
          <p className="text-xs sm:text-base text-gray-400">Test SMS messages and view Twilio logs</p>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex gap-3">
        <Code className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-purple-300 text-sm">Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER</p>
          <p className="text-xs text-purple-200 mt-1">Add these secrets in the Secrets tab once you have Twilio credentials</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab("test")}
          className={`p-3 rounded-lg font-bold transition-colors ${
            activeTab === "test"
              ? "bg-purple-600 text-white"
              : "bg-slate-800 text-gray-400 hover:text-gray-300"
          }`}
          data-testid="tab-test"
        >
          <Send className="w-4 h-4 inline mr-1" /> Test
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`p-3 rounded-lg font-bold transition-colors text-sm ${
            activeTab === "templates"
              ? "bg-purple-600 text-white"
              : "bg-slate-800 text-gray-400 hover:text-gray-300"
          }`}
          data-testid="tab-templates"
        >
          <Code className="w-4 h-4 inline mr-1" /> Templates
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`p-3 rounded-lg font-bold transition-colors text-sm ${
            activeTab === "logs"
              ? "bg-purple-600 text-white"
              : "bg-slate-800 text-gray-400 hover:text-gray-300"
          }`}
          data-testid="tab-logs"
        >
          <Clock className="w-4 h-4 inline mr-1" /> Logs
        </button>
      </div>

      {/* Tab: Test Send */}
      {activeTab === "test" && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg">Send Test Message</CardTitle>
            <CardDescription>Test SMS delivery to any phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1 615 555 0123"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                data-testid="input-phone"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Message</label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter your test message..."
                className="bg-slate-700 border-slate-600 text-white h-24"
                data-testid="textarea-message"
              />
              <p className="text-xs text-gray-400 mt-1">{messageContent.length} characters</p>
            </div>

            <Button
              onClick={handleSendTest}
              disabled={sending || !phoneNumber || !messageContent}
              className="w-full bg-purple-600 hover:bg-purple-700 min-h-[44px]"
              data-testid="button-send"
            >
              {sending ? "Sending..." : "Send Test SMS"}
            </Button>

            {sendResult && (
              <div className={`p-4 rounded-lg border ${
                sendResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                <p className={`font-bold mb-2 ${sendResult.success ? "text-emerald-400" : "text-red-400"}`}>
                  {sendResult.success ? "✓ Message Sent" : "✗ Send Failed"}
                </p>
                <pre className="text-xs text-gray-300 overflow-auto max-h-32">
                  {JSON.stringify(sendResult.data, null, 2)}
                </pre>
                <p className="text-xs text-gray-500 mt-2">{sendResult.timestamp}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Templates */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-lg">Available Templates</CardTitle>
              <CardDescription>Pre-built message templates for common use cases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-3 border border-slate-700 rounded-lg hover:border-purple-500/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{template.name}</p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{template.template}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={selectedTemplate === template.id ? "bg-purple-600 text-white" : ""}
                    >
                      {selectedTemplate === template.id ? "Selected" : "Select"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate}
            className="w-full bg-purple-600 hover:bg-purple-700 min-h-[44px]"
            data-testid="button-apply-template"
          >
            Apply Selected Template
          </Button>
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === "logs" && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg">Recent SMS Logs</CardTitle>
            <CardDescription>Latest API calls and delivery statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 overflow-x-auto">
              {mockLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 border border-slate-700 rounded-lg text-sm font-mono"
                >
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <span className="text-gray-400">{log.time}</span>
                    <Badge
                      className={`text-xs ${
                        log.status === "success" ? "bg-emerald-500/20 text-emerald-400" :
                        log.status === "failed" ? "bg-red-500/20 text-red-400" :
                        "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-gray-300">{log.phone}</p>
                  <p className="text-gray-400 text-xs">{log.message}</p>
                  <pre className="text-xs text-gray-500 mt-1 bg-slate-900/50 p-2 rounded overflow-auto max-h-16">
                    {JSON.stringify(log.response, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
