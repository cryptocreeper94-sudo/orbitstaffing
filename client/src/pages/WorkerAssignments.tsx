import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, DollarSign, Navigation, AlertCircle, CheckCircle2 } from "lucide-react";

interface Assignment {
  id: string;
  jobNumber: string;
  jobTitle: string;
  clientName: string;
  location: string;
  latitude: number;
  longitude: number;
  startDate: string;
  startTime: string;
  endTime: string;
  wage: number;
  status: "upcoming" | "today" | "completed" | "no_show";
  checkedIn: boolean;
  checkedInAt?: string;
  reminderSent: boolean;
  hoursUntilStart: number;
}

export default function WorkerAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      jobNumber: "JOB-20251122-001",
      jobTitle: "Electrician - Nissan Stadium",
      clientName: "ABC Construction",
      location: "Nissan Stadium, Nashville, TN",
      latitude: 36.1627,
      longitude: -86.7816,
      startDate: "2025-11-23",
      startTime: "08:00",
      endTime: "17:00",
      wage: 45.0,
      status: "today",
      checkedIn: false,
      reminderSent: true,
      hoursUntilStart: 5,
    },
    {
      id: "2",
      jobNumber: "JOB-20251124-002",
      jobTitle: "Laborer - Downtown Project",
      clientName: "Metro Nashville",
      location: "Downtown Nashville Development, TN",
      latitude: 36.1645,
      longitude: -86.7816,
      startDate: "2025-11-24",
      startTime: "07:00",
      endTime: "16:00",
      wage: 28.0,
      status: "upcoming",
      checkedIn: false,
      reminderSent: false,
      hoursUntilStart: 29,
    },
    {
      id: "3",
      jobNumber: "JOB-20251120-003",
      jobTitle: "Carpenter - Tech Hub",
      clientName: "East Nashville Development",
      location: "East Nashville, TN",
      latitude: 36.1627,
      longitude: -86.75,
      startDate: "2025-11-20",
      startTime: "09:00",
      endTime: "17:00",
      wage: 38.0,
      status: "completed",
      checkedIn: true,
      checkedInAt: "2025-11-20T09:15:00Z",
      reminderSent: true,
      hoursUntilStart: -72,
    },
  ]);

  const handleGetDirections = (assignment: Assignment) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${assignment.latitude},${assignment.longitude}&travelmode=driving`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleCheckIn = (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              checkedIn: true,
              checkedInAt: new Date().toISOString(),
              status: "today",
            }
          : a
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "today":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case "upcoming":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "no_show":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const upcomingAssignments = assignments.filter((a) => a.status === "upcoming");
  const todayAssignments = assignments.filter((a) => a.status === "today");
  const completedAssignments = assignments.filter((a) => a.status === "completed");

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Your Assignments</h1>
        <p className="text-muted-foreground">
          View upcoming jobs, get directions, and check in with GPS verification
        </p>
      </div>

      {/* Alert for Today's Assignment */}
      {todayAssignments.length > 0 && (
        <Alert className="mb-6 border-blue-500/50 bg-blue-500/5">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            You have {todayAssignments.length} assignment(s) today. Review details and get directions below.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="bg-card border border-border/50">
          <TabsTrigger value="today" className="flex-1">
            Today {todayAssignments.length > 0 && `(${todayAssignments.length})`}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming {upcomingAssignments.length > 0 && `(${upcomingAssignments.length})`}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed {completedAssignments.length > 0 && `(${completedAssignments.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Today's Assignments */}
        <TabsContent value="today" className="space-y-4">
          {todayAssignments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No assignments today</p>
              </CardContent>
            </Card>
          ) : (
            todayAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onGetDirections={handleGetDirections}
                onCheckIn={handleCheckIn}
              />
            ))
          )}
        </TabsContent>

        {/* Upcoming Assignments */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAssignments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No upcoming assignments</p>
              </CardContent>
            </Card>
          ) : (
            upcomingAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onGetDirections={handleGetDirections}
                onCheckIn={handleCheckIn}
              />
            ))
          )}
        </TabsContent>

        {/* Completed Assignments */}
        <TabsContent value="completed" className="space-y-4">
          {completedAssignments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No completed assignments</p>
              </CardContent>
            </Card>
          ) : (
            completedAssignments.map((assignment) => (
              <CompletedAssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function AssignmentCard({
  assignment,
  onGetDirections,
  onCheckIn,
}: {
  assignment: Assignment;
  onGetDirections: (a: Assignment) => void;
  onCheckIn: (id: string) => void;
}) {
  const isToday = assignment.status === "today";

  return (
    <Card className={`border-border/50 ${isToday ? "border-blue-500/50 bg-blue-500/5" : ""}`} data-testid={`card-assignment-${assignment.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <CardTitle className="text-lg">{assignment.jobTitle}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{assignment.clientName}</p>
          </div>
          <Badge className={isToday ? "bg-blue-500/20 text-blue-600" : "bg-yellow-500/20 text-yellow-600"}>
            {isToday ? "TODAY" : "Upcoming"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Job Info Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Job Reference</p>
            <p className="font-mono font-bold text-sm">{assignment.jobNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
            <p className="text-sm font-semibold">{assignment.startDate}</p>
            <p className="text-xs text-muted-foreground">
              {assignment.startTime} - {assignment.endTime}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Hourly Rate</p>
            <p className="text-lg font-bold text-green-600">${assignment.wage.toFixed(2)}/hr</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Time Until Start</p>
            <p className="text-sm font-semibold">
              {assignment.hoursUntilStart > 0 ? `${assignment.hoursUntilStart}h` : "Starting soon"}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="p-4 rounded-lg bg-card border border-border/30">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{assignment.location}</p>
              <p className="text-xs text-muted-foreground mt-1">
                GPS: {assignment.latitude.toFixed(4)}, {assignment.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* GPS Check-in - PRIMARY FEATURE */}
        {isToday && (
          <div
            className={`p-4 rounded-lg border-2 ${
              assignment.checkedIn
                ? "bg-green-500/10 border-green-500/50"
                : "bg-primary/10 border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold">GPS Verification</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {assignment.checkedIn 
                    ? "Arrival verified" 
                    : "We use GPS to verify you arrived at the job site"}
                </p>
              </div>
              {assignment.checkedIn && (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </div>

            {assignment.checkedIn && assignment.checkedInAt && (
              <p className="text-xs bg-green-500/20 text-green-700 px-3 py-2 rounded">
                ✓ Checked in at {new Date(assignment.checkedInAt).toLocaleTimeString()}
              </p>
            )}

            {!assignment.checkedIn && (
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10"
                onClick={() => onCheckIn(assignment.id)}
                data-testid={`button-checkin-${assignment.id}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Check In Now (Uses GPS)
              </Button>
            )}
          </div>
        )}

        {/* Directions - SECONDARY/SUBTLE */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 text-xs"
            onClick={() => onGetDirections(assignment)}
            data-testid={`button-directions-${assignment.id}`}
          >
            <Navigation className="w-3 h-3" />
            Get Directions
          </Button>
        </div>

        {/* Reminder Status */}
        {!assignment.reminderSent && assignment.status === "upcoming" && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
            <p className="text-xs text-blue-600">
              📬 You'll receive a reminder {assignment.hoursUntilStart - 5} hours before your shift
            </p>
          </div>
        )}

        {assignment.reminderSent && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
            <p className="text-xs text-green-600">
              ✓ Reminder sent! Check your notifications
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompletedAssignmentCard({ assignment }: { assignment: Assignment }) {
  return (
    <Card className="border-border/50 opacity-75" data-testid={`card-completed-${assignment.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-sm">{assignment.jobTitle}</h3>
            <p className="text-xs text-muted-foreground mt-1">{assignment.clientName}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {assignment.startDate} • {assignment.jobNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-green-600">Completed</p>
            {assignment.checkedInAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Checked in: {new Date(assignment.checkedInAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
