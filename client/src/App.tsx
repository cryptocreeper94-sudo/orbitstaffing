import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Candidates from "@/pages/Candidates";
import Clients from "@/pages/Clients";
import Finance from "@/pages/Finance";
import Marketing from "@/pages/Marketing";
import Sales from "@/pages/Sales";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/sales" component={Sales} />
      <Route path="/candidates" component={Candidates} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;