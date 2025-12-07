import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Star, 
  Award,
  Target,
  Calendar,
  CheckCircle,
  Trophy,
  Zap,
  BarChart3,
  TrendingDown,
  Download
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ICON_MAP: Record<string, string> = {
  "🏆": "/icons/pro/3d_trophy_winner_icon_clean.png",
  "✅": "/icons/pro/3d_checkmark_comply_icon_clean.png",
  "🛡️": "/icons/pro/3d_shield_protection_icon_clean.png",
  "🌅": "/icons/pro/3d_sunny_weather_icon_clean.png",
};

function Icon3D({ emoji, size = "lg" }: { emoji: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const iconPath = ICON_MAP[emoji];
  const sizeClasses = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10", xl: "w-14 h-14" };
  if (iconPath) {
    return <img src={`${iconPath}?v=3`} alt="" className={`${sizeClasses[size]} object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]`} />;
  }
  return <span className="text-2xl">{emoji}</span>;
}

const mockPerformanceData = {
  workerId: 'W-001',
  workerName: 'John Smith',
  totalHoursWorked: 1248,
  totalEarnings: 23088,
  shiftsCompleted: 156,
  shiftsAccepted: 164,
  shiftsDeclined: 12,
  noShows: 2,
  averageRating: 4.8,
  onTimePercentage: 98,
  currentStreak: 45,
  longestStreak: 67,
  badges: [
    { id: 1, name: 'Top Performer', icon: '🏆', earnedDate: '2024-10-15', description: '100+ shifts completed' },
    { id: 2, name: 'Perfect Attendance', icon: '✅', earnedDate: '2024-09-01', description: '60 days no absences' },
    { id: 3, name: 'Safety Champion', icon: '🛡️', earnedDate: '2024-08-20', description: 'Zero safety incidents' },
    { id: 4, name: 'Early Bird', icon: '🌅', earnedDate: '2024-11-01', description: 'Always 10+ min early' }
  ],
  monthlyData: [
    { month: 'Jun', hours: 160, earnings: 2960, rating: 4.7 },
    { month: 'Jul', hours: 176, earnings: 3256, rating: 4.8 },
    { month: 'Aug', hours: 168, earnings: 3108, rating: 4.9 },
    { month: 'Sep', hours: 152, earnings: 2812, rating: 4.8 },
    { month: 'Oct', hours: 184, earnings: 3404, rating: 4.9 },
    { month: 'Nov', hours: 192, earnings: 3552, rating: 4.8 }
  ],
  categoryBreakdown: [
    { category: 'Warehouse', hours: 720, percentage: 58 },
    { category: 'Events', hours: 240, percentage: 19 },
    { category: 'Construction', hours: 168, percentage: 13 },
    { category: 'Retail', hours: 120, percentage: 10 }
  ],
  recentAchievements: [
    { id: 1, title: '50 Shift Milestone', date: '2024-11-20', reward: '+$50 bonus' },
    { id: 2, title: 'Month Perfect Attendance', date: '2024-11-01', reward: '+$100 bonus' },
    { id: 3, title: '5-Star Rating Streak', date: '2024-10-25', reward: 'Priority scheduling' }
  ],
  skillProficiency: [
    { skill: 'Forklift Operation', level: 95 },
    { skill: 'Inventory Management', level: 88 },
    { skill: 'Safety Compliance', level: 100 },
    { skill: 'Team Leadership', level: 82 },
    { skill: 'Quality Control', level: 90 }
  ]
};

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export function WorkerPerformanceDashboard() {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m' | '1y'>('6m');

  const acceptanceRate = Math.round((mockPerformanceData.shiftsAccepted / (mockPerformanceData.shiftsAccepted + mockPerformanceData.shiftsDeclined)) * 100);
  const completionRate = Math.round((mockPerformanceData.shiftsCompleted / mockPerformanceData.shiftsAccepted) * 100);
  const averageHourly = mockPerformanceData.totalEarnings / mockPerformanceData.totalHoursWorked;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Worker Performance Dashboard
          </h2>
          <p className="text-gray-400">Track your stats, earnings, and achievements</p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            data-testid="select-time-range"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" data-testid="button-export-report">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 border border-cyan-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-cyan-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{mockPerformanceData.totalHoursWorked}h</p>
          <p className="text-cyan-300 font-bold text-sm">Total Hours Worked</p>
          <p className="text-xs text-cyan-400 mt-2">↑ 12% vs last period</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">${mockPerformanceData.totalEarnings.toLocaleString()}</p>
          <p className="text-green-300 font-bold text-sm">Total Earnings</p>
          <p className="text-xs text-green-400 mt-2">${averageHourly.toFixed(2)}/hr average</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{mockPerformanceData.averageRating}</p>
          <p className="text-yellow-300 font-bold text-sm">Average Rating</p>
          <p className="text-xs text-yellow-400 mt-2">{mockPerformanceData.shiftsCompleted} reviews</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{mockPerformanceData.currentStreak}</p>
          <p className="text-purple-300 font-bold text-sm">Day Streak</p>
          <p className="text-xs text-purple-400 mt-2">Longest: {mockPerformanceData.longestStreak} days</p>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Shift Acceptance
          </h3>
          <div className="text-center mb-4">
            <p className="text-5xl font-bold text-cyan-400">{acceptanceRate}%</p>
            <p className="text-sm text-gray-400 mt-2">
              {mockPerformanceData.shiftsAccepted} accepted / {mockPerformanceData.shiftsDeclined} declined
            </p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all"
              style={{ width: `${acceptanceRate}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Completion Rate
          </h3>
          <div className="text-center mb-4">
            <p className="text-5xl font-bold text-green-400">{completionRate}%</p>
            <p className="text-sm text-gray-400 mt-2">
              {mockPerformanceData.shiftsCompleted} completed / {mockPerformanceData.noShows} no-shows
            </p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            On-Time Arrival
          </h3>
          <div className="text-center mb-4">
            <p className="text-5xl font-bold text-yellow-400">{mockPerformanceData.onTimePercentage}%</p>
            <p className="text-sm text-gray-400 mt-2">
              {Math.round(mockPerformanceData.shiftsCompleted * (mockPerformanceData.onTimePercentage / 100))} on-time arrivals
            </p>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-yellow-500 h-full transition-all"
              style={{ width: `${mockPerformanceData.onTimePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Earnings Trend */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Monthly Earnings & Hours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockPerformanceData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="earnings" fill="#10b981" name="Earnings ($)" />
              <Bar dataKey="hours" fill="#06b6d4" name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Work Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={mockPerformanceData.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="hours"
              >
                {mockPerformanceData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-400" />
          Badges Earned ({mockPerformanceData.badges.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {mockPerformanceData.badges.map((badge) => (
            <div key={badge.id} className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg p-4 text-center">
              <div className="mb-2 flex justify-center"><Icon3D emoji={badge.icon} /></div>
              <p className="text-white font-bold mb-1">{badge.name}</p>
              <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
              <p className="text-xs text-purple-400">Earned {badge.earnedDate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Proficiency */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-cyan-400" />
          Skill Proficiency
        </h3>
        <div className="space-y-4">
          {mockPerformanceData.skillProficiency.map((skill) => (
            <div key={skill.skill}>
              <div className="flex justify-between mb-2">
                <span className="text-white font-medium">{skill.skill}</span>
                <span className="text-cyan-400 font-bold">{skill.level}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Recent Achievements
        </h3>
        <div className="space-y-3">
          {mockPerformanceData.recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded hover:bg-slate-700">
              <div className="flex items-center gap-4">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-white font-bold">{achievement.title}</p>
                  <p className="text-sm text-gray-400">{achievement.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-600 text-white text-sm rounded font-bold">
                  {achievement.reward}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
