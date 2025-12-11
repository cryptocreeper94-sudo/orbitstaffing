import { Shell } from "@/components/layout/Shell";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Settings as SettingsIcon, Palette, Bell, Shield, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400">Customize your ORBIT experience</p>
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
            <ThemeSelector />
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Notification Settings</h3>
              <p className="text-sm text-slate-400">Coming soon - configure email, SMS, and push notifications</p>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Account & Security</h3>
              <p className="text-sm text-slate-400">Coming soon - manage your account, password, and security settings</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
