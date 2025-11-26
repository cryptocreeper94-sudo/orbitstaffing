import { useState } from 'react';
import { TrendingUp, Users, Calendar, AlertTriangle, Target, Brain } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastData {
  period: string;
  predicted: number;
  historical: number;
  confidence: number;
}

export function WorkforceForecastingAI() {
  const [forecastPeriod, setForecastPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  
  // AI-generated forecasts
  const weeklyForecast: ForecastData[] = [
    { period: 'Mon', predicted: 145, historical: 142, confidence: 92 },
    { period: 'Tue', predicted: 152, historical: 148, confidence: 90 },
    { period: 'Wed', predicted: 148, historical: 150, confidence: 91 },
    { period: 'Thu', predicted: 158, historical: 155, confidence: 88 },
    { period: 'Fri', predicted: 165, historical: 160, confidence: 85 },
    { period: 'Sat', predicted: 98, historical: 95, confidence: 94 },
    { period: 'Sun', predicted: 72, historical: 70, confidence: 95 },
  ];

  const monthlyForecast: ForecastData[] = [
    { period: 'Week 1', predicted: 520, historical: 515, confidence: 88 },
    { period: 'Week 2', predicted: 545, historical: 540, confidence: 86 },
    { period: 'Week 3', predicted: 560, historical: 550, confidence: 84 },
    { period: 'Week 4', predicted: 580, historical: 570, confidence: 82 },
  ];

  const quarterlyForecast: ForecastData[] = [
    { period: 'Month 1', predicted: 2200, historical: 2180, confidence: 78 },
    { period: 'Month 2', predicted: 2350, historical: 2300, confidence: 75 },
    { period: 'Month 3', predicted: 2500, historical: 2420, confidence: 72 },
  ];

  const currentForecast = 
    forecastPeriod === 'week' ? weeklyForecast :
    forecastPeriod === 'month' ? monthlyForecast :
    quarterlyForecast;

  const insights = [
    {
      type: 'surge',
      title: 'Predicted Demand Surge',
      description: 'Construction industry expected to increase by 22% this Thursday-Friday due to weather patterns',
      confidence: 87,
      action: 'Pre-recruit 12-15 additional workers',
      icon: TrendingUp,
      color: 'cyan',
    },
    {
      type: 'shortage',
      title: 'Potential Shortage Alert',
      description: 'Hospitality sector may face 8% shortage next weekend based on event calendar',
      confidence: 82,
      action: 'Reach out to inactive workers',
      icon: AlertTriangle,
      color: 'yellow',
    },
    {
      type: 'optimization',
      title: 'Staffing Optimization',
      description: 'AI recommends shifting 6 workers from warehouse to events for better utilization',
      confidence: 91,
      action: 'Review suggested reassignments',
      icon: Target,
      color: 'green',
    },
  ];

  const skillDemandForecast = [
    { skill: 'Forklift Operators', current: 45, predicted: 62, change: +37.8 },
    { skill: 'Bartenders', current: 32, predicted: 28, change: -12.5 },
    { skill: 'Construction Workers', current: 78, predicted: 95, change: +21.8 },
    { skill: 'Warehouse Workers', current: 56, predicted: 58, change: +3.6 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-400" />
          AI Workforce Forecasting
        </h2>
        <p className="text-gray-400 text-sm">Predictive analytics to optimize staffing decisions</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <span className="text-sm font-bold text-green-400">+18.5%</span>
          </div>
          <p className="text-2xl font-bold">2,450</p>
          <p className="text-xs text-gray-400 mt-1">Predicted Demand (Next 30 Days)</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-400">342</span>
          </div>
          <p className="text-2xl font-bold">2,180</p>
          <p className="text-xs text-gray-400 mt-1">Current Active Workers</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">87%</span>
          </div>
          <p className="text-2xl font-bold">87%</p>
          <p className="text-xs text-gray-400 mt-1">Avg Forecast Confidence</p>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">Demand Forecasting</h3>
            <p className="text-sm text-gray-400">AI-powered predictions based on historical patterns</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setForecastPeriod(period)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  forecastPeriod === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
                data-testid={`button-period-${period}`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currentForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              formatter={(value: any, name: string) => [
                value,
                name === 'predicted' ? 'AI Forecast' : 'Historical'
              ]}
            />
            <Legend />
            <Line type="monotone" dataKey="historical" stroke="#6b7280" strokeWidth={2} name="Historical" />
            <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" name="AI Forecast" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI-Powered Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 border-${insight.color}-500 bg-${insight.color}-500/5`}
                data-testid={`insight-${insight.type}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 text-${insight.color}-400`} />
                    <h4 className="font-bold">{insight.title}</h4>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-${insight.color}-500/20 text-${insight.color}-400`}>
                    {insight.confidence}% Confidence
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                <p className={`text-xs font-bold text-${insight.color}-400`}>
                  💡 Recommended Action: {insight.action}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Demand Forecast */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Skill Demand Forecast (Next 30 Days)</h3>
        <div className="space-y-3">
          {skillDemandForecast.map((skill) => (
            <div key={skill.skill} className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{skill.skill}</span>
                <span className={`text-sm font-bold ${skill.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {skill.change >= 0 ? '+' : ''}{skill.change.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Current: </span>
                  <span className="font-bold">{skill.current}</span>
                </div>
                <div>
                  <span className="text-gray-400">Predicted: </span>
                  <span className="font-bold text-purple-400">{skill.predicted}</span>
                </div>
              </div>
              <div className="mt-2 h-2 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className={`h-full ${skill.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(skill.change) * 2, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
