import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Glow */}
        <div className="mb-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-lg rounded-lg" />
            <div className="relative bg-slate-900/80 backdrop-blur p-8 rounded-lg border border-cyan-500/30">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                Compliance Dashboard
              </h1>
              <p className="text-slate-300 text-lg">State regulations, prevailing wages, and workers compensation rates for all 8 states</p>
            </div>
          </div>
        </div>

        {/* State Selector with 3D Effect */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/30 to-amber-400/30 blur-lg rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
          <Card className="relative bg-slate-800/70 backdrop-blur border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl">📍 Select State</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="bg-gradient-to-r from-slate-700 to-slate-600 text-white border-orange-500/40 hover:border-orange-500/70 transition-colors shadow-lg hover:shadow-orange-500/50 hover:shadow-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-orange-500/40">
                  {states.map((state) => (
                    <SelectItem key={state.code} value={state.code} className="text-white">
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 mt-4">Loading compliance data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* State Compliance Rules */}
            {stateRules && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-lg group-hover:blur-xl transition-all duration-300 rounded-lg" />
                <Card className="relative bg-slate-800/80 backdrop-blur border-cyan-500/30 group-hover:border-cyan-500/60 transition-all duration-300 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-cyan-300 flex items-center gap-2">
                      <span className="text-2xl">📋</span> State Rules - {selectedState}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 text-slate-300">
                    <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 p-4 rounded-lg border border-green-500/30">
                      <span className="text-sm font-semibold text-slate-400">Minimum Wage</span>
                      <p className="text-3xl font-bold text-green-400 mt-2">${stateRules.minWagePerHour?.toFixed(2)}/hr</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-sm font-semibold text-slate-300">Requirements:</span>
                      <div className="flex flex-wrap gap-2">
                        {stateRules.workersCompRequired && (
                          <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:shadow-orange-500/50">
                            ✓ Workers Comp Required
                          </Badge>
                        )}
                        {stateRules.prevailingWageApplies && (
                          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-blue-500/50">
                            ✓ Prevailing Wage
                          </Badge>
                        )}
                        {stateRules.backgroundCheckRequired && (
                          <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:shadow-red-500/50">
                            ✓ Background Check
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <span className="text-sm font-semibold text-slate-300">License Requirements:</span>
                      <div className="text-sm space-y-1 mt-2">
                        {Object.entries(stateRules.licenseRequirementsPerTrade || {}).map(([trade, req]: any) => (
                          <p key={trade} className="text-slate-300">
                            • <span className="font-semibold capitalize">{trade}:</span> <span className="text-yellow-300">{req}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <Alert className="bg-slate-700/50 border-cyan-500/50">
                      <AlertDescription className="text-slate-300 text-sm">
                        {stateRules.specialRequirements}
                      </AlertDescription>
                    </Alert>

                    <a
                      href={stateRules.departmentOfLaborUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:shadow-xl font-semibold"
                    >
                      View DOL <ExternalLink size={16} />
                    </a>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Prevailing Wages */}
            {prevailingWages.length > 0 && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-lg group-hover:blur-xl transition-all duration-300 rounded-lg" />
                <Card className="relative bg-slate-800/80 backdrop-blur border-green-500/30 group-hover:border-green-500/60 transition-all duration-300 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-green-300 flex items-center gap-2">
                      <span className="text-2xl">💰</span> Prevailing Wages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {prevailingWages.map((wage: any) => (
                      <div
                        key={wage.id}
                        className="bg-gradient-to-r from-slate-700/60 to-slate-600/40 p-4 rounded-lg border-l-4 border-green-500 hover:border-l-green-400 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:translate-x-1"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-white text-lg">{wage.jobClassification}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{wage.skillLevel}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-400">${wage.totalHourlyRate?.toFixed(2)}/hr</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Base: <span className="text-green-300">${wage.baseHourlyRate?.toFixed(2)}</span> + <span className="text-emerald-300">${wage.fringe?.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Workers Comp Rates */}
            {workersCompRates.length > 0 && (
              <div className="relative group lg:col-span-2">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-lg group-hover:blur-xl transition-all duration-300 rounded-lg" />
                <Card className="relative bg-slate-800/80 backdrop-blur border-purple-500/30 group-hover:border-purple-500/60 transition-all duration-300 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <span className="text-2xl">🏥</span> Workers Compensation Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {workersCompRates.map((rate: any) => (
                        <div
                          key={rate.id}
                          className="relative group/card"
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 rounded-lg" />
                          <div className="relative bg-gradient-to-br from-slate-700/60 to-slate-600/40 p-4 rounded-lg border border-purple-500/30 group-hover/card:border-purple-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-105">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-white capitalize">{rate.industryClassification}</p>
                                <Badge
                                  className={`text-xs font-semibold ${
                                    rate.riskLevel === "high"
                                      ? "bg-red-600/80 text-red-100"
                                      : rate.riskLevel === "medium"
                                      ? "bg-yellow-600/80 text-yellow-100"
                                      : "bg-green-600/80 text-green-100"
                                  }`}
                                >
                                  {rate.riskLevel?.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="bg-slate-800/50 p-3 rounded border-l-4 border-purple-400">
                                <p className="text-xs text-slate-400 font-semibold">% of Payroll</p>
                                <p className="text-2xl font-bold text-purple-300">{rate.percentageOfPayroll?.toFixed(2)}%</p>
                              </div>
                              <div className="text-sm space-y-1">
                                <p className="text-slate-400">Min Premium: <span className="text-amber-300 font-semibold">${rate.minimumPremiumPerEmployee}</span></p>
                                {rate.coverageRequired && <p className="text-green-400 text-xs font-semibold">✓ Coverage Required</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
