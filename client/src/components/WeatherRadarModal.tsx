import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, Layers, MapPin, Thermometer, Droplets, Wind, 
  AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, Maximize2, Minimize2,
  Cloud, CloudRain, Snowflake, Sun, Moon, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  pressure: number;
  alerts: string[];
  icon: string;
}

interface RadarFrame {
  time: number;
  path: string;
}

interface LocationData {
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface WeatherRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';
const WEATHER_STORAGE_KEY = 'orbit-weather-coords';
const LOCATION_STORAGE_KEY = 'orbit-weather-location';
const ZIP_STORAGE_KEY = 'orbit-weather-zip';

const WEATHER_CODES: Record<number, { condition: string; description: string; icon: string }> = {
  0: { condition: 'Clear', description: 'Clear sky', icon: '☀️' },
  1: { condition: 'Mainly Clear', description: 'Mainly clear', icon: '🌤️' },
  2: { condition: 'Partly Cloudy', description: 'Partly cloudy', icon: '⛅' },
  3: { condition: 'Overcast', description: 'Overcast', icon: '☁️' },
  45: { condition: 'Fog', description: 'Fog', icon: '🌫️' },
  48: { condition: 'Rime Fog', description: 'Depositing rime fog', icon: '🌫️' },
  51: { condition: 'Light Drizzle', description: 'Light drizzle', icon: '🌧️' },
  53: { condition: 'Drizzle', description: 'Moderate drizzle', icon: '🌧️' },
  55: { condition: 'Heavy Drizzle', description: 'Dense drizzle', icon: '🌧️' },
  61: { condition: 'Light Rain', description: 'Slight rain', icon: '🌧️' },
  63: { condition: 'Rain', description: 'Moderate rain', icon: '🌧️' },
  65: { condition: 'Heavy Rain', description: 'Heavy rain', icon: '🌧️' },
  66: { condition: 'Freezing Rain', description: 'Light freezing rain', icon: '🌨️' },
  67: { condition: 'Heavy Freezing Rain', description: 'Heavy freezing rain', icon: '🌨️' },
  71: { condition: 'Light Snow', description: 'Slight snow', icon: '❄️' },
  73: { condition: 'Snow', description: 'Moderate snow', icon: '❄️' },
  75: { condition: 'Heavy Snow', description: 'Heavy snow', icon: '❄️' },
  80: { condition: 'Rain Showers', description: 'Slight rain showers', icon: '🌦️' },
  81: { condition: 'Rain Showers', description: 'Moderate rain showers', icon: '🌦️' },
  82: { condition: 'Heavy Showers', description: 'Violent rain showers', icon: '⛈️' },
  95: { condition: 'Thunderstorm', description: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Thunderstorm', description: 'Thunderstorm with hail', icon: '⛈️' },
  99: { condition: 'Severe Thunderstorm', description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

const MAP_LAYERS = [
  { id: 'radar', name: 'Radar', icon: CloudRain, color: 'text-blue-400' },
  { id: 'satellite', name: 'Satellite', icon: Cloud, color: 'text-slate-400' },
  { id: 'temperature', name: 'Temperature', icon: Thermometer, color: 'text-orange-400' },
];

export function WeatherRadarModal({ isOpen, onClose }: WeatherRadarModalProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeLayer, setActiveLayer] = useState<'radar' | 'satellite' | 'temperature'>('radar');
  const [loading, setLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(6);
  const [radarHost, setRadarHost] = useState('');
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const fetchRainViewerData = useCallback(async () => {
    try {
      const response = await fetch(RAINVIEWER_API);
      const data = await response.json();
      
      setRadarHost(data.host);
      
      if (data.radar && data.radar.past) {
        const frames = data.radar.past.map((frame: { time: number; path: string }) => ({
          time: frame.time,
          path: frame.path,
        }));
        
        if (data.radar.nowcast) {
          frames.push(...data.radar.nowcast.map((frame: { time: number; path: string }) => ({
            time: frame.time,
            path: frame.path,
          })));
        }
        
        setRadarFrames(frames);
        setCurrentFrame(frames.length - 1);
      }
    } catch (err) {
      console.error('Failed to fetch radar data:', err);
    }
  }, []);

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=precipitation_probability,temperature_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
      );
      
      if (!response.ok) throw new Error('Weather fetch failed');
      
      const data = await response.json();
      const current = data.current;
      
      const code = current.weather_code || 0;
      const weatherInfo = WEATHER_CODES[code] || { condition: 'Unknown', description: 'Unknown', icon: '❓' };
      
      const windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const windIndex = Math.round(current.wind_direction_10m / 22.5) % 16;
      
      const alerts: string[] = [];
      if (current.weather_code >= 95) alerts.push('⚠️ Thunderstorm Warning');
      if (current.wind_speed_10m > 40) alerts.push('💨 High Wind Advisory');
      if (current.temperature_2m < 0) alerts.push('❄️ Freezing Conditions');
      if (current.temperature_2m > 35) alerts.push('🌡️ Extreme Heat Warning');
      
      const weatherData: WeatherData = {
        temp: Math.round(current.temperature_2m * 9/5 + 32),
        feelsLike: Math.round(current.apparent_temperature * 9/5 + 32),
        condition: weatherInfo.condition,
        description: weatherInfo.description,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 0.621371),
        windDirection: windDirections[windIndex],
        precipitation: data.hourly?.precipitation_probability?.[0] || 0,
        pressure: Math.round(current.surface_pressure * 0.02953),
        alerts,
        icon: weatherInfo.icon,
      };
      
      setWeather(weatherData);
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRainViewerData();
      
      const savedCoords = localStorage.getItem(WEATHER_STORAGE_KEY);
      const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      const savedZip = localStorage.getItem(ZIP_STORAGE_KEY);
      
      if (savedCoords) {
        try {
          const coords = JSON.parse(savedCoords);
          const [city, state] = (savedLocation || '').split(', ');
          setLocation({
            lat: coords.lat,
            lon: coords.lon,
            city: city || undefined,
            state: state || undefined,
            zipCode: savedZip || undefined,
          });
          fetchWeatherByCoords(coords.lat, coords.lon);
        } catch {
          console.error('Failed to parse saved coords');
        }
      }
    }
  }, [isOpen, fetchRainViewerData, fetchWeatherByCoords]);

  useEffect(() => {
    if (isPlaying && radarFrames.length > 0 && isOpen) {
      animationRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % radarFrames.length);
      }, 500);
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, radarFrames.length, isOpen]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMapTileUrl = (z: number, x: number, y: number) => {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  const getRadarTileUrl = (z: number, x: number, y: number) => {
    if (!radarFrames.length || !radarHost) return '';
    const frame = radarFrames[currentFrame];
    return `${radarHost}${frame.path}/256/${z}/${x}/${y}/2/1_1.png`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="absolute inset-2 sm:inset-4 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(6, 182, 212, 0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full flex flex-col lg:flex-row">
            <div className="lg:w-1/3 bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-b lg:border-b-0 lg:border-r border-cyan-500/20 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-cyan-400" />
                  Weather Radar
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-red-600/50 transition-all"
                  data-testid="button-close-radar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {location && (
                <div className="flex items-center gap-2 text-sm text-slate-300 mb-4 bg-slate-800/50 rounded-lg p-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{location.city}, {location.state}</span>
                  {location.zipCode && (
                    <span className="text-slate-500">({location.zipCode})</span>
                  )}
                </div>
              )}

              {weather && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-4">
                      <motion.span 
                        className="text-6xl"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {weather.icon}
                      </motion.span>
                      <div>
                        <div className="text-5xl font-bold text-white">{weather.temp}°</div>
                        <div className="text-sm text-slate-400">{weather.condition}</div>
                        <div className="text-xs text-slate-500">Feels like {weather.feelsLike}°</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center gap-2 text-blue-400 mb-1">
                        <Droplets className="w-4 h-4" />
                        <span className="text-xs">Humidity</span>
                      </div>
                      <div className="text-lg font-semibold text-white">{weather.humidity}%</div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <Wind className="w-4 h-4" />
                        <span className="text-xs">Wind</span>
                      </div>
                      <div className="text-lg font-semibold text-white">{weather.windSpeed} mph {weather.windDirection}</div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <CloudRain className="w-4 h-4" />
                        <span className="text-xs">Precipitation</span>
                      </div>
                      <div className="text-lg font-semibold text-white">{weather.precipitation}%</div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <div className="flex items-center gap-2 text-orange-400 mb-1">
                        <Thermometer className="w-4 h-4" />
                        <span className="text-xs">Pressure</span>
                      </div>
                      <div className="text-lg font-semibold text-white">{weather.pressure} inHg</div>
                    </div>
                  </div>

                  {weather.alerts.length > 0 && (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-400 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-semibold">Weather Alerts</span>
                      </div>
                      {weather.alerts.map((alert, i) => (
                        <div key={i} className="text-sm text-red-300">{alert}</div>
                      ))}
                    </div>
                  )}

                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-2">Map Layers</div>
                    <div className="flex gap-2 flex-wrap">
                      {MAP_LAYERS.map((layer) => (
                        <button
                          key={layer.id}
                          onClick={() => setActiveLayer(layer.id as any)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                            activeLayer === layer.id
                              ? 'bg-cyan-600 text-white'
                              : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50'
                          }`}
                        >
                          <layer.icon className={`w-3.5 h-3.5 ${activeLayer === layer.id ? 'text-white' : layer.color}`} />
                          {layer.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              )}
            </div>

            <div className="lg:w-2/3 relative flex flex-col bg-slate-950">
              <div 
                ref={mapContainerRef}
                className="flex-1 relative overflow-hidden"
                style={{ minHeight: '300px' }}
              >
                {location && (
                  <>
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(https://tile.openstreetmap.org/${mapZoom}/${Math.floor((location.lon + 180) / 360 * Math.pow(2, mapZoom))}/${Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, mapZoom))}.png)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.7) saturate(0.8)',
                      }}
                    />

                    {activeLayer === 'radar' && radarFrames.length > 0 && radarHost && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: `url(${radarHost}${radarFrames[currentFrame]?.path}/256/${mapZoom}/${Math.floor((location.lon + 180) / 360 * Math.pow(2, mapZoom))}/${Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, mapZoom))}/2/1_1.png)`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: 0.7,
                          mixBlendMode: 'screen',
                        }}
                      />
                    )}

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="relative">
                        <div className="w-6 h-6 bg-cyan-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-900/90 px-2 py-1 rounded text-xs text-white font-medium">
                          {location.city}
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30 pointer-events-none" />
                  </>
                )}

                {!location && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="text-center">
                      <CloudRain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500">Set your location to view radar</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/90 border-t border-cyan-500/20 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
                      data-testid="button-radar-play"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => setCurrentFrame((prev) => (prev - 1 + radarFrames.length) % radarFrames.length)}
                      className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setCurrentFrame((prev) => (prev + 1) % radarFrames.length)}
                      className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {radarFrames.length > 0 && (
                    <div className="flex-1 mx-4">
                      <input
                        type="range"
                        min={0}
                        max={radarFrames.length - 1}
                        value={currentFrame}
                        onChange={(e) => {
                          setIsPlaying(false);
                          setCurrentFrame(parseInt(e.target.value));
                        }}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>{radarFrames[0] && formatTime(radarFrames[0].time)}</span>
                        <span className="text-cyan-400 font-medium">
                          {radarFrames[currentFrame] && formatTime(radarFrames[currentFrame].time)}
                        </span>
                        <span>{radarFrames[radarFrames.length - 1] && formatTime(radarFrames[radarFrames.length - 1].time)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMapZoom(Math.max(4, mapZoom - 1))}
                      className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="text-xs text-slate-400 w-8 text-center">{mapZoom}x</span>
                    <button
                      onClick={() => setMapZoom(Math.min(10, mapZoom + 1))}
                      className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <div className="bg-slate-900/90 rounded-lg px-3 py-2 border border-cyan-500/20">
                  <div className="text-xs text-slate-400 mb-1">Radar Legend</div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 bg-green-500 rounded-sm" />
                    <div className="w-4 h-2 bg-yellow-500 rounded-sm" />
                    <div className="w-4 h-2 bg-orange-500 rounded-sm" />
                    <div className="w-4 h-2 bg-red-500 rounded-sm" />
                    <div className="w-4 h-2 bg-purple-500 rounded-sm" />
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500 mt-0.5">
                    <span>Light</span>
                    <span>Heavy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
