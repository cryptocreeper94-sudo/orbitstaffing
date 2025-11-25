import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, MapPin, Clock, DollarSign, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WorkerMatch {
  id: string;
  workerId: string;
  matchScore: number;
  matchStatus: string;
  matchReason: { reasons: string[] };
  skillsMatch: boolean;
  availabilityMatch: boolean;
  insuranceMatch: boolean;
  locationMatch: boolean;
}

interface WorkerRequest {
  id: string;
  requestNumber: string;
  jobTitle: string;
  industry: string;
  workersNeeded: number;
  startDate: string;
  payRate: number;
  location: string;
  status: string;
  urgent: boolean;
  matches?: WorkerMatch[];
}

export default function AdminWorkerMatchingPanel() {
  const [requests, setRequests] = useState<WorkerRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WorkerRequest | null>(null);
  const [selectedMatches, setSelectedMatches] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load pending worker requests
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/worker-requests/pending/default-tenant-id");
        if (!response.ok) throw new Error("Failed to load requests");
        const data = await response.json();
        setRequests(data);
        if (data.length > 0) {
          setSelectedRequest(data[0]);
          loadMatchesForRequest(data[0].id);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load requests");
      } finally {
        setIsLoading(false);
      }
    };
    loadRequests();
  }, []);

  const loadMatchesForRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/worker-request-matches/${requestId}/default-tenant-id`);
      if (!response.ok) throw new Error("Failed to load matches");
      const matches = await response.json();
      const request = requests.find(r => r.id === requestId);
      if (request) {
        request.matches = matches;
        setSelectedRequest({ ...request });
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  };

  const assignWorker = async (matchId: string) => {
    try {
      const response = await fetch(`/api/worker-request-matches/${matchId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to assign worker");

      setSuccessMessage("Worker assigned successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reload the request
      if (selectedRequest) {
        loadMatchesForRequest(selectedRequest.id);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to assign worker");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const rejectMatch = async (matchId: string, reason: string = "Not suitable") => {
    try {
      const response = await fetch(`/api/worker-request-matches/${matchId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error("Failed to reject match");

      // Reload the request
      if (selectedRequest) {
        loadMatchesForRequest(selectedRequest.id);
      }
    } catch (error) {
      console.error("Failed to reject match:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading worker requests...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === "pending");
  const assignedRequests = requests.filter(r => r.status === "assigned");
  const suggestedMatches = selectedRequest?.matches?.filter(m => m.matchStatus === "suggested") || [];
  const assignedMatches = selectedRequest?.matches?.filter(m => m.matchStatus === "assigned") || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Worker Matching Panel</h1>
          <p className="text-gray-400">Review and assign workers to submitted requests</p>
        </div>

        {/* Success/Error Alerts */}
        {successMessage && (
          <Alert className="mb-6 border-green-500 bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-200">{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert className="mb-6 border-red-500 bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Request List */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Pending Requests</CardTitle>
                <CardDescription>{pendingRequests.length} pending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pendingRequests.length === 0 ? (
                    <p className="text-sm text-gray-400">No pending requests</p>
                  ) : (
                    pendingRequests.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => {
                          setSelectedRequest(req);
                          loadMatchesForRequest(req.id);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedRequest?.id === req.id
                            ? "bg-cyan-900 border border-cyan-500"
                            : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                        }`}
                        data-testid={`request-button-${req.requestNumber}`}
                      >
                        <p className="font-semibold text-sm text-cyan-400">{req.jobTitle}</p>
                        <p className="text-xs text-gray-400 mt-1">{req.requestNumber}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {req.workersNeeded} needed
                          </Badge>
                          {req.urgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {assignedRequests.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <h4 className="font-semibold text-sm mb-2">Assigned</h4>
                    <p className="text-xs text-gray-500">{assignedRequests.length} completed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Request Details & Matches */}
          <div className="lg:col-span-3 space-y-6">
            {selectedRequest ? (
              <>
                {/* Request Overview */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedRequest.jobTitle}</CardTitle>
                        <CardDescription>{selectedRequest.requestNumber}</CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            selectedRequest.status === "pending"
                              ? "bg-yellow-600"
                              : "bg-green-600"
                          }
                        >
                          {selectedRequest.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3" data-testid="detail-workersNeeded">
                        <Users className="w-5 h-5 text-cyan-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Workers Needed</p>
                          <p className="text-lg font-semibold">{selectedRequest.workersNeeded}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3" data-testid="detail-payRate">
                        <DollarSign className="w-5 h-5 text-green-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Pay Rate</p>
                          <p className="text-lg font-semibold">${selectedRequest.payRate}/hr</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3" data-testid="detail-startDate">
                        <Clock className="w-5 h-5 text-blue-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Start Date</p>
                          <p className="text-lg font-semibold">{selectedRequest.startDate}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3" data-testid="detail-location">
                        <MapPin className="w-5 h-5 text-red-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-400">Location</p>
                          <p className="text-lg font-semibold">{selectedRequest.location}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Matches */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Suggested Matches ({suggestedMatches.length})
                  </h2>

                  {suggestedMatches.length === 0 ? (
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="pt-6">
                        <p className="text-center text-gray-400">
                          No worker matches available for this request
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {suggestedMatches.map((match) => (
                        <Card key={match.id} className="bg-gray-900 border-gray-800">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <p className="text-lg font-semibold text-cyan-400">
                                  Worker #{match.workerId.substring(0, 8)}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                  Match Score: {match.matchScore}%
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => assignWorker(match.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                  data-testid={`button-assignWorker-${match.workerId}`}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Assign
                                </Button>
                                <Button
                                  onClick={() => rejectMatch(match.id)}
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-rejectWorker-${match.workerId}`}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>

                            {/* Match Criteria */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              <div
                                className={`p-2 rounded text-center text-xs font-semibold ${
                                  match.skillsMatch ? "bg-green-900 text-green-200" : "bg-gray-800 text-gray-400"
                                }`}
                                data-testid="criteria-skillsMatch"
                              >
                                {match.skillsMatch ? "✓" : "✗"} Skills
                              </div>
                              <div
                                className={`p-2 rounded text-center text-xs font-semibold ${
                                  match.availabilityMatch ? "bg-green-900 text-green-200" : "bg-gray-800 text-gray-400"
                                }`}
                                data-testid="criteria-availabilityMatch"
                              >
                                {match.availabilityMatch ? "✓" : "✗"} Available
                              </div>
                              <div
                                className={`p-2 rounded text-center text-xs font-semibold ${
                                  match.insuranceMatch ? "bg-green-900 text-green-200" : "bg-gray-800 text-gray-400"
                                }`}
                                data-testid="criteria-insuranceMatch"
                              >
                                {match.insuranceMatch ? "✓" : "✗"} Insurance
                              </div>
                              <div
                                className={`p-2 rounded text-center text-xs font-semibold ${
                                  match.locationMatch ? "bg-green-900 text-green-200" : "bg-gray-800 text-gray-400"
                                }`}
                                data-testid="criteria-locationMatch"
                              >
                                {match.locationMatch ? "✓" : "✗"} Location
                              </div>
                              <div
                                className={`p-2 rounded text-center text-xs font-semibold ${
                                  match.experienceMatch ? "bg-green-900 text-green-200" : "bg-gray-800 text-gray-400"
                                }`}
                                data-testid="criteria-experienceMatch"
                              >
                                {match.experienceMatch ? "✓" : "✗"} Exp
                              </div>
                            </div>

                            {/* Match Reasons */}
                            {match.matchReason?.reasons && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-400 mb-2">Match Reasons:</p>
                                <div className="flex flex-wrap gap-2">
                                  {match.matchReason.reasons.map((reason, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {reason}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assigned Workers */}
                {assignedMatches.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Assigned Workers ({assignedMatches.length})
                    </h2>
                    <div className="grid gap-4">
                      {assignedMatches.map((match) => (
                        <Card key={match.id} className="bg-green-950 border-green-800">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="w-6 h-6 text-green-400" />
                              <div>
                                <p className="text-lg font-semibold text-green-400">
                                  Worker #{match.workerId.substring(0, 8)} - Assigned
                                </p>
                                <p className="text-sm text-green-300 mt-1">
                                  Match Score: {match.matchScore}%
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <p className="text-center text-gray-400">
                    {pendingRequests.length === 0
                      ? "No pending requests to review"
                      : "Select a request to view matches"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
