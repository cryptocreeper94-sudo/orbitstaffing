import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, ArrowRight, Briefcase, Shield, Users, Plus, 
  Calendar, Clock, FileText, Mail, Link2, Send, Trash2,
  Eye, Check, ChevronRight, Sparkles, Presentation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TEMPLATE_ICONS: Record<string, any> = {
  client_proposal: Briefcase,
  compliance_report: Shield,
  worker_brief: Users,
};

const TEMPLATE_COLORS: Record<string, string> = {
  client_proposal: "from-blue-600 to-indigo-700",
  compliance_report: "from-emerald-600 to-teal-700",
  worker_brief: "from-amber-600 to-orange-700",
};

export default function MeetingPresentations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBuilder, setShowBuilder] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    meetingDate: "",
    meetingTime: "",
    notes: "",
    attendeeEmails: [] as string[],
    attendeeNames: [] as string[],
  });
  const [newAttendee, setNewAttendee] = useState({ name: "", email: "" });

  const { data: templates } = useQuery({
    queryKey: ["presentation-templates"],
    queryFn: async () => {
      const res = await fetch("/api/presentation-templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const { data: presentations, isLoading } = useQuery({
    queryKey: ["meeting-presentations"],
    queryFn: async () => {
      const res = await fetch("/api/meeting-presentations?userId=demo");
      if (!res.ok) throw new Error("Failed to fetch presentations");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/meeting-presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-presentations"] });
      toast({ title: "Presentation created!", description: "Your presentation is ready to customize." });
      resetBuilder();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create presentation", variant: "destructive" });
    },
  });

  const generateLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/meeting-presentations/${id}/generate-link`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate link");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["meeting-presentations"] });
      toast({ 
        title: "Link generated!", 
        description: `Share: ${window.location.origin}${data.viewUrl}` 
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/meeting-presentations/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["meeting-presentations"] });
      toast({ 
        title: "Presentation sent!", 
        description: `Sent to ${data.sentTo} attendee(s)` 
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send presentation", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/meeting-presentations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-presentations"] });
      toast({ title: "Deleted", description: "Presentation removed" });
    },
  });

  const resetBuilder = () => {
    setShowBuilder(false);
    setStep(1);
    setSelectedTemplate("");
    setFormData({ title: "", meetingDate: "", meetingTime: "", notes: "", attendeeEmails: [], attendeeNames: [] });
    setNewAttendee({ name: "", email: "" });
  };

  const addAttendee = () => {
    if (newAttendee.email && newAttendee.email.includes("@")) {
      setFormData({
        ...formData,
        attendeeEmails: [...formData.attendeeEmails, newAttendee.email],
        attendeeNames: [...formData.attendeeNames, newAttendee.name || ""],
      });
      setNewAttendee({ name: "", email: "" });
    }
  };

  const removeAttendee = (index: number) => {
    setFormData({
      ...formData,
      attendeeEmails: formData.attendeeEmails.filter((_, i) => i !== index),
      attendeeNames: formData.attendeeNames.filter((_, i) => i !== index),
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      templateType: selectedTemplate,
      title: formData.title,
      meetingDate: formData.meetingDate,
      meetingTime: formData.meetingTime,
      notes: formData.notes,
      attendeeEmails: formData.attendeeEmails,
      attendeeNames: formData.attendeeNames,
      userId: "demo",
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedTemplate;
      case 2: return !!formData.title;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const TemplateCard = templates?.find((t: any) => t.id === selectedTemplate);
  const TemplateIcon = selectedTemplate ? TEMPLATE_ICONS[selectedTemplate] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/crm">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" data-testid="button-back-crm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                CRM
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Presentation className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Meeting Presentations</h1>
            </div>
          </div>
          <Button 
            onClick={() => setShowBuilder(true)} 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            data-testid="button-new-presentation"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Presentation
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 mb-2">
            <Sparkles className="w-3 h-3 mr-1" />
            CRM Pro Feature
          </Badge>
          <p className="text-slate-400 text-sm">
            Create professional presentations for client meetings, compliance reviews, and worker briefings.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                <CardContent className="p-6 h-48" />
              </Card>
            ))}
          </div>
        ) : presentations && presentations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentations.map((pres) => {
              const Icon = TEMPLATE_ICONS[pres.templateType] || Briefcase;
              const color = TEMPLATE_COLORS[pres.templateType] || "from-slate-600 to-slate-700";
              return (
                <Card 
                  key={pres.id} 
                  className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all group"
                  data-testid={`card-presentation-${pres.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 bg-gradient-to-br ${color} rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant={pres.status === 'sent' ? 'default' : pres.status === 'ready' ? 'secondary' : 'outline'}>
                        {pres.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-white mb-1 line-clamp-1">{pres.title}</h3>
                    <p className="text-xs text-slate-400 mb-3">
                      {pres.meetingDate || "No date set"} {pres.meetingTime && `at ${pres.meetingTime}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                      <Mail className="w-3 h-3" />
                      {pres.attendeeEmails?.length || 0} attendees
                      {pres.viewCount ? (
                        <>
                          <span className="mx-1">•</span>
                          <Eye className="w-3 h-3" />
                          {pres.viewCount} views
                        </>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      {!pres.shareableLink ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs"
                          onClick={() => generateLinkMutation.mutate(pres.id)}
                          data-testid={`button-generate-link-${pres.id}`}
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          Generate Link
                        </Button>
                      ) : (
                        <>
                          <Link href={`/presentation/${pres.shareableLink}`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full text-xs" data-testid={`button-view-${pres.id}`}>
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            className="flex-1 text-xs bg-gradient-to-r from-cyan-500 to-blue-600"
                            onClick={() => sendMutation.mutate(pres.id)}
                            disabled={sendMutation.isPending || pres.status === 'sent'}
                            data-testid={`button-send-${pres.id}`}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {pres.status === 'sent' ? 'Sent' : 'Send'}
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => deleteMutation.mutate(pres.id)}
                        data-testid={`button-delete-${pres.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-slate-800/30 border-slate-700 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                <Presentation className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No presentations yet</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create your first meeting presentation to share with clients, stakeholders, or your team.
              </p>
              <Button 
                onClick={() => setShowBuilder(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
                data-testid="button-create-first"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Presentation
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Presentation className="w-4 h-4 text-white" />
              </div>
              Create Presentation
            </DialogTitle>
            <DialogDescription>
              Step {step} of 4 — {step === 1 ? "Choose Template" : step === 2 ? "Meeting Details" : step === 3 ? "Add Notes" : "Add Attendees"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  s <= step ? "bg-gradient-to-r from-cyan-500 to-blue-600" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Select a template that best fits your meeting type.</p>
              <div className="grid gap-3">
                {templates?.map((template: any) => {
                  const Icon = TEMPLATE_ICONS[template.id];
                  const isSelected = selectedTemplate === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      }`}
                      data-testid={`button-template-${template.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 bg-gradient-to-br ${template.color} rounded-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{template.name}</h4>
                          <p className="text-xs text-slate-400">{template.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Presentation Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Q1 Staffing Proposal for Acme Corp"
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                  data-testid="input-title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Meeting Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                      data-testid="input-date"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Meeting Time</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="time"
                      value={formData.meetingTime}
                      onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                      className="pl-10 bg-slate-800 border-slate-700 text-white"
                      data-testid="input-time"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Meeting Notes / Agenda</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter meeting agenda, key talking points, or any notes you want to include in the presentation..."
                  rows={6}
                  className="mt-1 bg-slate-800 border-slate-700 text-white resize-none"
                  data-testid="input-notes"
                />
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <FileText className="w-4 h-4" />
                  <span>Document attachments coming soon</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Add attendees who will receive the presentation link via email.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Name</Label>
                  <Input
                    value={newAttendee.name}
                    onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
                    placeholder="John Smith"
                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                    data-testid="input-attendee-name"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Email *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="email"
                      value={newAttendee.email}
                      onChange={(e) => setNewAttendee({ ...newAttendee, email: e.target.value })}
                      placeholder="john@acme.com"
                      className="bg-slate-800 border-slate-700 text-white"
                      onKeyPress={(e) => e.key === "Enter" && addAttendee()}
                      data-testid="input-attendee-email"
                    />
                    <Button 
                      onClick={addAttendee} 
                      size="icon" 
                      className="shrink-0"
                      data-testid="button-add-attendee"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {formData.attendeeEmails.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label className="text-slate-300">Attendees ({formData.attendeeEmails.length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.attendeeEmails.map((email, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-2 bg-slate-800 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {(formData.attendeeNames[i] || email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-white">{formData.attendeeNames[i] || "Guest"}</p>
                            <p className="text-xs text-slate-400">{email}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-400 hover:text-red-300"
                          onClick={() => removeAttendee(i)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="w-full sm:w-auto"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 4 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600"
                data-testid="button-next"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600"
                data-testid="button-create"
              >
                {createMutation.isPending ? "Creating..." : "Create Presentation"}
                <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
