import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Zap, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Briefcase,
  Info
} from "lucide-react";
import { calculateCSARates, formatCurrency, calculateEstimatedCost } from "@/lib/rateCalculations";

interface WorkerRequest {
  id: string;
  positionTitle: string;
  workersNeeded: number;
  startDate: string;
  endDate?: string;
  duration: string;
  workLocation: string;
  workerHourlyRate: number;
  hoursPerWeek: number;
  durationWeeks: number;
  description?: string;
}

export default function RateConfirmation() {
  const [, params] = useRoute("/worker-requests/:requestId/confirm-rates");
  const [, setLocation] = useLocation();
  const requestId = params?.requestId;

  const [request, setRequest] = useState<WorkerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [paymentTerms, setPaymentTerms] = useState<"net7" | "net15" | "net30">("net30");
  const [csaAccepted, setCsaAccepted] = useState(false);

  useEffect(() => {
    loadWorkerRequest();
  }, [requestId]);

  async function loadWorkerRequest() {
    if (!requestId) {
      setError("Invalid worker request ID");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/worker-requests/${requestId}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data);
      } else {
        setError("Failed to load worker request. Please try again.");
      }
    } catch (err) {
      console.error("Failed to load worker request:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptRates() {
    if (!request || !requestId) return;

    if (!csaAccepted) {
      alert("Please accept the CSA terms to continue");
      return;
    }

    setSubmitting(true);

    try {
      const rateBreakdown = calculateCSARates(request.workerHourlyRate);
      
      const res = await fetch(`/api/worker-requests/${requestId}/confirm-rates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          workerHourlyRate: request.workerHourlyRate,
          totalBillingRate: rateBreakdown.totalRate,
          paymentTerms,
          csaAccepted,
          timestamp: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("✓ Rates confirmed successfully! Worker matching is now in progress.");
        setLocation(`/worker-requests/${requestId}/status`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to confirm rates. Please try again.");
      }
    } catch (err) {
      console.error("Failed to confirm rates:", err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleModifyRequest() {
    if (requestId) {
      setLocation(`/worker-requests/${requestId}/edit`);
    } else {
      setLocation("/client/request-workers");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading rate confirmation...</div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-8 max-w-lg">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Error</h2>
          <p className="text-gray-300 text-center" data-testid="text-error-message">{error}</p>
          <Button
            onClick={() => setLocation("/client/request-workers")}
            className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700"
            data-testid="button-back-to-requests"
          >
            Back to Worker Requests
          </Button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-8 max-w-lg">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Request Not Found</h2>
          <p className="text-gray-300 text-center">
            The worker request could not be found. Please create a new request.
          </p>
        </div>
      </div>
    );
  }

  const rateBreakdown = calculateCSARates(request.workerHourlyRate);
  const estimatedCost = calculateEstimatedCost(
    request.workersNeeded,
    rateBreakdown.totalRate,
    request.hoursPerWeek,
    request.durationWeeks,
    paymentTerms
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-700/50 rounded-lg p-6 sm:p-8 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2" data-testid="text-page-title">
            📋 Rate Confirmation
          </h1>
          <p className="text-lg sm:text-xl text-gray-300" data-testid="text-page-subtitle">
            Review and accept rates for your worker request
          </p>
        </div>

        {/* Worker Request Details */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              Worker Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Position</p>
                  <p className="text-white font-semibold text-base sm:text-lg" data-testid="text-position-title">
                    {request.positionTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Workers Needed</p>
                  <p className="text-white font-semibold text-base sm:text-lg" data-testid="text-workers-needed">
                    {request.workersNeeded} {request.workersNeeded === 1 ? 'worker' : 'workers'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Start Date</p>
                  <p className="text-white font-semibold" data-testid="text-start-date">
                    {new Date(request.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="text-white font-semibold" data-testid="text-duration">
                    {request.duration}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">Location</p>
                  <p className="text-white font-semibold" data-testid="text-work-location">
                    {request.workLocation}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Breakdown */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Rate Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Item</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-gray-300">Base Worker Rate</td>
                      <td className="py-4 px-4 text-right text-white font-semibold text-lg" data-testid="text-worker-rate">
                        {formatCurrency(rateBreakdown.workerRate)}/hr
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700/50">
                      <td className="py-4 px-4 text-gray-300">
                        CSA Service Fee ({rateBreakdown.markupPercentage}%)
                      </td>
                      <td className="py-4 px-4 text-right text-cyan-400 font-semibold text-lg" data-testid="text-markup-amount">
                        +{formatCurrency(rateBreakdown.markupAmount)}/hr
                      </td>
                    </tr>
                    <tr className="bg-cyan-900/20">
                      <td className="py-4 px-4 text-white font-bold text-lg">
                        Total Billing Rate
                      </td>
                      <td className="py-4 px-4 text-right text-cyan-400 font-bold text-2xl" data-testid="text-total-rate">
                        {formatCurrency(rateBreakdown.totalRate)}/hr
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked View */}
              <div className="sm:hidden space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Base Worker Rate</p>
                  <p className="text-white font-semibold text-xl" data-testid="text-worker-rate-mobile">
                    {formatCurrency(rateBreakdown.workerRate)}/hr
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">
                    CSA Service Fee ({rateBreakdown.markupPercentage}%)
                  </p>
                  <p className="text-cyan-400 font-semibold text-xl" data-testid="text-markup-amount-mobile">
                    +{formatCurrency(rateBreakdown.markupAmount)}/hr
                  </p>
                </div>

                <div className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-700/50">
                  <p className="text-gray-300 text-sm mb-1">Total Billing Rate</p>
                  <p className="text-cyan-400 font-bold text-2xl" data-testid="text-total-rate-mobile">
                    {formatCurrency(rateBreakdown.totalRate)}/hr
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Estimated Cost */}
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-purple-300 font-bold mb-2">Estimated Total Cost</h4>
                    <p className="text-purple-100 text-sm mb-3">
                      Based on {request.workersNeeded} worker{request.workersNeeded !== 1 ? 's' : ''} × {request.hoursPerWeek} hours/week × {request.durationWeeks} weeks
                    </p>
                    <p className="text-purple-400 font-bold text-3xl" data-testid="text-estimated-cost">
                      {formatCurrency(estimatedCost)}
                    </p>
                    {paymentTerms === 'net7' && (
                      <p className="text-purple-300 text-xs mt-2">
                        ⚡ Includes 2% discount for Net 7 payment terms
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparency Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              💡 Why the CSA Markup?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              The Client Service Agreement (CSA) markup covers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                "Workers' compensation insurance",
                "Payroll taxes & compliance",
                "Worker screening & onboarding",
                "GPS-verified timekeeping",
                "24/7 support & worker replacement",
                "Automated payroll processing"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms Selection */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              💳 Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => setPaymentTerms("net7")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  paymentTerms === "net7"
                    ? "bg-cyan-600 border-cyan-400 text-white"
                    : "bg-slate-700 border-slate-600 text-gray-300 hover:border-slate-500"
                }`}
                data-testid="button-payment-term-net7"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Net 7</span>
                </div>
                <p className="text-xs">Payment due within 7 days</p>
                <p className="text-xs font-bold mt-1 text-green-400">2% discount</p>
              </button>

              <button
                onClick={() => setPaymentTerms("net15")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  paymentTerms === "net15"
                    ? "bg-cyan-600 border-cyan-400 text-white"
                    : "bg-slate-700 border-slate-600 text-gray-300 hover:border-slate-500"
                }`}
                data-testid="button-payment-term-net15"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bold">Net 15</span>
                </div>
                <p className="text-xs">Payment due within 15 days</p>
                <p className="text-xs mt-1">(standard)</p>
              </button>

              <button
                onClick={() => setPaymentTerms("net30")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  paymentTerms === "net30"
                    ? "bg-cyan-600 border-cyan-400 text-white"
                    : "bg-slate-700 border-slate-600 text-gray-300 hover:border-slate-500"
                }`}
                data-testid="button-payment-term-net30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bold">Net 30</span>
                </div>
                <p className="text-xs">Payment due within 30 days</p>
                <p className="text-xs mt-1 opacity-70">&nbsp;</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Legal Agreement */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              ✅ Legal Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={csaAccepted}
                onChange={(e) => setCsaAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                data-testid="checkbox-csa-acceptance"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">
                <strong className="text-white text-base sm:text-lg">
                  I agree to the Client Service Agreement terms
                </strong>{" "}
                including the {rateBreakdown.CSA_MARKUP}x billing rate, payment terms, and $5,000
                worker conversion protection fee.
              </span>
            </label>

            <Button
              variant="outline"
              onClick={() => window.open("/csa-template", "_blank")}
              className="w-full sm:w-auto border-cyan-700 text-cyan-400 hover:bg-cyan-900/20"
              data-testid="button-view-csa-terms"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Full CSA Terms
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-200" data-testid="text-error-message">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-4 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:p-0 -mx-4 sm:mx-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleModifyRequest}
              variant="outline"
              className="flex-1 py-6 text-lg border-slate-600 text-gray-300 hover:bg-slate-700"
              data-testid="button-modify-request"
            >
              Modify Request
            </Button>

            <Button
              onClick={handleAcceptRates}
              disabled={!csaAccepted || submitting}
              className={`flex-1 py-6 text-lg font-bold ${
                csaAccepted && !submitting
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
              data-testid="button-accept-rates"
            >
              {submitting ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Accept Rates & Sign CSA
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
