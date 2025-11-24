import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign, ChevronDown } from "lucide-react";

interface ShiftOffer {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startTime: string;
  endTime: string;
  pay: number;
  jobType: string;
  expiresIn: string;
  requirements: string[];
}

export function WorkerShiftOffers() {
  const [offers, setOffers] = useState<ShiftOffer[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const mockOffers: ShiftOffer[] = [
      {
        id: "1",
        jobTitle: "Commercial HVAC Install",
        company: "Superior Staffing",
        location: "Downtown Nashville, TN",
        startTime: "08:00 AM",
        endTime: "04:00 PM",
        pay: 35,
        jobType: "Skilled Trade",
        expiresIn: "45 min",
        requirements: ["HVAC Certification", "Valid Driver License"],
      },
      {
        id: "2",
        jobTitle: "Warehouse Picker",
        company: "Logistics Co.",
        location: "2 miles away",
        startTime: "02:00 PM",
        endTime: "10:00 PM",
        pay: 18,
        jobType: "General Labor",
        expiresIn: "1 hour",
        requirements: ["Lifting 50 lbs", "Standing 8 hours"],
      },
      {
        id: "3",
        jobTitle: "Event Security",
        company: "Event Staffing Plus",
        location: "Bridgestone Arena",
        startTime: "06:00 PM",
        endTime: "02:00 AM",
        pay: 22,
        jobType: "Security",
        expiresIn: "2 hours",
        requirements: ["Security License", "Professional Attire"],
      },
    ];
    setOffers(mockOffers);
  }, []);

  const handleAccept = (offerId: string) => {
    setOffers(offers.filter(o => o.id !== offerId));
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-white transition-colors p-2 -ml-2 min-h-[44px] flex items-center"
            data-testid="button-back"
            title="Back"
          >
            ← Back
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">Shift Offers</h1>
          <p className="text-xs sm:text-base text-gray-400">Click ACCEPT to quickly grab available shifts</p>
        </div>

        {offers.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-muted-foreground mb-2">No active shift offers right now</p>
              <p className="text-sm text-muted-foreground">Check back soon or set your availability to get more offers</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <Card key={offer.id} className="bg-card/50 border-border/50 hover:border-emerald-500/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Top Row */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{offer.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground">{offer.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-400">${offer.pay}/hr</div>
                        <Badge className="bg-red-500/20 text-red-600 text-xs mt-1">Expires in {offer.expiresIn}</Badge>
                      </div>
                    </div>

                    {/* Key Details - Mobile Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-muted-foreground">{offer.startTime} - {offer.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
                        <span className="text-muted-foreground">{offer.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap">{offer.jobType}</Badge>
                      </div>
                    </div>

                    {/* Requirements & Actions */}
                    <div>
                      <button 
                        onClick={() => setExpandedId(expandedId === offer.id ? null : offer.id)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === offer.id ? 'rotate-180' : ''}`} />
                        Requirements
                      </button>

                      {expandedId === offer.id && (
                        <div className="bg-slate-800/30 rounded-lg p-4 mb-4 border border-slate-700/30">
                          <ul className="space-y-2">
                            {offer.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleAccept(offer.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          data-testid={`button-accept-${offer.id}`}
                        >
                          ✓ Accept Shift
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          data-testid={`button-decline-${offer.id}`}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
