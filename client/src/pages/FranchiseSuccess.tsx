import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, Crown, Shield, ArrowRight, Download, Mail,
  Building2, MapPin, Sparkles, Rocket, Calendar, ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import confetti from 'canvas-confetti';

export default function FranchiseSuccess() {
  const [hasAnimated, setHasAnimated] = useState(false);

  const { data: hallmark, isLoading } = useQuery({
    queryKey: ['my-hallmark'],
    queryFn: async () => {
      const response = await fetch('/api/my-hallmark');
      if (!response.ok) return null;
      return response.json();
    }
  });

  useEffect(() => {
    if (!hasAnimated) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2
          },
          colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981'],
          particleCount: Math.floor(particleCount)
        });
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2
          },
          colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981'],
          particleCount: Math.floor(particleCount)
        });
      }, 250);

      setHasAnimated(true);

      return () => clearInterval(interval);
    }
  }, [hasAnimated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to the{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ORBIT Family!
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Congratulations! Your franchise payment has been processed successfully. 
              You're now an official ORBIT franchise owner.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-purple-900/40 to-gray-800/40 border-purple-500/30 mb-8">
            <CardHeader className="text-center border-b border-purple-500/20 pb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Crown className="h-8 w-8 text-purple-400" />
                <CardTitle className="text-2xl text-white">Your Franchise Details</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Your exclusive franchise ownership is now active
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">Loading your franchise details...</div>
              ) : hallmark ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Building2 className="h-4 w-4" />
                        Hallmark Name
                      </div>
                      <div className="text-xl font-bold text-white">{hallmark.hallmarkName}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Shield className="h-4 w-4" />
                        Ownership Mode
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {hallmark.ownershipMode === 'franchise_owned' ? 'Franchise Owner' : 'Subscriber'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {hallmark.territoryRegion && (
                      <div className="p-4 rounded-lg bg-gray-800/50">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                          <MapPin className="h-4 w-4" />
                          Territory
                        </div>
                        <div className="text-xl font-bold text-white">{hallmark.territoryRegion}</div>
                      </div>
                    )}
                    <div className="p-4 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Calendar className="h-4 w-4" />
                        Activated
                      </div>
                      <div className="text-lg text-white">
                        {new Date(hallmark.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                  <p className="text-gray-400 mb-4">
                    Your franchise is being activated. This may take a few moments.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="border-gray-600 text-gray-300"
                    data-testid="button-refresh"
                  >
                    Refresh Page
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-colors group">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Rocket className="h-7 w-7 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Next Steps</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Our franchise team will contact you within 24 hours to complete onboarding.
                </p>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  Onboarding Soon
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors group">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Check Your Email</h3>
                <p className="text-gray-400 text-sm mb-4">
                  A confirmation email with your franchise agreement has been sent.
                </p>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Sent
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-colors group">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Download className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Resources</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Access training materials and franchise guidelines in your portal.
                </p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Available
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">What Happens Next?</h2>
              <p className="text-gray-400">Here's what to expect in the coming days</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { day: 'Today', title: 'Payment Confirmed', description: 'Your franchise fee has been processed' },
                { day: 'Day 1-2', title: 'Onboarding Call', description: 'Meet your dedicated account manager' },
                { day: 'Day 3-5', title: 'Platform Setup', description: 'Configure your white-label instance' },
                { day: 'Day 7+', title: 'Go Live', description: 'Launch your franchise operation' }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="p-4 rounded-lg bg-gray-800/50 h-full">
                    <div className="text-cyan-400 text-sm font-medium mb-1">{step.day}</div>
                    <div className="font-semibold text-white mb-1">{step.title}</div>
                    <div className="text-gray-400 text-sm">{step.description}</div>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/my-hallmark">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                data-testid="button-manage-hallmark"
              >
                <Crown className="h-4 w-4 mr-2" />
                Manage My Hallmark
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Questions? Contact our franchise team at{' '}
              <a href="mailto:franchise@orbitstaffing.io" className="text-cyan-400 hover:underline">
                franchise@orbitstaffing.io
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Badge variant="outline" className="bg-gray-900/80 border-gray-700 text-gray-400">
          Powered by ORBIT
        </Badge>
      </div>
    </div>
  );
}
