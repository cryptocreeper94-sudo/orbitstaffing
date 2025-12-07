import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInBusinessDays } from "date-fns";
import { BentoGrid } from "@/components/ui/bento-grid";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";
import {
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Heart,
  Briefcase,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Users
} from "lucide-react";

export default function PTOTracking() {
  const [activeTab, setActiveTab] = useState("my-pto");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const { toast } = useToast();

  const [requestForm, setRequestForm] = useState({
    type: "vacation",
    reason: "",
  });

  const mockPtoBalances = {
    vacation: { available: 12, used: 3, accrued: 15, pending: 2 },
    sick: { available: 5, used: 2, accrued: 7, pending: 0 },
    personal: { available: 3, used: 0, accrued: 3, pending: 0 },
    unpaid: { available: "Unlimited", used: 1, accrued: null, pending: 0 },
  };

  const mockRequests = [
    { id: 1, type: "vacation", startDate: "2024-12-23", endDate: "2024-12-27", days: 5, status: "approved", reason: "Holiday travel", approvedBy: "Sarah Manager" },
    { id: 2, type: "sick", startDate: "2024-11-15", endDate: "2024-11-15", days: 1, status: "approved", reason: "Doctor appointment" },
    { id: 3, type: "vacation", startDate: "2025-01-06", endDate: "2025-01-08", days: 3, status: "pending", reason: "Family visit" },
    { id: 4, type: "personal", startDate: "2024-10-01", endDate: "2024-10-01", days: 1, status: "denied", reason: "Moving day", denialReason: "Coverage not available" },
  ];

  const mockTeamRequests = [
    { id: 101, worker: "John Smith", type: "vacation", startDate: "2025-01-10", endDate: "2025-01-12", days: 3, status: "pending" },
    { id: 102, worker: "Maria Garcia", type: "sick", startDate: "2025-01-08", endDate: "2025-01-08", days: 1, status: "pending" },
    { id: 103, worker: "James Wilson", type: "vacation", startDate: "2025-01-20", endDate: "2025-01-24", days: 5, status: "pending" },
  ];

  const mockCompanyHolidays = [
    { date: "2025-01-01", name: "New Year's Day" },
    { date: "2025-01-20", name: "MLK Day" },
    { date: "2025-02-17", name: "Presidents' Day" },
    { date: "2025-05-26", name: "Memorial Day" },
    { date: "2025-07-04", name: "Independence Day" },
    { date: "2025-09-01", name: "Labor Day" },
    { date: "2025-11-27", name: "Thanksgiving" },
    { date: "2025-11-28", name: "Day After Thanksgiving" },
    { date: "2025-12-24", name: "Christmas Eve" },
    { date: "2025-12-25", name: "Christmas Day" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "denied":
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vacation": return <Sun className="w-4 h-4 text-yellow-400" />;
      case "sick": return <Heart className="w-4 h-4 text-red-400" />;
      case "personal": return <Briefcase className="w-4 h-4 text-purple-400" />;
      case "unpaid": return <Clock className="w-4 h-4 text-slate-400" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const handleSubmitRequest = () => {
    if (!startDate || !endDate) {
      toast({ title: "Please select dates", variant: "destructive" });
      return;
    }
    toast({
      title: "PTO Request Submitted",
      description: "Your time off request has been sent to your manager for approval.",
    });
    setIsRequestDialogOpen(false);
    setStartDate(undefined);
    setEndDate(undefined);
    setRequestForm({ type: "vacation", reason: "" });
  };

  const handleApproveRequest = (id: number) => {
    toast({ title: "Request Approved", description: `Time off request #${id} has been approved.` });
  };

  const handleDenyRequest = (id: number) => {
    toast({ title: "Request Denied", description: `Time off request #${id} has been denied.`, variant: "destructive" });
  };

  return (
    <Shell>
      <div className="space-y-6">
        <PageHeader
          title="Time Off"
          subtitle="Track your PTO, request time off, and view company holidays"
          actions={
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-request-pto">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Time Off
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Request Time Off</DialogTitle>
                  <DialogDescription>Submit a new PTO request for approval</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type of Time Off</Label>
                    <Select value={requestForm.type} onValueChange={(v) => setRequestForm({...requestForm, type: v})}>
                      <SelectTrigger data-testid="select-pto-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacation">Vacation (12 days available)</SelectItem>
                        <SelectItem value="sick">Sick Leave (5 days available)</SelectItem>
                        <SelectItem value="personal">Personal Day (3 days available)</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal" data-testid="button-start-date">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal" data-testid="button-end-date">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => startDate ? date < startDate : false}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {startDate && endDate && (
                    <div className="p-3 rounded-lg bg-cyan-900/20 border border-cyan-500/30">
                      <p className="text-sm text-cyan-300">
                        Requesting <strong>{differenceInBusinessDays(endDate, startDate) + 1}</strong> business day(s)
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Brief description of your time off..."
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                      data-testid="input-reason"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)} data-testid="button-cancel-request">Cancel</Button>
                  <Button onClick={handleSubmitRequest} className="bg-cyan-600 hover:bg-cyan-700" data-testid="button-submit-request">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 bg-slate-800/50 p-1" data-testid="tabs-pto">
            <TabsTrigger value="my-pto" className="text-xs sm:text-sm" data-testid="tab-my-pto">
              <CalendarIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">My PTO</span>
            </TabsTrigger>
            <TabsTrigger value="approve" className="text-xs sm:text-sm" data-testid="tab-approve">
              <Users className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Approve (3)</span>
            </TabsTrigger>
            <TabsTrigger value="holidays" className="text-xs sm:text-sm" data-testid="tab-holidays">
              <Sun className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Holidays</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-pto" className="space-y-6">
            <BentoGrid cols={4} gap="md">
              {[
                { type: "vacation", label: "Vacation", icon: <Sun className="w-5 h-5" />, data: mockPtoBalances.vacation },
                { type: "sick", label: "Sick Leave", icon: <Heart className="w-5 h-5" />, data: mockPtoBalances.sick },
                { type: "personal", label: "Personal", icon: <Briefcase className="w-5 h-5" />, data: mockPtoBalances.personal },
                { type: "unpaid", label: "Unpaid", icon: <Clock className="w-5 h-5" />, data: mockPtoBalances.unpaid },
              ].map((pto) => (
                <StatCard
                  key={pto.type}
                  label={pto.label}
                  value={`${pto.data.available} days`}
                  icon={pto.icon}
                  className="data-testid-wrapper"
                  data-testid={`card-balance-${pto.type}`}
                />
              ))}
            </BentoGrid>

            <OrbitCard>
              <OrbitCardHeader icon={<Clock className="w-5 h-5 text-cyan-400" />}>
                <OrbitCardTitle>My Requests</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {mockRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50"
                        data-testid={`card-request-${request.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                            {getTypeIcon(request.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium capitalize">{request.type}</p>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-slate-400">
                              {request.startDate === request.endDate 
                                ? request.startDate 
                                : `${request.startDate} - ${request.endDate}`}
                              <span className="mx-2">•</span>
                              {request.days} day{request.days > 1 ? 's' : ''}
                            </p>
                            {request.reason && (
                              <p className="text-xs text-slate-500 mt-1">{request.reason}</p>
                            )}
                            {request.status === "denied" && request.denialReason && (
                              <p className="text-xs text-red-400 mt-1">Reason: {request.denialReason}</p>
                            )}
                          </div>
                        </div>
                        {request.status === "pending" && (
                          <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10" data-testid={`button-cancel-${request.id}`}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </OrbitCardContent>
            </OrbitCard>
          </TabsContent>

          <TabsContent value="approve" className="space-y-4">
            <OrbitCard>
              <OrbitCardHeader 
                icon={<Users className="w-5 h-5 text-cyan-400" />}
                action={
                  <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30">
                    {mockTeamRequests.length} pending
                  </Badge>
                }
              >
                <OrbitCardTitle>Pending Approvals</OrbitCardTitle>
                <p className="text-sm text-slate-400 mt-1">Review and approve team time off requests</p>
              </OrbitCardHeader>
              <OrbitCardContent>
                <div className="space-y-4">
                  {mockTeamRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50"
                      data-testid={`card-team-request-${request.id}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold">
                            {request.worker.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{request.worker}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              {getTypeIcon(request.type)}
                              <span className="capitalize">{request.type}</span>
                              <span>•</span>
                              <span>{request.startDate} - {request.endDate}</span>
                              <span>•</span>
                              <span>{request.days} day{request.days > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                            onClick={() => handleDenyRequest(request.id)}
                            data-testid={`button-deny-${request.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveRequest(request.id)}
                            data-testid={`button-approve-${request.id}`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </OrbitCardContent>
            </OrbitCard>

            <BentoGrid cols={3} gap="md">
              <StatCard
                label="Approved This Month"
                value="24"
                icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
              />
              <StatCard
                label="Pending Review"
                value="3"
                icon={<Clock className="w-5 h-5 text-yellow-400" />}
              />
              <StatCard
                label="Total Days Used (Team)"
                value="156"
                icon={<Users className="w-5 h-5 text-cyan-400" />}
              />
            </BentoGrid>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-4">
            <OrbitCard>
              <OrbitCardHeader icon={<Sun className="w-5 h-5 text-yellow-400" />}>
                <OrbitCardTitle>2025 Company Holidays</OrbitCardTitle>
                <p className="text-sm text-slate-400 mt-1">Paid holidays observed by the company</p>
              </OrbitCardHeader>
              <OrbitCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockCompanyHolidays.map((holiday, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
                      data-testid={`card-holiday-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          <Sun className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium">{holiday.name}</p>
                          <p className="text-xs text-slate-400">{holiday.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-400 border-green-500/30">Paid</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500 text-center">
                    10 paid holidays per year • Holiday schedule set by company policy
                  </p>
                </div>
              </OrbitCardContent>
            </OrbitCard>

            <OrbitCard variant="glass" className="bg-cyan-900/20 border-cyan-500/30">
              <OrbitCardContent>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-cyan-300">Holiday Pay Policy</p>
                    <p className="text-xs text-cyan-200/70 mt-1">
                      Full-time employees receive regular pay for company holidays. Part-time and temporary 
                      workers may have different holiday pay arrangements based on their assignment.
                    </p>
                  </div>
                </div>
              </OrbitCardContent>
            </OrbitCard>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
