import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, RefreshCw } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  isDay: boolean;
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
  admin1: string;
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

function getTemperatureColor(temp: number): string {
  if (temp <= 32) return '#3B82F6';
  if (temp <= 50) return '#06B6D4';
  if (temp <= 65) return '#22C55E';
  if (temp <= 75) return '#EAB308';
  if (temp <= 85) return '#F97316';
  return '#EF4444';
}

export function FooterWeatherWidget() {
  const [zipCode, setZipCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('orbit-weather-zip') || '';
    }
    return '';
  });
  const [showInput, setShowInput] = useState(false);
  const [tempZip, setTempZip] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orbit-weather-coords');
      if (saved) {
        try { return JSON.parse(saved); } catch { return null; }
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

  const { data: geoData } = useQuery<GeoLocation>({
    queryKey: ['/api/weather/geocode', zipCode],
    queryFn: async () => {
      if (!zipCode || zipCode.length !== 5) return null;
      const response = await fetch(`/api/weather/geocode/${zipCode}`);
      if (!response.ok) throw new Error('Failed to geocode');
      return response.json();
    },
    enabled: !!zipCode && zipCode.length === 5,
    staleTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (geoData) {
      setCoordinates({ lat: geoData.latitude, lon: geoData.longitude });
      setLocationName(`${geoData.name}, ${geoData.admin1}`);
      localStorage.setItem('orbit-weather-coords', JSON.stringify({ lat: geoData.latitude, lon: geoData.longitude }));
      localStorage.setItem('orbit-weather-location', `${geoData.name}, ${geoData.admin1}`);
    }
  }, [geoData]);

  const { data: weatherData, isLoading, refetch } = useQuery<WeatherData>({
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
  });

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempZip.length === 5 && /^\d{5}$/.test(tempZip)) {
      setZipCode(tempZip);
      localStorage.setItem('orbit-weather-zip', tempZip);
      setShowInput(false);
      setTempZip('');
    }
  };

  if (!zipCode) {
    return (
      <div className="flex items-center gap-2">
        {showInput ? (
          <form onSubmit={handleZipSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={tempZip}
              onChange={(e) => setTempZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="ZIP"
              className="w-16 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white text-center"
              autoFocus
              data-testid="input-footer-zip"
            />
            <button 
              type="submit" 
              className="text-xs text-cyan-400 hover:text-cyan-300"
              disabled={tempZip.length !== 5}
            >
              Set
            </button>
            <button 
              type="button"
              onClick={() => setShowInput(false)}
              className="text-xs text-slate-500 hover:text-slate-400"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition text-xs"
            data-testid="button-footer-weather-setup"
          >
            <span>☁️</span>
            <span>Set Location</span>
          </button>
        )}
      </div>
    );
  }

  const iconType = weatherData?.icon || 'cloudy';
  const emoji = iconType === 'night' || iconType === 'night-cloudy' 
    ? getMoonPhase() 
    : (WEATHER_EMOJIS[iconType] || '☁️');
  const tempColor = weatherData ? getTemperatureColor(weatherData.temperature) : '#94a3b8';

  return (
    <div className="flex items-center gap-2 text-xs">
      {weatherData ? (
        <>
          <span className="text-base" title={weatherData.condition}>{emoji}</span>
          <span 
            className="font-bold"
            style={{ color: tempColor }}
          >
            {weatherData.temperature}°F
          </span>
          <span className="text-slate-500 hidden sm:inline">
            {locationName.split(',')[0]}
          </span>
        </>
      ) : isLoading ? (
        <span className="text-slate-500">Loading...</span>
      ) : (
        <span className="text-slate-500">--°F</span>
      )}
      <button
        onClick={() => refetch()}
        className="text-slate-500 hover:text-cyan-400 transition p-0.5"
        title="Refresh weather"
        data-testid="button-footer-weather-refresh"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
      <button
        onClick={() => setShowInput(true)}
        className="text-slate-500 hover:text-cyan-400 transition p-0.5"
        title="Change location"
        data-testid="button-footer-weather-change"
      >
        <MapPin className="w-3 h-3" />
      </button>
      {showInput && (
        <form onSubmit={handleZipSubmit} className="flex items-center gap-1 ml-1">
          <input
            type="text"
            value={tempZip}
            onChange={(e) => setTempZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="ZIP"
            className="w-14 px-1 py-0.5 text-xs bg-slate-800 border border-slate-700 rounded text-white text-center"
            autoFocus
          />
          <button type="submit" className="text-cyan-400 text-xs" disabled={tempZip.length !== 5}>✓</button>
          <button type="button" onClick={() => setShowInput(false)} className="text-slate-500 text-xs">✕</button>
        </form>
      )}
    </div>
  );
}
