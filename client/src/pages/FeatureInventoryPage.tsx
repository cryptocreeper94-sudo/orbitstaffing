import { FeatureInventory } from "@/components/FeatureInventory";
import { PageWrapper, ContentSection } from "@/components/ui/page-wrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useLocation } from "wouter";

export default function FeatureInventoryPage() {
  const [, setLocation] = useLocation();

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <ContentSection>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/")}
                className="text-slate-400 hover:text-white"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Feature Inventory</h1>
                  <p className="text-slate-400 text-sm">ORBIT Staffing OS Complete Feature Checklist</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img 
                src="/mascot/orbit_mascot_cyan_saturn_style_transparent.png" 
                alt="Orby" 
                className="w-12 h-12 animate-float drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              />
            </div>
          </div>
        </ContentSection>

        <ContentSection delay={0.1}>
          <FeatureInventory />
        </ContentSection>
      </div>
    </PageWrapper>
  );
}
