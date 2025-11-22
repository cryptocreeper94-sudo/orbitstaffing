import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cloud, MapPin, Eye, Wind, Droplets, Maximize2, X } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  precipitation: number;
  feelsLike: number;
}

interface ForecastDay {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
}

export function WeatherWidget() {
  const [zipCode, setZipCode] = useState('37201'); // Nashville default
  const [location, setLocation] = useState('Nashville, TN');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (zip: string) => {
    setLoading(true);
    setError('');
    try {
      // Simple ZIP to coordinates mapping (in production, use geocoding API)
      const zipCoords: Record<string, [number, number, string]> = {
        '37201': [36.1627, -86.7816, 'Nashville, TN'],
        '90210': [34.0901, -118.4065, 'Beverly Hills, CA'],
        '10001': [40.7505, -73.9972, 'New York, NY'],
        '60601': [41.8842, -87.6188, 'Chicago, IL'],
        '98101': [47.6062, -122.3321, 'Seattle, WA'],
      };

      const coords = zipCoords[zip] || zipCoords['37201'];
      const [latitude, longitude, locName] = coords;
      setLocation(locName);

      // Fetch weather data from Open-Meteo (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
      );
      
      if (!response.ok) throw new Error('Failed to fetch weather');
      
      const data = await response.json();
      const current = data.current;
      const daily = data.daily;

      setWeather({
        temperature: Math.round(current.temperature_2m),
        condition: getWeatherCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        visibility: current.visibility / 1000,
        precipitation: current.precipitation || 0,
        feelsLike: Math.round(current.temperature_2m - (current.wind_speed_10m / 10)),
      });

      // Build 10-day forecast
      const forecastDays: ForecastDay[] = [];
      for (let i = 0; i < Math.min(10, daily.time.length); i++) {
        forecastDays.push({
          date: new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          high: Math.round(daily.temperature_2m_max[i]),
          low: Math.round(daily.temperature_2m_min[i]),
          condition: getWeatherCondition(daily.weather_code[i]),
          icon: getWeatherIcon(daily.weather_code[i]),
          precipitation: daily.precipitation_sum[i] || 0,
        });
      }
      setForecast(forecastDays);
    } catch (err) {
      setError('Unable to fetch weather. Please check ZIP code.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(zipCode);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length === 5) {
      fetchWeather(zipCode);
    }
  };

  const getWeatherIcon = (code: number): string => {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code === 51 || code === 53 || code === 55 || code === 61 || code === 63 || code === 65) return '🌧️';
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 80 || code === 81 || code === 82) return '🌨️';
    if (code === 85 || code === 86) return '❄️';
    if (code === 80 || code === 81 || code === 82) return '⛈️';
    return '🌤️';
  };

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear Sky';
    if (code === 1 || code === 2) return 'Mostly Clear';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 86) return 'Snow/Sleet';
    return 'Unknown';
  };

  const getPrecipitationColor = (mm: number): string => {
    if (mm === 0) return 'text-gray-400'; // No precipitation
    if (mm < 2) return 'text-yellow-400'; // Light (yellow)
    if (mm < 10) return 'text-orange-400'; // Moderate (orange)
    return 'text-red-400'; // Heavy (red)
  };

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-slate-800 border-b border-slate-700">
            <CardTitle>Weather Radar & Forecast</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              data-testid="button-close-weather"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                maxLength={5}
                className="max-w-xs"
                data-testid="input-zip-code-expanded"
              />
              <Button
                type="submit"
                disabled={zipCode.length !== 5 || loading}
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-search-weather-expanded"
              >
                Search
              </Button>
            </form>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            {weather && (
              <div className="space-y-6">
                {/* Current Weather */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">{location}</h2>
                      <p className="text-gray-400 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Current Conditions
                      </p>
                    </div>
                    <div className="text-6xl">{getWeatherIcon(0)}</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Temperature</p>
                      <p className="text-3xl font-bold text-white">{weather.temperature}°F</p>
                      <p className="text-xs text-gray-500">Feels like {weather.feelsLike}°F</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Condition</p>
                      <p className="text-xl font-bold text-white">{weather.condition}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                        <Droplets className="w-4 h-4" /> Humidity
                      </p>
                      <p className="text-2xl font-bold text-white">{weather.humidity}%</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                        <Wind className="w-4 h-4" /> Wind Speed
                      </p>
                      <p className="text-2xl font-bold text-white">{weather.windSpeed} mph</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                        <Eye className="w-4 h-4" /> Visibility
                      </p>
                      <p className="text-2xl font-bold text-white">{weather.visibility.toFixed(1)} km</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Precipitation</p>
                      <p className={`text-2xl font-bold ${getPrecipitationColor(weather.precipitation)}`}>
                        {weather.precipitation.toFixed(1)} mm
                      </p>
                    </div>
                  </div>
                </div>

                {/* 10-Day Forecast */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">10-Day Forecast</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {forecast.map((day, idx) => (
                      <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <p className="font-bold text-white mb-2">{day.date}</p>
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-4xl">{day.icon}</div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">{day.high}°F</p>
                            <p className="text-sm text-gray-400">{day.low}°F</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 mb-2">{day.condition}</p>
                        {day.precipitation > 0 && (
                          <p className={`text-xs font-bold ${getPrecipitationColor(day.precipitation)}`}>
                            💧 {day.precipitation.toFixed(1)}mm
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Map Information */}
                <div className="bg-gradient-to-br from-cyan-900/30 to-slate-900/50 rounded-lg p-6 border border-cyan-700/50">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                    Precipitation Radar
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Radar intensity scale based on precipitation levels:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-400 rounded" />
                      <span className="text-sm text-gray-300">Light: 0-2mm (Yellow)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-400 rounded" />
                      <span className="text-sm text-gray-300">Moderate: 2-10mm (Orange)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-400 rounded" />
                      <span className="text-sm text-gray-300">Heavy: 10mm+ (Red)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="w-5 h-5 text-cyan-400" />
            Weather
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-cyan-400 hover:text-cyan-300"
            data-testid="button-expand-weather"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ZIP Code Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
            maxLength={5}
            className="text-sm"
            data-testid="input-zip-code"
          />
          <Button
            type="submit"
            disabled={zipCode.length !== 5 || loading}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700"
            data-testid="button-search-weather"
          >
            Go
          </Button>
        </form>

        {error && (
          <div className="text-red-400 text-xs">{error}</div>
        )}

        {weather && (
          <>
            {/* Current Weather */}
            <div>
              <p className="text-xs text-gray-400 mb-1">{location}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">{weather.temperature}°F</div>
                  <p className="text-xs text-gray-400">{weather.condition}</p>
                </div>
                <div className="text-4xl">{getWeatherIcon(0)}</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-gray-400">Humidity</p>
                <p className="font-bold text-white">{weather.humidity}%</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-gray-400">Wind</p>
                <p className="font-bold text-white">{weather.windSpeed} mph</p>
              </div>
            </div>

            {/* Mini 3-Day Forecast */}
            {forecast.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Next 3 Days</p>
                <div className="space-y-2">
                  {forecast.slice(1, 4).map((day, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-700/30 rounded p-2 text-xs">
                      <span className="text-gray-300">{day.date.split(',')[0]}</span>
                      <div className="flex items-center gap-2">
                        <span>{day.icon}</span>
                        <span className={`font-bold ${getPrecipitationColor(day.precipitation)}`}>
                          {day.high}°/{day.low}°
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Radar Legend */}
            <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
              <p className="text-xs text-gray-400 mb-2 font-bold">Precipitation Scale</p>
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-gray-300">Light</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span className="text-gray-300">Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-gray-300">Heavy</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsExpanded(true)}
              variant="outline"
              size="sm"
              className="w-full text-xs border-slate-600 hover:bg-slate-700"
              data-testid="button-view-full-weather"
            >
              View Full Radar & Forecast
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
