import { Shell } from "@/components/layout/Shell";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeCategory, Theme } from "@/contexts/ThemeContext";
import { Settings as SettingsIcon, Palette, Bell, Shield, User, Check, Sun, Moon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const categoryLabels: Record<ThemeCategory, string> = {
  classic: "Classic Themes",
  nfl: "NFL Teams",
  mlb: "MLB Teams",
  nba: "NBA Teams",
  nhl: "NHL Teams",
  mls: "MLS Teams",
  wsl: "WSL Teams",
  epl: "EPL Teams",
  laliga: "La Liga Teams",
  bundesliga: "Bundesliga Teams",
  seriea: "Serie A Teams",
  ligue1: "Ligue 1 Teams",
  college: "College Teams",
  golf: "Golf Courses",
  nature: "Nature Scenes"
};

const categoryEmojis: Record<ThemeCategory, string> = {
  classic: "🎨",
  nfl: "🏈",
  mlb: "⚾",
  nba: "🏀",
  nhl: "🏒",
  mls: "⚽",
  wsl: "⚽",
  epl: "⚽",
  laliga: "⚽",
  bundesliga: "⚽",
  seriea: "⚽",
  ligue1: "⚽",
  college: "🎓",
  golf: "⛳",
  nature: "🌿"
};

function InlineThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const themesByCategory = availableThemes.reduce((acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = [];
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<ThemeCategory, Theme[]>);

  const isLightTheme = currentTheme.colors.textPrimary.includes('text-slate-900');

  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4 bg-gradient-to-r from-cyan-900/30 to-violet-900/30 border-cyan-500/30">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentTheme.colors.primary} border-2 border-white/20 flex items-center justify-center`}
          >
            {currentTheme.watermark && (
              <img 
                src={currentTheme.watermark} 
                alt=""
                className="w-10 h-10 object-contain"
              />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isLightTheme ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-blue-400" />
              )}
              <span className="font-bold text-lg">{currentTheme.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">Currently active theme</p>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 flex items-center gap-1">
            <Check className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-400 font-medium">Active</span>
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible defaultValue="classic" className="space-y-2">
        {Object.entries(themesByCategory).map(([category, themes]) => (
          <AccordionItem 
            key={category} 
            value={category}
            className="border border-slate-700 rounded-xl px-4 bg-slate-800/30"
          >
            <AccordionTrigger 
              className="py-4 hover:no-underline"
              data-testid={`theme-category-${category}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{categoryEmojis[category as ThemeCategory]}</span>
                <span className="font-semibold">{categoryLabels[category as ThemeCategory]}</span>
                <span className="text-sm text-muted-foreground bg-slate-700/50 px-2 py-0.5 rounded-full">
                  {themes.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`relative rounded-xl overflow-hidden text-left transition-all ${
                      currentTheme.id === theme.id
                        ? "ring-2 ring-cyan-400 scale-105 shadow-lg shadow-cyan-500/20"
                        : "border border-slate-600 hover:border-cyan-500/50 hover:scale-102"
                    }`}
                    data-testid={`theme-${theme.id}`}
                  >
                    <div
                      className={`h-16 bg-gradient-to-br ${theme.colors.primary} relative`}
                    >
                      {theme.watermark && (
                        <img 
                          src={theme.watermark} 
                          alt=""
                          className="absolute inset-0 w-full h-full object-contain opacity-70 p-2"
                          loading="lazy"
                        />
                      )}
                      {currentTheme.id === theme.id && (
                        <div className="absolute top-1.5 right-1.5">
                          <div className="bg-cyan-400 rounded-full p-1">
                            <Check className="h-3 w-3 text-slate-900" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-2 ${theme.colors.cardBg}`}>
                      <p className={`text-xs font-medium truncate ${theme.colors.textPrimary}`}>
                        {theme.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default function Settings() {
  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your ORBIT experience</p>
          </div>
        </div>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-cyan-600" data-testid="tab-appearance">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-cyan-600" data-testid="tab-notifications">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2 data-[state=active]:bg-cyan-600" data-testid="tab-account">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <InlineThemeSelector />
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">Coming soon - configure email, SMS, and push notifications</p>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Account & Security</h3>
              <p className="text-sm text-muted-foreground">Coming soon - manage your account, password, and security settings</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
