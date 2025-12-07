import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapPin, X, Thermometer, Droplets, Wind, RefreshCw, Radar, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  cloudCover: number;
  precipitation: number;
  condition: string;
  icon: string;
  isDay: boolean;
  weatherCode: number;
  timezone: string;
  updatedAt: string;
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
  admin1: string;
  country: string;
}

const WEATHER_EMOJIS: Record<string, string> = {
  sunny: '☀️',
  'partly-cloudy': '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  thunderstorm: '⛈️',
  snowy: '❄️',
  foggy: '🌫️',
  night: '🌙',
  'night-cloudy': '🌥️',
  windy: '💨',
  tornado: '🌪️',
  hot: '🔥',
  cold: '🥶',
};

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

function getMoonPhase(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  let c = 0, e = 0, jd = 0, b = 0;
  
  if (month < 3) {
    c = year - 1;
    e = month + 12;
  } else {
    c = year;
    e = month;
  }
  
  jd = Math.floor(365.25 * c) + Math.floor(30.6001 * (e + 1)) + day - 694039.09;
  jd /= 29.53059;
  b = Math.floor(jd);
  jd -= b;
  b = Math.round(jd * 8);
  
  if (b >= 8) b = 0;
  
  return MOON_PHASES[b];
}

const WEATHER_GLOWS: Record<string, { color: string; shadow: string; bg: string }> = {
  sunny: { 
    color: 'rgba(251, 191, 36, 0.8)', 
    shadow: '0 0 40px rgba(251, 191, 36, 0.6), 0 0 80px rgba(251, 191, 36, 0.3)',
    bg: 'from-amber-500/20 to-orange-500/10'
  },
  'partly-cloudy': { 
    color: 'rgba(251, 191, 36, 0.5)', 
    shadow: '0 0 30px rgba(251, 191, 36, 0.4), 0 0 60px rgba(148, 163, 184, 0.3)',
    bg: 'from-amber-400/15 to-slate-400/10'
  },
  cloudy: { 
    color: 'rgba(148, 163, 184, 0.6)', 
    shadow: '0 0 30px rgba(148, 163, 184, 0.5), 0 0 60px rgba(100, 116, 139, 0.3)',
    bg: 'from-slate-400/20 to-slate-600/10'
  },
  rainy: { 
    color: 'rgba(59, 130, 246, 0.6)', 
    shadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(37, 99, 235, 0.3)',
    bg: 'from-blue-500/20 to-blue-700/10'
  },
  thunderstorm: { 
    color: 'rgba(234, 179, 8, 0.7)', 
    shadow: '0 0 40px rgba(234, 179, 8, 0.6), 0 0 80px rgba(139, 92, 246, 0.4)',
    bg: 'from-yellow-500/20 to-purple-600/15'
  },
  snowy: { 
    color: 'rgba(226, 232, 240, 0.7)', 
    shadow: '0 0 35px rgba(226, 232, 240, 0.6), 0 0 70px rgba(186, 230, 253, 0.4)',
    bg: 'from-slate-200/20 to-cyan-200/10'
  },
  foggy: { 
    color: 'rgba(148, 163, 184, 0.5)', 
    shadow: '0 0 25px rgba(148, 163, 184, 0.4), 0 0 50px rgba(100, 116, 139, 0.2)',
    bg: 'from-slate-400/15 to-slate-500/10'
  },
  night: { 
    color: 'rgba(139, 92, 246, 0.6)', 
    shadow: '0 0 35px rgba(139, 92, 246, 0.5), 0 0 70px rgba(99, 102, 241, 0.3)',
    bg: 'from-purple-500/20 to-indigo-600/15'
  },
  tornado: {
    color: 'rgba(220, 38, 38, 0.7)',
    shadow: '0 0 40px rgba(220, 38, 38, 0.6), 0 0 80px rgba(127, 29, 29, 0.4)',
    bg: 'from-red-500/20 to-red-800/15'
  },
};

const CONDITION_LABELS: Record<string, string> = {
  sunny: 'Sunny',
  'partly-cloudy': 'Partly Cloudy',
  cloudy: 'Cloudy',
  rainy: 'Rainy',
  thunderstorm: 'Thunderstorm',
  snowy: 'Snowy',
  foggy: 'Foggy',
  night: 'Clear Night',
  'night-cloudy': 'Cloudy Night',
  clear: 'Clear',
  tornado: 'Severe Weather',
};

