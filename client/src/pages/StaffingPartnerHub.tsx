import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LinkIcon, CheckCircle2, Clock, AlertCircle, Unlink, Copy, Check } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  status: 'pending' | 'verified' | 'active' | 'paused';
  employees: number;
  assignments: number;
  email?: string;
  connectedAt?: Date;
  integrationLink?: string;
}

export default function StaffingPartnerHub() {
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: '1',
      name: 'Pro Staffing Solutions',
      status: 'active',
      employees: 45,
      assignments: 120,
      email: 'admin@prostaffing.com',
      connectedAt: new Date(Date.now() - 2592000000),
      integrationLink: 'https://orbitstaffing.io/partner/connect/abc123xyz'
    },
    {
      id: '2',
      name: 'ABC Staffing Group',
      status: 'verified',
      employees: 28,
      assignments: 67,
      email: 'contact@abcstaff.com',
      connectedAt: new Date(Date.now() - 604800000),
      integrationLink: 'https://orbitstaffing.io/partner/connect/def456uvw'
    }
  ]);

  const [showAddPartner, setShowAddPartner] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleAddPartner = () => {
    if (!partnerName || !partnerEmail) return;

    const newPartner: Partner = {
      id: String(partners.length + 1),
      name: partnerName,
      status: 'pending',
      employees: 0,
      assignments: 0,
      email: partnerEmail,
      integrationLink: `https://orbitstaffing.io/partner/connect/${Math.random().toString(36).substring(7)}`
    };

    setPartners([...partners, newPartner]);
    setPartnerName('');
    setPartnerEmail('');
    setShowAddPartner(false);
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const removePartner = (id: string) => {
    setPartners(partners.filter(p => p.id !== id));
  };

  const getStatusIcon = (status: Partner['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'verified':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusLabel = (status: Partner['status']) => {
    return {
      active: 'Active',
      verified: 'Verified',
      pending: 'Pending',
      paused: 'Paused'
    }[status];
  };

  const getStatusColor = (status: Partner['status']) => {
    return {
      active: 'bg-green-900/30 border-green-700/50 text-green-300',
      verified: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300',
      pending: 'bg-gray-900/30 border-gray-700/50 text-gray-300',
      paused: 'bg-red-900/30 border-red-700/50 text-red-300'
    }[status];
  };

  const totalEmployees = partners.reduce((sum, p) => sum + p.employees, 0);
  const totalAssignments = partners.reduce((sum, p) => sum + p.assignments, 0);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Staffing Partner Hub</h1>
        <p className="text-muted-foreground">
          Connect multiple staffing agencies to manage all employees in one unified dashboard.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Connected Partners</p>
                <div className="text-3xl font-bold text-foreground">{partners.length}</div>
              </div>
              <LinkIcon className="w-6 h-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Employees</p>
                <div className="text-3xl font-bold text-foreground">{totalEmployees}</div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Assignments</p>
                <div className="text-3xl font-bold text-foreground">{totalAssignments}</div>
              </div>
              <AlertCircle className="w-6 h-6 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Partner Section */}
      {!showAddPartner ? (
        <div className="mb-8">
          <Button
            onClick={() => setShowAddPartner(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-add-partner"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Connect New Staffing Agency
          </Button>
        </div>
      ) : (
        <Card className="bg-card/50 border-primary/30 mb-8">
          <CardHeader>
            <CardTitle>Add New Partner</CardTitle>
            <CardDescription>
              Generate a shareable link to connect another staffing agency.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Agency Name
              </label>
              <Input
                placeholder="e.g., Pro Staffing Solutions"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                data-testid="input-partner-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Contact Email
              </label>
              <Input
                placeholder="contact@staffing-agency.com"
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                data-testid="input-partner-email"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddPartner}
                className="bg-primary hover:bg-primary/90"
                disabled={!partnerName || !partnerEmail}
                data-testid="button-generate-link"
              >
                Generate Link
              </Button>
              <Button
                onClick={() => setShowAddPartner(false)}
                variant="outline"
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partners List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading">Connected Agencies</h2>

        {partners.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No staffing agencies connected yet. Connect your first partner to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          partners.map(partner => (
            <Card
              key={partner.id}
              className={`border-l-4 ${getStatusColor(partner.status)}`}
              data-testid={`partner-card-${partner.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{partner.name}</h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(partner.status)}
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(partner.status)}`}
                        >
                          {getStatusLabel(partner.status)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{partner.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePartner(partner.id)}
                    className="text-red-400 hover:bg-red-900/20"
                    data-testid={`button-remove-partner-${partner.id}`}
                  >
                    <Unlink className="w-4 h-4" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-t border-b border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Employees</p>
                    <p className="text-lg font-bold text-foreground">{partner.employees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Assignments</p>
                    <p className="text-lg font-bold text-foreground">{partner.assignments}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Connected</p>
                    <p className="text-sm text-foreground">
                      {partner.connectedAt?.toLocaleDateString() || 'Pending'}
                    </p>
                  </div>
                </div>

                {/* Integration Link */}
                {partner.integrationLink && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Share this link with {partner.name}:
                    </p>
                    <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-3">
                      <code className="text-xs text-gray-400 flex-1 truncate">
                        {partner.integrationLink}
                      </code>
                      <button
                        onClick={() => copyLink(partner.integrationLink!)}
                        className="text-gray-400 hover:text-cyan-400 transition flex-shrink-0"
                        data-testid={`button-copy-link-${partner.id}`}
                      >
                        {copiedLink === partner.integrationLink ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* How It Works */}
      <Card className="bg-primary/10 border-primary/30 mt-8">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="text-primary font-bold">1.</span>
            <span>Click "Connect New Agency" to generate a unique integration link</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-bold">2.</span>
            <span>Share the link with the staffing agency via email</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-bold">3.</span>
            <span>They click the link and verify their identity</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-bold">4.</span>
            <span>All their employees and assignments appear in your dashboard automatically</span>
          </div>
          <div className="flex gap-3">
            <span className="text-primary font-bold">5.</span>
            <span>Manage everything from one place - no more juggling multiple systems!</span>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
