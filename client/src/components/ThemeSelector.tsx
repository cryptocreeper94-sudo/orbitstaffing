import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeCategory, Theme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Palette, Check, Sun, Moon } from "lucide-react";

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

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [open, setOpen] = useState(false);

  const themesByCategory = availableThemes.reduce((acc, theme) => {
    if (!acc[theme.category]) acc[theme.category] = [];
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<ThemeCategory, Theme[]>);

  const isLightTheme = currentTheme.colors.textPrimary.includes('text-slate-900');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative"
          data-testid="button-theme-selector"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-cyan-400" />
            Theme Gallery
            <span className="text-xs text-muted-foreground ml-2">
              ({availableThemes.length} themes)
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg border p-3 mb-3 bg-gradient-to-r from-cyan-900/30 to-violet-900/30 border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentTheme.colors.primary} border-2 border-white/20`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {isLightTheme ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-400" />
                )}
                <span className="font-semibold">{currentTheme.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </div>
            <Check className="h-5 w-5 text-green-400" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pr-1">
          <Accordion type="single" collapsible className="w-full space-y-1">
            {Object.entries(themesByCategory).map(([category, themes]) => (
              <AccordionItem 
                key={category} 
                value={category}
                className="border rounded-lg px-2"
              >
                <AccordionTrigger 
                  className="text-sm py-3 hover:no-underline"
                  data-testid={`theme-category-${category}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{categoryEmojis[category as ThemeCategory]}</span>
                    <span>{categoryLabels[category as ThemeCategory]}</span>
                    <span className="text-xs text-muted-foreground">
                      ({themes.length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setTheme(theme.id);
                          setOpen(false);
                        }}
                        className={`relative rounded-lg overflow-hidden text-left transition-all ${
                          currentTheme.id === theme.id
                            ? "ring-2 ring-cyan-400 scale-105"
                            : "border border-border hover:border-primary hover:scale-102"
                        }`}
                        data-testid={`theme-${theme.id}`}
                      >
                        <div
                          className={`h-12 bg-gradient-to-br ${theme.colors.primary} relative`}
                        >
                          {theme.watermark && (
                            <img 
                              src={theme.watermark} 
                              alt=""
                              className="absolute inset-0 w-full h-full object-contain opacity-60 p-1"
                              loading="lazy"
                            />
                          )}
                          {currentTheme.id === theme.id && (
                            <div className="absolute top-1 right-1">
                              <div className="bg-cyan-400 rounded-full p-0.5">
                                <Check className="h-3 w-3 text-slate-900" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`px-2 py-1.5 ${theme.colors.cardBg}`}>
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
      </DialogContent>
    </Dialog>
  );
}
