import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ChevronDown, Briefcase, DollarSign, Calendar } from "lucide-react";
import { BentoGrid, BentoTile } from "@/components/ui/bento-grid";
import { CarouselRail } from "@/components/ui/carousel-rail";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardContent, OrbitCardHeader, OrbitCardTitle, StatCard } from "@/components/ui/orbit-card";
import { useIsMobile } from "@/hooks/use-mobile";

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

function ShiftOfferCard({ 
  offer, 
  expandedId, 
  setExpandedId, 
  onAccept 
}: { 
  offer: ShiftOffer; 
  expandedId: string | null; 
  setExpandedId: (id: string | null) => void;
  onAccept: (id: string) => void;
}) {
  return (
    <OrbitCard 
      variant="default" 
      className="h-full"
      data-testid={`card-shift-${offer.id}`}
    >
      <OrbitCardHeader>
        <div className="flex justify-between items-start w-full">
          <div className="flex-1">
            <OrbitCardTitle>{offer.jobTitle}</OrbitCardTitle>
            <p className="text-sm text-slate-400">{offer.company}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">${offer.pay}/hr</div>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs mt-1">
              Expires in {offer.expiresIn}
            </Badge>
          </div>
        </div>
      </OrbitCardHeader>
      
      <OrbitCardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />
              <span className="text-slate-400">{offer.startTime} - {offer.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
              <span className="text-slate-400">{offer.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap border-slate-600">
                {offer.jobType}
              </Badge>
            </div>
          </div>

          <div>
            <button 
              onClick={() => setExpandedId(expandedId === offer.id ? null : offer.id)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-3 transition-colors"
              data-testid={`button-requirements-${offer.id}`}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === offer.id ? 'rotate-180' : ''}`} />
              Requirements
            </button>

            {expandedId === offer.id && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700/50">
                <ul className="space-y-2">
                  {offer.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={() => onAccept(offer.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid={`button-accept-${offer.id}`}
              >
                ✓ Accept Shift
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-slate-600 hover:border-slate-500"
                data-testid={`button-decline-${offer.id}`}
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </OrbitCardContent>
    </OrbitCard>
  );
}

export function WorkerShiftOffers() {
  const [offers, setOffers] = useState<ShiftOffer[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isMobile = useIsMobile();

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

  const avgPay = offers.length > 0 
    ? Math.round(offers.reduce((sum, o) => sum + o.pay, 0) / offers.length) 
    : 0;

  const BackButton = (
    <button
      onClick={() => window.history.back()}
      className="text-slate-400 hover:text-white transition-colors p-2 -ml-2 min-h-[44px] flex items-center"
      data-testid="button-back"
      title="Back"
    >
      ← Back
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Shift Offers"
          subtitle="Click ACCEPT to quickly grab available shifts"
          breadcrumb={BackButton}
        />

        <BentoGrid cols={3} gap="md" className="mb-6">
          <BentoTile>
            <StatCard 
              label="Available Offers"
              value={offers.length}
              icon={<Briefcase className="w-5 h-5" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard 
              label="Avg. Pay Rate"
              value={`$${avgPay}/hr`}
              icon={<DollarSign className="w-5 h-5" />}
            />
          </BentoTile>
          <BentoTile>
            <StatCard 
              label="Expiring Soon"
              value={offers.filter(o => o.expiresIn.includes("min")).length}
              icon={<Calendar className="w-5 h-5" />}
            />
          </BentoTile>
        </BentoGrid>

        {offers.length === 0 ? (
          <BentoTile className="p-8">
            <OrbitCard variant="glass" className="text-center py-8">
              <OrbitCardContent>
                <p className="text-slate-400 mb-2">No active shift offers right now</p>
                <p className="text-sm text-slate-500">Check back soon or set your availability to get more offers</p>
              </OrbitCardContent>
            </OrbitCard>
          </BentoTile>
        ) : (
          <>
            {isMobile && (
              <CarouselRail 
                title="Available Shifts" 
                subtitle={`${offers.length} shifts available`}
                itemWidth="lg"
                gap="md"
                showArrows={false}
              >
                {offers.map((offer) => (
                  <div key={offer.id} className="w-[320px]">
                    <ShiftOfferCard 
                      offer={offer}
                      expandedId={expandedId}
                      setExpandedId={setExpandedId}
                      onAccept={handleAccept}
                    />
                  </div>
                ))}
              </CarouselRail>
            )}

            {!isMobile && (
              <BentoGrid cols={2} gap="md">
                {offers.map((offer) => (
                  <BentoTile key={offer.id}>
                    <ShiftOfferCard 
                      offer={offer}
                      expandedId={expandedId}
                      setExpandedId={setExpandedId}
                      onAccept={handleAccept}
                    />
                  </BentoTile>
                ))}
              </BentoGrid>
            )}
          </>
        )}
      </div>
    </div>
  );
}
