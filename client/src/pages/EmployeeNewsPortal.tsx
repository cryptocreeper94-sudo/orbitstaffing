import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface NewsItem {
  id: string;
  company: string;
  title: string;
  content: string;
  category: 'update' | 'announcement' | 'alert' | 'hiring' | 'policy';
  priority: 'normal' | 'high' | 'urgent';
  isPinned: boolean;
  publishedAt: Date;
  expiresAt?: Date;
}

// Mock data - in production, fetch from API
const mockNews: NewsItem[] = [
  {
    id: '1',
    company: 'Superior Staffing',
    title: 'New Bonus Tier Unlocked!',
    content: 'You\'ve reached Tier 2! You now earn $50/week bonus for perfect weeks. Keep up the great work!',
    category: 'announcement',
    priority: 'high',
    isPinned: true,
    publishedAt: new Date(),
  },
  {
    id: '2',
    company: 'Superior Staffing',
    title: 'Holiday Pay Rates - 50% Bonus',
    content: 'Holiday weekend shifts (Dec 23-25) pay 50% premium. Double shifts available. Request availability now!',
    category: 'hiring',
    priority: 'high',
    isPinned: true,
    publishedAt: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    company: 'ABC Staffing Solutions',
    title: 'Updated Safety Policy',
    content: 'Effective immediately, all job sites require hard hats and high-visibility vests. Review attached documentation.',
    category: 'policy',
    priority: 'urgent',
    isPinned: false,
    publishedAt: new Date(Date.now() - 172800000),
  },
  {
    id: '4',
    company: 'Superior Staffing',
    title: 'Shift Incentives - Electrical Work',
    content: '2-week electrical project at Downtown office. $28/hr + $5 daily bonus. All experience levels welcome.',
    category: 'hiring',
    priority: 'normal',
    isPinned: false,
    publishedAt: new Date(Date.now() - 259200000),
  },
  {
    id: '5',
    company: 'ABC Staffing Solutions',
    title: 'Mobile App Update Available',
    content: 'New features: time clock photo verification, digital pay stubs, and improved GPS accuracy. Update now!',
    category: 'update',
    priority: 'normal',
    isPinned: false,
    publishedAt: new Date(Date.now() - 345600000),
  },
];

export default function EmployeeNewsPortal() {
  const [filter, setFilter] = useState<'all' | 'pinned' | 'alerts'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  const companies = ['all', 'Superior Staffing', 'ABC Staffing Solutions'];
  
  const filteredNews = mockNews.filter(item => {
    if (filter === 'pinned' && !item.isPinned) return false;
    if (filter === 'alerts' && !['alert', 'urgent'].includes(item.priority)) return false;
    if (selectedCompany !== 'all' && item.company !== selectedCompany) return false;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-blue-400" />;
      case 'hiring':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'policy':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'alert':
        return 'bg-red-900/30 border-red-700/50 text-red-300';
      case 'announcement':
        return 'bg-blue-900/30 border-blue-700/50 text-blue-300';
      case 'hiring':
        return 'bg-green-900/30 border-green-700/50 text-green-300';
      case 'policy':
        return 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300';
      default:
        return 'bg-slate-800 border-slate-700 text-gray-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'urgent') {
      return <Badge className="bg-red-600">Urgent</Badge>;
    }
    if (priority === 'high') {
      return <Badge className="bg-orange-600">High Priority</Badge>;
    }
    return null;
  };

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Agency News & Updates</h1>
        <p className="text-muted-foreground">Stay informed about your agencies, bonuses, shifts, and policies.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Filter by Type */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Filter by Type</label>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pinned', 'alerts'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border/50 text-foreground hover:border-primary/50'
                }`}
                data-testid={`filter-${f}`}
              >
                {f === 'all' && 'All News'}
                {f === 'pinned' && '📌 Pinned'}
                {f === 'alerts' && '⚠️ Alerts'}
              </button>
            ))}
          </div>
        </div>

        {/* Filter by Company */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Your Agencies</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-card border border-border/50 text-foreground focus:outline-none focus:border-primary/50"
            data-testid="select-company"
          >
            {companies.map(company => (
              <option key={company} value={company}>
                {company === 'all' ? 'All Agencies' : company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No news updates match your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNews.map(news => (
            <Card
              key={news.id}
              className={`border-l-4 transition cursor-pointer hover:shadow-lg ${
                news.isPinned
                  ? 'border-l-primary bg-primary/5'
                  : getCategoryColor(news.category)
              }`}
              data-testid={`news-item-${news.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="mt-1 flex-shrink-0">
                        {getCategoryIcon(news.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-foreground">
                            {news.title}
                          </h3>
                          {news.isPinned && <span className="text-lg">📌</span>}
                          {getPriorityBadge(news.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {news.company}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-foreground mb-4">{news.content}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {news.publishedAt.toLocaleDateString()}
                      </span>
                      {news.expiresAt && (
                        <span className="text-red-500">
                          Expires: {news.expiresAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="capitalize">
                      {news.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <Card className="bg-primary/10 border-primary/30 mt-8">
        <CardContent className="p-6">
          <p className="text-sm text-foreground">
            💡 <strong>Tip:</strong> Pinned stories are important! Make sure to read them. High-priority alerts require your attention.
            When working with multiple agencies, check this portal regularly for updates, bonus opportunities, and shift openings.
          </p>
        </CardContent>
      </Card>
    </Shell>
  );
}
