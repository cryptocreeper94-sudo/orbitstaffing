import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";

interface Paystub {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  netPay: number;
  status: "pending" | "completed" | "failed";
  garnishments: number;
}

export default function WorkerPayrollPortal() {
  const [paystubs, setPaystubs] = useState<Paystub[]>([
    {
      id: "1",
      payPeriodStart: "2025-11-01",
      payPeriodEnd: "2025-11-14",
      grossPay: 2500,
      netPay: 1850,
      status: "completed",
      garnishments: 200,
    },
    {
      id: "2",
      payPeriodStart: "2025-11-15",
      payPeriodEnd: "2025-11-28",
      grossPay: 2650,
      netPay: 1950,
      status: "completed",
      garnishments: 250,
    },
  ]);

  const [selectedPaystub, setSelectedPaystub] = useState<Paystub | null>(null);

  const getTotalGarnishments = () =>
    paystubs.reduce((sum, p) => sum + p.garnishments, 0);

  const getAverageNetPay = () =>
    (paystubs.reduce((sum, p) => sum + p.netPay, 0) / paystubs.length).toFixed(2);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Payroll</h1>
        <p className="text-gray-600 mt-1">
          View your paystubs, garnishments, and payment history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Garnishments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ${getTotalGarnishments().toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across {paystubs.length} pay periods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Net Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${getAverageNetPay()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per pay period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paystubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paystubs.length}</div>
            <p className="text-xs text-gray-500 mt-1">Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Paystubs List */}
      <Card>
        <CardHeader>
          <CardTitle>Paystub History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paystubs.map((paystub) => (
              <div
                key={paystub.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-semibold">
                    {new Date(paystub.payPeriodStart).toLocaleDateString()} -{" "}
                    {new Date(paystub.payPeriodEnd).toLocaleDateString()}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>
                      Gross: <span className="font-semibold">${paystub.grossPay}</span>
                    </span>
                    <span>
                      Net: <span className="font-semibold">${paystub.netPay}</span>
                    </span>
                    {paystub.garnishments > 0 && (
                      <span className="text-red-600">
                        Garnishment: ${paystub.garnishments}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      paystub.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {paystub.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedPaystub(paystub)}
                    data-testid={`button-view-paystub-${paystub.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-testid={`button-download-paystub-${paystub.id}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Garnishment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Garnishment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-red-50 rounded">
              <span>Child Support</span>
              <span className="font-semibold">$150.00</span>
            </div>
            <div className="flex justify-between p-3 bg-orange-50 rounded">
              <span>Tax Levy (IRS)</span>
              <span className="font-semibold">$200.00</span>
            </div>
            <div className="flex justify-between p-3 bg-yellow-50 rounded">
              <span>Student Loan</span>
              <span className="font-semibold">$100.00</span>
            </div>
            <div className="flex justify-between p-3 border-t-2 font-bold">
              <span>Total</span>
              <span>${getTotalGarnishments().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paystub Detail Modal (simple version) */}
      {selectedPaystub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Paystub Detail</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setSelectedPaystub(null)}
                data-testid="button-close-paystub"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Pay Period Start</p>
                  <p className="font-semibold">
                    {new Date(
                      selectedPaystub.payPeriodStart
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Pay Period End</p>
                  <p className="font-semibold">
                    {new Date(selectedPaystub.payPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Gross Pay</p>
                  <p className="font-semibold">${selectedPaystub.grossPay}</p>
                </div>
                <div>
                  <p className="text-gray-600">Net Pay</p>
                  <p className="font-semibold text-green-600">
                    ${selectedPaystub.netPay}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Garnishments</p>
                  <p className="font-semibold text-red-600">
                    ${selectedPaystub.garnishments}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <Badge variant="default">{selectedPaystub.status}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Download PDF</Button>
                <Button variant="outline" className="flex-1">
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
