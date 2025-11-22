import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Eye, Download, MapPin, Clock, DollarSign } from "lucide-react";

interface WorkOrder {
  id: string;
  referenceNumber: string;
  positionTitle: string;
  clientName: string;
  location: string;
  startDate: string;
  endDate?: string;
  workersNeeded: number;
  hourlyRate: number;
  status: "draft" | "submitted" | "under_review" | "approved" | "active" | "completed" | "cancelled";
  createdAt: string;
}

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: "1",
      referenceNumber: "WO-2024-11-22-001",
      positionTitle: "Electrician - Residential Wiring",
      clientName: "ABC Construction",
      location: "Nissan Stadium, Nashville TN",
      startDate: "2024-11-23",
      endDate: "2024-11-25",
      workersNeeded: 2,
      hourlyRate: 45,
      status: "approved",
      createdAt: "2024-11-22",
    },
    {
      id: "2",
      referenceNumber: "WO-2024-11-21-001",
      positionTitle: "General Laborer",
      clientName: "Metro Development",
      location: "Downtown Nashville",
      startDate: "2024-11-20",
      endDate: "2024-11-20",
      workersNeeded: 5,
      hourlyRate: 28,
      status: "active",
      createdAt: "2024-11-21",
    },
    {
      id: "3",
      referenceNumber: "WO-2024-11-20-001",
      positionTitle: "Server - Hospitality",
      clientName: "The Hermitage Hotel",
      location: "Downtown Nashville",
      startDate: "2024-11-22",
      workersNeeded: 3,
      hourlyRate: 18,
      status: "draft",
      createdAt: "2024-11-20",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-600";
      case "approved":
        return "bg-blue-500/20 text-blue-600";
      case "draft":
        return "bg-gray-500/20 text-gray-600";
      case "submitted":
        return "bg-yellow-500/20 text-yellow-600";
      case "under_review":
        return "bg-orange-500/20 text-orange-600";
      case "completed":
        return "bg-purple-500/20 text-purple-600";
      case "cancelled":
        return "bg-red-500/20 text-red-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  const handleNewWorkOrder = () => {
    alert("Creating new work order...\n\nIn production, this opens the form to create a new work order.");
  };

  const handleViewWorkOrder = (id: string) => {
    alert(`Viewing work order details for ${id}`);
  };

  const handleDownloadPDF = (id: string) => {
    alert(`Downloading PDF for work order ${id}`);
  };

  const activeCount = workOrders.filter((w) => w.status === "active").length;
  const approvedCount = workOrders.filter((w) => w.status === "approved").length;
  const draftCount = workOrders.filter((w) => w.status === "draft").length;

  return (
    <Shell>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Work Orders
          </h1>
          <p className="text-muted-foreground">
            Detailed job specifications from clients - paired with CSA
          </p>
        </div>
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleNewWorkOrder}
          data-testid="button-new-work-order"
        >
          <Plus className="w-4 h-4" />
          New Work Order
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Jobs</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <Badge className="bg-green-500/20 text-green-600">Live</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Approved & Ready</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-600">Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">In Draft</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
              <Badge className="bg-gray-500/20 text-gray-600">Draft</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="all" className="flex-1">
            All {workOrders.length}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1">
            Active {activeCount}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            Pending {approvedCount}
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex-1">
            Draft {draftCount}
          </TabsTrigger>
        </TabsList>

        {/* All Work Orders */}
        <TabsContent value="all" className="space-y-4">
          {workOrders.map((wo) => (
            <WorkOrderCard
              key={wo.id}
              workOrder={wo}
              onView={handleViewWorkOrder}
              onDownload={handleDownloadPDF}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>

        {/* Active Only */}
        <TabsContent value="active" className="space-y-4">
          {workOrders
            .filter((w) => w.status === "active")
            .map((wo) => (
              <WorkOrderCard
                key={wo.id}
                workOrder={wo}
                onView={handleViewWorkOrder}
                onDownload={handleDownloadPDF}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>

        {/* Pending Only */}
        <TabsContent value="pending" className="space-y-4">
          {workOrders
            .filter((w) => w.status === "approved")
            .map((wo) => (
              <WorkOrderCard
                key={wo.id}
                workOrder={wo}
                onView={handleViewWorkOrder}
                onDownload={handleDownloadPDF}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>

        {/* Draft Only */}
        <TabsContent value="draft" className="space-y-4">
          {workOrders
            .filter((w) => w.status === "draft")
            .map((wo) => (
              <WorkOrderCard
                key={wo.id}
                workOrder={wo}
                onView={handleViewWorkOrder}
                onDownload={handleDownloadPDF}
                getStatusColor={getStatusColor}
              />
            ))}
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <div className="mt-8 p-6 rounded-lg bg-blue-500/5 border border-blue-500/30">
        <h2 className="text-lg font-bold font-heading mb-3">How Work Orders Work</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold mb-2">📋 Two-Document System</p>
            <p>
              <strong>CSA:</strong> Legal agreement (signed once)<br />
              <strong>Work Order:</strong> Specific job request (multiple per client)
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">🎯 Work Order Contains</p>
            <p>
              Job title, skills needed, location, dates, pay rate, hours, special requirements, sourcing strategy (ORBIT pool, Indeed, LinkedIn)
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">✅ Workflow</p>
            <p>
              Client submits → ORBIT reviews → Approved → Assign workers → GPS verification → Invoice → Completion
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">🔗 Integration with Indeed</p>
            <p>
              If client selects "Indeed sourcing", ORBIT searches Indeed database and sources candidates with per-hire commission ($5-15)
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function WorkOrderCard({
  workOrder,
  onView,
  onDownload,
  getStatusColor,
}: {
  workOrder: WorkOrder;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  getStatusColor: (status: string) => string;
}) {
  return (
    <Card className="border-border/50 hover:border-primary/50 transition-colors" data-testid={`card-work-order-${workOrder.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <CardTitle className="text-lg">{workOrder.positionTitle}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{workOrder.referenceNumber}</p>
          </div>
          <Badge className={getStatusColor(workOrder.status)}>
            {workOrder.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <p className="text-xs text-muted-foreground font-semibold min-w-fit">Client:</p>
              <p className="text-sm font-semibold">{workOrder.clientName}</p>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm">{workOrder.location}</p>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p>
                  {new Date(workOrder.startDate).toLocaleDateString()}
                  {workOrder.endDate && ` - ${new Date(workOrder.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <p className="text-xs text-muted-foreground font-semibold min-w-fit">Workers:</p>
              <p className="text-sm font-bold">{workOrder.workersNeeded}</p>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-green-600">${workOrder.hourlyRate}/hr</p>
            </div>

            <div className="flex items-start gap-2">
              <p className="text-xs text-muted-foreground font-semibold min-w-fit">Created:</p>
              <p className="text-xs text-muted-foreground">{new Date(workOrder.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border/30">
          <Button
            variant="outline"
            className="flex-1 text-xs gap-2"
            onClick={() => onView(workOrder.id)}
            data-testid={`button-view-${workOrder.id}`}
          >
            <Eye className="w-3 h-3" />
            View Details
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-xs gap-2"
            onClick={() => onDownload(workOrder.id)}
            data-testid={`button-download-${workOrder.id}`}
          >
            <Download className="w-3 h-3" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
