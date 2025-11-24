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

function RootPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return null;
  return <DeveloperLanding />;
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
