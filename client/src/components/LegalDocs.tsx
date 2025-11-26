import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Building2, User } from 'lucide-react';

export function LegalDocs() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            DarkWave Studios LLC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-white font-semibold">Single Member Operating Agreement</p>
                <p className="text-xs text-slate-400">Member-Managed Limited Liability Company</p>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Member: Ronald Andrews (100%)
              </p>
              <p className="text-slate-300">
                Address: 116 AGNES RD STE 200, Knoxville, TN 37919
              </p>
              <p className="text-slate-400 flex items-center gap-2 mt-3">
                <FileText className="w-4 h-4" />
                Document: DarkWave Studios LLC Operating Agreement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Sections */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Operating Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-slate-300">
            
            {/* Article I */}
            <div className="border-l-4 border-cyan-500 pl-4">
              <h3 className="text-cyan-300 font-bold mb-2">ARTICLE I - Company Formation</h3>
              <div className="space-y-2 text-sm">
                <p><strong>1.1 Formation:</strong> Single Member-Managed Limited Liability Company</p>
                <p><strong>1.2 Registered Agent:</strong> As stated in formation documents</p>
                <p><strong>1.3 Term:</strong> Perpetual unless dissolved by member or legal event</p>
                <p><strong>1.5 Business Purpose:</strong> Conduct any lawful business</p>
                <p><strong>1.6 Principal Place:</strong> As stated in formation documents</p>
              </div>
            </div>

            {/* Article II */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-blue-300 font-bold mb-2">ARTICLE II - Capital Contributions</h3>
              <div className="space-y-2 text-sm">
                <p><strong>2.1 Initial Contributions:</strong> Member's initial capital contribution as described in Exhibit 1</p>
                <p className="text-amber-400 italic">Note: Initial contribution includes expenses to this point for business formation</p>
              </div>
            </div>

            {/* Article III */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-purple-300 font-bold mb-2">ARTICLE III - Profits, Losses and Distributions</h3>
              <div className="space-y-2 text-sm">
                <p><strong>3.1 Profits/Losses:</strong> Determined annually for financial and tax purposes</p>
                <p><strong>3.2 Distributions:</strong> Member determines distribution of available funds after expenses</p>
              </div>
            </div>

            {/* Article IV */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-green-300 font-bold mb-2">ARTICLE IV - Management</h3>
              <div className="space-y-2 text-sm">
                <p><strong>4.1 Management:</strong> Member is responsible for all Company management</p>
                <p><strong>4.2 Liability:</strong> Limited according to state law</p>
                <p><strong>4.3 Powers:</strong> Full authority for sales, purchases, borrowing, contracts, and employment decisions</p>
                <p><strong>4.7 Records:</strong> Must maintain member list, Articles of Organization, tax returns (3 years), and financial statements (3 years)</p>
              </div>
            </div>

            {/* Article V */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-orange-300 font-bold mb-2">ARTICLE V - Compensation</h3>
              <div className="space-y-2 text-sm">
                <p><strong>5.1 Management Fee:</strong> Member entitled to compensation for services</p>
                <p><strong>5.2 Reimbursement:</strong> Company reimburses member for direct expenses</p>
              </div>
            </div>

            {/* Article VI */}
            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="text-pink-300 font-bold mb-2">ARTICLE VI - Bookkeeping</h3>
              <div className="space-y-2 text-sm">
                <p><strong>6.1 Books:</strong> Member maintains complete accounting records</p>
                <p><strong>6.2 Accounts:</strong> Capital account tracking per Treasury Regulations</p>
                <p><strong>6.3 Reports:</strong> Annual statements for tax reporting</p>
              </div>
            </div>

            {/* Article VII */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-yellow-300 font-bold mb-2">ARTICLE VII - Transfers</h3>
              <div className="space-y-2 text-sm">
                <p><strong>7.1 Assignment:</strong> Member may sell, assign, or dispose of interest</p>
              </div>
            </div>

            {/* Article VIII */}
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-red-300 font-bold mb-2">ARTICLE VIII - Dissolution</h3>
              <div className="space-y-2 text-sm">
                <p><strong>8.1 Dissolution:</strong> Member may dissolve at any time</p>
                <p className="text-amber-400">Upon dissolution: Pay debts first, then distribute remaining assets to member</p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-cyan-950/30 rounded-lg p-4 border border-cyan-500/30 mt-6">
              <p className="text-cyan-300 text-sm">
                <strong>📄 Full Document:</strong> DarkWave Studios LLC Operating Agreement
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Location: attached_assets/DarkWave Studios LLC_1764172590926.pdf
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Subsidiaries */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            DarkWave Studios Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/40 rounded-lg p-4 border border-cyan-500/30">
              <h4 className="text-cyan-300 font-bold mb-1">🚀 ORBIT Staffing OS</h4>
              <p className="text-slate-400 text-sm">Universal marketplace platform for flexible labor/services with 100% automation</p>
            </div>
            <div className="bg-gradient-to-r from-purple-950/40 to-blue-950/40 rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-purple-300 font-bold mb-1">🏢 Lot Ops Pro</h4>
              <p className="text-slate-400 text-sm">Commercial property operations management platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
