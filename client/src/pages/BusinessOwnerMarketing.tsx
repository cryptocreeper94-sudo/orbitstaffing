import React, { useState } from 'react';
import { Zap, Users, Clock, TrendingUp, Shield, MessageSquare, BarChart3, Send, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkflowDemo from '@/components/WorkflowDemo';
import { toast } from 'sonner';

export default function BusinessOwnerMarketing() {
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    currentStaffing: '',
    laborType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('We\'ll be in touch within 24 hours!');
        setFormData({ companyName: '', ownerName: '', email: '', phone: '', currentStaffing: '', laborType: '' });
      } else {
        toast.error('Error submitting. Please try again.');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your Staffing Headaches—<span className="text-blue-400">Gone</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            ORBIT automates end-to-end staffing. From day labor to permanent hires. 
            Your employees stay longer. Your costs drop. Your life gets simpler.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6" data-testid="button-get-started">
              Get Started Free
            </Button>
            <Button 
              onClick={() => setIsWorkflowOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 flex items-center gap-2" 
              data-testid="button-see-demo"
            >
              <Play className="w-5 h-5" />
              See It Work (90 seconds)
            </Button>
            <Button variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white/10" data-testid="button-request-demo">
              Request Demo Call
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <StatBox icon="⚡" stat="60% Less" label="Hiring Time" />
          <StatBox icon="💰" stat="40% Lower" label="Turnover Cost" />
          <StatBox icon="📈" stat="3x Faster" label="Productivity" />
        </div>
      </section>

      {/* The Problem */}
      <section className="bg-black/50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Traditional Staffing Agencies Keep You Stuck
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <ProblemCard
              icon="⏰"
              title="Manual Everything"
              desc="You're still making calls, juggling spreadsheets, chasing workers who don't show up."
            />
            <ProblemCard
              icon="💸"
              title="High Margins, Low Transparency"
              desc="30-50% markups. Workers get scraps. You pay too much. Nobody's happy."
            />
            <ProblemCard
              icon="😞"
              title="Workers Leave After 3 Months"
              desc="No loyalty system. No incentive to show up. Constant hiring cycle."
            />
            <ProblemCard
              icon="⚖️"
              title="Compliance Nightmares"
              desc="Scattered documentation. No audit trail. Liability exposure."
            />
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">
            ORBIT Does the Work for You
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SolutionCard
              icon={<Clock className="w-8 h-8" />}
              title="Automated Matching"
              desc="System matches right worker to right job. No calls needed. Instant placement."
            />
            <SolutionCard
              icon={<Users className="w-8 h-8" />}
              title="Built-in Loyalty"
              desc="Workers earn bonuses for showing up. $480-$5,000/year loyalty rewards. 70% longer tenure."
            />
            <SolutionCard
              icon={<Zap className="w-8 h-8" />}
              title="GPS Verification"
              desc="Workers clock in with GPS. Biometric security. No time theft. Fair to everyone."
            />
            <SolutionCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Real-Time Dashboard"
              desc="See every assignment, worker, earning in real-time. One click reporting."
            />
            <SolutionCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Full Automation"
              desc="Payroll, invoicing, compliance reports—all automatic. Done."
            />
            <SolutionCard
              icon={<Shield className="w-8 h-8" />}
              title="Incident Documentation"
              desc="On-site incidents documented automatically. Liability protected. OSHA ready."
            />
          </div>
        </div>
      </section>

      {/* Labor Types */}
      <section className="bg-blue-900/30 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Cover Every Labor Type—One System
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <LaborType label="📅 Day Labor" desc="Hourly workers, one-off jobs, event staffing" />
            <LaborType label="📆 Week Labor" desc="Project-based workers, recurring weekly assignments" />
            <LaborType label="🗓️ Month Labor" desc="Rotating assignments, ongoing placements" />
            <LaborType label="📊 6-Month Labor" desc="Extended projects, construction, hospitality seasons" />
            <LaborType label="🔄 Temp-to-Perm" desc="Trial period then conversion—best of both worlds" />
            <LaborType label="💼 Permanent Hire" desc="Full recruitment, vetting, onboarding—automated" />
          </div>
          <p className="text-center mt-12 text-gray-300 text-lg">
            <strong>All types in one platform.</strong> All automated. All documented. All compliant.
          </p>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            What ORBIT Clients Actually Save
          </h2>
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg p-12 text-center">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <p className="text-5xl font-bold text-blue-200 mb-2">15 hours/week</p>
                <p className="text-gray-200">Less manual staffing work</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-blue-200 mb-2">$2,500/mo</p>
                <p className="text-gray-200">Average cost savings</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-blue-200 mb-2">60% Less</p>
                <p className="text-gray-200">Worker turnover</p>
              </div>
            </div>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Clients report their staffing manager now manages 2-3x more placements with less stress.
              Workers stay 3x longer because of loyalty bonuses. Everyone wins.
            </p>
          </div>
        </div>
      </section>

      {/* For Your Employees */}
      <section className="bg-black/50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Your Employees Get Something Competitors Don't Offer
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <BenefitCard
              icon="💰"
              title="Instant Pay"
              desc="ORBIT Card—get paid same day, not 2 weeks later. Your employees never worry about cash flow."
            />
            <BenefitCard
              icon="🏆"
              title="Loyalty Rewards"
              desc="Show up reliably, earn $480-$5,000/year. That's a real bonus that matters."
            />
            <BenefitCard
              icon="📊"
              title="Transparent Earnings"
              desc="Real-time pay tracking. No surprises. See every dollar before payday."
            />
            <BenefitCard
              icon="📱"
              title="Mobile-First Experience"
              desc="Biometric security, GPS verification, direct messaging. Professional app, serious work."
            />
            <BenefitCard
              icon="🔒"
              title="Protective Documentation"
              desc="Incident reporting protects them legally. Fair verification system."
            />
            <BenefitCard
              icon="💬"
              title="Voice Matters"
              desc="Feedback directly shapes improvements. Their input is valued and acted on."
            />
          </div>
          <p className="text-center mt-12 text-gray-300 text-lg">
            <strong>Result:</strong> Workers see you invest in them. They stay longer. Quality improves. Your reputation grows.
          </p>
        </div>
      </section>

      {/* The Virtuous Cycle */}
      <section className="bg-gradient-to-r from-green-900/50 to-blue-900/50 py-20 px-6 border-y border-green-700">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">
            The Virtuous Cycle: Why It Works for Both of You
          </h2>
          <p className="text-center text-gray-300 mb-16 text-lg max-w-3xl mx-auto">
            You invest in your employees. They invest back through loyalty and integrity. Everyone wins. Here's the math:
          </p>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Owner Side */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-green-300">For You (The Owner)</h3>
              <div className="space-y-4">
                <CycleStep
                  step="1"
                  title="You Invest in Bonuses"
                  desc="$480-$5,000/year per loyal employee. Real money for showing up."
                />
                <CycleStep
                  step="2"
                  title="Employees Stay 3x Longer"
                  desc="70% higher retention. No constant rehiring. No training new people every month."
                />
                <CycleStep
                  step="3"
                  title="You Save on Turnover"
                  desc="Each rehire costs $2,500-$5,000. Keep 10 people = $25,000-$50,000 saved annually."
                />
                <CycleStep
                  step="4"
                  title="Work Quality Improves"
                  desc="Employees show up reliably. Fewer mistakes. Better client satisfaction. Better reputation."
                />
                <CycleStep
                  step="5"
                  title="You Free Up 15+ Hours/Week"
                  desc="Less time chasing workers. More time growing business. Delegation works when people stay."
                />
              </div>
              <div className="mt-8 bg-green-900/40 border border-green-700 rounded-lg p-6">
                <p className="text-lg font-bold text-green-300 mb-2">Net Outcome:</p>
                <p className="text-gray-300">
                  Spend $500-$1,000/month on bonuses. Save $2,500-$5,000/month on turnover + time + quality. 
                  <strong className="text-green-300"> ROI: 300-500%</strong>
                </p>
              </div>
            </div>

            {/* Employee Side */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-blue-300">For Your Employees</h3>
              <div className="space-y-4">
                <CycleStep
                  step="1"
                  title="You Offer Something Rare"
                  desc="Bonuses + instant pay + respect. Most staffing agencies don't."
                />
                <CycleStep
                  step="2"
                  title="They Show Up Reliably"
                  desc="When you reward integrity, they deliver it. Because it matters to them now."
                />
                <CycleStep
                  step="3"
                  title="They Do Quality Work"
                  desc="Not just filling time. They're invested in YOUR success = better clients = more referrals."
                />
                <CycleStep
                  step="4"
                  title="They Come Back"
                  desc="When work is available, they call YOU first. Because you're better than Competitor B."
                />
                <CycleStep
                  step="5"
                  title="They Refer Others"
                  desc="Happy employees bring friends. Free recruitment. Lower hiring costs."
                />
              </div>
              <div className="mt-8 bg-blue-900/40 border border-blue-700 rounded-lg p-6">
                <p className="text-lg font-bold text-blue-300 mb-2">Net Outcome:</p>
                <p className="text-gray-300">
                  They earn $480-$5k/year in bonuses + instant pay + respect. 
                  <strong className="text-blue-300"> They become your most reliable workforce.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Competitor Comparison */}
          <div className="mt-16 p-8 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h3 className="text-2xl font-bold mb-8 text-center">Why Workers Choose ORBIT Agencies Over Competitors</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <ComparisonColumn
                title="🎯 Your Agency (ORBIT)"
                items={[
                  "✓ Bonuses: $480-$5,000/year",
                  "✓ Instant pay (same day)",
                  "✓ Real-time earnings visibility",
                  "✓ GPS verification (fair, transparent)",
                  "✓ Feedback actually shapes improvements",
                  "✓ Treated with respect + integrity matters",
                ]}
                highlight
              />
              <ComparisonColumn
                title="❌ Competitor B (Traditional Agency)"
                items={[
                  "✗ No bonuses (just hourly wage)",
                  "✗ Payment in 2 weeks (if lucky)",
                  "✗ No transparency on earnings",
                  "✗ Manual time tracking (no GPS)",
                  "✗ Feedback gets ignored",
                  "✗ Just a number filling slots",
                ]}
              />
            </div>
            <p className="text-center mt-8 text-gray-300 text-lg">
              <strong>Result:</strong> Your workers show up more reliably. Work longer. Refer friends. Stay loyal. 
              <strong className="text-green-300"> That's competitive advantage.</strong>
            </p>
          </div>

          {/* Integrity Message */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">The Integrity Multiplier</h3>
            <p className="text-lg text-gray-300 mb-4">
              When you reward integrity (showing up, doing good work), you get more of it.
            </p>
            <p className="text-gray-300">
              Workers who know they'll be rewarded for 90%+ attendance don't skip days. 
              Workers who know they'll earn $5,000 for a full year of loyalty show up in rain, snow, and exhaustion.
              <br />
              <strong className="text-blue-300">That's not a cost. That's a superpower.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            What Our Partners Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="Cut our staffing overhead by 40%. Workers actually show up now. Game changer."
              author="Mike Thompson"
              role="Regional Staffing Manager"
            />
            <TestimonialCard
              quote="First system that treats workers like people, not just filling slots. Retention up 70%."
              author="Sarah Chen"
              role="Hospitality Staffing Owner"
            />
            <TestimonialCard
              quote="Compliance used to terrify us. Now it's automatic. Sleep better knowing we're protected."
              author="Robert King"
              role="Construction Labor Agency"
            />
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-800 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">
            Ready to Stop the Staffing Grind?
          </h2>
          <p className="text-center text-gray-200 mb-12 text-lg">
            Schedule a free 15-minute call. See how other agencies freed up 15+ hours/week.
          </p>

          <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-lg p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="companyName"
                placeholder="Company Name *"
                value={formData.companyName}
                onChange={handleChange}
                className="px-4 py-3 rounded bg-slate-700 border border-slate-600 focus:border-blue-400 focus:outline-none"
                required
              />
              <input
                type="text"
                name="ownerName"
                placeholder="Your Name"
                value={formData.ownerName}
                onChange={handleChange}
                className="px-4 py-3 rounded bg-slate-700 border border-slate-600 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                className="px-4 py-3 rounded bg-slate-700 border border-slate-600 focus:border-blue-400 focus:outline-none"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="px-4 py-3 rounded bg-slate-700 border border-slate-600 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <select
                name="currentStaffing"
                value={formData.currentStaffing}
                onChange={handleChange}
                className="px-4 py-3 rounded bg-slate-700 border border-slate-600 focus:border-blue-400 focus:outline-none"
              >
                <option value="">Current Staffing Volume</option>
                <option value="1-50">1-50 placements/month</option>
                <option value="50-200">50-200 placements/month</option>
                <option value="200-500">200-500 placements/month</option>
                <option value="500+">500+ placements/month</option>
              </select>
              <select
                name="laborType"
                value={formData.laborType}
                onChange={handleChange}
                className="px-4 py-3 rounded bg-slate-700 border border-slate-600 focus:border-blue-400 focus:outline-none"
              >
                <option value="">Primary Labor Type</option>
                <option value="skilled_trades">Skilled Trades</option>
                <option value="hospitality">Hospitality</option>
                <option value="construction">Construction</option>
                <option value="general_labor">General Labor</option>
                <option value="mixed">Mixed/Multiple</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3 font-bold flex items-center justify-center gap-2"
              data-testid="button-request-demo"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Submitting...' : 'Get Your Free Demo'}
            </Button>

            <p className="text-center text-gray-400 text-sm">
              We'll call within 24 hours. No pressure, no commitment.
            </p>
          </form>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Join the Future of Staffing
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Over 50+ staffing agencies already using ORBIT. Saving time. Keeping employees. Growing revenue.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-12 py-6" data-testid="button-start-free">
          Start Your Free Trial
        </Button>
      </section>

      <WorkflowDemo isOpen={isWorkflowOpen} onClose={() => setIsWorkflowOpen(false)} />
    </div>
  );
}

function StatBox({ icon, stat, label }: { icon: string; stat: string; label: string }) {
  return (
    <div className="bg-blue-900/50 rounded-lg p-8 text-center border border-blue-700">
      <p className="text-4xl mb-2">{icon}</p>
      <p className="text-3xl font-bold text-blue-300 mb-2">{stat}</p>
      <p className="text-gray-300">{label}</p>
    </div>
  );
}

function ProblemCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
      <p className="text-3xl mb-3">{icon}</p>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{desc}</p>
    </div>
  );
}

function SolutionCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
      <div className="text-blue-400 mb-3">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{desc}</p>
    </div>
  );
}

function LaborType({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-700">
      <p className="font-bold mb-2">{label}</p>
      <p className="text-gray-300">{desc}</p>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
      <p className="text-3xl mb-3">{icon}</p>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{desc}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div className="bg-blue-900/40 border border-blue-700 rounded-lg p-6">
      <p className="text-lg mb-4 italic">"{quote}"</p>
      <p className="font-bold">{author}</p>
      <p className="text-gray-400 text-sm">{role}</p>
    </div>
  );
}

function CycleStep({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
          {step}
        </div>
      </div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-gray-300 text-sm">{desc}</p>
      </div>
    </div>
  );
}

function ComparisonColumn({
  title,
  items,
  highlight = false,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-6 ${
        highlight
          ? 'bg-green-900/30 border border-green-700'
          : 'bg-red-900/30 border border-red-700'
      }`}
    >
      <h4 className="font-bold text-lg mb-4">{title}</h4>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="text-gray-200 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
