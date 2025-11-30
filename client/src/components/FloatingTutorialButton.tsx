import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial, PageTutorialContent, TUTORIAL_CONTENT } from "./PageTutorial";
import { useLocation } from "wouter";

const PAGE_TUTORIAL_MAP: Record<string, keyof typeof TUTORIAL_CONTENT> = {
  '/': 'landing',
  '/home': 'landing',
  '/admin': 'dashboard',
  '/developer': 'dashboard',
  '/pricing': 'pricing',
  '/payment-plans': 'pricing',
  '/crm': 'dashboard',
  '/admin/crm': 'dashboard',
  '/worker': 'workers',
  '/worker-portal': 'workers',
  '/apply': 'workers',
  '/admin/payroll-dashboard': 'payroll',
  '/payroll-processing': 'payroll',
  '/worker/payroll-portal': 'payroll',
  '/admin/assignment-dashboard': 'assignments',
  '/admin/worker-matching': 'assignments',
  '/admin/compliance': 'compliance',
  '/admin/compliance-monitor': 'compliance',
  '/worker/compliance': 'compliance',
  '/gps-clock-in': 'timeTracking',
  '/admin/timesheet-approval': 'timeTracking',
  '/talent-pool': 'workers',
  '/admin/talent-exchange': 'workers',
  '/employer-portal': 'clients',
  '/employer/portal': 'clients',
  '/employer/login': 'clients',
  '/employer/register': 'clients',
  '/client/request-workers': 'clients',
  '/employee-hub': 'employeeHub',
  '/my-hub': 'employeeHub',
  '/owner-hub': 'ownerHub',
  '/jobs': 'jobBoard',
  '/why-orbit': 'landing',
  '/roadmap': 'landing',
  '/professional-staffing': 'landing',
};

export function FloatingTutorialButton() {
  const [location] = useLocation();
  const { openTutorial, hasSeenTutorial } = useTutorial();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  const tutorialKey = PAGE_TUTORIAL_MAP[location];
  const content = tutorialKey ? TUTORIAL_CONTENT[tutorialKey] : null;

  useEffect(() => {
    if (content && !hasSeenTutorial(content.pageTitle)) {
      setShowPulse(true);
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, hasSeenTutorial]);

  if (!content) return null;

  const handleClick = () => {
    openTutorial(content);
    setShowPulse(false);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-8 left-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-16 left-0 w-64 p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 shadow-xl shadow-cyan-500/10"
          >
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold text-white">Need Help?</span>
            </div>
            <p className="text-sm text-slate-300 mb-3">
              Take a quick tour to learn how this page works and connects to everything else.
            </p>
            <Button
              onClick={handleClick}
              size="sm"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              data-testid="button-start-tour"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Start Tour
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        onMouseEnter={() => setIsExpanded(true)}
        className={`
          relative flex items-center justify-center w-14 h-14 rounded-full
          bg-gradient-to-br from-cyan-500 to-blue-600 text-white
          shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50
          transition-shadow duration-300
        `}
        data-testid="button-floating-tutorial"
      >
        <HelpCircle className="w-6 h-6" />
        
        {showPulse && (
          <>
            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-900">!</span>
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}

export function PageTutorialHeader({ 
  tutorialKey 
}: { 
  tutorialKey: keyof typeof TUTORIAL_CONTENT 
}) {
  const { openTutorial, hasSeenTutorial } = useTutorial();
  const content = TUTORIAL_CONTENT[tutorialKey];

  if (!content) return null;

  const hasSeen = hasSeenTutorial(content.pageTitle);

  return (
    <Button
      onClick={() => openTutorial(content)}
      variant="outline"
      size="sm"
      className="relative border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 gap-2"
      data-testid="button-header-tutorial"
    >
      <HelpCircle className="w-4 h-4" />
      <span className="hidden sm:inline">How It Works</span>
      {!hasSeen && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
      )}
    </Button>
  );
}
