import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ComplianceDashboard() {
  const [selectedState, setSelectedState] = useState<string>("TN");
  const [stateRules, setStateRules] = useState<any>(null);
  const [prevailingWages, setPrevailingWages] = useState<any[]>([]);
  const [workersCompRates, setWorkersCompRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const states = [
    { code: "TN", name: "Tennessee" },
    { code: "KY", name: "Kentucky" },
    { code: "AL", name: "Alabama" },
    { code: "AR", name: "Arkansas" },
    { code: "NC", name: "North Carolina" },
    { code: "SC", name: "South Carolina" },
    { code: "GA", name: "Georgia" },
    { code: "MS", name: "Mississippi" },
  ];

  useEffect(() => {
    const fetchStateData = async () => {
      setLoading(true);
      try {
        const [rulesRes, wagesRes, compRes] = await Promise.all([
          fetch(`/api/compliance/state-rules/${selectedState}`),
          fetch(`/api/compliance/prevailing-wages?state=${selectedState}`),
          fetch(`/api/compliance/workers-comp-rates?state=${selectedState}`),
        ]);

        if (rulesRes.ok) setStateRules(await rulesRes.json());
        if (wagesRes.ok) setPrevailingWages(await wagesRes.json());
        if (compRes.ok) setWorkersCompRates(await compRes.json());
      } catch (error) {
        console.error("Failed to fetch compliance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStateData();
  }, [selectedState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Compliance Dashboard</h1>
          <p className="text-slate-400">State regulations, prevailing wages, and workers compensation rates</p>
        </div>

        {/* State Selector */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Select State</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="bg-slate-700 text-white border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {states.map((state) => (
                  <SelectItem key={state.code} value={state.code} className="text-white">
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading compliance data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* State Compliance Rules */}
            {stateRules && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">📋 State Compliance Rules - {selectedState}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-300">
                  <div>
                    <span className="font-semibold text-white">Minimum Wage:</span>
                    <p className="text-lg font-bold text-green-400">${stateRules.minWagePerHour.toFixed(2)}/hr</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-semibold text-white">Requirements:</span>
                    <div className="flex flex-wrap gap-2">
                      {stateRules.workersCompRequired && <Badge className="bg-orange-600">Workers Comp Required</Badge>}
                      {stateRules.prevailingWageApplies && <Badge className="bg-blue-600">Prevailing Wage Applies</Badge>}
                      {stateRules.backgroundCheckRequired && <Badge className="bg-red-600">Background Check Required</Badge>}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-white">License Requirements:</span>
                    <p className="text-sm">
                      {Object.entries(stateRules.licenseRequirementsPerTrade || {}).map(([trade, req]: any) => (
                        <span key={trade} className="block">
                          • {trade}: <span className="text-yellow-400">{req}</span>
                        </span>
                      ))}
                    </p>
                  </div>
                  <Alert className="bg-slate-700/50 border-slate-600 mt-4">
                    <AlertDescription className="text-slate-300">
                      <strong>Special Requirements:</strong> {stateRules.specialRequirements}
                    </AlertDescription>
                  </Alert>
                  <a
                    href={stateRules.departmentOfLaborUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    → View Department of Labor
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Prevailing Wages */}
            {prevailingWages.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">💰 Prevailing Wages - {selectedState}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prevailingWages.map((wage: any) => (
                      <div key={wage.id} className="bg-slate-700/50 p-3 rounded border border-slate-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-white">{wage.jobClassification}</p>
                            <p className="text-sm text-slate-400">{wage.skillLevel}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-400">${wage.totalHourlyRate.toFixed(2)}/hr</p>
                            <p className="text-xs text-slate-400">Base: ${wage.baseHourlyRate.toFixed(2)} + Fringe: ${wage.fringe.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Workers Comp Rates */}
            {workersCompRates.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">🏥 Workers Compensation Rates - {selectedState}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workersCompRates.map((rate: any) => (
                      <div key={rate.id} className="bg-slate-700/50 p-4 rounded border border-slate-600">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-white capitalize">{rate.industryClassification}</p>
                              <Badge className="text-xs mt-1" variant={rate.riskLevel === "high" ? "destructive" : "default"}>
                                {rate.riskLevel?.toUpperCase() || "N/A"}
                              </Badge>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-600">
                            <p className="text-sm text-slate-400">Rate of Payroll</p>
                            <p className="text-xl font-bold text-yellow-400">{rate.percentageOfPayroll.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Min Premium: ${rate.minimumPremiumPerEmployee || "N/A"}</p>
                            {rate.coverageRequired && <p className="text-xs text-blue-400 mt-1">✓ Coverage Required</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