interface FloatingWeatherButtonProps {
  onOpenRadar?: () => void;
}

export function FloatingWeatherButton({ onOpenRadar }: FloatingWeatherButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showZipInput, setShowZipInput] = useState(false);
  const [zipCode, setZipCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('orbit-weather-zip') || '37090';
    }
    return '37090';
  });
  const [tempZip, setTempZip] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orbit-weather-coords');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [locationName, setLocationName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('orbit-weather-location') || '';
    }
    return '';
  });

  const { data: geoData, isLoading: geoLoading, refetch: refetchGeo } = useQuery<GeoLocation>({
    queryKey: ['/api/weather/geocode', zipCode],
    queryFn: async () => {
      if (!zipCode || zipCode.length !== 5) return null;
      const response = await fetch(`/api/weather/geocode/${zipCode}`);
      if (!response.ok) throw new Error('Failed to geocode');
      return response.json();
    },
    enabled: !!zipCode && zipCode.length === 5,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (geoData) {
      setCoordinates({ lat: geoData.latitude, lon: geoData.longitude });
      setLocationName(`${geoData.name}, ${geoData.admin1}`);
      localStorage.setItem('orbit-weather-coords', JSON.stringify({ lat: geoData.latitude, lon: geoData.longitude }));
      localStorage.setItem('orbit-weather-location', `${geoData.name}, ${geoData.admin1}`);
    }
  }, [geoData]);

  const { data: weatherData, isLoading: weatherLoading, refetch: refetchWeather } = useQuery<WeatherData>({
    queryKey: ['/api/weather', coordinates?.lat, coordinates?.lon],
    queryFn: async () => {
      if (!coordinates) return null;
      const response = await fetch(`/api/weather?lat=${coordinates.lat}&lon=${coordinates.lon}`);
      if (!response.ok) throw new Error('Failed to fetch weather');
      return response.json();
    },
    enabled: !!coordinates,
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30,
    retry: 3,
    retryDelay: 1000,
  });

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempZip.length === 5 && /^\d{5}$/.test(tempZip)) {
      setZipCode(tempZip);
      localStorage.setItem('orbit-weather-zip', tempZip);
      setShowZipInput(false);
      setTempZip('');
    }
  };

  const handleRefresh = () => {
    refetchGeo();
    refetchWeather();
  };

  const iconType = weatherData?.icon || 'sunny';
  const glow = WEATHER_GLOWS[iconType] || WEATHER_GLOWS.sunny;
  const emoji = WEATHER_EMOJIS[iconType] || '☀️';
  const isLoading = geoLoading || weatherLoading;

  if (!zipCode) {
    return (
      <div className="fixed bottom-20 left-4 z-[140]" data-testid="floating-weather-container">
        <AnimatePresence>
          {showZipInput ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-4 shadow-2xl w-64"
              style={{ boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌤️</span>
                  <span className="text-sm font-medium text-white">Set Your Location</span>
                </div>
                <button 
                  onClick={() => setShowZipInput(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleZipSubmit} className="space-y-3">
                <Input
                  value={tempZip}
                  onChange={(e) => setTempZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="Enter ZIP code"
                  className="bg-slate-700/50 border-cyan-500/30 text-white text-center text-lg tracking-widest"
                  data-testid="input-weather-zip"
                  autoFocus
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                  disabled={tempZip.length !== 5}
                  data-testid="button-weather-submit"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Get Weather
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowZipInput(true)}
              className="relative"
              data-testid="button-weather-setup"
            >
              <motion.span 
                className="text-5xl block"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
              >
                🌤️
              </motion.span>
              <span 
                className="absolute -bottom-1 -right-1 text-[10px] font-bold text-white bg-cyan-500 rounded-full w-4 h-4 flex items-center justify-center"
                style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                +
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 z-[140]" data-testid="floating-weather-container">
      <AnimatePresence>
        {isExpanded && weatherData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-16 left-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-3 shadow-2xl"
            style={{ boxShadow: glow.shadow, width: 'calc(100vw - 32px)', maxWidth: '320px' }}
          >
            {/* Header Row - Location & Controls */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span className="text-xs text-white font-medium truncate">{locationName}</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button 
                  onClick={handleRefresh}
                  className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5"
                  data-testid="button-weather-refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Weather Row - Icon, Temp, Stats all horizontal */}
            <div className="flex items-center gap-3">
              {/* Weather Icon */}
              <motion.span 
                className="text-4xl flex-shrink-0"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(${glow.shadow})` }}
              >
                {emoji}
              </motion.span>
              
              {/* Temperature */}
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-white leading-none">{weatherData.temperature}°</div>
                <div className="text-[10px] text-slate-400">{CONDITION_LABELS[weatherData.condition] || weatherData.condition}</div>
              </div>
              
              {/* Stats Row - Compact horizontal */}
              <div className="flex-1 grid grid-cols-3 gap-1 text-center border-l border-slate-700/50 pl-3">
                <div>
                  <Droplets className="w-3.5 h-3.5 text-blue-400 mx-auto" />
                  <div className="text-xs text-white font-medium">{weatherData.humidity}%</div>
                </div>
                <div>
                  <Wind className="w-3.5 h-3.5 text-cyan-400 mx-auto" />
                  <div className="text-xs text-white font-medium">{weatherData.windSpeed}</div>
                </div>
                <div>
                  <Thermometer className="w-3.5 h-3.5 text-orange-400 mx-auto" />
                  <div className="text-xs text-white font-medium">{weatherData.feelsLike}°</div>
                </div>
              </div>
            </div>

            {/* Action Row - Radar & Change Location */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/30">
              <Button
                onClick={() => {
                  setIsExpanded(false);
                  onOpenRadar?.();
                }}
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white h-8 text-xs"
                data-testid="button-view-radar"
              >
                <Radar className="w-3.5 h-3.5 mr-1.5" />
                Radar Map
              </Button>
              
              <button
                onClick={() => {
                  setShowZipInput(true);
                  setIsExpanded(false);
                }}
                className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors px-2"
                data-testid="button-change-location"
              >
                Change
              </button>
            </div>
          </motion.div>
        )}

        {showZipInput && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-20 left-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-4 shadow-2xl w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Change Location</span>
              <button 
                onClick={() => setShowZipInput(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleZipSubmit} className="space-y-3">
              <Input
                value={tempZip}
                onChange={(e) => setTempZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Enter ZIP code"
                className="bg-slate-700/50 border-cyan-500/30 text-white text-center text-lg tracking-widest"
                data-testid="input-weather-zip-change"
                autoFocus
              />
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
                disabled={tempZip.length !== 5}
                data-testid="button-weather-submit-change"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Update Location
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          if (!showZipInput) {
            setIsExpanded(!isExpanded);
          }
        }}
        className="relative"
        data-testid="button-weather-toggle"
      >
        {weatherData ? (
          <motion.div 
            className="relative"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="text-5xl leading-none block"
              style={{ 
                filter: `drop-shadow(0 0 15px ${glow.color}) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
              }}
            >
              {iconType === 'night' || iconType === 'night-cloudy' ? getMoonPhase() : emoji}
            </span>
            <span 
              className="absolute bottom-1 right-0 text-[10px] font-black text-white leading-none"
              style={{ 
                textShadow: '0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,1), -1px -1px 0 rgba(0,0,0,1), 1px -1px 0 rgba(0,0,0,1), -1px 1px 0 rgba(0,0,0,1), 1px 1px 0 rgba(0,0,0,1)'
              }}
            >
              {weatherData.temperature}°
            </span>
          </motion.div>
        ) : isLoading ? (
          <motion.div 
            className="relative"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="text-5xl leading-none block"
              style={{ filter: 'drop-shadow(0 0 10px rgba(6,182,212,0.5))' }}
            >
              ☁️
            </span>
            <span 
              className="absolute bottom-1 right-0 text-[10px] font-black text-cyan-400 leading-none animate-pulse"
              style={{ 
                textShadow: '0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,1)'
              }}
            >
              ...
            </span>
          </motion.div>
        ) : (
          <motion.div 
            className="relative"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="text-5xl leading-none block"
              style={{ filter: 'drop-shadow(0 0 10px rgba(6,182,212,0.4))' }}
            >
              ☁️
            </span>
            <span 
              className="absolute bottom-1 right-0 text-[10px] font-black text-slate-400 leading-none"
              style={{ 
                textShadow: '0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,1)'
              }}
            >
              --°
            </span>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}
