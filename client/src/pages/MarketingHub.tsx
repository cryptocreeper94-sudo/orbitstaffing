import { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Clock, Copy, Check, Image, Twitter, Facebook, 
  Zap, Target, TrendingUp, Sparkles, ExternalLink, ChevronRight,
  Bell, RefreshCw, Eye, MessageSquare, Hash, Megaphone, Upload,
  X, Send, ImagePlus, Loader2, AlertCircle, Circle, RotateCcw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { SectionHeader, PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardContent, ActionCard } from '@/components/ui/orbit-card';
import { useIsMobile } from '@/hooks/use-mobile';

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

const postingTasks = [
  { id: 'task-1', platform: 'twitter', type: 'Morning tip or insight', emoji: '🌅', order: 1 },
  { id: 'task-2', platform: 'facebook', type: 'Feature highlight', emoji: '✨', order: 2 },
  { id: 'task-3', platform: 'twitter', type: 'Engagement post', emoji: '💬', order: 3 },
  { id: 'task-4', platform: 'facebook', type: 'Pain point / solution', emoji: '🎯', order: 4 },
  { id: 'task-5', platform: 'twitter', type: 'End-of-day CTA', emoji: '🚀', order: 5 },
  { id: 'task-6', platform: 'facebook', type: 'Story or testimonial', emoji: '📖', order: 6 },
];

interface TaskCompletion {
  completedDate: string;
  completedAt: number;
}

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
  const [composerContent, setComposerContent] = useState('');
  const [composerImage, setComposerImage] = useState<string | null>(null);
  const [composerImageFile, setComposerImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postingPlatform, setPostingPlatform] = useState<'twitter' | 'facebook' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [taskCompletions, setTaskCompletions] = useState<Record<string, TaskCompletion>>(() => {
    const saved = localStorage.getItem('orbit_marketing_tasks');
    return saved ? JSON.parse(saved) : {};
  });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    localStorage.setItem('orbit_marketing_tasks', JSON.stringify(taskCompletions));
  }, [taskCompletions]);

  const completeTask = (taskId: string, date: string) => {
    if (!date.trim()) return;
    setTaskCompletions(prev => ({
      ...prev,
      [taskId]: { completedDate: date.trim(), completedAt: Date.now() }
    }));
    setEditingTask(null);
    setDateInput('');
    toast({
      title: "Task completed!",
      description: `Marked as done on ${date.trim()}`,
    });
  };

  const uncompleteTask = (taskId: string) => {
    setTaskCompletions(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const clearAllTasks = () => {
    setTaskCompletions({});
    toast({
      title: "Schedule reset",
      description: "All tasks cleared for a fresh start",
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadTemplate = (template: PostTemplate) => {
    setComposerContent(template.content);
    toast({
      title: "Template loaded",
      description: `"${template.title}" ready to edit and post`,
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB",
        variant: "destructive",
      });
      return;
    }

    setComposerImageFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/marketing/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setComposerImage(data.imageUrl);
      toast({
        title: "Image uploaded",
        description: "Your image is ready to include in your post",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
      setComposerImageFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setComposerImage(null);
    setComposerImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const postToTwitter = async () => {
    if (!composerContent.trim()) {
      toast({
        title: "No content",
        description: "Please write something to post",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    setPostingPlatform('twitter');

    try {
      const response = await fetch('/api/marketing/post/twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: composerContent,
          imageUrl: composerImage,
        }),
      });

      const data = await response.json();

      if (data.method === 'browser') {
        navigator.clipboard.writeText(composerContent);
        window.open(data.url, '_blank');
        toast({
          title: "Opening X/Twitter",
          description: "Content copied! Paste it in the tweet composer.",
        });
      } else {
        toast({
          title: "Posted to X/Twitter",
          description: "Your post is live!",
        });
      }
    } catch (error) {
      toast({
        title: "Post failed",
        description: "Could not post to X/Twitter",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
      setPostingPlatform(null);
    }
  };

  const postToFacebook = async () => {
    if (!composerContent.trim()) {
      toast({
        title: "No content",
        description: "Please write something to post",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    setPostingPlatform('facebook');

    try {
      const response = await fetch('/api/marketing/post/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: composerContent,
          imageUrl: composerImage,
        }),
      });

      const data = await response.json();

      navigator.clipboard.writeText(composerContent);
      window.open(data.url, '_blank');
      toast({
        title: "Opening Facebook",
        description: "Content copied! Paste it in your Facebook post.",
      });
    } catch (error) {
      toast({
        title: "Post failed",
        description: "Could not post to Facebook",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
      setPostingPlatform(null);
    }
  };

  const filteredTemplates = postTemplates.filter(t => 
    selectedPlatform === 'all' || t.platform === selectedPlatform || t.platform === 'both'
  );

  const characterCount = composerContent.length;
  const completedTaskCount = Object.keys(taskCompletions).length;
  const twitterLimit = 280;
  const isOverTwitterLimit = characterCount > twitterLimit;

  const TemplateCard = ({ template }: { template: PostTemplate }) => (
    <OrbitCard className="h-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {template.platform === 'twitter' ? (
            <div className="p-1.5 rounded-lg bg-sky-500/20 flex-shrink-0">
              <Twitter className="w-4 h-4 text-sky-400" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-blue-500/20 flex-shrink-0">
              <Facebook className="w-4 h-4 text-blue-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-white text-sm truncate">{template.title}</h4>
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
              {template.category}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadTemplate(template)}
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 text-xs px-2"
            data-testid={`button-use-${template.id}`}
          >
            <Send className="w-3 h-3 mr-1" />
            Use
          </Button>
          <Button
            size="sm"
            onClick={() => copyToClipboard(template.content, template.id)}
            className={`text-xs px-2 ${copiedId === template.id ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}
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
      </div>
      
      <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words font-sans bg-slate-900/50 rounded-lg p-2 md:p-3 max-h-32 overflow-y-auto overflow-x-hidden">
        {template.content}
      </pre>
      
      {template.screenshotPath && (
        <div className="mt-2 flex flex-wrap items-center gap-1 md:gap-2 text-xs text-slate-500">
          <Image className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[150px] md:max-w-none">Screenshot: {template.screenshotDesc}</span>
          <a 
            href={template.screenshotPath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 flex-shrink-0"
          >
            Open <ExternalLink className="w-3 h-3" />
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
    </OrbitCard>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <PageHeader
          title="Marketing Command Center"
          subtitle="Your social media mission control"
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge className={`${completedTaskCount === postingTasks.length ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'} px-3 py-1`} data-testid="badge-task-progress">
                <Check className="w-3 h-3 mr-1" />
                {completedTaskCount}/{postingTasks.length} Tasks Done
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-1" data-testid="badge-template-count">
                <Zap className="w-3 h-3 mr-1" />
                {postTemplates.length} Templates
              </Badge>
            </div>
          }
        />

        <OrbitCard variant="glass" className="border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <OrbitCardHeader
            icon={
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                <Send className="w-4 h-4 text-white" />
              </div>
            }
            action={
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                Live
              </Badge>
            }
          >
            <OrbitCardTitle>Post Composer</OrbitCardTitle>
          </OrbitCardHeader>
          <OrbitCardContent className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Write your post here... or click a template below to load it."
                value={composerContent}
                onChange={(e) => setComposerContent(e.target.value)}
                className="min-h-[120px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                data-testid="textarea-composer"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <span className={`text-xs ${isOverTwitterLimit ? 'text-red-400' : 'text-slate-500'}`}>
                  {characterCount}/{twitterLimit}
                </span>
                {isOverTwitterLimit && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                data-testid="input-image-upload"
              />
              
              {!composerImage ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  data-testid="button-add-image"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4 mr-2" />
                  )}
                  {isUploading ? 'Uploading...' : 'Add Image'}
                </Button>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                  <img
                    src={composerImage}
                    alt="Upload preview"
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate">
                      {composerImageFile?.name || 'Uploaded image'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {composerImageFile ? `${(composerImageFile.size / 1024).toFixed(1)} KB` : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    className="text-slate-400 hover:text-red-400 p-1 h-auto"
                    data-testid="button-remove-image"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex-1" />

              <div className="flex gap-2">
                <Button
                  onClick={postToTwitter}
                  disabled={isPosting || !composerContent.trim()}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                  data-testid="button-post-twitter"
                >
                  {isPosting && postingPlatform === 'twitter' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Twitter className="w-4 h-4 mr-2" />
                  )}
                  Post to X
                </Button>
                <Button
                  onClick={postToFacebook}
                  disabled={isPosting || !composerContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-post-facebook"
                >
                  {isPosting && postingPlatform === 'facebook' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Facebook className="w-4 h-4 mr-2" />
                  )}
                  Post to FB
                </Button>
              </div>
            </div>

            {isOverTwitterLimit && (
              <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-300">
                  Your post exceeds Twitter's 280 character limit. Consider shortening it for X/Twitter.
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Tip: Click any template below to load it into the composer. Add an image, edit the text, then post!
            </p>
          </OrbitCardContent>
        </OrbitCard>

        <BentoGrid cols={3} gap="md">
          <BentoTile className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="text-white font-semibold text-base sm:text-lg">Posting Tasks</h3>
              </div>
              {Object.keys(taskCompletions).length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllTasks}
                  className="text-slate-400 hover:text-white h-7 px-2"
                  data-testid="button-clear-tasks"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">Click to mark done & add date</p>
            
            <div className="space-y-2">
              {postingTasks.map((task) => {
                const isCompleted = taskCompletions[task.id];
                const isEditing = editingTask === task.id;
                
                return (
                  <div 
                    key={task.id}
                    data-testid={`task-${task.id}`}
                    className={`p-2 sm:p-3 rounded-lg border transition-all overflow-hidden ${
                      isCompleted 
                        ? 'bg-green-900/30 border-green-500/50' 
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isCompleted && !isEditing) {
                        setEditingTask(task.id);
                        setDateInput('');
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg sm:text-xl flex-shrink-0">{task.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          {task.platform === 'twitter' ? (
                            <Twitter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 flex-shrink-0" />
                          ) : (
                            <Facebook className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" />
                          )}
                          <span className="text-xs sm:text-sm text-slate-300 truncate">{task.type}</span>
                        </div>
                        
                        {isEditing && (
                          <div className="mt-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Input
                              placeholder="e.g., 12/2/25"
                              value={dateInput}
                              onChange={(e) => setDateInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  completeTask(task.id, dateInput);
                                } else if (e.key === 'Escape') {
                                  setEditingTask(null);
                                  setDateInput('');
                                }
                              }}
                              className="h-7 text-xs bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 flex-1"
                              autoFocus
                              data-testid={`input-date-${task.id}`}
                            />
                            <Button
                              size="sm"
                              onClick={() => completeTask(task.id, dateInput)}
                              disabled={!dateInput.trim()}
                              className="h-7 bg-green-600 hover:bg-green-700 px-2"
                              data-testid={`button-save-${task.id}`}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setEditingTask(null); setDateInput(''); }}
                              className="h-7 px-2 text-slate-400"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        
                        {isCompleted && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-green-400">
                              Done: {taskCompletions[task.id].completedDate}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); uncompleteTask(task.id); }}
                              className="h-5 px-1 text-slate-500 hover:text-red-400"
                              data-testid={`button-undo-${task.id}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {!isEditing && !isCompleted && (
                        <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      )}
                      {isCompleted && (
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                  {Object.keys(taskCompletions).length}/{postingTasks.length} completed
                </p>
              </div>
            </div>
          </BentoTile>

          <BentoTile span={2} className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold text-lg">Ready-to-Post Templates</h3>
              </div>
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

            {isMobile ? (
              <CarouselRail gap="md" itemWidth="lg" showArrows={false}>
                {filteredTemplates.map((template) => (
                  <CarouselRailItem key={template.id}>
                    <TemplateCard template={template} />
                  </CarouselRailItem>
                ))}
              </CarouselRail>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </BentoTile>
        </BentoGrid>

        {/* Compact Quick Links Row */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.open('https://business.facebook.com', '_blank')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
            data-testid="button-meta-suite"
          >
            <Facebook className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white">Meta Suite</span>
          </button>
          <button
            onClick={() => window.open('https://buffer.com', '_blank')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700 transition-colors"
            data-testid="button-buffer"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white">Buffer</span>
          </button>
          <button
            onClick={() => window.open('https://twitter.com/compose/tweet', '_blank')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600/20 border border-sky-500/30 hover:bg-sky-600/30 transition-colors"
            data-testid="button-post-x"
          >
            <Twitter className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-white">Post to X</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
            <Target className="w-3 h-3" />
            <span>6 posts/day · 42/week</span>
          </div>
        </div>

      </div>
    </div>
  );
}
