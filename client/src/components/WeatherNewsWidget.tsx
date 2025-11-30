import React, { useState } from 'react';
import { Cloud, CloudRain, AlertTriangle, Newspaper, Wind, Droplets, Eye, X } from 'lucide-react';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  precipitation: number;
  alerts: string[];
}

interface NewsItem {
  title: string;
  category: 'local' | 'national';
  timestamp: string;
}

export default function WeatherNewsWidget({ 
  userRole = 'worker',
  zipCode: initialZipCode = '37201'
}: { 
  userRole?: 'worker' | 'admin' | 'dev';
  zipCode?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [zipCode, setZipCode] = useState(initialZipCode);
  const [activeLayer, setActiveLayer] = useState<'precipitation' | 'weather' | 'news'>('precipitation');
  const [weather, setWeather] = useState<WeatherData>({
    temp: 72,
    condition: 'Cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    precipitation: 45,
    alerts: ['Thunderstorm Warning 2-4 PM'],
  });

  const news: NewsItem[] = [
    { title: 'Local Job Fair This Weekend', category: 'local', timestamp: 'Today' },
    { title: 'New Labor Law Effective Jan 1', category: 'national', timestamp: '2 hrs ago' },
  ];

  const getPrecipitationColor = (percent: number) => {
    if (percent < 20) return 'from-green-500 to-green-600';
    if (percent < 40) return 'from-blue-400 to-blue-500';
    if (percent < 60) return 'from-blue-500 to-blue-600';
    if (percent < 80) return 'from-purple-600 to-purple-700';
    return 'from-purple-700 to-red-700';
  };

  return (
    <div className="fixed bottom-32 left-6 z-40">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-all bg-gradient-to-br ${getPrecipitationColor(weather.precipitation)}`}
          data-testid="button-weather-widget-toggle"
          title={`${weather.precipitation}% Precipitation`}
        >
          <div className="text-center">
            <CloudRain className="w-8 h-8 mx-auto" />
            <div className="text-xs mt-1">{weather.precipitation}%</div>
          </div>
        </button>
      ) : (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl w-80 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 flex justify-between items-center border-b border-cyan-500/20">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Cloud className="w-5 h-5 text-cyan-400" />
              Weather & News Hub
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
              data-testid="button-weather-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Zip Code Input */}
          <div className="p-3 border-b border-slate-700 flex gap-2">
            <input
              type="text"
              placeholder="Enter zip code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              data-testid="input-zip-code"
            />
            <button
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm transition-colors"
              data-testid="button-zip-search"
            >
              Search
            </button>
          </div>

          {/* Layer Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveLayer('precipitation')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeLayer === 'precipitation'
                  ? 'bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              data-testid="tab-precipitation"
            >
              <Droplets className="w-4 h-4 mx-auto mb-1" />
              Precipitation
            </button>
            <button
              onClick={() => setActiveLayer('weather')}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeLayer === 'weather'
                  ? 'bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              data-testid="tab-weather"
            >
              <Cloud className="w-4 h-4 mx-auto mb-1" />
              Weather
            </button>
            {(userRole === 'admin' || userRole === 'dev') && (
              <button
                onClick={() => setActiveLayer('news')}
                className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                  activeLayer === 'news'
                    ? 'bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                data-testid="tab-news"
              >
                <Newspaper className="w-4 h-4 mx-auto mb-1" />
                News
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {activeLayer === 'precipitation' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-red-700 rounded-lg p-6 text-white text-center">
                  <div className="text-4xl font-bold mb-2">{weather.precipitation}%</div>
                  <div className="text-sm">Chance of Precipitation</div>
                  <div className="mt-3 text-xs text-gray-200">
                    {weather.precipitation < 30 && '✓ Good conditions'}
                    {weather.precipitation >= 30 && weather.precipitation < 70 && '⚠ Possible rain'}
                    {weather.precipitation >= 70 && '⛈ Heavy rain expected'}
                  </div>
                </div>

                {/* Alerts */}
                {weather.alerts.length > 0 && (
                  <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
                    <div className="flex items-start gap-2 text-red-300 text-sm">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-red-400">Storm Alerts</div>
                        {weather.alerts.map((alert, i) => (
                          <div key={i} className="text-xs mt-1">{alert}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeLayer === 'weather' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 rounded p-3">
                    <div className="text-gray-400 text-xs">Temperature</div>
                    <div className="text-2xl font-bold text-white">{weather.temp}°F</div>
                  </div>
                  <div className="bg-slate-800 rounded p-3">
                    <div className="text-gray-400 text-xs">Humidity</div>
                    <div className="text-2xl font-bold text-white">{weather.humidity}%</div>
                  </div>
                  <div className="bg-slate-800 rounded p-3">
                    <div className="text-gray-400 text-xs flex items-center gap-1">
                      <Wind className="w-3 h-3" />Wind Speed
                    </div>
                    <div className="text-2xl font-bold text-white">{weather.windSpeed} mph</div>
                  </div>
                  <div className="bg-slate-800 rounded p-3">
                    <div className="text-gray-400 text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />Visibility
                    </div>
                    <div className="text-2xl font-bold text-white">{weather.visibility} mi</div>
                  </div>
                </div>
                <div className="bg-slate-800 rounded p-3 text-center">
                  <div className="text-gray-400 text-sm mb-2">Condition</div>
                  <div className="text-xl font-bold text-cyan-400">{weather.condition}</div>
                </div>
              </div>
            )}

            {activeLayer === 'news' && (userRole === 'admin' || userRole === 'dev') && (
              <div className="space-y-3">
                {news.map((item, i) => (
                  <div key={i} className="bg-slate-800 rounded p-3 border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <Newspaper className={`w-4 h-4 mt-1 flex-shrink-0 ${
                        item.category === 'local' ? 'text-green-400' : 'text-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white line-clamp-2">{item.title}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.category === 'local' ? '📍 Local' : '🌐 National'} • {item.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
