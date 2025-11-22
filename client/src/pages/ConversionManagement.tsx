import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, DollarSign, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ConversionRequest {
  id: string;
  workerName: string;
  clientName: string;
  totalHours: number;
  conversionFee: number;
  status: "pending" | "approved" | "completed" | "declined";
  workerApproved: boolean;
  clientApproved: boolean;
  orbitApproved: boolean;
  buyoutPaid: boolean;
  requestDate: string;
}

export default function ConversionManagement() {
  const [conversions, setConversions] = useState<ConversionRequest[]>([
    {
      id: "1",
      workerName: "Jake Thompson",
      clientName: "ABC Manufacturing",
      totalHours: 420,
      conversionFee: 0,
      status: "pending",
      workerApproved: true,
      clientApproved: true,
      orbitApproved: false,
      buyoutPaid: false,
      requestDate: "2025-11-20",
    },
    {
      id: "2",
      workerName: "Sarah Johnson",
      clientName: "Tech Services Inc",
      totalHours: 650,
      conversionFee: 2000,
      status: "pending",
      workerApproved: true,
      clientApproved: false,
      orbitApproved: false,
      buyoutPaid: false,
      requestDate: "2025-11-19",
    },
    {
      id: "3",
      workerName: "Marcus Davis",
      clientName: "Logistics Pro",
      totalHours: 1200,
      conversionFee: 4000,
      status: "approved",
      workerApproved: true,
      clientApproved: true,
      orbitApproved: true,
      buyoutPaid: false,
      requestDate: "2025-11-15",
    },
  ]);

  const pendingCount = conversions.filter((c) => c.status === "pending").length;
  const approvedCount = conversions.filter((c) => c.status === "approved").length;
  const completedCount = conversions.filter((c) => c.status === "completed").length;

  const handleApprove = (id: string) => {
    setConversions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "approved", orbitApproved: true }
          : c
      )
    );
    toast.success("Conversion approved!");
  };

  const handleDecline = (id: string) => {
    setConversions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "declined", orbitApproved: false }
          : c
      )
    );
    toast.success("Conversion declined");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "approved":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "declined":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getFeeCategory = (hours: number): string => {
    if (hours < 480) return "Free";
    if (hours < 960) return "$2,000 Fee";
    return "$4,000 Fee";
  };

  const getFeeAmount = (hours: number): number => {
    if (hours < 480) return 0;
    if (hours < 960) return 2000;
    return 4000;
  };

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Worker Conversion Management</h1>
        <p className="text-muted-foreground">Manage temporary worker conversions to full-time employment</p>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Pending Reviews</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-2">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Approved</p>
            <p className="text-3xl font-bold text-blue-600">{approvedCount}</p>
            <p className="text-xs text-muted-foreground mt-2">Ready for completion</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-2">Released workers</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Buyout Revenue</p>
            <p className="text-3xl font-bold text-primary">$6,000</p>
            <p className="text-xs text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="pending" className="flex-1">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex-1">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            All Conversions
          </TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="space-y-4">
          {conversions
            .filter((c) => c.status === "pending")
            .map((conversion) => (
              <Card key={conversion.id} className="border-yellow-500/30 bg-yellow-500/5" data-testid={`card-pending-${conversion.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{conversion.workerName}</h3>
                      <p className="text-sm text-muted-foreground">{conversion.clientName}</p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-600">Pending Review</Badge>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Hours</p>
                      <p className="font-bold text-lg">{conversion.totalHours}h</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conversion.totalHours < 480 ? "< 6 months" : 
                         conversion.totalHours < 960 ? "6-12 months" : 
                         "12+ months"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Buyout Fee</p>
                      <p className="font-bold text-lg text-primary">${conversion.conversionFee}</p>
                      <p className="text-xs text-green-600 mt-1">{getFeeCategory(conversion.totalHours)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Approvals</p>
                      <div className="space-y-1">
                        <p className="text-xs">
                          Worker: {conversion.workerApproved ? "✓" : "✗"}
                        </p>
                        <p className="text-xs">
                          Client: {conversion.clientApproved ? "✓" : "✗"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Requested</p>
                      <p className="text-xs">{conversion.requestDate}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      className="bg-primary/20 text-primary text-sm h-9 flex-1"
                      onClick={() => handleApprove(conversion.id)}
                      data-testid={`button-approve-${conversion.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Conversion
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs h-9 flex-1"
                      onClick={() => handleDecline(conversion.id)}
                      data-testid={`button-decline-${conversion.id}`}
                    >
                      Decline
                    </Button>
                  </div>

                  {/* Policy Reference */}
                  <div className="mt-4 p-3 bg-card rounded border border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>CSA Section 13 Policy:</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ Worker hours verified via GPS and timesheets</li>
                      <li>✓ Buyout fee: {conversion.conversionFee > 0 ? "$" + conversion.conversionFee : "No fee (under 480 hours)"}</li>
                      <li>✓ Payment required before final release</li>
                      <li>✓ Worker remains in system until conversion complete</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* Approved */}
        <TabsContent value="approved" className="space-y-4">
          {conversions
            .filter((c) => c.status === "approved")
            .map((conversion) => (
              <Card key={conversion.id} className="border-blue-500/30 bg-blue-500/5" data-testid={`card-approved-${conversion.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{conversion.workerName}</h3>
                      <p className="text-sm text-muted-foreground">{conversion.clientName}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-600">Approved</Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Buyout Fee Status</p>
                      <p className="font-bold text-lg">
                        {conversion.buyoutPaid ? (
                          <span className="text-green-600">✓ Paid</span>
                        ) : conversion.conversionFee > 0 ? (
                          <span className="text-orange-600">${conversion.conversionFee}</span>
                        ) : (
                          <span className="text-green-600">No Fee</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Approval Status</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs">All parties approved</span>
                      </div>
                    </div>
                    <div>
                      <Button
                        className="bg-green-600 text-white text-xs h-9 w-full"
                        onClick={() => {
                          setConversions((prev) =>
                            prev.map((c) =>
                              c.id === conversion.id
                                ? { ...c, status: "completed" }
                                : c
                            )
                          );
                          toast.success("Worker conversion completed!");
                        }}
                        data-testid={`button-complete-${conversion.id}`}
                      >
                        Complete Conversion
                      </Button>
                    </div>
                  </div>

                  {conversion.conversionFee > 0 && !conversion.buyoutPaid && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <p className="text-xs text-yellow-600 font-medium mb-2">
                        ⚠️ Awaiting Buyout Payment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Client payment of ${conversion.conversionFee} required before conversion completes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        {/* All */}
        <TabsContent value="all" className="space-y-4">
          {conversions.map((conversion) => (
            <Card key={conversion.id} className="border-border/50" data-testid={`card-all-${conversion.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(conversion.status)}
                    <div>
                      <h3 className="font-bold">{conversion.workerName}</h3>
                      <p className="text-xs text-muted-foreground">{conversion.clientName}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      conversion.status === "completed"
                        ? "bg-green-500/20 text-green-600"
                        : conversion.status === "approved"
                        ? "bg-blue-500/20 text-blue-600"
                        : conversion.status === "declined"
                        ? "bg-red-500/20 text-red-600"
                        : "bg-yellow-500/20 text-yellow-600"
                    }
                  >
                    {conversion.status.charAt(0).toUpperCase() + conversion.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-5 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Hours</p>
                    <p className="font-semibold">{conversion.totalHours}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Fee</p>
                    <p className="font-semibold">${conversion.conversionFee}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Worker Approved</p>
                    <p>{conversion.workerApproved ? "✓ Yes" : "✗ No"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Client Approved</p>
                    <p>{conversion.clientApproved ? "✓ Yes" : "✗ No"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Requested</p>
                    <p>{conversion.requestDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Policy Reference Card */}
      <Card className="mt-8 border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Worker Conversion Policy (CSA Section 13)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-sm mb-2">Less than 480 hours</p>
              <p className="text-xs text-muted-foreground mb-3">~Less than 6 months</p>
              <p className="text-2xl font-bold text-green-600">$0</p>
              <p className="text-xs text-muted-foreground mt-2">No buyout fee required</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">480-960 hours</p>
              <p className="text-xs text-muted-foreground mb-3">~6-12 months</p>
              <p className="text-2xl font-bold text-orange-600">$2,000</p>
              <p className="text-xs text-muted-foreground mt-2">Buyout fee to ORBIT</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">960+ hours</p>
              <p className="text-xs text-muted-foreground mb-3">~12+ months</p>
              <p className="text-2xl font-bold text-red-600">$4,000</p>
              <p className="text-xs text-muted-foreground mt-2">Buyout fee to ORBIT</p>
            </div>
          </div>

          <div className="p-4 bg-card rounded border border-border/30">
            <p className="text-sm font-semibold mb-3">Policy Protections</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Client has predictable conversion costs</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Workers get path to permanent employment</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>ORBIT compensated for lost recurring revenue</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>GPS verification prevents hour disputes</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
