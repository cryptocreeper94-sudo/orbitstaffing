import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, UserPlus, FileCheck, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BentoGrid } from "@/components/ui/bento-grid";
import { PageHeader } from "@/components/ui/section-header";
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, OrbitCardFooter } from "@/components/ui/orbit-card";

const mockCandidates = [
  { id: "C-001", name: "Sarah Connor", role: "Logistics Coordinator", status: "Active", email: "s.connor@email.com", phone: "+1 (555) 010-2233", verification: "Verified" },
  { id: "C-002", name: "John Wick", role: "Security Specialist", status: "Onboarding", email: "j.wick@email.com", phone: "+1 (555) 010-4455", verification: "Pending I-9" },
  { id: "C-003", name: "Ellen Ripley", role: "Warehouse Manager", status: "Available", email: "e.ripley@email.com", phone: "+1 (555) 010-6677", verification: "Verified" },
  { id: "C-004", name: "Rick Deckard", role: "Investigator", status: "Active", email: "r.deckard@email.com", phone: "+1 (555) 010-8899", verification: "Verified" },
  { id: "C-005", name: "Neo Anderson", role: "Software Engineer", status: "Available", email: "neo@matrix.com", phone: "+1 (555) 010-1122", verification: "Verified" },
];

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = mockCandidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Shell>
      <PageHeader
        title="Talent Pool"
        subtitle="Manage candidates, compliance, and onboarding."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <UserPlus className="w-4 h-4 mr-2" />
                Onboard Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground">
              <DialogHeader>
                <DialogTitle>New Candidate Onboarding</DialogTitle>
                <DialogDescription>
                  Initiate the automated onboarding sequence. This will send I-9 and tax forms to the candidate.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input placeholder="jane.doe@example.com" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role / Skillset</label>
                  <Input placeholder="e.g. Warehouse Associate" />
                </div>
                <Button className="w-full bg-primary text-primary-foreground">Send Onboarding Package</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search candidates..." 
            className="pl-9 bg-background/50 border-border/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-candidates"
          />
        </div>
      </div>

      <BentoGrid cols={3} gap="md">
        {filteredCandidates.map((candidate) => (
          <OrbitCard 
            key={candidate.id} 
            variant="default" 
            hover={true}
            className="cursor-pointer"
            data-testid={`card-candidate-${candidate.id}`}
          >
            <OrbitCardHeader
              icon={
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              }
              action={<StatusBadge status={candidate.status} />}
            >
              <OrbitCardTitle>{candidate.name}</OrbitCardTitle>
              <OrbitCardDescription>{candidate.role}</OrbitCardDescription>
            </OrbitCardHeader>
            
            <OrbitCardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-mono text-xs text-muted-foreground">{candidate.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className={cn("w-4 h-4", candidate.verification === "Verified" ? "text-green-500" : "text-amber-500")} />
                  <span className={candidate.verification === "Verified" ? "text-green-400" : "text-amber-400"}>
                    {candidate.verification}
                  </span>
                </div>
              </div>
            </OrbitCardContent>
            
            <OrbitCardFooter>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[140px]">{candidate.email}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 hover:text-primary hover:bg-cyan-500/10"
                  data-testid={`button-email-${candidate.id}`}
                >
                  <Mail className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 hover:text-primary hover:bg-cyan-500/10"
                  data-testid={`button-phone-${candidate.id}`}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </OrbitCardFooter>
          </OrbitCard>
        ))}
      </BentoGrid>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No candidates found matching your search.</p>
        </div>
      )}
    </Shell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-green-500/10 text-green-500 border-green-500/20",
    Onboarding: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Available: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  return (
    <Badge variant="outline" className={cn("font-normal", styles[status] || "bg-gray-500/10 text-gray-500")}>
      {status}
    </Badge>
  );
}
