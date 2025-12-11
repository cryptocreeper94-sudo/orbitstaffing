import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { THEME_CATEGORIES, ThemeCategory, Theme } from "@/data/themes";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { CheckCircle2, Palette, Sparkles, Sun, Moon, Briefcase, Trees, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<ThemeCategory, React.ReactNode> = {
  classic: <Moon className="h-4 w-4" />,
  professional: <Briefcase className="h-4 w-4" />,
  nature: <Trees className="h-4 w-4" />,
  vibrant: <Zap className="h-4 w-4" />
};

const categoryColors: Record<ThemeCategory, string> = {
  classic: "from-slate-600 to-slate-800",
  professional: "from-blue-600 to-blue-800",
  nature: "from-emerald-600 to-emerald-800",
  vibrant: "from-fuchsia-600 to-purple-800"
};

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["classic"]);

  const themesByCategory = availableThemes.reduce((acc: Record<string, Theme[]>, theme: Theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, Theme[]>);

  return (
    <div className="space-y-4 rounded-2xl p-4 border border-slate-700/50 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-violet-600 p-2.5 rounded-full">
          <Palette className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Theme Gallery
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </h2>
          <p className="text-xs text-slate-400">
            {availableThemes.length} themes available
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-cyan-900/50 to-violet-900/50 border border-cyan-500/30 p-3">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-12 h-12 rounded-lg bg-gradient-to-br border-2 border-white/20",
              currentTheme.colors.primary
            )}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {currentTheme.colors.background.includes('50') || currentTheme.colors.background.includes('white') 
                ? <Sun className="h-4 w-4 text-yellow-400" />
                : <Moon className="h-4 w-4 text-blue-400" />
              }
              <span className="text-sm font-bold text-white">{currentTheme.name}</span>
            </div>
            <p className="text-xs text-cyan-300">{currentTheme.description || "Currently Active"}</p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-400" />
        </div>
      </div>

      <Accordion 
        type="multiple" 
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="space-y-2"
      >
        {THEME_CATEGORIES.map((category) => {
          const themes = themesByCategory[category.id] || [];
          const hasCurrentTheme = themes.some((t: Theme) => t.id === currentTheme.id);
          
          return (
            <AccordionItem key={category.id} value={category.id} className="border-0">
              <AccordionTrigger 
                className={cn(
                  "px-3 py-2.5 rounded-xl bg-gradient-to-r border border-white/10 hover:no-underline",
                  categoryColors[category.id as ThemeCategory],
                  hasCurrentTheme ? "ring-2 ring-cyan-400/50" : ""
                )}
                data-testid={`theme-category-${category.id}`}
              >
                <div className="flex items-center gap-3 w-full">
                  {categoryIcons[category.id as ThemeCategory]}
                  <div className="text-left flex-1">
                    <span className="text-sm font-bold text-white">{category.label}</span>
                    <p className="text-[10px] text-white/70">{category.description}</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    {themes.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pt-3 pb-1">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {themes.map((theme) => {
                    const isSelected = currentTheme.id === theme.id;
                    const isLight = theme.colors.background.includes('50') || 
                                   theme.colors.background.includes('white');
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={cn(
                          "relative rounded-xl overflow-hidden transition-all",
                          isSelected 
                            ? "ring-2 ring-cyan-400 scale-105" 
                            : "hover:scale-105 border border-slate-600/50"
                        )}
                        data-testid={`theme-${theme.id}`}
                      >
                        <div 
                          className={cn(
                            "h-14 bg-gradient-to-br relative",
                            theme.colors.primary
                          )}
                        >
                          <div className={cn(
                            "absolute bottom-1 left-1 w-4 h-2 rounded-sm",
                            theme.colors.cardBg
                          )} />
                          <div className={cn(
                            "absolute bottom-1 right-1 w-2 h-2 rounded-full",
                            theme.colors.accent
                          )} />
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <div className="bg-cyan-400 rounded-full p-0.5">
                                <CheckCircle2 className="h-3 w-3 text-slate-900" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={cn(
                          "p-1.5",
                          isLight ? "bg-slate-100" : "bg-slate-800/90"
                        )}>
                          <p className={cn(
                            "text-[10px] font-medium truncate text-center",
                            isLight ? "text-slate-800" : "text-white"
                          )}>
                            {theme.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
