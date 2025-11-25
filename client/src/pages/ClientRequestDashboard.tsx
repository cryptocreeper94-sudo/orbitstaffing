import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, MapPin, Briefcase } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const workerRequestSchema = z.object({
  jobTitle: z.string().min(1, "Job title required"),
  jobDescription: z.string().min(10, "Provide a detailed job description"),
  industry: z.string().min(1, "Industry type required"),
  workersNeeded: z.number().min(1, "At least 1 worker needed"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  shiftType: z.string().optional(),
  payRate: z.number().min(0, "Pay rate must be positive"),
  location: z.string().min(1, "Location required"),
  workersCompRequired: z.boolean().default(true),
  backgroundCheckRequired: z.boolean().default(false),
  drugTestRequired: z.boolean().default(false),
  specialInstructions: z.string().optional(),
  urgent: z.boolean().default(false),
});

type WorkerRequestForm = z.infer<typeof workerRequestSchema>;

export default function ClientRequestDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  const form = useForm<WorkerRequestForm>({
    resolver: zodResolver(workerRequestSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
      industry: "general_labor",
      workersNeeded: 1,
      startDate: new Date().toISOString().split('T')[0],
      payRate: 15.00,
      workersCompRequired: true,
      backgroundCheckRequired: false,
      drugTestRequired: false,
      urgent: false,
    },
  });

  const onSubmit = async (data: WorkerRequestForm) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/worker-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      const result = await response.json();
      setSuccessMessage(`Request submitted! Request #${result.requestNumber}`);
      setRecentRequests([result, ...recentRequests]);
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Request Workers</h1>
          <p className="text-gray-400">Submit a job request and we'll auto-match qualified workers</p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <Alert className="mb-6 border-green-500 bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-200">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <Alert className="mb-6 border-red-500 bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>New Worker Request</CardTitle>
                <CardDescription>Fill in the job details to find qualified workers</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Job Information */}
                    <div className="border-b border-gray-800 pb-6">
                      <h3 className="text-lg font-semibold mb-4">Job Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Construction Worker, Event Staff"
                                className="bg-gray-800 border-gray-700"
                                {...field}
                                data-testid="input-jobTitle"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Industry</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-700" data-testid="select-industry">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="construction">Construction</SelectItem>
                                <SelectItem value="hospitality">Hospitality</SelectItem>
                                <SelectItem value="event_staff">Event Staff</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="logistics">Logistics</SelectItem>
                                <SelectItem value="general_labor">General Labor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="jobDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the work, requirements, and expectations..."
                                className="bg-gray-800 border-gray-700 h-32"
                                {...field}
                                data-testid="textarea-jobDescription"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Schedule & Location */}
                    <div className="border-b border-gray-800 pb-6">
                      <h3 className="text-lg font-semibold mb-4">Schedule & Location</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-gray-800 border-gray-700"
                                  {...field}
                                  data-testid="input-startDate"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-gray-800 border-gray-700"
                                  {...field}
                                  data-testid="input-endDate"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  className="bg-gray-800 border-gray-700"
                                  {...field}
                                  data-testid="input-startTime"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  className="bg-gray-800 border-gray-700"
                                  {...field}
                                  data-testid="input-endTime"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Compensation & Requirements */}
                    <div className="border-b border-gray-800 pb-6">
                      <h3 className="text-lg font-semibold mb-4">Compensation & Requirements</h3>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name="workersNeeded"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Workers Needed</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  className="bg-gray-800 border-gray-700"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-workersNeeded"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="payRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pay Rate ($/hour)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="bg-gray-800 border-gray-700"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  data-testid="input-payRate"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="workersCompRequired"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded"
                                  data-testid="checkbox-workersCompRequired"
                                />
                              </FormControl>
                              <FormLabel className="mb-0">Workers Compensation Insurance Required</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="backgroundCheckRequired"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded"
                                  data-testid="checkbox-backgroundCheck"
                                />
                              </FormControl>
                              <FormLabel className="mb-0">Background Check Required</FormLabel>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="drugTestRequired"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded"
                                  data-testid="checkbox-drugTest"
                                />
                              </FormControl>
                              <FormLabel className="mb-0">Drug Test Required</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Additional Information</h3>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem className="mb-4">
                            <FormLabel>Work Location</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Full address or site name"
                                className="bg-gray-800 border-gray-700"
                                {...field}
                                data-testid="input-location"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special instructions or notes..."
                                className="bg-gray-800 border-gray-700 h-20"
                                {...field}
                                data-testid="textarea-specialInstructions"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="urgent"
                        render={({ field }) => (
                          <FormItem className="mt-4 flex items-center gap-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 rounded"
                                data-testid="checkbox-urgent"
                              />
                            </FormControl>
                            <FormLabel className="mb-0 font-semibold text-yellow-400">
                              Mark as Urgent - Prioritize Matching
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      data-testid="button-submitRequest"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Worker Request"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Recent Requests */}
          <div>
            <Card className="bg-gray-900 border-gray-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg" data-testid="stat-requestsThisMonth">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-xs text-gray-400">Requests This Month</p>
                    <p className="text-2xl font-bold">{recentRequests.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg" data-testid="stat-workersMatched">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">Workers Matched</p>
                    <p className="text-2xl font-bold">{recentRequests.reduce((sum, r) => sum + (r.matches?.length || 0), 0)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg" data-testid="stat-avgResponseTime">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-gray-400">Avg Response Time</p>
                    <p className="text-2xl font-bold">5m</p>
                  </div>
                </div>

                {recentRequests.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <h4 className="font-semibold mb-3 text-sm">Recent Requests</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recentRequests.slice(0, 5).map((req) => (
                        <div
                          key={req.id}
                          className="p-2 bg-gray-800 rounded text-xs"
                          data-testid={`recent-request-${req.requestNumber}`}
                        >
                          <p className="font-semibold text-cyan-400">{req.jobTitle}</p>
                          <p className="text-gray-400">{req.requestNumber}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {req.matches?.length || 0} matches
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
