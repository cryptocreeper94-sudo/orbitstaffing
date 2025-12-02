import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapPin, X, Thermometer, Droplets, Wind, RefreshCw } from "lucide-react";
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

const WEATHER_ICONS: Record<string, string> = {
  sunny: '/weather-icons/sunny.png',
  'partly-cloudy': '/weather-icons/partly-cloudy.png',
  cloudy: '/weather-icons/cloudy.png',
  rainy: '/weather-icons/rainy.png',
  thunderstorm: '/weather-icons/thunderstorm.png',
  snowy: '/weather-icons/snowy.png',
  foggy: '/weather-icons/foggy.png',
  night: '/weather-icons/night.png',
};

const WEATHER_GLOWS: Record<string, { color: string; shadow: string }> = {
  sunny: { 
    color: 'rgba(251, 191, 36, 0.6)', 
    shadow: '0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3)' 
  },
  'partly-cloudy': { 
    color: 'rgba(251, 191, 36, 0.4)', 
    shadow: '0 0 25px rgba(251, 191, 36, 0.4), 0 0 50px rgba(148, 163, 184, 0.3)' 
  },
  cloudy: { 
    color: 'rgba(148, 163, 184, 0.5)', 
    shadow: '0 0 25px rgba(148, 163, 184, 0.4), 0 0 50px rgba(100, 116, 139, 0.3)' 
  },
  rainy: { 
    color: 'rgba(59, 130, 246, 0.5)', 
    shadow: '0 0 25px rgba(59, 130, 246, 0.4), 0 0 50px rgba(37, 99, 235, 0.3)' 
  },
  thunderstorm: { 
    color: 'rgba(234, 179, 8, 0.6)', 
    shadow: '0 0 30px rgba(234, 179, 8, 0.5), 0 0 60px rgba(139, 92, 246, 0.4)' 
  },
  snowy: { 
    color: 'rgba(226, 232, 240, 0.6)', 
    shadow: '0 0 30px rgba(226, 232, 240, 0.5), 0 0 60px rgba(186, 230, 253, 0.4)' 
  },
  foggy: { 
    color: 'rgba(148, 163, 184, 0.4)', 
    shadow: '0 0 25px rgba(148, 163, 184, 0.3), 0 0 50px rgba(100, 116, 139, 0.2)' 
  },
  night: { 
    color: 'rgba(139, 92, 246, 0.5)', 
    shadow: '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(99, 102, 241, 0.3)' 
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
  clear: 'Clear',
};

export function FloatingWeatherButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showZipInput, setShowZipInput] = useState(false);
  const [zipCode, setZipCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('orbit-weather-zip') || '';
    }
    return '';
  });
  const [tempZip, setTempZip] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orbit-weather-coords');
      if (saved) {
        return JSON.parse(saved);
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
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
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
    staleTime: 1000 * 60 * 10, // 10 minute cache
    refetchInterval: 1000 * 60 * 30, // Refresh every 30 minutes
  });

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempZip.length === 5 && /^\d{5}$/.test(tempZip)) {
      setZipCode(tempZip);
      localStorage.setItem('orbit-weather-zip', tempZip);
      setShowZipInput(false);
    }
  };

  const handleRefresh = () => {
    refetchGeo();
    refetchWeather();
  };

  const iconType = weatherData?.icon || 'sunny';
  const glow = WEATHER_GLOWS[iconType] || WEATHER_GLOWS.sunny;
  const isLoading = geoLoading || weatherLoading;

  if (!zipCode) {
    return (
      <div className="fixed bottom-3 left-4 z-[140]" data-testid="floating-weather-container">
        <AnimatePresence>
          {showZipInput ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 rounded-2xl p-4 shadow-xl w-64"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Set Location</span>
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
                  className="bg-slate-700/50 border-slate-600 text-white"
                  data-testid="input-weather-zip"
                />
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  disabled={tempZip.length !== 5}
                  data-testid="button-weather-submit"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Set Location
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowZipInput(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 rounded-full text-slate-300 hover:text-white transition-colors shadow-lg"
              data-testid="button-weather-setup"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Add Weather</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 left-4 z-[140]" data-testid="floating-weather-container">
      <AnimatePresence>
        {isExpanded && weatherData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-20 left-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 rounded-2xl p-4 shadow-xl w-72"
            style={{ boxShadow: glow.shadow }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white font-medium truncate max-w-[180px]">{locationName}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {CONDITION_LABELS[weatherData.condition] || weatherData.condition}
                </p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={handleRefresh}
                  className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
                  data-testid="button-weather-refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.img
                  src={WEATHER_ICONS[iconType]}
                  alt={weatherData.condition}
                  className="w-20 h-20 object-contain"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: `drop-shadow(${glow.shadow})` }}
                />
              </div>
              <div className="flex-1">
                <div className="text-4xl font-bold text-white">
                  {weatherData.temperature}°
                </div>
                <p className="text-sm text-slate-400">
                  Feels like {weatherData.feelsLike}°
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/50">
              <div className="flex flex-col items-center gap-1">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Humidity</span>
                <span className="text-sm text-white font-medium">{weatherData.humidity}%</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Wind</span>
                <span className="text-sm text-white font-medium">{weatherData.windSpeed} mph</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-400">Feels</span>
                <span className="text-sm text-white font-medium">{weatherData.feelsLike}°</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowZipInput(true);
                setIsExpanded(false);
              }}
              className="mt-3 text-xs text-slate-500 hover:text-cyan-400 transition-colors w-full text-center"
              data-testid="button-change-location"
            >
              Change location
            </button>
          </motion.div>
        )}

        {showZipInput && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-20 left-0 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 rounded-2xl p-4 shadow-xl w-64"
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
                className="bg-slate-700/50 border-slate-600 text-white"
                data-testid="input-weather-zip-change"
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!showZipInput) {
            setIsExpanded(!isExpanded);
          }
        }}
        className="relative flex items-center gap-2.5 px-3 py-2 bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-full shadow-lg transition-all"
        style={{ 
          boxShadow: weatherData ? glow.shadow : undefined,
        }}
        data-testid="button-weather-toggle"
      >
        {weatherData ? (
          <>
            <motion.div
              className="relative w-10 h-10"
              animate={{ 
                y: [0, -2, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={WEATHER_ICONS[iconType]}
                alt={weatherData.condition}
                className="w-full h-full object-contain"
                style={{ filter: `drop-shadow(0 0 8px ${glow.color})` }}
              />
            </motion.div>
            <div className="flex flex-col items-start pr-1">
              <span className="text-lg font-bold text-white leading-tight">
                {weatherData.temperature}°
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {locationName.split(',')[0]}
              </span>
            </div>
          </>
        ) : isLoading ? (
          <div className="flex items-center gap-2 py-1 px-2">
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-sm text-slate-300">Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1 px-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-slate-300">Weather</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
