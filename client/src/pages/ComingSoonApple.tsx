import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Apple, Smartphone, Lock, CheckCircle, ArrowRight } from "lucide-react";

export default function ComingSoonApple() {
  return (
    <Shell>
      <div className="max-w-2xl mx-auto py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-black/5 p-6 rounded-full">
              <Apple className="w-16 h-16 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-heading mb-3 tracking-tight">
            Coming Soon to App Store
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            ORBIT Staffing for iPhone and iPad
          </p>
          <div className="inline-block px-4 py-2 bg-amber-500/20 text-amber-700 rounded-full text-sm font-semibold">
            Available in a few weeks
          </div>
        </div>

        {/* Why We're Building on iOS */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-heading mb-6">Why iPhone Users Deserve ORBIT</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Smartphone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Native iOS Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Built specifically for iPhone with iOS design standards and performance optimizations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Maximum Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Apple's secure enclave protects your data with Face ID and keychain integration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Same Account, Same Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Log in with your existing ORBIT account. All your assignments sync instantly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <ArrowRight className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Complete Feature Parity</h3>
                    <p className="text-sm text-muted-foreground">
                      All Android features (GPS check-in, assignments, profiles) on iOS.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-xl font-bold font-heading mb-6">iOS Features</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>
                <strong>Face ID & Touch ID</strong> for secure, instant login
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>
                <strong>Siri Integration</strong> for hands-free check-ins
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>
                <strong>Live Activities</strong> showing current shift on lock screen
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>
                <strong>Background App Refresh</strong> for real-time shift updates
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>
                <strong>Widgets</strong> showing today's schedule at a glance
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>
                <strong>Dark Mode</strong> support for all-day usage
              </span>
            </li>
          </ul>
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-xl font-bold font-heading mb-6">Release Timeline</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <div className="w-0.5 h-12 bg-green-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-semibold">Android Live Now</h3>
                <p className="text-sm text-muted-foreground mt-1">Google Play Store - Test and provide feedback</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                <div className="w-0.5 h-12 bg-amber-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-semibold">iOS Development (In Progress)</h3>
                <p className="text-sm text-muted-foreground mt-1">Building iOS-specific features and optimizations</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold">iOS App Store Launch</h3>
                <p className="text-sm text-muted-foreground mt-1">Expected within 2-4 weeks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Get Notified */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-8 text-center mb-12">
          <h2 className="text-xl font-bold font-heading mb-3">Get Notified When iOS Launches</h2>
          <p className="text-muted-foreground mb-6">
            Leave your email to be first to know when ORBIT is available on the App Store
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your.email@example.com"
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-email-notify"
            />
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-notify-me"
            >
              Notify Me
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold font-heading mb-6">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Can I use my Android account on iOS?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Log in with the same email and password you use on Android. Your assignments and profile sync instantly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Why the wait for iOS?</h3>
              <p className="text-sm text-muted-foreground">
                We're building iOS-native features like Siri shortcuts, widgets, and Live Activities. We want the iOS experience to be just as good as Android.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Will it cost money on iOS?</h3>
              <p className="text-sm text-muted-foreground">
                No. ORBIT is free on both Android and iOS. We make money from staffing agencies, not workers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do I need iOS 15+?</h3>
              <p className="text-sm text-muted-foreground">
                iOS app will support iOS 14+, covering 98% of active iPhones.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-muted-foreground mb-6">In the meantime, download ORBIT for Android</p>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            data-testid="button-download-android"
          >
            Get Android App
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Shell>
  );
}
