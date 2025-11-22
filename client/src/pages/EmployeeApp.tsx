import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Calendar,
  FileCheck,
  DollarSign,
  LogOut,
  Send,
  MessageSquare,
  Reply,
  Zap,
  TrendingUp,
  Star
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeeApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [clockedIn, setClockedIn] = useState(false);
  const [gpsVerified, setGpsVerified] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [messages, setMessages] = useState<Array<{id: string; from: string; text: string; time: string}>>([
    { id: "1", from: "Manager", text: "You're scheduled for 8am tomorrow at Metro Construction", time: "2 hours ago" }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsVerified(true);
        toast.success("Location verified! Within job site geofence ✓");
      });
    } else {
      toast.error("Location services not available");
    }
  };

  const handleClockIn = () => {
    if (!gpsVerified) {
      toast.error("Please verify your location first");
      return;
    }
    setClockedIn(true);
    toast.success("Clocked in at 8:32 AM");
  };

  const handleClockOut = () => {
    setClockedIn(false);
    toast.success("Clocked out - 8 hours worked");
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now().toString(),
        from: "You",
        text: newMessage,
        time: "now"
      }]);
      setNewMessage("");
      toast.success("Message sent to manager");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border/50 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold font-heading">Alex Martinez</h1>
            <p className="text-xs text-muted-foreground">Electrician | Nashville, TN</p>
          </div>
          <Badge className="bg-green-500/20 text-green-600">Active</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4">
        <Tabs defaultValue="home" className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border/50 w-full">
            <TabsTrigger value="home" className="flex-1">Home</TabsTrigger>
            <TabsTrigger value="jobs" className="flex-1">Jobs</TabsTrigger>
            <TabsTrigger value="bonuses" className="flex-1">Bonuses</TabsTrigger>
            <TabsTrigger value="messages" className="flex-1">Messages</TabsTrigger>
            <TabsTrigger value="pay" className="flex-1">Pay</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6 mt-6">
            {/* Clock In/Out */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {clockedIn ? "You're Working" : "Ready to Work?"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clockedIn ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-600">Clocked In</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Metro Construction Site</p>
                      <p className="text-xs text-muted-foreground mt-1">Started: 8:32 AM</p>
                      <p className="text-xs text-muted-foreground">Elapsed: 2 hours 15 minutes</p>
                    </div>
                    <Button onClick={handleClockOut} className="w-full bg-red-500/20 text-red-600 hover:bg-red-500/30 border border-red-500/30">
                      <LogOut className="w-4 h-4 mr-2" /> Clock Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!gpsVerified ? (
                      <div className="space-y-3">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-sm text-blue-600 mb-3">
                            📍 We need your location to verify you're at the job site (required for compliance and payroll accuracy)
                          </p>
                          <Button onClick={handleGetLocation} className="w-full bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 border border-blue-500/30">
                            <MapPin className="w-4 h-4 mr-2" /> Verify My Location
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-600">Location Verified</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            📍 {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                          </p>
                          <p className="text-xs text-green-600 mt-1">✓ Within job site geofence (200-300ft radius)</p>
                        </div>
                        <Button onClick={handleClockIn} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <Clock className="w-4 h-4 mr-2" /> Clock In Now
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Status */}
            {clockedIn && (
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Today's Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm">Job Site</span>
                    <span className="font-bold">Metro Construction</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm">Hourly Rate</span>
                    <span className="font-bold">$45/hr</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                    <span className="text-sm">Breaks Remaining</span>
                    <span className="font-bold">Lunch (30 min)</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Need Something?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-border/50">
                  <AlertCircle className="w-4 h-4 mr-2" /> Report an Issue
                </Button>
                <Button variant="outline" className="w-full justify-start border-border/50">
                  <MessageSquare className="w-4 h-4 mr-2" /> Message Your Manager
                </Button>
                <Button variant="outline" className="w-full justify-start border-border/50">
                  <Reply className="w-4 h-4 mr-2" /> Request Time Off
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4 mt-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Tomorrow's Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-bold text-lg">Licensed Electrician</p>
                  <p className="text-sm text-muted-foreground">Metro Construction - Downtown Nashville</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>📅 Date:</span>
                    <span>Friday, Nov 23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⏰ Time:</span>
                    <span>8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💰 Rate:</span>
                    <span>$45/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📍 Location:</span>
                    <span>35.0896° N</span>
                  </div>
                </div>
                <Button className="w-full bg-primary text-primary-foreground">Accept & Review Details</Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Your Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 hover:bg-background/50 rounded">
                    <span>This Week: 4 jobs assigned</span>
                    <Badge>32 hours</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-background/50 rounded">
                    <span>This Month: 18 jobs assigned</span>
                    <Badge>144 hours</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bonuses Tab */}
          <TabsContent value="bonuses" className="space-y-4 mt-6">
            {/* Weekly Bonus */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Weekly Performance Bonus
                </CardTitle>
                <CardDescription>Current week on extended assignment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">This Week Bonus</div>
                    <div className="text-4xl font-bold text-amber-500">$35.00</div>
                    <p className="text-xs text-muted-foreground mt-2">Earned for perfect attendance this week</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Perfect Days</span>
                    <Badge className="bg-green-500/20 text-green-600">5 / 5 ✓</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Streak Status</span>
                    <Badge className="bg-blue-500/20 text-blue-600">On Track</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assignment Duration</span>
                    <Badge variant="outline">Week 3 of 12</Badge>
                  </div>
                </div>

                <Button className="w-full bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 border border-amber-500/30">
                  <TrendingUp className="w-4 h-4 mr-2" /> View Bonus History
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Score */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  Loyalty Score (12-Month)
                </CardTitle>
                <CardDescription>Your overall reliability & availability rating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-purple-500">96%</div>
                    <p className="text-sm text-muted-foreground mt-1">Loyalty Score</p>
                  </div>
                  
                  <div className="w-full bg-background rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{width: "96%"}}></div>
                  </div>

                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <div className="text-sm font-bold text-purple-600 mb-1">TIER 2 - GROWTH</div>
                    <p className="text-xs text-muted-foreground">5 days paid time off</p>
                    <p className="text-xs text-muted-foreground">+$1,200-2,000 annual bonus</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Availability Score</span>
                    <span className="font-bold">95%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reliability Score</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Calculated as: (Availability × 60%) + (Reliability × 40%)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-background/50 rounded p-3 text-center">
                    <div className="font-bold text-green-600">90 days</div>
                    <div className="text-muted-foreground">Perfect attendance streak</div>
                  </div>
                  <div className="bg-background/50 rounded p-3 text-center">
                    <div className="font-bold text-blue-600">1 tardy</div>
                    <div className="text-muted-foreground">Minor impact on score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tier Progression */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Tier Progression</CardTitle>
                <CardDescription>Your path to higher bonuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {[
                    {tier: "Tier 1", score: "90-94%", bonus: "2 days off", current: false},
                    {tier: "Tier 2", score: "95-97%", bonus: "5 days off / $1,200+", current: true},
                    {tier: "Tier 3", score: "98-99%", bonus: "1 week off / $2,400+", current: false},
                    {tier: "Tier 4", score: "100%", bonus: "1 week + recognition / $2,400+", current: false},
                  ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-lg border transition-all ${
                      item.current 
                        ? "bg-purple-500/10 border-purple-500/30" 
                        : "bg-background/50 border-border/50 opacity-60"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-sm">{item.tier}</div>
                          <div className="text-xs text-muted-foreground">{item.score}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-purple-500">{item.bonus}</div>
                          {item.current && <Badge className="mt-1 bg-green-500/20 text-green-600">Current</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground bg-background/50 rounded p-3">
                  <p className="mb-2"><strong>How to improve:</strong></p>
                  <ul className="space-y-1">
                    <li>✓ Accept more shift offers (boost Availability)</li>
                    <li>✓ Never no-show (boost Reliability)</li>
                    <li>✓ Always arrive on-time (maintain score)</li>
                    <li>✓ Complete full shifts (maximize Reliability)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4 mt-6">
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === "You" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.from === "You" 
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-card border border-border/50 rounded-bl-none"
                  }`}>
                    {msg.text}
                    <div className="text-xs opacity-70 mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 p-4">
              <div className="max-w-2xl mx-auto flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message your manager..."
                  className="flex-1 bg-background border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage} className="bg-primary text-primary-foreground">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Pay Tab */}
          <TabsContent value="pay" className="space-y-4 mt-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  This Week's Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="text-sm text-muted-foreground mb-1">Gross Pay</div>
                  <div className="text-3xl font-bold text-primary">$1,440.00</div>
                  <div className="text-xs text-muted-foreground mt-1">32 hours @ $45/hr</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Federal Tax</span>
                    <span>-$144.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State Tax (TN)</span>
                    <span>-$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FICA</span>
                    <span>-$110.16</span>
                  </div>
                  <div className="border-t border-border/50 pt-2 mt-2 flex justify-between font-bold">
                    <span>Net Pay</span>
                    <span className="text-green-600">$1,185.84</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Direct Deposit</CardTitle>
                <CardDescription>Deposits every Friday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-background/50 rounded-lg border border-border/50 text-sm">
                  <p className="text-muted-foreground">••••  2847</p>
                  <p className="text-xs text-muted-foreground mt-1">Next deposit: Nov 24, 2025</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
