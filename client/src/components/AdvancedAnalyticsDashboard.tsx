import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, AlertTriangle, BarChart3, Calendar, Target, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  activeWorkers: number;
  workerGrowth: number;
  avgWorkerPerformance: number;
  churnRate: number;
  predictedRevenue: number;
  topPerformers: Array<{ name: string; score: number; revenue: number }>;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export function AdvancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 145680,
    revenueGrowth: 23.5,
    activeWorkers: 342,
    workerGrowth: 12.3,
    avgWorkerPerformance: 87.5,
    churnRate: 4.2,
    predictedRevenue: 168000,
    topPerformers: [
      { name: 'John Davis', score: 98, revenue: 12400 },
      { name: 'Sarah Chen', score: 96, revenue: 11800 },
      { name: 'Mike Torres', score: 94, revenue: 11200 },
      { name: 'Lisa Rodriguez', score: 92, revenue: 10900 },
      { name: 'David Kim', score: 90, revenue: 10500 },
    ],
  });

  // Revenue forecast data (6 months)
  const revenueForecast = [
    { month: 'Jul', actual: 142000, predicted: 142000, target: 140000 },
    { month: 'Aug', actual: 145680, predicted: 145680, target: 145000 },
    { month: 'Sep', actual: null, predicted: 152000, target: 150000 },
    { month: 'Oct', actual: null, predicted: 158000, target: 155000 },
    { month: 'Nov', actual: null, predicted: 164000, target: 160000 },
    { month: 'Dec', actual: null, predicted: 168000, target: 165000 },
  ];

  // Worker performance distribution
  const performanceDistribution = [
    { range: '90-100', count: 45, fill: '#10b981' },
    { range: '80-89', count: 112, fill: '#06b6d4' },
    { range: '70-79', count: 98, fill: '#f59e0b' },
    { range: '60-69', count: 52, fill: '#ef4444' },
    { range: '<60', count: 35, fill: '#7c3aed' },
  ];

  // Industry breakdown
  const industryBreakdown = [
    { name: 'Construction', value: 35, workers: 120 },
    { name: 'Hospitality', value: 28, workers: 96 },
    { name: 'Warehouse', value: 22, workers: 75 },
    { name: 'Events', value: 10, workers: 34 },
    { name: 'Other', value: 5, workers: 17 },
  ];

  // Churn prediction data
  const churnPrediction = [
    { month: 'Aug', rate: 4.2 },
    { month: 'Sep', rate: 4.5 },
    { month: 'Oct', rate: 4.1 },
    { month: 'Nov', rate: 3.8 },
    { month: 'Dec', rate: 3.5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Advanced Analytics</h2>
        <p className="text-gray-400 text-sm">AI-powered insights and predictive forecasting</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-400" />
            <span className={`text-sm font-bold ${metrics.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.revenueGrowth >= 0 ? '+' : ''}{metrics.revenueGrowth}%
            </span>
          </div>
          <p className="text-2xl font-bold">${(metrics.totalRevenue / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-400 mt-1">Total Revenue (MTD)</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-cyan-400" />
            <span className={`text-sm font-bold ${metrics.workerGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.workerGrowth >= 0 ? '+' : ''}{metrics.workerGrowth}%
            </span>
          </div>
          <p className="text-2xl font-bold">{metrics.activeWorkers}</p>
          <p className="text-xs text-gray-400 mt-1">Active Workers</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">{metrics.avgWorkerPerformance}/100</span>
          </div>
          <p className="text-2xl font-bold">{metrics.avgWorkerPerformance}%</p>
          <p className="text-xs text-gray-400 mt-1">Avg Performance Score</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className={`w-8 h-8 ${metrics.churnRate > 5 ? 'text-red-400' : 'text-yellow-400'}`} />
            <span className={`text-sm font-bold ${metrics.churnRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.churnRate}%
            </span>
          </div>
          <p className="text-2xl font-bold">{metrics.churnRate}%</p>
          <p className="text-xs text-gray-400 mt-1">Churn Rate</p>
        </div>
      </div>

      {/* Revenue Forecasting */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold">Revenue Forecasting (AI-Powered)</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Predicted 6-month revenue: <span className="text-green-400 font-bold">${(metrics.predictedRevenue / 1000).toFixed(1)}K</span>
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              formatter={(value: any) => `$${(value / 1000).toFixed(1)}K`}
            />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={3} strokeDasharray="5 5" name="AI Forecast" />
            <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance & Industry Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Worker Performance Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold">Performance Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="count" fill="#8b5cf6" name="Workers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Industry Breakdown */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Industry Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={industryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {industryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Churn Prediction */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold">Churn Rate Prediction</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          AI predicts churn will {churnPrediction[churnPrediction.length - 1].rate < metrics.churnRate ? 'decrease' : 'increase'} to {' '}
          <span className={`font-bold ${churnPrediction[churnPrediction.length - 1].rate < metrics.churnRate ? 'text-green-400' : 'text-red-400'}`}>
            {churnPrediction[churnPrediction.length - 1].rate}%
          </span> by December
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={churnPrediction}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              formatter={(value: any) => `${value}%`}
            />
            <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={3} name="Churn Rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold">Top Performers (This Month)</h3>
        </div>
        <div className="space-y-3">
          {metrics.topPerformers.map((worker, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-orange-600/20 text-orange-400' :
                  'bg-slate-600/20 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-bold">{worker.name}</p>
                  <p className="text-xs text-gray-400">Score: {worker.score}/100</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">${worker.revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
