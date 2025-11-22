import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Briefcase, X } from "lucide-react";
import { Link } from "wouter";

interface BusinessTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessTypeModal({ isOpen, onClose }: BusinessTypeModalProps) {
  const [selected, setSelected] = useState<"small" | "large" | null>(null);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      data-testid="modal-business-type"
      onClick={onClose}
    >
      <Card 
        className="max-w-2xl w-full border-primary/50 bg-background shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <CardHeader className="border-b border-border/50 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Choose Your Business Type</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Select which best describes your staffing operation</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            data-testid="button-close-modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-8 pb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {/* Small Business Option */}
            <div
              onClick={() => setSelected("small")}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selected === "small"
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
              }`}
              data-testid="option-small-business"
            >
              <Briefcase className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-2">Independent Staffing Agency</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You own & operate a single staffing company. You manage workers, clients, payroll, and billing yourself or with a small team.
              </p>
              <div className="text-xs text-primary font-medium">Example: Superior Staffing</div>
            </div>

            {/* Large Business Option */}
            <div
              onClick={() => setSelected("large")}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selected === "large"
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
              }`}
              data-testid="option-large-business"
            >
              <Building2 className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-lg mb-2">Enterprise / Parent Company</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You manage multiple staffing divisions, franchises, or subsidiaries. You need centralized oversight and multi-location support.
              </p>
              <div className="text-xs text-primary font-medium">Example: Fortune 500 Staffing Division</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {selected && (
              <Link href={selected === "small" ? "/small-business" : "/large-business"}>
                <a className="flex-1">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-continue">
                    Continue to {selected === "small" ? "Small Business" : "Enterprise"} Plan
                  </Button>
                </a>
              </Link>
            )}
            {!selected && (
              <Button className="w-full bg-primary/20 text-primary cursor-not-allowed" disabled>
                Select an option above to continue
              </Button>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Not sure? Pick the one that best describes your situation. You can always change it later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
