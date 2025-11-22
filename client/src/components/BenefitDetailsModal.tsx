import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import saturnLogo from "@assets/generated_images/3d_saturn_with_dark_outline_and_shadow_depth.png";

interface BenefitDetail {
  id: string;
  title: string;
  brief: string;
  icon: string;
  detailed: string;
}

const benefits: BenefitDetail[] = [
  {
    id: "automate",
    title: "Automate Everything",
    brief: "Zero manual entry. Full automation.",
    icon: "⚡",
    detailed: "Stop wasting hours on spreadsheets, manual timesheets, and data entry. ORBIT automates your entire staffing lifecycle—from job posting and candidate matching to time tracking, payroll processing, invoicing, and compliance reporting. Your team goes from 15+ hours of manual work per week to zero. Our rules-based workflows handle edge cases automatically. Everything is audit-ready, timestamped, and logged. One platform. Complete control. Zero busy work."
  },
  {
    id: "workers",
    title: "Keep Workers Longer",
    brief: "3x longer retention. Loyalty bonuses.",
    icon: "👥",
    detailed: "Workers stay 3x longer when they earn loyalty bonuses. ORBIT's dual-tier bonus system (weekly performance + annual loyalty rewards) creates genuine incentives to show up reliably. Your workers earn $480-$5,000 annually in bonuses just for being consistent. They get instant pay on the ORBIT Card. They see real-time earnings. They feel valued. The result? Your turnover rate drops dramatically. Your training costs plummet. Your team becomes more skilled and reliable. Everyone wins."
  },
  {
    id: "money",
    title: "Save Real Money",
    brief: "35% cost reduction. 300-500% ROI.",
    icon: "💰",
    detailed: "Most staffing agencies waste $2,500-$5,000 per month per worker on turnover costs—hiring, training, lost productivity, no-shows. ORBIT's loyalty system costs $500-$1,000/month per worker in bonuses but saves you $2,500-$5,000 in turnover. That's 300-500% ROI. Plus, automation eliminates 15+ hours of administrative work per week (worth $1,500-$3,000/month). You also eliminate billing disputes with GPS-verified clock-in/out. All told, agencies using ORBIT save 35% on total staffing costs while improving worker satisfaction. That's not theoretical—that's real money in your pocket."
  },
  {
    id: "scale",
    title: "Scale Without Limits",
    brief: "Handle 10x workers with same team.",
    icon: "📈",
    detailed: "Traditional staffing agencies hit a wall around 100-150 workers because manual operations become impossible. ORBIT lets you scale to 1,000+ workers without adding staff. Your current team can now manage 10x more placements because everything is automated. Mobile app handles time tracking. System handles payroll. Invoices generate automatically. Compliance is built-in. You can open new markets, win bigger clients, take on more volume—without the headaches. Whether you're running one agency or franchising nationwide, ORBIT scales with you."
  }
];

interface ModalProps {
  isOpen: boolean;
  benefitId: string | null;
  onClose: () => void;
}

export function BenefitDetailsModal({ isOpen, benefitId, onClose }: ModalProps) {
  const benefit = benefits.find(b => b.id === benefitId);
  
  if (!isOpen || !benefit) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Saturn Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <img 
          src={saturnLogo}
          alt=""
          className="w-96 h-96 object-contain"
        />
      </div>

      {/* Modal Content */}
      <div 
        className="relative z-10 bg-background rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-primary/30"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary/20 to-primary/10 border-b border-primary/20 p-6 flex justify-between items-center gap-4">
          <div>
            <div className="text-4xl mb-2">{benefit.icon}</div>
            <h2 className="text-3xl font-bold text-foreground">{benefit.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:bg-primary/20 p-2 rounded-lg transition"
            data-testid="button-close-benefit"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-lg leading-relaxed text-foreground/90 mb-6">
            {benefit.detailed}
          </p>

          {/* Context-specific CTA */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground/70 mb-2 font-medium">Ready to see this in action?</p>
            <p className="text-xs text-muted-foreground">See how other staffing agencies are already winning with ORBIT.</p>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-3"
            data-testid="button-close-modal"
          >
            Back to Platform
          </Button>
        </div>
      </div>
    </div>
  );
}
