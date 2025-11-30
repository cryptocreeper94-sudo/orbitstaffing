import { useState } from 'react';
import { 
  Calendar, Clock, Copy, Check, Image, Twitter, Facebook, 
  Zap, Target, TrendingUp, Sparkles, ExternalLink, ChevronRight,
  Bell, RefreshCw, Eye, MessageSquare, Hash, Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PostTemplate {
  id: string;
  platform: 'twitter' | 'facebook' | 'both';
  category: string;
  title: string;
  content: string;
  screenshotPath: string;
  screenshotDesc: string;
  hashtags?: string[];
}

const postTemplates: PostTemplate[] = [
  {
    id: 'pain-1',
    platform: 'twitter',
    category: 'Pain Point',
    title: 'Spreadsheet Problem',
    content: `Still using spreadsheets to track your temp workers?

There's a better way.

ORBIT Staffing OS automates:
✅ GPS time tracking
✅ Payroll processing  
✅ Compliance monitoring
✅ Worker matching

60-95% cheaper than Bullhorn.

🔗 orbitstaffing.io`,
    screenshotPath: '/',
    screenshotDesc: 'Landing page hero section',
  },
  {
    id: 'pain-2',
    platform: 'facebook',
    category: 'Pain Point',
    title: 'Payroll Time Savings',
    content: `🚨 Staffing agency owners - how much time do you spend on payroll every week?

5 hours? 10 hours? More?

ORBIT Staffing OS cuts that to MINUTES with automated GPS-verified timesheets that flow straight into payroll.

No more chasing workers for hours. No more manual entry errors.

See how it works 👉 orbitstaffing.io

#staffing #payroll #automation #HR`,
    screenshotPath: '/gps-clock-in',
    screenshotDesc: 'GPS Clock-In page with map',
    hashtags: ['staffing', 'payroll', 'automation', 'HR'],
  },
  {
    id: 'compare-1',
    platform: 'twitter',
    category: 'Comparison',
    title: 'Price Comparison',
    content: `The staffing industry has a problem:

❌ Bullhorn costs $99-199/user/month
❌ ADP charges per employee + base fees
❌ HubSpot CRM starts at $45/month for basics

ORBIT does CRM + Payroll + Time Tracking + Compliance for $99-149/month total.

Same features. 60-95% less cost.

What could you do with that savings?`,
    screenshotPath: '/pricing',
    screenshotDesc: 'Pricing page showing bundles',
  },
  {
    id: 'engage-1',
    platform: 'facebook',
    category: 'Engagement',
    title: 'Headache Poll',
    content: `💡 Quick question for staffing agency owners:

What's your biggest headache right now?

A) Payroll taking forever
B) Workers not showing up
C) Compliance paperwork
D) Finding qualified candidates

Drop your answer below 👇

(We built ORBIT to solve all four, btw)`,
    screenshotPath: '/admin',
    screenshotDesc: 'Dashboard overview',
  },
  {
    id: 'feature-1',
    platform: 'twitter',
    category: 'Feature',
    title: 'Built Different',
    content: `Built different:

🪐 Blockchain-verified documents
📍 GPS-verified time tracking  
🤖 AI-powered worker matching
💳 Instant pay options (Pay Card coming)

This isn't your grandfather's staffing software.

This is ORBIT.

orbitstaffing.io`,
    screenshotPath: '/digital-hallmark',
    screenshotDesc: 'Blockchain verification page',
  },
  {
    id: 'story-1',
    platform: 'facebook',
    category: 'Story',
    title: 'Our Origin Story',
    content: `📖 Our Story:

We saw staffing agencies drowning in:
- $200+/month software subscriptions
- Hours of manual data entry
- Compliance nightmares
- Scattered tools that don't talk to each other

So we built ORBIT - one platform that does everything, at a fraction of the cost.

From recruiting to payroll, all in one place.

Ready to simplify your operations? 
👉 orbitstaffing.io

#staffingagency #entrepreneur #smallbusiness #automation`,
    screenshotPath: '/',
    screenshotDesc: 'Landing page or Owner Hub',
    hashtags: ['staffingagency', 'entrepreneur', 'smallbusiness', 'automation'],
  },
  {
    id: 'crm-1',
    platform: 'twitter',
    category: 'Feature',
    title: 'CRM Comparison',
    content: `ORBIT CRM vs HubSpot:

HubSpot: $45-800/month
ORBIT: $19/month

Both include:
• Contact management
• Deal pipelines
• Activity tracking
• Email integration

The difference? We built ours for staffing.

Your move.`,
    screenshotPath: '/crm',
    screenshotDesc: 'CRM Dashboard with pipeline',
  },
  {
    id: 'gps-1',
    platform: 'facebook',
    category: 'Feature',
    title: 'GPS Clock-In Spotlight',
    content: `🎯 Feature Spotlight: GPS Clock-In

Your workers clock in from their phone.
We verify they're actually at the job site.
Timesheets create automatically.
Payroll processes with one click.

No buddy punching. No time theft. No manual entry.

Just accurate time tracking that saves you hours every week.

See it in action 👉 orbitstaffing.io

#timetracking #staffing #workforce #GPS`,
    screenshotPath: '/gps-clock-in',
    screenshotDesc: 'GPS Clock-In map interface',
    hashtags: ['timetracking', 'staffing', 'workforce', 'GPS'],
  },
  {
    id: 'compliance-1',
    platform: 'twitter',
    category: 'Feature',
    title: 'Compliance Made Easy',
    content: `I-9 compliance used to take hours.

Now it takes minutes.

ORBIT tracks:
• Document verification status
• Expiration dates
• Audit-ready reports
• State-specific requirements

Sleep better knowing you're always compliant.`,
    screenshotPath: '/admin/compliance',
    screenshotDesc: 'Compliance Dashboard',
  },
  {
    id: 'savings-1',
    platform: 'facebook',
    category: 'Comparison',
    title: 'Annual Savings',
    content: `💰 Let's talk numbers:

Average staffing agency spends:
• Bullhorn ATS: $150/user/month
• ADP Payroll: $59 base + $4/employee
• HubSpot CRM: $90/month
• Time tracking: $25/month

That's $324+/month MINIMUM for basic operations.

ORBIT Growth Bundle: $149/month
ALL features included.

That's $175+ saved. Every single month.

What would you do with an extra $2,100/year?

Calculate your savings 👉 orbitstaffing.io/pricing`,
    screenshotPath: '/pricing',
    screenshotDesc: 'Pricing comparison',
  },
  {
    id: 'engage-2',
    platform: 'twitter',
    category: 'Engagement',
    title: 'Unpopular Opinion',
    content: `Unpopular opinion:

Most staffing software is overpriced and over-complicated.

Agree or disagree? 👇`,
    screenshotPath: '',
    screenshotDesc: 'No screenshot needed - text only',
  },
  {
    id: 'engage-3',
    platform: 'twitter',
    category: 'Engagement',
    title: 'Feature Request',
    content: `What's the ONE feature you wish your staffing software had?

Reply below - we're always building.`,
    screenshotPath: '',
    screenshotDesc: 'No screenshot needed - text only',
  },
];

const dailySchedule = [
  { time: '7:00 AM', platform: 'twitter', type: 'Morning tip or insight', emoji: '🌅' },
  { time: '9:00 AM', platform: 'facebook', type: 'Feature highlight', emoji: '✨' },
  { time: '12:00 PM', platform: 'twitter', type: 'Engagement post', emoji: '💬' },
  { time: '2:00 PM', platform: 'facebook', type: 'Pain point / solution', emoji: '🎯' },
  { time: '5:00 PM', platform: 'twitter', type: 'End-of-day CTA', emoji: '🚀' },
  { time: '7:00 PM', platform: 'facebook', type: 'Story or testimonial', emoji: '📖' },
];

const screenshotGuide = [
  { page: 'Landing Page', path: '/', use: 'General posts, brand awareness' },
  { page: 'GPS Clock-In', path: '/gps-clock-in', use: 'Time tracking features' },
  { page: 'Payroll Dashboard', path: '/admin/payroll', use: 'Payroll automation posts' },
  { page: 'CRM Dashboard', path: '/crm', use: 'CRM comparison posts' },
  { page: 'Pricing', path: '/pricing', use: 'Price comparison, value posts' },
  { page: 'Compliance', path: '/admin/compliance', use: 'Compliance feature posts' },
  { page: 'Talent Pool', path: '/talent-pool', use: 'Worker management posts' },
  { page: 'Owner Hub', path: '/owner-hub', use: 'Business owner focused posts' },
  { page: 'Digital Hallmark', path: '/digital-hallmark', use: 'Blockchain verification posts' },
];

export default function MarketingHub() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'twitter' | 'facebook'>('all');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTemplates = postTemplates.filter(t => 
    selectedPlatform === 'all' || t.platform === selectedPlatform || t.platform === 'both'
  );

  const currentHour = new Date().getHours();
  const getNextPostTime = () => {
    const times = [7, 9, 12, 14, 17, 19];
    for (const t of times) {
      if (currentHour < t) return t;
    }
    return 7;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              Marketing Command Center
            </h1>
            <p className="text-slate-400 mt-1">Your social media mission control</p>
          </div>
          
          <div className="flex gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-3 py-1" data-testid="badge-next-post">
              <Clock className="w-3 h-3 mr-1" />
              Next post: {getNextPostTime()}:00
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1" data-testid="badge-template-count">
              <Zap className="w-3 h-3 mr-1" />
              {postTemplates.length} Templates Ready
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <Card className="lg:col-span-1 bg-slate-900/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dailySchedule.map((slot, i) => {
                const slotHour = parseInt(slot.time.split(':')[0]) + (slot.time.includes('PM') && !slot.time.includes('12') ? 12 : 0);
                const isPast = currentHour > slotHour;
                const isCurrent = currentHour === slotHour;
                
                return (
                  <div 
                    key={i}
                    data-testid={`schedule-slot-${i}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isCurrent 
                        ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30' 
                        : isPast 
                          ? 'bg-slate-800/30 border-slate-700/30 opacity-50' 
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-xl">{slot.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{slot.time}</span>
                        {slot.platform === 'twitter' ? (
                          <Twitter className="w-3.5 h-3.5 text-sky-400" />
                        ) : (
                          <Facebook className="w-3.5 h-3.5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{slot.type}</p>
                    </div>
                    {isCurrent && (
                      <Badge className="bg-cyan-500 text-white text-xs">NOW</Badge>
                    )}
                    {isPast && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                );
              })}
              
              <div className="pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                  All times Eastern Time (ET)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-slate-900/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  Ready-to-Post Templates
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedPlatform('all')}
                    className={selectedPlatform === 'all' ? 'bg-purple-600' : 'border-slate-600'}
                    data-testid="button-filter-all"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedPlatform === 'twitter' ? 'default' : 'outline'}
                    onClick={() => setSelectedPlatform('twitter')}
                    className={selectedPlatform === 'twitter' ? 'bg-sky-500' : 'border-slate-600'}
                    data-testid="button-filter-twitter"
                  >
                    <Twitter className="w-3 h-3 mr-1" />
                    X
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedPlatform === 'facebook' ? 'default' : 'outline'}
                    onClick={() => setSelectedPlatform('facebook')}
                    className={selectedPlatform === 'facebook' ? 'bg-blue-600' : 'border-slate-600'}
                    data-testid="button-filter-facebook"
                  >
                    <Facebook className="w-3 h-3 mr-1" />
                    FB
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {template.platform === 'twitter' ? (
                            <div className="p-1.5 rounded-lg bg-sky-500/20">
                              <Twitter className="w-4 h-4 text-sky-400" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-lg bg-blue-500/20">
                              <Facebook className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-white text-sm">{template.title}</h4>
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(template.content, template.id)}
                          className={copiedId === template.id ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-700'}
                          data-testid={`button-copy-${template.id}`}
                        >
                          {copiedId === template.id ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {template.content}
                      </pre>
                      
                      {template.screenshotPath && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <Image className="w-3 h-3" />
                          <span>Screenshot: {template.screenshotDesc}</span>
                          <a 
                            href={template.screenshotPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            Open page <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      
                      {template.hashtags && (
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          <Hash className="w-3 h-3 text-slate-500" />
                          {template.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs text-cyan-400">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Image className="w-5 h-5 text-green-400" />
                Screenshot Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {screenshotGuide.map((item, i) => (
                  <div 
                    key={i}
                    data-testid={`screenshot-guide-${i}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{item.page}</p>
                      <p className="text-xs text-slate-400">{item.use}</p>
                    </div>
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-screenshot-${item.page.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href="https://business.facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-meta-business"
                className="flex items-center justify-between p-3 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white text-sm">Meta Business Suite</p>
                    <p className="text-xs text-slate-400">Schedule Facebook posts</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              
              <a 
                href="https://buffer.com" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-buffer"
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="font-medium text-white text-sm">Buffer</p>
                    <p className="text-xs text-slate-400">Schedule X/Twitter posts (free)</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              
              <a 
                href="https://twitter.com/compose/tweet" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-twitter-compose"
                className="flex items-center justify-between p-3 rounded-lg bg-sky-600/20 border border-sky-500/30 hover:bg-sky-600/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Twitter className="w-5 h-5 text-sky-400" />
                  <div>
                    <p className="font-medium text-white text-sm">Post to X Now</p>
                    <p className="text-xs text-slate-400">Open Twitter/X composer</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              
              <div className="pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Target className="w-4 h-4" />
                  <span>Pro tip: Batch create posts on Sunday, schedule for the week!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Consistency is Key</h3>
                  <p className="text-sm text-slate-400">Post 3-6 times daily across platforms for maximum reach</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  6 posts/day target
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  42 posts/week
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
