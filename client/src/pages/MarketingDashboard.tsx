import React, { useState, useEffect } from 'react';
import { TrendingUp, Mail, Phone, MapPin, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Lead {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  currentStaffing: string;
  laborType: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'demo_scheduled' | 'converted';
}

export default function MarketingDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [status, setStatus] = useState<Lead['status']>('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Failed to update lead');
    }
  };

  const newLeads = leads.filter(l => l.status === 'new').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales Pipeline</h1>
          <p className="text-gray-600">Track ORBIT adoption across your sales channel</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon="👥" label="Total Leads" value={leads.length.toString()} />
          <StatCard icon="⭐" label="New Leads" value={newLeads.toString()} highlight />
          <StatCard icon="✅" label="Converted" value={convertedLeads.toString()} />
          <StatCard icon="📈" label="Conversion" value={`${conversionRate}%`} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leads List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Business Owner Leads</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : leads.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="mb-4">No leads yet. Share the business owner page to start collecting leads.</p>
                <code className="bg-gray-100 p-3 rounded text-sm block mb-4">
                  /business-owner
                </code>
              </div>
            ) : (
              <div className="divide-y">
                {leads.map(lead => (
                  <div
                    key={lead.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer border-l-4"
                    style={{
                      borderColor:
                        lead.status === 'new'
                          ? '#3b82f6'
                          : lead.status === 'contacted'
                            ? '#f59e0b'
                            : lead.status === 'demo_scheduled'
                              ? '#8b5cf6'
                              : '#10b981',
                    }}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{lead.companyName}</h3>
                        <p className="text-gray-600">{lead.ownerName}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          lead.status === 'new'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'contacted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : lead.status === 'demo_scheduled'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {lead.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {lead.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> {lead.currentStaffing}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lead Details */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            {selectedLead ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Lead Details</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <p className="text-gray-900 font-medium">{selectedLead.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <p className="text-gray-900">{selectedLead.ownerName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-blue-600 hover:underline cursor-pointer">{selectedLead.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedLead.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Staffing Volume</label>
                    <p className="text-gray-900">{selectedLead.currentStaffing}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Labor Type</label>
                    <p className="text-gray-900">{selectedLead.laborType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Received</label>
                    <p className="text-gray-600 text-sm">
                      {new Date(selectedLead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Update Status</label>
                  <select
                    value={selectedLead.status}
                    onChange={e =>
                      updateLeadStatus(selectedLead.id, e.target.value as Lead['status'])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="demo_scheduled">Demo Scheduled</option>
                    <option value="converted">Converted</option>
                  </select>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Next steps:</strong> Call within 24 hours. Offer free 15-min demo. Emphasize
                    automation + loyalty bonuses = worker retention.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a lead to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Where to Drive Traffic</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SourceCard
              title="Landing Page"
              url="/business-owner"
              desc="Full-page sales funnel for business owners"
            />
            <SourceCard
              title="Email Campaign"
              url="Email template in: /emails/business-owner.html"
              desc="Drip campaign emphasizing automation benefits"
            />
            <SourceCard
              title="LinkedIn Ads"
              url="Use /business-owner landing page"
              desc="Target staffing agency owners, FMS managers"
            />
          </div>
        </div>

        {/* Messaging Guide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales Messaging</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">For Business Owners</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ "Free up 15+ hours/week from manual staffing"</li>
                <li>✓ "$2,500/month average cost savings"</li>
                <li>✓ "60% less worker turnover"</li>
                <li>✓ "Full automation (payroll, invoicing, compliance)"</li>
                <li>✓ "All labor types covered (day to permanent)"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">For Their Employees</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ "Instant pay (same day, not 2 weeks)"</li>
                <li>✓ "Loyalty bonuses ($480-$5k/year)"</li>
                <li>✓ "Real-time earnings visibility"</li>
                <li>✓ "GPS verification (fair, transparent)"</li>
                <li>✓ "Your feedback shapes improvements"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-6 ${highlight ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}>
      <p className="text-3xl mb-2">{icon}</p>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className={`text-3xl font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function SourceCard({ title, url, desc }: { title: string; url: string; desc: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-3">{desc}</p>
      <code className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono block text-center">
        {url}
      </code>
    </div>
  );
}
