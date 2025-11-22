import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Download, Send, CheckCircle } from "lucide-react";

interface IosInterest {
  id: string;
  email: string;
  source: string;
  userType?: string;
  notified: boolean;
  notifiedAt?: string;
  createdAt: string;
}

export default function AdminIOSInterest() {
  const [interests, setInterests] = useState<IosInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "notified" | "pending">("pending");

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ios-interest");
      if (response.ok) {
        const data = await response.json();
        setInterests(data);
      }
    } catch (error) {
      console.error("Error fetching iOS interests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyAll = async () => {
    const confirmed = confirm(
      "Send notification email to all pending users? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const response = await fetch("/api/admin/ios-interest/notify-all", {
        method: "POST",
      });
      if (response.ok) {
        alert("Notifications sent successfully!");
        fetchInterests();
      }
    } catch (error) {
      alert("Error sending notifications");
    }
  };

  const handleMarkNotified = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/ios-interest/${id}/notify`, {
        method: "POST",
      });
      if (response.ok) {
        fetchInterests();
      }
    } catch (error) {
      alert("Error updating notification status");
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Email", "User Type", "Source", "Notified", "Date Added"],
      ...interests.map((i) => [
        i.email,
        i.userType || "worker",
        i.source,
        i.notified ? "Yes" : "No",
        new Date(i.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ios-interest-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filtered =
    filter === "all"
      ? interests
      : filter === "notified"
        ? interests.filter((i) => i.notified)
        : interests.filter((i) => !i.notified);

  const stats = {
    total: interests.length,
    notified: interests.filter((i) => i.notified).length,
    pending: interests.filter((i) => !i.notified).length,
  };

  return (
    <Shell>
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2 flex items-center gap-2">
              <Mail className="w-8 h-8 text-primary" />
              iOS Interest List
            </h1>
            <p className="text-muted-foreground">
              Email capture from "Coming Soon" page - notify when iOS app launches
            </p>
          </div>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleExportCSV}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Total Signups</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Pending Notification</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Already Notified</p>
              <p className="text-2xl font-bold text-green-600">{stats.notified}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
              data-testid="filter-all"
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              size="sm"
              data-testid="filter-pending"
            >
              Pending ({stats.pending})
            </Button>
            <Button
              variant={filter === "notified" ? "default" : "outline"}
              onClick={() => setFilter("notified")}
              size="sm"
              data-testid="filter-notified"
            >
              Notified ({stats.notified})
            </Button>
          </div>

          {stats.pending > 0 && (
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700 text-white ml-auto"
              onClick={handleNotifyAll}
              data-testid="button-notify-all"
            >
              <Send className="w-4 h-4" />
              Notify All {stats.pending}
            </Button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "No signups yet"
                  : filter === "pending"
                    ? "All users have been notified!"
                    : "No users notified yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((interest) => (
              <Card
                key={interest.id}
                className="border-border/50 hover:border-primary/50 transition-colors"
                data-testid={`card-interest-${interest.id}`}
              >
                <CardContent className="py-4 px-6 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{interest.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {interest.userType || "worker"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {interest.source === "ios_coming_soon" ? "iOS Coming Soon" : interest.source}
                      </Badge>
                      {interest.notified && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          Notified
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(interest.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {!interest.notified && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4 gap-2"
                      onClick={() => handleMarkNotified(interest.id)}
                      data-testid={`button-notify-${interest.id}`}
                    >
                      <Send className="w-3 h-3" />
                      Send
                    </Button>
                  )}

                  {interest.notified && (
                    <div className="ml-4 flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">
                        {interest.notifiedAt &&
                          new Date(interest.notifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
