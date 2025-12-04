import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import AdminPanel from "@/pages/AdminPanel";
import WorkerPortal from "@/pages/WorkerPortal";
import Landing from "@/pages/Landing";
import DeveloperPanel from "@/pages/DeveloperPanel";
import { shouldBypassDeveloperLogin } from "@/lib/deviceFingerprint";
import DeveloperLanding from "@/pages/DeveloperLanding";
import Pricing from "@/pages/Pricing";
import EquipmentTrackingAdmin from "@/pages/EquipmentTrackingAdmin";
import GPSClockIn from "@/pages/GPSClockIn";
import PayrollProcessing from "@/pages/PayrollProcessing";
import { WorkerBonusTracker } from "@/pages/WorkerBonusTracker";
import { WorkerShiftOffers } from "@/pages/WorkerShiftOffers";
import { WorkerAvailabilityCalendar } from "@/pages/WorkerAvailabilityCalendar";
import { WorkerReferrals } from "@/pages/WorkerReferrals";
import WorkerApplication from "@/pages/WorkerApplication";
import Roadmap from "@/pages/Roadmap";
import PaymentPlans from "@/pages/PaymentPlans";
import ValueProposition from "@/pages/ValueProposition";
import ProfessionalStaffing from "@/pages/ProfessionalStaffing";
import { SMSConsentPage } from "@/pages/SMSConsentPage";
import { AdminSMSDashboard } from "@/pages/AdminSMSDashboard";
import { DevSMSPanel } from "@/pages/DevSMSPanel";
import SendWelcomeLetters from "@/pages/SendWelcomeLetters";
import HallmarkRegistry from "@/pages/HallmarkRegistry";
import HallmarkSeal from "@/pages/HallmarkSeal";
import ClientRequestDashboard from "@/pages/ClientRequestDashboard";
import AdminWorkerMatchingPanel from "@/pages/AdminWorkerMatchingPanel";
import AdminPayrollDashboard from "@/pages/AdminPayrollDashboard";
import AdminAssignmentDashboard from "@/pages/AdminAssignmentDashboard";
import AdminGarnishmentDashboard from "@/pages/AdminGarnishmentDashboard";
import WorkerPayrollPortal from "@/pages/WorkerPayrollPortal";
import WorkerComplianceDashboard from "@/pages/WorkerComplianceDashboard";
import AdminComplianceMonitor from "@/pages/AdminComplianceMonitor";
import { ComplianceDashboard } from "@/pages/ComplianceDashboard";
import CSASigningPage from "@/pages/CSASigningPage";
import RateConfirmation from "@/pages/RateConfirmation";
import OAuthConnectionWizard from "@/pages/OAuthConnectionWizard";
import OAuthSettings from "@/pages/OAuthSettings";
import TimesheetApproval from "@/pages/TimesheetApproval";
import ProductsGallery from "@/pages/ProductsGallery";
import Slideshow from "@/pages/Slideshow";
import JobBoard from "@/pages/JobBoard";
import JobDetails from "@/pages/JobDetails";
import EmployerPortal from "@/pages/EmployerPortal";
import EmployerLogin from "@/pages/EmployerLogin";
import EmployerRegister from "@/pages/EmployerRegister";
import TalentPool from "@/pages/TalentPool";
import TalentExchangeLanding from "@/pages/TalentExchangeLanding";
import AdminTalentExchange from "@/pages/AdminTalentExchange";
import EmployeeHub from "@/pages/EmployeeHub";
import OwnerHub from "@/pages/OwnerHub";
import CRMDashboard from "@/pages/CRMDashboard";
import OrbitPayCard from "@/pages/OrbitPayCard";
import MarketingHub from "@/pages/MarketingHub";
import CryptoWallet from "@/pages/CryptoWallet";
import FeatureInventoryPage from "@/pages/FeatureInventoryPage";
import { TutorialProvider } from "@/components/PageTutorial";
import { FloatingHomeButton } from "@/components/FloatingHomeButton";
import { FloatingWeatherButton } from "@/components/FloatingWeatherButton";
import { WeatherRadarModal } from "@/components/WeatherRadarModal";
import { OrbitExperienceProvider } from "@/components/OrbitExperience";
import { OrbitChatAssistant } from "@/components/OrbitChatAssistant";
import { ModeProvider } from "@/contexts/ModeContext";
import { SandboxBanner } from "@/components/SandboxBanner";
import { SandboxWelcome } from "@/components/SandboxWelcome";

function RootPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-redirect to Developer Panel if bypass is enabled (Jason's devices)
    if (shouldBypassDeveloperLogin()) {
      setLocation('/developer');
      return;
    }
    setLoading(false);
  }, [setLocation]);

  if (loading) return null;
  // Main landing page for everyone - devs can go to /dev-landing to skip
  return <Landing />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootPage} />
      <Route path="/dev-landing" component={DeveloperLanding} />
      <Route path="/developer" component={DeveloperPanel} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/worker" component={WorkerPortal} />
      <Route path="/home" component={Landing} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/equipment-tracking" component={EquipmentTrackingAdmin} />
      <Route path="/gps-clock-in" component={GPSClockIn} />
      <Route path="/payroll-processing" component={PayrollProcessing} />
      <Route path="/worker-bonuses" component={WorkerBonusTracker} />
      <Route path="/worker-shifts" component={WorkerShiftOffers} />
      <Route path="/worker-availability" component={WorkerAvailabilityCalendar} />
      <Route path="/worker-referrals" component={WorkerReferrals} />
      <Route path="/apply" component={WorkerApplication} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/payment-plans" component={PaymentPlans} />
      <Route path="/why-orbit" component={ValueProposition} />
      <Route path="/professional-staffing" component={ProfessionalStaffing} />
      <Route path="/sms-consent" component={SMSConsentPage} />
      <Route path="/admin-sms" component={AdminSMSDashboard} />
      <Route path="/dev-sms" component={DevSMSPanel} />
      <Route path="/send-welcome-letters" component={SendWelcomeLetters} />
      <Route path="/hallmark-registry" component={HallmarkRegistry} />
      <Route path="/hallmark-seal" component={HallmarkSeal} />
      <Route path="/client/request-workers" component={ClientRequestDashboard} />
      <Route path="/clients/:clientId/csa/sign" component={CSASigningPage} />
      <Route path="/rate-confirmation/:requestId" component={RateConfirmation} />
      <Route path="/admin/worker-matching" component={AdminWorkerMatchingPanel} />
      <Route path="/admin/payroll-dashboard" component={AdminPayrollDashboard} />
      <Route path="/admin/assignment-dashboard" component={AdminAssignmentDashboard} />
      <Route path="/admin/garnishment-dashboard" component={AdminGarnishmentDashboard} />
      <Route path="/admin/compliance-monitor" component={AdminComplianceMonitor} />
      <Route path="/admin/compliance" component={ComplianceDashboard} />
      <Route path="/admin/timesheet-approval" component={TimesheetApproval} />
      <Route path="/admin/talent-exchange" component={AdminTalentExchange} />
      <Route path="/crm" component={CRMDashboard} />
      <Route path="/admin/crm" component={CRMDashboard} />
      <Route path="/worker/payroll-portal" component={WorkerPayrollPortal} />
      <Route path="/worker/compliance" component={WorkerComplianceDashboard} />
      <Route path="/oauth/wizard" component={OAuthConnectionWizard} />
      <Route path="/oauth/settings" component={OAuthSettings} />
      <Route path="/products" component={ProductsGallery} />
      <Route path="/studio" component={ProductsGallery} />
      <Route path="/slideshow" component={Slideshow} />
      <Route path="/jobs" component={JobBoard} />
      <Route path="/jobs/:jobId" component={JobDetails} />
      <Route path="/talent-exchange" component={TalentExchangeLanding} />
      <Route path="/join" component={TalentExchangeLanding} />
      <Route path="/talent-pool" component={TalentPool} />
      <Route path="/employer-portal" component={EmployerPortal} />
      <Route path="/employer/portal" component={EmployerPortal} />
      <Route path="/employer/login" component={EmployerLogin} />
      <Route path="/employer/register" component={EmployerRegister} />
      <Route path="/employee-hub" component={EmployeeHub} />
      <Route path="/my-hub" component={EmployeeHub} />
      <Route path="/owner-hub" component={OwnerHub} />
      <Route path="/orbit-pay-card" component={OrbitPayCard} />
      <Route path="/pay-card" component={OrbitPayCard} />
      <Route path="/marketing" component={MarketingHub} />
      <Route path="/marketing-hub" component={MarketingHub} />
      <Route path="/crypto-wallet" component={CryptoWallet} />
      <Route path="/crypto" component={CryptoWallet} />
      <Route path="/feature-inventory" component={FeatureInventoryPage} />
      <Route path="/features" component={FeatureInventoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ConditionalOrbitAssistant() {
  const [location] = useLocation();
  const darkwavePages = ['/products', '/studio'];
  
  if (darkwavePages.some(page => location.startsWith(page))) {
    return null;
  }
  
  return <OrbitChatAssistant />;
}

export default function App() {
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ModeProvider>
          <OrbitExperienceProvider>
            <TutorialProvider>
              <SandboxBanner />
              <SandboxWelcome />
              <div className="sandbox-banner-spacer" />
              <Router />
              <FloatingHomeButton />
              <FloatingWeatherButton onOpenRadar={() => setIsRadarOpen(true)} />
              <WeatherRadarModal isOpen={isRadarOpen} onClose={() => setIsRadarOpen(false)} />
              <ConditionalOrbitAssistant />
              <Toaster />
            </TutorialProvider>
          </OrbitExperienceProvider>
        </ModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
