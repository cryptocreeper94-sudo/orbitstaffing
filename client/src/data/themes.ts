export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export type ThemeCategory = "classic" | "professional" | "nature" | "vibrant";

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  watermark?: string;
  category: ThemeCategory;
  description?: string;
  isLight: boolean;
}

export const allThemes: Theme[] = [
  {
    id: "light",
    name: "Light Mode",
    category: "classic",
    description: "Clean, bright interface",
    isLight: true,
    colors: {
      primary: "from-slate-100 via-slate-50 to-white",
      secondary: "from-cyan-500 to-blue-500",
      accent: "bg-cyan-500",
      background: "bg-slate-50",
      cardBg: "bg-white",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-600",
      border: "border-slate-200"
    }
  },
  {
    id: "soft-light",
    name: "Soft Light",
    category: "classic",
    description: "Gentle, easy on eyes",
    isLight: true,
    colors: {
      primary: "from-gray-100 via-gray-50 to-white",
      secondary: "from-blue-400 to-indigo-500",
      accent: "bg-blue-500",
      background: "bg-gray-50",
      cardBg: "bg-white",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-500",
      border: "border-gray-200"
    }
  },
  {
    id: "cream",
    name: "Cream",
    category: "classic",
    description: "Warm, paper-like feel",
    isLight: true,
    colors: {
      primary: "from-amber-50 via-orange-50 to-yellow-50",
      secondary: "from-amber-500 to-orange-500",
      accent: "bg-amber-600",
      background: "bg-orange-50",
      cardBg: "bg-white",
      textPrimary: "text-amber-950",
      textSecondary: "text-amber-800",
      border: "border-amber-200"
    }
  },
  {
    id: "orbit-dark",
    name: "ORBIT Dark",
    category: "classic",
    description: "Default dark industrial",
    isLight: false,
    colors: {
      primary: "from-slate-900 via-slate-800 to-slate-900",
      secondary: "from-cyan-500 to-violet-500",
      accent: "bg-cyan-500",
      background: "bg-slate-900",
      cardBg: "bg-slate-800",
      textPrimary: "text-white",
      textSecondary: "text-slate-400",
      border: "border-slate-700"
    }
  },
  {
    id: "pure-black",
    name: "Pure Black",
    category: "classic",
    description: "OLED-friendly dark",
    isLight: false,
    colors: {
      primary: "from-black via-zinc-950 to-black",
      secondary: "from-cyan-600 to-blue-600",
      accent: "bg-cyan-600",
      background: "bg-black",
      cardBg: "bg-zinc-950",
      textPrimary: "text-white",
      textSecondary: "text-zinc-400",
      border: "border-zinc-800"
    }
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    category: "classic",
    description: "Deep blue professional",
    isLight: false,
    colors: {
      primary: "from-blue-950 via-slate-900 to-blue-950",
      secondary: "from-blue-500 to-cyan-500",
      accent: "bg-blue-500",
      background: "bg-blue-950",
      cardBg: "bg-slate-900",
      textPrimary: "text-white",
      textSecondary: "text-blue-200",
      border: "border-blue-900"
    }
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    category: "professional",
    description: "Business professional",
    isLight: true,
    colors: {
      primary: "from-slate-100 via-blue-50 to-slate-100",
      secondary: "from-blue-600 to-blue-700",
      accent: "bg-blue-600",
      background: "bg-slate-50",
      cardBg: "bg-white",
      textPrimary: "text-slate-900",
      textSecondary: "text-slate-600",
      border: "border-blue-100"
    }
  },
  {
    id: "executive",
    name: "Executive",
    category: "professional",
    description: "Premium dark gray",
    isLight: false,
    colors: {
      primary: "from-gray-900 via-gray-800 to-gray-900",
      secondary: "from-amber-500 to-yellow-500",
      accent: "bg-amber-500",
      background: "bg-gray-900",
      cardBg: "bg-gray-800",
      textPrimary: "text-white",
      textSecondary: "text-gray-400",
      border: "border-gray-700"
    }
  },
  {
    id: "emerald-pro",
    name: "Emerald Pro",
    category: "professional",
    description: "Success & growth",
    isLight: false,
    colors: {
      primary: "from-emerald-950 via-slate-900 to-emerald-950",
      secondary: "from-emerald-500 to-green-500",
      accent: "bg-emerald-500",
      background: "bg-emerald-950",
      cardBg: "bg-slate-900",
      textPrimary: "text-white",
      textSecondary: "text-emerald-200",
      border: "border-emerald-900"
    }
  },
  {
    id: "lavender",
    name: "Lavender",
    category: "nature",
    description: "Calm purple tones",
    isLight: true,
    colors: {
      primary: "from-violet-100 via-purple-50 to-violet-100",
      secondary: "from-violet-500 to-purple-500",
      accent: "bg-violet-500",
      background: "bg-violet-50",
      cardBg: "bg-white",
      textPrimary: "text-violet-950",
      textSecondary: "text-violet-700",
      border: "border-violet-200"
    }
  },
  {
    id: "ocean",
    name: "Ocean",
    category: "nature",
    description: "Deep sea vibes",
    isLight: false,
    colors: {
      primary: "from-cyan-950 via-blue-900 to-cyan-950",
      secondary: "from-cyan-400 to-blue-400",
      accent: "bg-cyan-500",
      background: "bg-cyan-950",
      cardBg: "bg-blue-900",
      textPrimary: "text-white",
      textSecondary: "text-cyan-200",
      border: "border-cyan-800"
    }
  },
  {
    id: "forest",
    name: "Forest",
    category: "nature",
    description: "Natural green tones",
    isLight: false,
    colors: {
      primary: "from-green-950 via-emerald-900 to-green-950",
      secondary: "from-green-500 to-emerald-500",
      accent: "bg-green-500",
      background: "bg-green-950",
      cardBg: "bg-emerald-900",
      textPrimary: "text-white",
      textSecondary: "text-green-200",
      border: "border-green-800"
    }
  },
  {
    id: "sunset",
    name: "Sunset",
    category: "vibrant",
    description: "Warm orange glow",
    isLight: false,
    colors: {
      primary: "from-orange-900 via-rose-800 to-orange-900",
      secondary: "from-orange-500 to-rose-500",
      accent: "bg-orange-500",
      background: "bg-slate-950",
      cardBg: "bg-rose-900/80",
      textPrimary: "text-white",
      textSecondary: "text-orange-200",
      border: "border-orange-800"
    }
  },
  {
    id: "neon-cyber",
    name: "Neon Cyber",
    category: "vibrant",
    description: "Cyberpunk aesthetic",
    isLight: false,
    colors: {
      primary: "from-fuchsia-950 via-violet-900 to-fuchsia-950",
      secondary: "from-fuchsia-500 to-cyan-500",
      accent: "bg-fuchsia-500",
      background: "bg-slate-950",
      cardBg: "bg-violet-900/80",
      textPrimary: "text-white",
      textSecondary: "text-fuchsia-200",
      border: "border-fuchsia-800"
    }
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    category: "vibrant",
    description: "Elegant pink gold",
    isLight: true,
    colors: {
      primary: "from-rose-100 via-pink-50 to-rose-100",
      secondary: "from-rose-400 to-pink-400",
      accent: "bg-rose-500",
      background: "bg-rose-50",
      cardBg: "bg-white",
      textPrimary: "text-rose-950",
      textSecondary: "text-rose-700",
      border: "border-rose-200"
    }
  }
];

export const THEME_CATEGORIES = [
  { id: "classic", label: "Classic", description: "Light & dark essentials" },
  { id: "professional", label: "Professional", description: "Business-ready" },
  { id: "nature", label: "Nature", description: "Inspired by outdoors" },
  { id: "vibrant", label: "Vibrant", description: "Bold & colorful" },
] as const;
