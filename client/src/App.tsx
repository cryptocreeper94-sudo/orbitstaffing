import { Switch, Route } from "wouter";
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
import DeveloperLanding from "@/pages/DeveloperLanding";
import Pricing from "@/pages/Pricing";
import EquipmentTrackingAdmin from "@/pages/EquipmentTrackingAdmin";
import GPSClockIn from "@/pages/GPSClockIn";
import PayrollProcessing from "@/pages/PayrollProcessing";
import { WorkerBonusTracker } from "@/pages/WorkerBonusTracker";
import { WorkerShiftOffers } from "@/pages/WorkerShiftOffers";
import { WorkerAvailabilityCalendar } from "@/pages/WorkerAvailabilityCalendar";
import { WorkerReferrals } from "@/pages/WorkerReferrals";
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

function RootPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

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
      <Route path="/admin/worker-matching" component={AdminWorkerMatchingPanel} />
      <Route path="/admin/payroll-dashboard" component={AdminPayrollDashboard} />
      <Route path="/admin/assignment-dashboard" component={AdminAssignmentDashboard} />
      <Route path="/admin/garnishment-dashboard" component={AdminGarnishmentDashboard} />
      <Route path="/admin/compliance-monitor" component={AdminComplianceMonitor} />
      <Route path="/admin/compliance" component={ComplianceDashboard} />
      <Route path="/worker/payroll-portal" component={WorkerPayrollPortal} />
      <Route path="/worker/compliance" component={WorkerComplianceDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
