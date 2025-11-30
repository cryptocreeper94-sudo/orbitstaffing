import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  X, ChevronLeft, ChevronRight, Play, HelpCircle, 
  Lightbulb, ArrowRight, CheckCircle2, Sparkles,
  LayoutDashboard, Users, Building2, Calendar, DollarSign,
  FileText, Shield, Clock, MapPin, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrbitMascot } from "./OrbitMascot";

const connectionRoutes: Record<string, string> = {
  "Job Board": "/talent-exchange",
  "Employer Portal": "/employer/register",
  "Owner Hub": "/owner-hub",
  "Pricing": "/pricing",
  "Free Trial": "/pricing",
  "Contact Sales": "/sales",
  "Workers": "/admin/workers",
  "Assignments": "/admin/assignments",
  "Payroll": "/admin/payroll",
  "Settings": "/settings",
  "Compliance": "/admin/compliance",
  "Clients": "/admin/clients",
  "Invoicing": "/admin/invoicing",
  "Reports": "/admin/reports",
  "Scheduling": "/admin/scheduling",
  "Dashboard": "/dashboard",
};

export interface TutorialSlide {
  title: string;
  description: string;
  icon?: ReactNode;
  tips?: string[];
  connections?: string[];
  highlight?: string;
}

export interface PageTutorialContent {
  pageTitle: string;
  pageIcon: ReactNode;
  introduction: string;
  slides: TutorialSlide[];
}

interface TutorialContextType {
  isOpen: boolean;
  openTutorial: (content: PageTutorialContent) => void;
  closeTutorial: () => void;
  currentContent: PageTutorialContent | null;
  hasSeenTutorial: (pageId: string) => boolean;
  markTutorialSeen: (pageId: string) => void;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<PageTutorialContent | null>(null);
  const [seenTutorials, setSeenTutorials] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('orbit_seen_tutorials');
    if (saved) {
      setSeenTutorials(new Set(JSON.parse(saved)));
    }
  }, []);

  const openTutorial = (content: PageTutorialContent) => {
    setCurrentContent(content);
    setIsOpen(true);
  };

  const closeTutorial = () => {
    setIsOpen(false);
  };

  const hasSeenTutorial = (pageId: string) => seenTutorials.has(pageId);

  const markTutorialSeen = (pageId: string) => {
    const updated = new Set(seenTutorials);
    updated.add(pageId);
    setSeenTutorials(updated);
    localStorage.setItem('orbit_seen_tutorials', JSON.stringify(Array.from(updated)));
  };

  return (
    <TutorialContext.Provider value={{ 
      isOpen, openTutorial, closeTutorial, currentContent,
      hasSeenTutorial, markTutorialSeen 
    }}>
      {children}
      <TutorialModal />
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) throw new Error("useTutorial must be used within TutorialProvider");
  return context;
}

