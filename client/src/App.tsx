import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Candidates from "@/pages/Candidates";
import Recruiting from "@/pages/Recruiting";
import Clients from "@/pages/Clients";
import Finance from "@/pages/Finance";
import Marketing from "@/pages/Marketing";
import Sales from "@/pages/Sales";
import WorkerPortal from "@/pages/WorkerPortal";
import Operations from "@/pages/Operations";
import Landing from "@/pages/Landing";
import BusinessConfig from "@/pages/BusinessConfig";
import WorkerConfig from "@/pages/WorkerConfig";
import AdminPanel from "@/pages/AdminPanel";
import Configuration from "@/pages/Configuration";
import EmployeeApp from "@/pages/EmployeeApp";
import BusinessFinance from "@/pages/BusinessFinance";
import BillingSettings from "@/pages/BillingSettings";
import FeatureRequests from "@/pages/FeatureRequests";
import SmallBusinessPage from "@/pages/SmallBusinessPage";
import LargeBusinessPage from "@/pages/LargeBusinessPage";
import MultiAgencyHub from "@/pages/MultiAgencyHub";
import ConversionManagement from "@/pages/ConversionManagement";
import NDAAcceptance from "@/pages/NDAAcceptance";
import AIAssistant from "@/pages/AIAssistant";
import WorkerAssignments from "@/pages/WorkerAssignments";
import Integrations from "@/pages/Integrations";
import WorkOrders from "@/pages/WorkOrders";
import ComingSoonApple from "@/pages/ComingSoonApple";
import AdminIOSInterest from "@/pages/AdminIOSInterest";
import IncidentReporting from "@/pages/IncidentReporting";
import BusinessOwnerMarketing from "@/pages/BusinessOwnerMarketing";
import MarketingDashboard from "@/pages/MarketingDashboard";
import WorkflowDemoPage from "@/pages/WorkflowDemoPage";
import EmployeeNewsPortal from "@/pages/EmployeeNewsPortal";
import StaffingPartnerHub from "@/pages/StaffingPartnerHub";
import PartnerVerification from "@/pages/PartnerVerification";
import PartnerAgencyDashboard from "@/pages/PartnerAgencyDashboard";
import EmployeePreApplication from "@/pages/EmployeePreApplication";
import ComplianceVerification from "@/pages/ComplianceVerification";
import DrugTestScheduling from "@/pages/DrugTestScheduling";
import IncidentReportingApp from "@/pages/IncidentReportingApp";
import WorkersCompAdmin from "@/pages/WorkersCompAdmin";
import DrugTestBilling from "@/pages/DrugTestBilling";
import AdminLanding from "@/pages/AdminLanding";
import OwnerPitch from "@/pages/OwnerPitch";
import DigitalHallmark from "@/pages/DigitalHallmark";
import DeveloperPanel from "@/pages/DeveloperPanel";
import DeveloperLanding from "@/pages/DeveloperLanding";
import SecureSandbox from "@/pages/SecureSandbox";
import EmblemDownload from "@/pages/EmblemDownload";
import Pricing from "@/pages/Pricing";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { AIChat } from "@/components/AIChat";

function RootPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return null;

  // Always land on developer/sandbox page
  return <DeveloperLanding />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootPage} />
      <Route path="/dev-landing" component={DeveloperLanding} />
      <Route path="/sandbox-secure" component={SecureSandbox} />
      <Route path="/home" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/sales" component={Sales} />
      <Route path="/operations" component={Operations} />
      <Route path="/worker" component={WorkerPortal} />
      <Route path="/business-config" component={BusinessConfig} />
      <Route path="/worker-config" component={WorkerConfig} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/configure" component={Configuration} />
      <Route path="/candidates" component={Candidates} />
      <Route path="/recruiting" component={Recruiting} />
      <Route path="/employee-app" component={EmployeeApp} />
      <Route path="/finance" component={BusinessFinance} />
      <Route path="/billing" component={BillingSettings} />
      <Route path="/feature-requests" component={FeatureRequests} />
      <Route path="/small-business" component={SmallBusinessPage} />
      <Route path="/large-business" component={LargeBusinessPage} />
      <Route path="/hub" component={MultiAgencyHub} />
      <Route path="/conversions" component={ConversionManagement} />
      <Route path="/nda" component={NDAAcceptance} />
      <Route path="/ai" component={AIAssistant} />
      <Route path="/my-assignments" component={WorkerAssignments} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/work-orders" component={WorkOrders} />
      <Route path="/ios-coming-soon" component={ComingSoonApple} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/admin/ios-interest" component={AdminIOSInterest} />
      <Route path="/incidents" component={IncidentReporting} />
      <Route path="/business-owner" component={BusinessOwnerMarketing} />
      <Route path="/marketing" component={MarketingDashboard} />
      <Route path="/workflow-demo" component={WorkflowDemoPage} />
      <Route path="/employee-news" component={EmployeeNewsPortal} />
      <Route path="/partner-hub" component={StaffingPartnerHub} />
      <Route path="/partner-verify/:token" component={PartnerVerification} />
      <Route path="/partner-verify" component={PartnerVerification} />
      <Route path="/partner-agency" component={PartnerAgencyDashboard} />
      <Route path="/pre-apply" component={EmployeePreApplication} />
      <Route path="/compliance" component={ComplianceVerification} />
      <Route path="/drug-test-scheduling" component={DrugTestScheduling} />
      <Route path="/incident-reporting" component={IncidentReportingApp} />
      <Route path="/workers-comp-admin" component={WorkersCompAdmin} />
      <Route path="/drug-test-billing" component={DrugTestBilling} />
      <Route path="/owner-pitch" component={OwnerPitch} />
      <Route path="/digital-hallmark" component={DigitalHallmark} />
      <Route path="/developer" component={DeveloperPanel} />
      <Route path="/emblem" component={EmblemDownload} />
      <Route path="/clients" component={Clients} />
      <Route path="/finance" component={Finance} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <FeedbackWidget />
        <AIChat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;