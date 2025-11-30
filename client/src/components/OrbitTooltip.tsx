import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

interface OrbitTooltipProps {
  term: string;
  definition: string;
  children?: ReactNode;
  showIcon?: boolean;
}

const MASCOT_IMAGE = "/mascot/orbit_mascot_pointing_helpful_transparent.png";

export function OrbitTooltip({ term, definition, children, showIcon = true }: OrbitTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      {children || <span className="border-b border-dashed border-cyan-400/50 cursor-help">{term}</span>}
      
      {showIcon && (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center w-4 h-4 text-cyan-400 hover:text-cyan-300 transition-colors"
          data-testid={`tooltip-trigger-${term.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[151] flex flex-col items-center"
            >
              <div className="relative bg-white rounded-2xl p-5 shadow-2xl border-4 border-slate-800 max-w-sm mx-4">
                <div 
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "16px solid transparent",
                    borderRight: "16px solid transparent",
                    borderTop: "20px solid #1e293b",
                  }}
                />
                <div 
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderTop: "16px solid white",
                  }}
                />
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors shadow-lg"
                  data-testid="button-tooltip-close"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {term}
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {definition}
                </p>
              </div>
              
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4"
              >
                <img
                  src={MASCOT_IMAGE}
                  alt="Orbit explains"
                  className="w-24 h-24 object-contain drop-shadow-2xl"
                  style={{ filter: "drop-shadow(0 10px 20px rgba(6, 182, 212, 0.4))" }}
                />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  );
}

export function OrbitDefinitionCard({ 
  term, 
  definition, 
  icon 
}: { 
  term: string; 
  definition: string; 
  icon?: ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="bg-slate-800/50 rounded-xl border border-cyan-500/20 p-4 cursor-pointer card-hover"
      onClick={() => setIsExpanded(!isExpanded)}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-white flex items-center gap-2">
            {term}
            <HelpCircle className="w-4 h-4 text-cyan-400/60" />
          </h4>
          <AnimatePresence>
            {isExpanded && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-sm text-slate-300 mt-2"
              >
                {definition}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export const ORBIT_DEFINITIONS: Record<string, string> = {
  "Hallmark": "A unique digital certificate that verifies the authenticity of any document or asset created in ORBIT. Each Hallmark is cryptographically signed and can be verified on the blockchain.",
  "Talent Exchange": "ORBIT's two-way job marketplace where workers can find opportunities and employers can discover talent. Features smart matching based on skills, location, and availability.",
  "Pay Card": "ORBIT's branded Visa debit card that allows workers to receive instant pay, eliminating wait times for traditional payroll processing.",
  "CSA": "Client Service Agreement - A contract between your staffing agency and a client that outlines terms, rates, and conditions for providing temporary workers.",
  "Prevailing Wage": "Government-mandated minimum wages for specific job classifications, often required on public works projects. ORBIT automatically calculates these based on location.",
  "I-9 Verification": "Federal requirement to verify employment eligibility for all workers. ORBIT tracks I-9 status and sends compliance reminders.",
  "GPS Clock-In": "Location-verified time tracking that confirms workers are at the correct job site when clocking in or out.",
  "White-Label": "The ability to rebrand ORBIT with your own company's logo, colors, and domain while using all of ORBIT's technology.",
  "Franchise": "A licensed business model where agencies purchase the right to operate under the ORBIT brand with dedicated support and territory rights.",
  "Multi-Tenant": "Architecture that allows multiple separate companies to use the same platform while keeping their data completely isolated and secure.",
  "Blockchain Anchoring": "The process of recording document hashes on the Solana blockchain to create permanent, tamper-proof verification of authenticity.",
  "Merkle Tree": "A data structure used to efficiently batch multiple document hashes into a single blockchain transaction, reducing costs.",
};
