import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Clock, Download } from "lucide-react";

interface BackgroundCheck {
  id: string;
  checkType: string;
  status: "pending" | "processing" | "completed" | "failed";
  resultStatus?: "clear" | "issues_found" | "disqualified";
  expiryDate: string;
  completedDate?: string;
}

interface DrugTest {
  id: string;
  testType: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: "pass" | "fail" | "inconclusive";
  expiryDate: string;
  completedDate?: string;
}

interface ComplianceCheck {
  id: string;
  checkType: string;
  status: "pending" | "completed" | "expired";
  complianceStatus?: "compliant" | "non_compliant";
  expiryDate: string;
}

export default function WorkerComplianceDashboard() {
  const [bgChecks, setBgChecks] = useState<BackgroundCheck[]>([]);
  const [drugTests, setDrugTests] = useState<DrugTest[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiryWarnings, setExpiryWarnings] = useState<any[]>([]);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      setBgChecks([
        {
          id: "1",
          checkType: "criminal",
          status: "completed",
          resultStatus: "clear",
          completedDate: "2025-10-15",
          expiryDate: "2026-10-15",
        },
      ]);

      setDrugTests([
        {
          id: "1",
          testType: "pre_employment",
          status: "completed",
          result: "pass",
          completedDate: "2025-10-10",
          expiryDate: "2026-10-10",
        },
      ]);

      setComplianceChecks([
        {
          id: "1",
          checkType: "i9_verification",
          status: "completed",
          complianceStatus: "compliant",
          expiryDate: "2026-11-25",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getExpiryStatus = (daysLeft: number) => {
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 7) return "critical";
    if (daysLeft <= 14) return "warning";
    if (daysLeft <= 30) return "soon";
    return "ok";
  };

  const getStatusColor = (status: string, type: string = "status") => {
    if (type === "expiry") {
      switch (status) {
        case "expired":
          return "bg-red-100 text-red-800";
        case "critical":
          return "bg-orange-100 text-orange-800";
        case "warning":
          return "bg-yellow-100 text-yellow-800";
        case "soon":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-green-100 text-green-800";
      }
    }

    switch (status) {
      case "completed":
      case "compliant":
      case "clear":
      case "pass":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "expired":
      case "non_compliant":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Compliance Status</h1>
        <p className="text-gray-600 mt-1">
          View your background checks, drug tests, and compliance status
        </p>
      </div>

      {/* Expiry Warnings */}
      {expiryWarnings.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You have {expiryWarnings.length} compliance check(s) expiring soon.
            Please renew them to maintain compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Background Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Background Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bgChecks.length === 0 ? (
            <p className="text-sm text-gray-600">No background checks on file</p>
          ) : (
            bgChecks.map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold capitalize">
                    {check.checkType.replace(/_/g, " ")} Check
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed: {check.completedDate || "Pending"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {check.status === "completed" && (
                    <Badge className={getStatusColor(check.resultStatus || "")}>
                      {check.resultStatus}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(check.status)}>
                    {check.status}
                  </Badge>
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Expires</p>
                    <p
                      className={`font-semibold ${
                        getDaysUntilExpiry(check.expiryDate) <= 30
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {getDaysUntilExpiry(check.expiryDate)} days
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Drug Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            Drug Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {drugTests.length === 0 ? (
            <p className="text-sm text-gray-600">No drug tests on file</p>
          ) : (
            drugTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold capitalize">
                    {test.testType.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed: {test.completedDate || "Pending"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {test.status === "completed" && (
                    <Badge className={getStatusColor(test.result || "")}>
                      {test.result}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Expires</p>
                    <p
                      className={`font-semibold ${
                        getDaysUntilExpiry(test.expiryDate) <= 30
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {getDaysUntilExpiry(test.expiryDate)} days
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Compliance Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {complianceChecks.length === 0 ? (
            <p className="text-sm text-gray-600">
              No compliance checks on file
            </p>
          ) : (
            complianceChecks.map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold capitalize">
                    {check.checkType.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(check.complianceStatus || "")}>
                    {check.complianceStatus}
                  </Badge>
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Expires</p>
                    <p
                      className={`font-semibold ${
                        getDaysUntilExpiry(check.expiryDate) <= 30
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {getDaysUntilExpiry(check.expiryDate)} days
                    </p>
                  </div>
                  {getDaysUntilExpiry(check.expiryDate) <= 30 && (
                    <Button size="sm" variant="outline">
                      Renew
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const Beaker = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M4.5 3h15v7c0 1.1-.9 2-2 2h-11c-1.1 0-2-.9-2-2V3z" />
    <path d="M12 20l3-5H9l3 5z" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
);
