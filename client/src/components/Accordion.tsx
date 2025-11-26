import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionItem {
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => setExpanded(expanded === idx ? null : idx)}
          className="w-full text-left p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800/70 transition-all"
          data-testid={`accordion-item-${idx}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl">{item.icon}</span>
              <h3 className="font-semibold text-white text-sm sm:text-base">{item.title}</h3>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                expanded === idx ? "rotate-180" : ""
              }`}
            />
          </div>

          <AnimatePresence>
            {expanded === idx && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed"
              >
                {item.description}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      ))}
    </div>
  );
}
