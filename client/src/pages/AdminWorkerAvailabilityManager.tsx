import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";

export function AdminWorkerAvailabilityManager() {
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  const mockWorkers = [
    { id: "1", name: "Marcus Johnson", availability: "85% available", slots: 17, status: "excellent" },
    { id: "2", name: "Sarah Williams", availability: "60% available", slots: 12, status: "good" },
    { id: "3", name: "David Martinez", availability: "40% available", slots: 8, status: "needs-improvement" },
    { id: "4", name: "Jessica Lee", availability: "95% available", slots: 19, status: "excellent" },
  ];

  const mockAvailabilityGrid = [
    ["6-12", "✓", "✓", "✓", "✓", "✓", "✗", "✓"],
    ["12-5", "✓", "✓", "✓", "✓", "✓", "✓", "✓"],
    ["5-10", "✗", "✓", "✗", "✓", "✓", "✗", "✓"],
    ["10-6", "✗", "✗", "✗", "✗", "✓", "✗", "✗"],
  ];

  const timeLabels = ["Morning", "Afternoon", "Evening", "Night"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Worker Availability Management</h2>
        <p className="text-muted-foreground">Monitor and manage worker availability across all time slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Total Workers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{mockWorkers.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Avg Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">70%</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Total Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{mockWorkers.reduce((sum, w) => sum + w.slots, 0)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-500">12-5pm</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workers" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/30">
          <TabsTrigger value="workers">Worker List</TabsTrigger>
          <TabsTrigger value="heatmap">Availability Heatmap</TabsTrigger>
          <TabsTrigger value="scheduling">Smart Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {mockWorkers.map((worker) => (
              <Card 
                key={worker.id}
                className="bg-card/50 border-border/50 hover:border-blue-500/30 cursor-pointer transition-colors"
                onClick={() => setSelectedWorker(worker.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{worker.name}</p>
                      <p className="text-sm text-muted-foreground">{worker.slots} time slots available</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">{worker.availability}</p>
                      <Badge className={
                        worker.status === "excellent" ? "bg-green-500/20 text-green-600" :
                        worker.status === "good" ? "bg-blue-500/20 text-blue-600" :
                        "bg-yellow-500/20 text-yellow-600"
                      }>
                        {worker.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>2-Week Availability Heatmap</CardTitle>
              <CardDescription>Green = Available, Red = Unavailable</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-max">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-muted-foreground font-medium">Time</th>
                      {dayLabels.map(day => (
                        <th key={day} className="text-center p-2 text-muted-foreground font-medium">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockAvailabilityGrid.map((row, idx) => (
                      <tr key={idx} className="border-t border-slate-700/30">
                        <td className="p-2 font-medium text-muted-foreground">{timeLabels[idx]}</td>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="text-center p-2">
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-semibold ${
                              cell === "✓" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                            }`}>
                              {cell}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Smart Scheduling Recommendations</CardTitle>
              <CardDescription>Based on current worker availability patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="font-semibold text-blue-400 mb-2">🎯 Peak Availability Window</p>
                <p className="text-sm text-muted-foreground">12-5pm (Mon-Fri) has 95% worker availability</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="font-semibold text-green-400 mb-2">✓ Best for Scheduling</p>
                <p className="text-sm text-muted-foreground">Tuesday & Thursday afternoons - 4 workers available</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="font-semibold text-yellow-400 mb-2">⚠️ Coverage Gap Alert</p>
                <p className="text-sm text-muted-foreground">Evening shifts (5-10pm) need more worker availability</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
