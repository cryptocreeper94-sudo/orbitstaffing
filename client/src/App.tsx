import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { AIChat } from "@/components/AIChat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
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
      <Route path="/admin/ios-interest" component={AdminIOSInterest} />
      <Route path="/clients" component={Clients} />
      <Route path="/finance" component={Finance} />
      <Route path="/marketing" component={Marketing} />
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