import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, UserPlus, FileCheck, Mail, Phone } from "lucide-react";
import { useState } from "react";

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Talent Pool</h1>
          <p className="text-muted-foreground">Manage candidates, compliance, and onboarding.</p>
        </div>
        
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
      </div>

      <div className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search candidates..." 
              className="pl-9 bg-background/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5 border-border/50">
              <TableHead>ID</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id} className="hover:bg-white/5 border-border/50 group cursor-pointer">
                <TableCell className="font-mono text-xs text-muted-foreground">{candidate.id}</TableCell>
                <TableCell>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">{candidate.name}</div>
                </TableCell>
                <TableCell>{candidate.role}</TableCell>
                <TableCell>
                  <StatusBadge status={candidate.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <FileCheck className={cn("w-4 h-4", candidate.verification === "Verified" ? "text-green-500" : "text-amber-500")} />
                    {candidate.verification}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
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

import { cn } from "@/lib/utils";