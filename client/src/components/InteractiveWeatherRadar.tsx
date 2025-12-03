import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, CloudRain, Sun, Wind, Droplets, Eye, Thermometer, 
  X, Minimize2, Maximize2, MapPin, AlertTriangle, RefreshCw,
  Layers, Play, Pause, ChevronLeft, ChevronRight, Expand, Shrink
} from 'lucide-react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  visibility: number;
  uvIndex: number;
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
}

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';
const WEATHER_STORAGE_KEY = 'orbit_weather_location';

interface SavedLocation {
  zipCode: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
}

const getSavedLocation = (): SavedLocation | null => {
  try {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(WEATHER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveLocation = (data: SavedLocation) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    console.error('Failed to save location');
  }
};

export default function InteractiveWeatherRadar({
  onWeatherCapture,
  initialLocation,
}: {
  onWeatherCapture?: (weather: WeatherData) => void;
  initialLocation?: LocationData;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(initialLocation || null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeLayer, setActiveLayer] = useState<'radar' | 'satellite' | 'temperature'>('radar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [isLocationSaved, setIsLocationSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRainViewerData = useCallback(async () => {
    try {
      const response = await fetch(RAINVIEWER_API);
      const data = await response.json();
      
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
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=precipitation_probability&timezone=auto`
      );
      
      if (!response.ok) throw new Error('Weather fetch failed');
      
      const data = await response.json();
      const current = data.current;
      
      const weatherCodes: Record<number, { condition: string; description: string; icon: string }> = {
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

      const code = current.weather_code || 0;
      const weatherInfo = weatherCodes[code] || { condition: 'Unknown', description: 'Unknown', icon: '❓' };
      
      const windDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
      const windIndex = Math.round(current.wind_direction_10m / 22.5) % 16;
      
      const precip = data.hourly?.precipitation_probability?.[0] || 0;
      
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
        precipitation: precip,
        visibility: 10,
        uvIndex: 0,
        pressure: Math.round(current.surface_pressure * 0.02953),
        alerts,
        icon: weatherInfo.icon,
      };
      
      setWeather(weatherData);
      
      if (onWeatherCapture) {
        onWeatherCapture(weatherData);
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, [onWeatherCapture]);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setLocation(loc);
          fetchWeatherByCoords(loc.lat, loc.lon);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Location access denied. Enter ZIP code.');
          setLoading(false);
        }
      );
    }
  }, [fetchWeatherByCoords]);

  const searchByZip = async (saveToStorage = true) => {
    if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      setError('Enter a valid 5-digit ZIP code');
      return;
    }
    
    setLoading(true);
    setError(null);
    setIsLocationSaved(false);
    
    try {
      // Use Zippopotam.us API for US zip code lookup
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      
      if (!response.ok) {
        setError('ZIP code not found');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.places && data.places.length > 0) {
        const place = data.places[0];
        const loc = {
          lat: parseFloat(place.latitude),
          lon: parseFloat(place.longitude),
          city: place['place name'],
          state: place['state abbreviation'],
        };
        setLocation(loc);
        await fetchWeatherByCoords(loc.lat, loc.lon);
        
        if (saveToStorage) {
          saveLocation({
            zipCode,
            lat: loc.lat,
            lon: loc.lon,
            city: loc.city,
            state: loc.state,
          });
          setIsLocationSaved(true);
        }
      } else {
        setError('Location not found');
        setLoading(false);
      }
    } catch (err) {
      setError('Search failed - check ZIP code');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRainViewerData();
    const interval = setInterval(fetchRainViewerData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRainViewerData]);

  useEffect(() => {
    if (initialLocation) {
      fetchWeatherByCoords(initialLocation.lat, initialLocation.lon);
    } else {
      const saved = getSavedLocation();
      if (saved) {
        setZipCode(saved.zipCode);
        setIsLocationSaved(true);
        setLocation({
          lat: saved.lat,
          lon: saved.lon,
          city: saved.city,
          state: saved.state,
        });
        fetchWeatherByCoords(saved.lat, saved.lon);
      }
    }
  }, [initialLocation, fetchWeatherByCoords]);

  useEffect(() => {
    if (isPlaying && radarFrames.length > 0) {
      animationRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % radarFrames.length);
      }, 500);
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, radarFrames.length]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPrecipitationColor = (percent: number) => {
    if (percent < 20) return 'from-green-500 to-green-600';
    if (percent < 40) return 'from-blue-400 to-blue-500';
    if (percent < 60) return 'from-blue-500 to-blue-600';
    if (percent < 80) return 'from-purple-600 to-purple-700';
    return 'from-purple-700 to-red-700';
  };

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-[200] bg-slate-900'
    : 'fixed bottom-32 left-6 z-40';

  const panelClasses = isFullscreen
    ? 'w-full h-full'
    : 'w-[90vw] max-w-3xl max-h-[80vh]';

  return (
    <div className={containerClasses}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-all bg-gradient-to-br ${getPrecipitationColor(weather?.precipitation || 0)}`}
            data-testid="button-weather-widget-toggle"
            title={`${weather?.precipitation || 0}% Precipitation`}
          >
            <div className="text-center">
              <CloudRain className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
              <div className="text-[10px] sm:text-xs mt-0.5">{weather?.precipitation || 0}%</div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col ${panelClasses}`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-2 sm:p-3 flex justify-between items-center border-b border-cyan-500/20 shrink-0">
              <h3 className="text-white font-bold flex items-center gap-2 text-xs sm:text-sm">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">HD Weather Radar</span>
                <span className="sm:hidden">Weather</span>
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={getCurrentLocation}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-600/50 text-gray-300 hover:bg-green-600 hover:text-white transition-all"
                  title="Get Location"
                  disabled={loading}
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => weather && fetchWeatherByCoords(location?.lat || 0, location?.lon || 0)}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-600/50 text-gray-300 hover:bg-cyan-600 hover:text-white transition-all"
                  title="Refresh"
                  disabled={loading}
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 sm:p-1.5 rounded-lg bg-slate-600/50 text-gray-300 hover:bg-purple-600 hover:text-white transition-all"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Shrink className="w-3 h-3 sm:w-4 sm:h-4" /> : <Expand className="w-3 h-3 sm:w-4 sm:h-4" />}
                </button>
                <button
                  onClick={() => { setIsExpanded(false); setIsFullscreen(false); }}
                  className="p-1 sm:p-1.5 rounded-lg bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white transition-all"
                  title="Close"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Location Search */}
            <div className="p-2 border-b border-slate-700 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="ZIP code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                onKeyDown={(e) => e.key === 'Enter' && searchByZip()}
                className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                data-testid="input-weather-zip"
              />
              <button
                onClick={() => searchByZip()}
                disabled={loading}
                className="px-2 sm:px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-xs sm:text-sm transition-colors disabled:opacity-50"
                data-testid="button-weather-search"
              >
                Search
              </button>
            </div>

            {/* Location Display */}
            {location && (
              <div className="px-2 py-1 bg-slate-800/50 text-xs text-gray-400 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  {location.city ? `${location.city}, ${location.state}` : `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`}
                </div>
                {isLocationSaved && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    ✓ Saved
                  </span>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="px-2 py-1 bg-red-900/30 text-xs text-red-300 flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3 h-3" />
                {error}
              </div>
            )}

            {/* Side-by-Side Layout */}
            <div className={`flex flex-col md:flex-row ${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
              {/* Left Side - Weather Data */}
              <div className={`md:w-1/2 p-3 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-700 ${isFullscreen ? '' : 'max-h-64 md:max-h-none'}`}>
                {weather ? (
                  <div className="space-y-3">
                    {/* Main Temperature */}
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{weather.icon}</div>
                      <div>
                        <div className="text-4xl font-bold text-white">{weather.temp}°F</div>
                        <div className="text-sm text-gray-400">Feels like {weather.feelsLike}°F</div>
                      </div>
                    </div>
                    
                    {/* Condition */}
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-lg font-bold text-white">{weather.condition}</div>
                      <div className="text-sm text-gray-400">{weather.description}</div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
                        <Droplets className="w-6 h-6 text-blue-400" />
                        <div>
                          <div className="text-lg font-bold text-white">{weather.humidity}%</div>
                          <div className="text-xs text-gray-400">Humidity</div>
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
                        <Wind className="w-6 h-6 text-cyan-400" />
                        <div>
                          <div className="text-lg font-bold text-white">{weather.windSpeed} mph</div>
                          <div className="text-xs text-gray-400">{weather.windDirection}</div>
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
                        <CloudRain className="w-6 h-6 text-purple-400" />
                        <div>
                          <div className="text-lg font-bold text-white">{weather.precipitation}%</div>
                          <div className="text-xs text-gray-400">Precipitation</div>
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
                        <Eye className="w-6 h-6 text-green-400" />
                        <div>
                          <div className="text-lg font-bold text-white">{weather.pressure} inHg</div>
                          <div className="text-xs text-gray-400">Pressure</div>
                        </div>
                      </div>
                    </div>

                    {/* Weather Alerts */}
                    {weather.alerts.length > 0 && (
                      <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Weather Alerts
                        </div>
                        {weather.alerts.map((alert, i) => (
                          <div key={i} className="text-sm text-red-300">{alert}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    {loading ? (
                      <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <span className="text-sm">Loading weather...</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Thermometer className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">Enter ZIP code to view weather</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side - Radar Map */}
              <div className="md:w-1/2 flex flex-col">
                {/* Layer Tabs */}
                <div className="flex border-b border-slate-700 shrink-0">
                  {(['radar', 'satellite', 'temperature'] as const).map((layer) => (
                    <button
                      key={layer}
                      onClick={() => setActiveLayer(layer)}
                      className={`flex-1 py-2 px-2 text-xs font-medium transition-colors ${
                        activeLayer === layer
                          ? 'bg-cyan-600/20 text-cyan-400 border-b-2 border-cyan-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {layer === 'radar' && <CloudRain className="w-4 h-4 mx-auto mb-0.5" />}
                      {layer === 'satellite' && <Cloud className="w-4 h-4 mx-auto mb-0.5" />}
                      {layer === 'temperature' && <Thermometer className="w-4 h-4 mx-auto mb-0.5" />}
                      <span className="capitalize">{layer}</span>
                    </button>
                  ))}
                </div>

                {/* Map */}
                <div 
                  ref={mapRef}
                  className={`relative bg-slate-800 flex-1 ${isFullscreen ? '' : 'min-h-[200px] md:min-h-[250px]'}`}
                >
                  {radarFrames.length > 0 && location ? (
                    <>
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(https://tile.openstreetmap.org/${Math.floor(8)}/${Math.floor((location.lon + 180) / 360 * 256)}/${Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * 256)}.png)`,
                          filter: 'brightness(0.4) saturate(0.5)',
                        }}
                      />
                      
                      <img
                        src={`https://tilecache.rainviewer.com${radarFrames[currentFrame]?.path}/256/8/${Math.floor((location.lon + 180) / 360 * 256)}/${Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * 256)}/2/1_1.png`}
                        alt="Radar"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      
                      <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                        {radarFrames[currentFrame] && formatTime(radarFrames[currentFrame].time)}
                      </div>
                      
                      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-black/60 p-2 rounded">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="p-1.5 text-white hover:text-cyan-400"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setCurrentFrame((prev) => (prev - 1 + radarFrames.length) % radarFrames.length)}
                          className="p-1 text-white hover:text-cyan-400"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-400 transition-all"
                            style={{ width: `${((currentFrame + 1) / radarFrames.length) * 100}%` }}
                          />
                        </div>
                        <button
                          onClick={() => setCurrentFrame((prev) => (prev + 1) % radarFrames.length)}
                          className="p-1 text-white hover:text-cyan-400"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      {loading ? (
                        <RefreshCw className="w-8 h-8 animate-spin" />
                      ) : (
                        <div className="text-center">
                          <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <span className="text-sm">Enter location to view radar</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Radar Legend */}
                <div className="p-2 border-t border-slate-700 shrink-0">
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Light</span>
                    <div className="flex-1 mx-2 h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-500 to-red-600" />
                    <span>Heavy</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
