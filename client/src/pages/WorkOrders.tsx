import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Eye, Download, MapPin, Clock, DollarSign, Zap, CheckCircle, FileEdit, Users } from "lucide-react";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, OrbitCardFooter, StatCard } from "@/components/ui/orbit-card";

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
        return "bg-green-500/20 text-green-400";
      case "approved":
        return "bg-blue-500/20 text-blue-400";
      case "draft":
        return "bg-slate-500/20 text-slate-400";
      case "submitted":
        return "bg-yellow-500/20 text-yellow-400";
      case "under_review":
        return "bg-orange-500/20 text-orange-400";
      case "completed":
        return "bg-purple-500/20 text-purple-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
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

  const renderWorkOrderCards = (orders: WorkOrder[]) => (
    <>
      <div className="hidden md:block space-y-4">
        {orders.map((wo) => (
          <WorkOrderCard
            key={wo.id}
            workOrder={wo}
            onView={handleViewWorkOrder}
            onDownload={handleDownloadPDF}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>
      <div className="md:hidden">
        <CarouselRail gap="md" itemWidth="lg">
          {orders.map((wo) => (
            <CarouselRailItem key={wo.id}>
              <WorkOrderCard
                workOrder={wo}
                onView={handleViewWorkOrder}
                onDownload={handleDownloadPDF}
                getStatusColor={getStatusColor}
              />
            </CarouselRailItem>
          ))}
        </CarouselRail>
      </div>
    </>
  );

  return (
    <Shell>
      <PageHeader
        title="Work Orders"
        subtitle="Detailed job specifications from clients - paired with CSA"
        actions={
          <Button
            className="gap-2 bg-cyan-600 text-white hover:bg-cyan-500"
            onClick={handleNewWorkOrder}
            data-testid="button-new-work-order"
          >
            <Plus className="w-4 h-4" />
            New Work Order
          </Button>
        }
      />

      <BentoGrid cols={3} gap="md" className="mb-8">
        <BentoTile className="p-0">
          <StatCard
            label="Active Jobs"
            value={activeCount}
            icon={<Zap className="w-6 h-6" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>
        <BentoTile className="p-0">
          <StatCard
            label="Approved & Ready"
            value={approvedCount}
            icon={<CheckCircle className="w-6 h-6" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>
        <BentoTile className="p-0">
          <StatCard
            label="In Draft"
            value={draftCount}
            icon={<FileEdit className="w-6 h-6" />}
            className="border-0 bg-transparent"
          />
        </BentoTile>
      </BentoGrid>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            All {workOrders.length}
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            Active {activeCount}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            Pending {approvedCount}
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex-1 data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            Draft {draftCount}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderWorkOrderCards(workOrders)}
        </TabsContent>

        <TabsContent value="active">
          {renderWorkOrderCards(workOrders.filter((w) => w.status === "active"))}
        </TabsContent>

        <TabsContent value="pending">
          {renderWorkOrderCards(workOrders.filter((w) => w.status === "approved"))}
        </TabsContent>

        <TabsContent value="draft">
          {renderWorkOrderCards(workOrders.filter((w) => w.status === "draft"))}
        </TabsContent>
      </Tabs>

      <OrbitCard variant="glass" className="mt-8">
        <OrbitCardHeader icon={<FileText className="w-5 h-5 text-cyan-400" />}>
          <OrbitCardTitle>How Work Orders Work</OrbitCardTitle>
        </OrbitCardHeader>
        <OrbitCardContent>
          <BentoGrid cols={2} gap="md">
            <BentoTile className="p-4">
              <p className="font-semibold text-cyan-400 mb-2">📋 Two-Document System</p>
              <p className="text-sm text-slate-400">
                <strong className="text-white">CSA:</strong> Legal agreement (signed once)<br />
                <strong className="text-white">Work Order:</strong> Specific job request (multiple per client)
              </p>
            </BentoTile>
            <BentoTile className="p-4">
              <p className="font-semibold text-cyan-400 mb-2">🎯 Work Order Contains</p>
              <p className="text-sm text-slate-400">
                Job title, skills needed, location, dates, pay rate, hours, special requirements, sourcing strategy (ORBIT pool, Indeed, LinkedIn)
              </p>
            </BentoTile>
            <BentoTile className="p-4">
              <p className="font-semibold text-cyan-400 mb-2">✅ Workflow</p>
              <p className="text-sm text-slate-400">
                Client submits → ORBIT reviews → Approved → Assign workers → GPS verification → Invoice → Completion
              </p>
            </BentoTile>
            <BentoTile className="p-4">
              <p className="font-semibold text-cyan-400 mb-2">🔗 Integration with Indeed</p>
              <p className="text-sm text-slate-400">
                If client selects "Indeed sourcing", ORBIT searches Indeed database and sources candidates with per-hire commission ($5-15)
              </p>
            </BentoTile>
          </BentoGrid>
        </OrbitCardContent>
      </OrbitCard>
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
    <OrbitCard data-testid={`card-work-order-${workOrder.id}`}>
      <OrbitCardHeader
        action={
          <Badge className={getStatusColor(workOrder.status)}>
            {workOrder.status.replace("_", " ").toUpperCase()}
          </Badge>
        }
      >
        <div>
          <OrbitCardTitle>{workOrder.positionTitle}</OrbitCardTitle>
          <p className="text-xs text-slate-500 mt-1">{workOrder.referenceNumber}</p>
        </div>
      </OrbitCardHeader>

      <OrbitCardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Client</p>
                <p className="text-sm font-semibold text-white">{workOrder.clientName}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-slate-300">{workOrder.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Schedule</p>
                <p className="text-sm text-slate-300">
                  {new Date(workOrder.startDate).toLocaleDateString()}
                  {workOrder.endDate && ` - ${new Date(workOrder.endDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Workers Needed</p>
                <p className="text-sm font-bold text-white">{workOrder.workersNeeded}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Hourly Rate</p>
                <p className="text-sm font-bold text-emerald-400">${workOrder.hourlyRate}/hr</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-xs text-slate-400">{new Date(workOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </OrbitCardContent>

      <OrbitCardFooter>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-2 border-slate-600 hover:border-cyan-500 hover:text-cyan-400"
          onClick={() => onView(workOrder.id)}
          data-testid={`button-view-${workOrder.id}`}
        >
          <Eye className="w-3 h-3" />
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-2 border-slate-600 hover:border-cyan-500 hover:text-cyan-400"
          onClick={() => onDownload(workOrder.id)}
          data-testid={`button-download-${workOrder.id}`}
        >
          <Download className="w-3 h-3" />
          Download PDF
        </Button>
      </OrbitCardFooter>
    </OrbitCard>
  );
}
