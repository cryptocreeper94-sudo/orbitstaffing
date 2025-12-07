import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Shield, DollarSign, Briefcase, MapPin } from "lucide-react";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail, CarouselRailItem } from "@/components/ui/carousel-rail";
import { PageHeader, SectionHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, StatCard } from "@/components/ui/orbit-card";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <PageHeader
          title="Compliance Dashboard"
          subtitle="State regulations, prevailing wages, and workers compensation rates for all 8 states"
          actions={
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[180px] bg-gradient-to-r from-slate-700 to-slate-600 text-white border-cyan-500/40 hover:border-cyan-500/70 transition-colors">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-cyan-500/40">
                {states.map((state) => (
                  <SelectItem key={state.code} value={state.code} className="text-white">
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 mt-4">Loading compliance data...</p>
          </div>
        ) : (
          <>
            {stateRules && (
              <BentoGrid cols={4} gap="md">
                <BentoTile>
                  <StatCard
                    label="Minimum Wage"
                    value={`$${Number(stateRules.minWagePerHour || 0).toFixed(2)}/hr`}
                    icon={<DollarSign className="w-6 h-6" />}
                  />
                </BentoTile>
                <BentoTile>
                  <StatCard
                    label="Workers Comp"
                    value={stateRules.workersCompRequired ? "Required" : "Optional"}
                    icon={<Shield className="w-6 h-6" />}
                  />
                </BentoTile>
                <BentoTile>
                  <StatCard
                    label="Prevailing Wage"
                    value={stateRules.prevailingWageApplies ? "Applies" : "N/A"}
                    icon={<Briefcase className="w-6 h-6" />}
                  />
                </BentoTile>
                <BentoTile>
                  <StatCard
                    label="Background Check"
                    value={stateRules.backgroundCheckRequired ? "Required" : "Optional"}
                    icon={<Shield className="w-6 h-6" />}
                  />
                </BentoTile>
              </BentoGrid>
            )}

            <BentoGrid cols={2} gap="lg">
              {stateRules && (
                <BentoTile>
                  <OrbitCard variant="default" hover={false} className="h-full border-0 bg-transparent p-0">
                    <OrbitCardHeader icon={<span className="text-2xl">📋</span>}>
                      <OrbitCardTitle>State Rules - {selectedState}</OrbitCardTitle>
                    </OrbitCardHeader>
                    <OrbitCardContent className="space-y-4">
                      <div className="space-y-3">
                        <span className="text-sm font-semibold text-slate-300">Requirements:</span>
                        <div className="flex flex-wrap gap-2">
                          {stateRules.workersCompRequired && (
                            <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg">
                              ✓ Workers Comp Required
                            </Badge>
                          )}
                          {stateRules.prevailingWageApplies && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
                              ✓ Prevailing Wage
                            </Badge>
                          )}
                          {stateRules.backgroundCheckRequired && (
                            <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg font-semibold"
                      >
                        View DOL <ExternalLink size={16} />
                      </a>
                    </OrbitCardContent>
                  </OrbitCard>
                </BentoTile>
              )}

              {prevailingWages.length > 0 && (
                <BentoTile>
                  <OrbitCard variant="default" hover={false} className="h-full border-0 bg-transparent p-0">
                    <OrbitCardHeader icon={<span className="text-2xl">💰</span>}>
                      <OrbitCardTitle>Prevailing Wages</OrbitCardTitle>
                    </OrbitCardHeader>
                    <OrbitCardContent className="space-y-3">
                      {prevailingWages.map((wage: any) => (
                        <div
                          key={wage.id}
                          className="bg-gradient-to-r from-slate-700/60 to-slate-600/40 p-4 rounded-lg border-l-4 border-green-500 hover:border-l-green-400 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-white text-lg">{wage.jobClassification}</p>
                              <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{wage.skillLevel}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-400">${Number(wage.totalHourlyRate || 0).toFixed(2)}/hr</p>
                              <p className="text-xs text-slate-400 mt-1">
                                Base: <span className="text-green-300">${Number(wage.baseHourlyRate || 0).toFixed(2)}</span> + <span className="text-emerald-300">${Number(wage.fringe || 0).toFixed(2)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </OrbitCardContent>
                  </OrbitCard>
                </BentoTile>
              )}
            </BentoGrid>

            {workersCompRates.length > 0 && (
              <div className="space-y-4">
                <SectionHeader
                  title="Workers Compensation Rates"
                  subtitle="Industry classification rates and coverage requirements"
                  eyebrow="Insurance"
                />
                
                <div className="hidden md:block">
                  <BentoGrid cols={3} gap="md">
                    {workersCompRates.map((rate: any) => (
                      <BentoTile key={rate.id}>
                        <OrbitCard variant="stat" hover className="h-full border-0 bg-transparent p-0">
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
                              <p className="text-2xl font-bold text-purple-300">{Number(rate.percentageOfPayroll || 0).toFixed(2)}%</p>
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="text-slate-400">Min Premium: <span className="text-amber-300 font-semibold">${rate.minimumPremiumPerEmployee}</span></p>
                              {rate.coverageRequired && <p className="text-green-400 text-xs font-semibold">✓ Coverage Required</p>}
                            </div>
                          </div>
                        </OrbitCard>
                      </BentoTile>
                    ))}
                  </BentoGrid>
                </div>

                <div className="md:hidden">
                  <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
                    {workersCompRates.map((rate: any) => (
                      <CarouselRailItem key={rate.id}>
                        <OrbitCard variant="stat" className="h-full min-w-[280px]">
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
                              <p className="text-2xl font-bold text-purple-300">{Number(rate.percentageOfPayroll || 0).toFixed(2)}%</p>
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="text-slate-400">Min Premium: <span className="text-amber-300 font-semibold">${rate.minimumPremiumPerEmployee}</span></p>
                              {rate.coverageRequired && <p className="text-green-400 text-xs font-semibold">✓ Coverage Required</p>}
                            </div>
                          </div>
                        </OrbitCard>
                      </CarouselRailItem>
                    ))}
                  </CarouselRail>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