function TutorialModal() {
  const { isOpen, closeTutorial, currentContent, markTutorialSeen } = useTutorial();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [, navigate] = useLocation();

  const handleConnectionClick = (connectionName: string) => {
    const route = connectionRoutes[connectionName];
    if (route) {
      markTutorialSeen(currentContent?.pageTitle || '');
      closeTutorial();
      navigate(route);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setShowIntro(true);
    }
  }, [isOpen, currentContent]);

  if (!isOpen || !currentContent) return null;

  const totalSlides = currentContent.slides.length;
  const slide = currentContent.slides[currentSlide];

  const handleNext = () => {
    if (showIntro) {
      setShowIntro(false);
    } else if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      markTutorialSeen(currentContent.pageTitle);
      closeTutorial();
    }
  };

  const handlePrev = () => {
    if (showIntro) return;
    if (currentSlide === 0) {
      setShowIntro(true);
    } else {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleClose = () => {
    markTutorialSeen(currentContent.pageTitle);
    closeTutorial();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/30 rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-cyan-500/20 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-1.5 sm:h-2 bg-slate-700 flex-shrink-0">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ 
                width: showIntro ? '5%' : `${((currentSlide + 1) / totalSlides) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-3 sm:p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-cyan-500/20 text-cyan-400">
                  {currentContent.pageIcon}
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-white">{currentContent.pageTitle}</h2>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {showIntro ? 'Getting Started' : `Step ${currentSlide + 1} of ${totalSlides}`}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 w-8 sm:h-10 sm:w-10"
                data-testid="button-close-tutorial"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {showIntro ? (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="min-h-[180px] sm:min-h-[250px] flex flex-col items-center justify-center text-center py-2"
                >
                  <OrbitMascot pose="wave" size="md" />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 sm:mt-4 bg-slate-800/50 border border-cyan-500/20 rounded-xl sm:rounded-2xl p-2 sm:p-4 max-w-sm"
                  >
                    <p className="text-cyan-300 font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">Hey there! I'm Orbit!</p>
                    <p className="text-slate-400 text-xs">Your guide to {currentContent.pageTitle}</p>
                  </motion.div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-4 mt-4 sm:mt-6">
                    Welcome to {currentContent.pageTitle}
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-lg max-w-md leading-relaxed px-2">
                    {currentContent.introduction}
                  </p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 sm:mt-8 flex items-center gap-2 text-cyan-400"
                  >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Click Next to start</span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="min-h-[180px] sm:min-h-[250px]"
                >
                  <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-6">
                    <div className="shrink-0 hidden sm:block">
                      <OrbitMascot pose="point" size="sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        {slide.icon && (
                          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                            {slide.icon}
                          </div>
                        )}
                        <h3 className="text-base sm:text-xl font-semibold text-white">{slide.title}</h3>
                      </div>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{slide.description}</p>
                    </div>
                  </div>

                  {slide.highlight && (
                    <div className="mb-3 sm:mb-4 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center gap-2 text-amber-400 mb-0.5 sm:mb-1">
                        <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium text-xs sm:text-sm">Pro Tip</span>
                      </div>
                      <p className="text-amber-200/80 text-xs sm:text-sm">{slide.highlight}</p>
                    </div>
                  )}

                  {slide.tips && slide.tips.length > 0 && (
                    <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2">Key Features:</p>
                      {slide.tips.map((tip, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-1.5 sm:gap-2"
                        >
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 shrink-0" />
                          <span className="text-slate-300 text-xs sm:text-sm">{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {slide.connections && slide.connections.length > 0 && (
                    <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800/50 border border-slate-700">
                      <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        Connects To:
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {slide.connections.map((conn, i) => (
                          <button 
                            key={i}
                            onClick={() => handleConnectionClick(conn)}
                            className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium hover:bg-cyan-500/40 hover:text-white transition-all cursor-pointer active:scale-95"
                            data-testid={`button-connection-${conn.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {conn}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-t border-slate-700 bg-slate-900/50">
            <div className="flex gap-1 sm:gap-1.5 flex-wrap max-w-[100px] sm:max-w-none">
              {[...Array(totalSlides)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setShowIntro(false); setCurrentSlide(i); }}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                    !showIntro && i === currentSlide 
                      ? 'bg-cyan-400 w-4 sm:w-6' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                  data-testid={`button-slide-${i}`}
                />
              ))}
            </div>

            <div className="flex gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={showIntro}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
                data-testid="button-tutorial-prev"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
                data-testid="button-tutorial-next"
              >
                <span className="sm:hidden">{showIntro ? 'Start' : currentSlide === totalSlides - 1 ? 'Done' : 'Next'}</span>
                <span className="hidden sm:inline">{showIntro ? 'Start Tour' : currentSlide === totalSlides - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TutorialButton({ 
  content, 
  variant = "icon",
  className = ""
}: { 
  content: PageTutorialContent;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { openTutorial, hasSeenTutorial } = useTutorial();
  const hasSeen = hasSeenTutorial(content.pageTitle);

  return (
    <Button
      onClick={() => openTutorial(content)}
      variant="outline"
      size={variant === "icon" ? "icon" : "default"}
      className={`relative border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 ${className}`}
      data-testid="button-page-tutorial"
    >
      <HelpCircle className="w-4 h-4" />
      {variant === "full" && <span className="ml-2">How It Works</span>}
      {!hasSeen && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
      )}
    </Button>
  );
}

export const TUTORIAL_CONTENT: Record<string, PageTutorialContent> = {
  landing: {
    pageTitle: "Welcome to ORBIT",
    pageIcon: <Sparkles className="w-5 h-5" />,
    introduction: "ORBIT Staffing OS is your complete solution for managing temporary workers. Let's take a quick tour of what you can do here.",
    slides: [
      {
        title: "Choose Your Path",
        description: "ORBIT serves three types of users: Workers looking for jobs, Employers hiring talent, and Agency Owners managing operations. Select your role to get started.",
        icon: <Users className="w-6 h-6" />,
        tips: [
          "Workers: Find shifts, track hours, get paid",
          "Employers: Post jobs, hire fast, manage teams",
          "Owners: Full staffing agency management"
        ],
        connections: ["Job Board", "Employer Portal", "Owner Hub"]
      },
      {
        title: "Explore Our Tools",
        description: "Each module is designed to work standalone or together. Start with what you need, add more as you grow.",
        icon: <LayoutDashboard className="w-6 h-6" />,
        tips: [
          "CRM - Manage contacts and relationships",
          "Payroll - Multi-state compliant processing",
          "Time & GPS - Accurate hour tracking",
          "Compliance - Stay audit-ready"
        ],
        highlight: "Save up to 95% compared to competitors like Bullhorn!"
      },
      {
        title: "Ready to Start?",
        description: "Create a free account to explore all features. No credit card required. Upgrade anytime as your needs grow.",
        icon: <CheckCircle2 className="w-6 h-6" />,
        tips: [
          "Free 14-day trial on all bundles",
          "No long-term contracts required",
          "24/7 support available"
        ],
        connections: ["Pricing", "Free Trial", "Contact Sales"]
      }
    ]
  },
  dashboard: {
    pageTitle: "Dashboard",
    pageIcon: <LayoutDashboard className="w-5 h-5" />,
    introduction: "Your command center for managing all staffing operations. Get real-time insights into workers, assignments, and payroll at a glance.",
    slides: [
      {
        title: "Real-Time Overview",
        description: "The dashboard shows live statistics including active workers, pending assignments, and payroll totals. All numbers update automatically as your team works.",
        icon: <LayoutDashboard className="w-6 h-6" />,
        tips: [
          "Click any stat card to jump to that section",
          "Charts show trends over the past 30 days",
          "Red indicators mean items need attention"
        ],
        connections: ["Workers", "Assignments", "Payroll"]
      },
      {
        title: "Quick Actions",
        description: "Common tasks are just one click away. Add new workers, create assignments, or run payroll directly from the dashboard without navigating away.",
        icon: <Sparkles className="w-6 h-6" />,
        tips: [
          "Use keyboard shortcuts for faster access",
          "Recent activity shows the last 10 actions",
          "Pin your most-used actions to the top"
        ],
        highlight: "Double-click any card to expand it full screen!"
      },
      {
        title: "Notifications Center",
        description: "Stay informed with real-time alerts for new assignments, time-off requests, compliance deadlines, and more. Never miss important updates.",
        icon: <MessageSquare className="w-6 h-6" />,
        tips: [
          "Click the bell icon to see all notifications",
          "Mark as read or snooze for later",
          "Set custom notification preferences"
        ],
        connections: ["Settings", "Workers", "Compliance"]
      }
    ]
  },
  workers: {
    pageTitle: "Workers Management",
    pageIcon: <Users className="w-5 h-5" />,
    introduction: "Manage your entire workforce from one place. Add workers, track certifications, manage availability, and monitor performance.",
    slides: [
      {
        title: "Worker Profiles",
        description: "Each worker has a complete profile with contact info, skills, certifications, and work history. Everything you need to make smart assignment decisions.",
        icon: <Users className="w-6 h-6" />,
        tips: [
          "Click a worker's name to view their full profile",
          "Stars indicate worker rating and reliability",
          "Tags show skills and certifications"
        ],
        connections: ["Assignments", "Payroll", "Compliance"]
      },
      {
        title: "Onboarding Flow",
        description: "New workers go through a guided onboarding process. Track I-9 verification, background checks, and required training all in one place.",
        icon: <CheckCircle2 className="w-6 h-6" />,
        tips: [
          "Incomplete onboarding shows yellow warning",
          "Send reminders with one click",
          "Bulk approve multiple workers at once"
        ],
        highlight: "Workers with incomplete onboarding cannot be assigned to jobs!"
      },
      {
        title: "Availability Calendar",
        description: "See when workers are available at a glance. The heatmap shows popular days and helps you plan shifts more effectively.",
        icon: <Calendar className="w-6 h-6" />,
        tips: [
          "Green means available, red means unavailable",
          "Workers can update their own availability",
          "Filter by date range or skill type"
        ],
        connections: ["Assignments", "Scheduling"]
      }
    ]
  },
  clients: {
    pageTitle: "Client Management",
    pageIcon: <Building2 className="w-5 h-5" />,
    introduction: "Build and manage relationships with your client companies. Track contacts, job sites, billing preferences, and service history.",
    slides: [
      {
        title: "Client Profiles",
        description: "Store all client information including multiple contacts, job site locations, billing details, and special requirements for each company.",
        icon: <Building2 className="w-6 h-6" />,
        tips: [
          "Add multiple contacts per client",
          "Set default billing and payment terms",
          "Track client-specific pay rates"
        ],
        connections: ["Assignments", "Invoicing", "Payroll"]
      },
      {
        title: "Job Sites",
        description: "Each client can have multiple job sites with GPS coordinates for accurate time tracking. Set site-specific rules and requirements.",
        icon: <MapPin className="w-6 h-6" />,
        tips: [
          "GPS geofencing ensures accurate clock-in",
          "Set safety requirements per site",
          "View site history and performance"
        ],
        highlight: "Workers must be within 300 feet of the job site to clock in!"
      },
      {
        title: "Billing & Invoicing",
        description: "Set up billing preferences, payment terms, and auto-generate invoices based on completed work. Track payment status and send reminders.",
        icon: <DollarSign className="w-6 h-6" />,
        tips: [
          "Auto-generate weekly or monthly invoices",
          "Add markup percentages per client",
          "Track outstanding balances"
        ],
        connections: ["Invoicing", "Reports", "Payroll"]
      }
    ]
  },
  assignments: {
    pageTitle: "Assignments & Scheduling",
    pageIcon: <Calendar className="w-5 h-5" />,
    introduction: "Create and manage work assignments. Match the right workers to the right jobs based on skills, availability, and location.",
    slides: [
      {
        title: "Creating Assignments",
        description: "Build assignments by selecting a client, job site, and required skills. The system automatically suggests available workers who match.",
        icon: <Calendar className="w-6 h-6" />,
        tips: [
          "Set start/end dates and shift times",
          "Specify required certifications",
          "Add special instructions for workers"
        ],
        connections: ["Workers", "Clients", "Payroll"]
      },
      {
        title: "Worker Matching",
        description: "Our smart matching system ranks workers by skill match, distance to job site, and past performance. Assign the best fit with one click.",
        icon: <Users className="w-6 h-6" />,
        tips: [
          "Green checkmarks show matching skills",
          "Star ratings indicate reliability",
          "Distance shows travel time to site"
        ],
        highlight: "Use bulk assign to fill multiple positions at once!"
      },
      {
        title: "Real-Time Tracking",
        description: "Monitor assignments as they happen. See who clocked in, track hours, and get alerts for no-shows or late arrivals.",
        icon: <Clock className="w-6 h-6" />,
        tips: [
          "Live map shows worker locations",
          "Instant alerts for attendance issues",
          "Approve timesheets on the go"
        ],
        connections: ["Time Tracking", "Payroll", "Reports"]
      }
    ]
  },
  payroll: {
    pageTitle: "Payroll Management",
    pageIcon: <DollarSign className="w-5 h-5" />,
    introduction: "Process accurate, compliant payroll with ease. Calculate wages, handle deductions, and generate paystubs automatically.",
    slides: [
      {
        title: "Payroll Processing",
        description: "Run payroll with a few clicks. The system calculates regular and overtime hours, applies tax rules, and handles deductions automatically.",
        icon: <DollarSign className="w-6 h-6" />,
        tips: [
          "Review time entries before processing",
          "Multi-state tax compliance built-in",
          "Garnishment processing included"
        ],
        connections: ["Time Tracking", "Workers", "Reports"]
      },
      {
        title: "Deductions & Garnishments",
        description: "Manage court-ordered garnishments, benefits deductions, and advances. The system tracks limits and applies payments correctly.",
        icon: <FileText className="w-6 h-6" />,
        tips: [
          "Upload garnishment documents",
          "Automatic limit tracking",
          "Payment history for audits"
        ],
        highlight: "Federal limits protect workers from over-garnishment!"
      },
      {
        title: "Paystubs & Reports",
        description: "Generate professional paystubs with your branding. Export detailed reports for accounting, compliance, and tax filing.",
        icon: <FileText className="w-6 h-6" />,
        tips: [
          "PDF paystubs with your logo",
          "Export to QuickBooks format",
          "Year-end tax document prep"
        ],
        connections: ["Reports", "Workers", "Compliance"]
      }
    ]
  },
  compliance: {
    pageTitle: "Compliance Center",
    pageIcon: <Shield className="w-5 h-5" />,
    introduction: "Stay compliant with labor laws, safety requirements, and documentation needs. Track certifications and get alerts before they expire.",
    slides: [
      {
        title: "Document Management",
        description: "Store and track all required documents including I-9s, W-4s, certifications, and licenses. Get alerts when documents are expiring.",
        icon: <FileText className="w-6 h-6" />,
        tips: [
          "Automatic expiration reminders",
          "Secure document storage",
          "Easy document uploads"
        ],
        connections: ["Workers", "Onboarding", "Reports"]
      },
      {
        title: "Certification Tracking",
        description: "Track worker certifications like OSHA, forklift licenses, and safety training. Prevent non-certified workers from being assigned to jobs.",
        icon: <Shield className="w-6 h-6" />,
        tips: [
          "Color-coded expiration status",
          "Bulk renewal reminders",
          "Assignment blocking for expired certs"
        ],
        highlight: "Set up auto-renewal reminders 30, 60, or 90 days in advance!"
      },
      {
        title: "Audit Trail",
        description: "Every action is logged for compliance purposes. Track who did what, when, and why. Export reports for audits and investigations.",
        icon: <Clock className="w-6 h-6" />,
        tips: [
          "Complete action history",
          "User activity tracking",
          "Exportable audit reports"
        ],
        connections: ["Settings", "Reports", "Security"]
      }
    ]
  },
  pricing: {
    pageTitle: "Pricing & Plans",
    pageIcon: <DollarSign className="w-5 h-5" />,
    introduction: "Choose the perfect plan for your staffing agency. Start with individual tools or get everything with our all-in-one bundles.",
    slides: [
      {
        title: "Standalone Tools",
        description: "Start with just what you need. Each tool works independently and can be added or removed anytime. Perfect for agencies with specific needs.",
        icon: <Sparkles className="w-6 h-6" />,
        tips: [
          "CRM - $19/mo for contact management",
          "Talent Exchange - $29/mo for job board",
          "Payroll - $39/mo for multi-state payroll",
          "Time & GPS - $15/mo for time tracking",
          "Compliance - $25/mo for document management"
        ],
        highlight: "Save up to 40% by bundling tools together!"
      },
      {
        title: "Platform Bundles",
        description: "Get everything you need in one package. Bundles include all tools plus premium features, priority support, and volume discounts.",
        icon: <LayoutDashboard className="w-6 h-6" />,
        tips: [
          "Starter ($99/mo) - Up to 25 workers",
          "Growth ($149/mo) - Up to 100 workers",
          "Professional ($249/mo) - Up to 500 workers",
          "Enterprise - Custom pricing for 500+"
        ],
        connections: ["Contact Sales", "Free Trial"]
      },
      {
        title: "Affiliate Program",
        description: "Earn money by referring other agencies! Get 20-40% commission on all referred subscriptions. Perfect for consultants and industry partners.",
        icon: <Users className="w-6 h-6" />,
        tips: [
          "20% base commission on all referrals",
          "Bonus tiers for high performers",
          "Monthly payouts via PayPal or check",
          "Custom tracking links and dashboard"
        ],
        highlight: "Top affiliates earn $5,000+ per month!"
      }
    ]
  },
  timeTracking: {
    pageTitle: "Time & GPS Tracking",
    pageIcon: <Clock className="w-5 h-5" />,
    introduction: "Track time accurately with GPS verification. Workers clock in and out from their phones, and you see everything in real-time.",
    slides: [
      {
        title: "GPS Clock-In/Out",
        description: "Workers must be at the job site to clock in. GPS coordinates are captured and verified against the job site location automatically.",
        icon: <MapPin className="w-6 h-6" />,
        tips: [
          "300-foot geofence accuracy",
          "Photo verification option",
          "Works offline and syncs later"
        ],
        connections: ["Assignments", "Payroll", "Reports"]
      },
      {
        title: "Timesheet Approval",
        description: "Review and approve timesheets before payroll. See discrepancies, add notes, and make adjustments as needed.",
        icon: <CheckCircle2 className="w-6 h-6" />,
        tips: [
          "Bulk approve or reject",
          "Add supervisor notes",
          "Track edit history"
        ],
        highlight: "Timesheets auto-lock after payroll processing!"
      },
      {
        title: "Break Tracking",
        description: "Ensure compliance with break requirements. The system tracks meal and rest breaks and alerts supervisors to violations.",
        icon: <Clock className="w-6 h-6" />,
        tips: [
          "State-specific break rules",
          "Auto-deduct unpaid breaks",
          "Waiver tracking for long shifts"
        ],
        connections: ["Compliance", "Payroll", "Workers"]
      }
    ]
  },
  employeeHub: {
    pageTitle: "Employee Hub",
    pageIcon: <Users className="w-5 h-5" />,
    introduction: "Your personal dashboard for managing your work life. View shifts, track hours, see earnings, and stay connected with your agency.",
    slides: [
      {
        title: "Your Schedule",
        description: "See all your upcoming shifts in one place. Accept or decline new offers, request time off, and set your availability for the week.",
        icon: <Calendar className="w-6 h-6" />,
        tips: [
          "Swipe to accept or decline shifts",
          "Set recurring availability patterns",
          "Get notified of new opportunities"
        ],
        connections: ["Shift Offers", "Availability", "Time Off"]
      },
      {
        title: "Time & Earnings",
        description: "Track your hours and see your earnings in real-time. View paystubs, understand deductions, and track your work history.",
        icon: <DollarSign className="w-6 h-6" />,
        tips: [
          "Clock in/out with GPS verification",
          "View detailed pay breakdowns",
          "Download paystubs anytime"
        ],
        highlight: "Enable direct deposit for fastest payments!"
      },
      {
        title: "Profile & Documents",
        description: "Keep your profile updated with current certifications, contact info, and skills. Upload required documents and track expiration dates.",
        icon: <FileText className="w-6 h-6" />,
        tips: [
          "Add skills to get more job matches",
          "Upload certifications for verification",
          "Update contact info anytime"
        ],
        connections: ["Compliance", "Job Matching", "Profile"]
      }
    ]
  },
  jobBoard: {
    pageTitle: "Job Board",
    pageIcon: <Calendar className="w-5 h-5" />,
    introduction: "Find your next opportunity! Browse available shifts, filter by location and pay, and apply with one click.",
    slides: [
      {
        title: "Browse Opportunities",
        description: "See all available jobs in your area. Filter by industry, pay rate, distance, and schedule to find the perfect fit.",
        icon: <Calendar className="w-6 h-6" />,
        tips: [
          "Save your favorite filters",
          "Set alerts for new postings",
          "View detailed job requirements"
        ],
        connections: ["My Applications", "Saved Jobs", "Profile"]
      },
      {
        title: "Apply Instantly",
        description: "One-click applications for jobs you qualify for. Your profile, certifications, and availability are shared automatically.",
        icon: <CheckCircle2 className="w-6 h-6" />,
        tips: [
          "Complete your profile for instant apply",
          "Track application status in real-time",
          "Employers can contact you directly"
        ],
        highlight: "Workers with complete profiles get 3x more offers!"
      },
      {
        title: "Smart Matching",
        description: "Our AI matches you with jobs based on your skills, location, and preferences. Get personalized recommendations every day.",
        icon: <Sparkles className="w-6 h-6" />,
        tips: [
          "Rate jobs to improve matches",
          "Set preferred industries and shifts",
          "Get notified of perfect matches"
        ],
        connections: ["Profile", "Preferences", "Notifications"]
      }
    ]
  },
  ownerHub: {
    pageTitle: "Owner Hub",
    pageIcon: <Building2 className="w-5 h-5" />,
    introduction: "Your business command center. Monitor revenue, manage clients, oversee staff, and make data-driven decisions.",
    slides: [
      {
        title: "Business Overview",
        description: "See your key metrics at a glance: revenue, active workers, client satisfaction, and profit margins. Track trends over time.",
        icon: <LayoutDashboard className="w-6 h-6" />,
        tips: [
          "Customize your dashboard widgets",
          "Set goals and track progress",
          "Compare to industry benchmarks"
        ],
        connections: ["Reports", "Analytics", "Goals"]
      },
      {
        title: "Client Management",
        description: "Manage all your client relationships. Track contracts, monitor satisfaction, and identify growth opportunities.",
        icon: <Building2 className="w-6 h-6" />,
        tips: [
          "View client profitability",
          "Track contract renewals",
          "Manage multiple locations"
        ],
        highlight: "Use the CRM to automate follow-ups and close more deals!"
      },
      {
        title: "Team Performance",
        description: "Monitor your internal team and field workers. Track productivity, manage payroll costs, and identify top performers.",
        icon: <Users className="w-6 h-6" />,
        tips: [
          "View worker reliability scores",
          "Track payroll as % of revenue",
          "Identify training opportunities"
        ],
        connections: ["Workers", "Payroll", "Reports"]
      }
    ]
  }
};
