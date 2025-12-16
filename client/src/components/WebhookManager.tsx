import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Webhook, Plus, Trash2, RefreshCw, Check, X, Copy,
  Eye, EyeOff, AlertTriangle, Clock, CheckCircle2, XCircle,
  Send, Activity, Settings, ChevronDown, Zap, Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  description?: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  lastDeliveryAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface DeliveryLog {
  id: string;
  subscriptionId: string;
  event: string;
  status: string;
  statusCode?: number;
  attemptCount: number;
  errorMessage?: string;
  deliveredAt?: string;
  nextRetryAt?: string;
  createdAt: string;
}

const WEBHOOK_EVENTS = [
  { id: 'worker.created', label: 'Worker Created', category: 'Workers' },
  { id: 'worker.updated', label: 'Worker Updated', category: 'Workers' },
  { id: 'worker.deleted', label: 'Worker Deleted', category: 'Workers' },
  { id: 'job.created', label: 'Job Created', category: 'Jobs' },
  { id: 'job.filled', label: 'Job Filled', category: 'Jobs' },
  { id: 'job.cancelled', label: 'Job Cancelled', category: 'Jobs' },
  { id: 'timesheet.submitted', label: 'Timesheet Submitted', category: 'Timesheets' },
  { id: 'timesheet.approved', label: 'Timesheet Approved', category: 'Timesheets' },
  { id: 'payroll.processed', label: 'Payroll Processed', category: 'Payroll' },
  { id: 'payroll.failed', label: 'Payroll Failed', category: 'Payroll' },
  { id: 'invoice.created', label: 'Invoice Created', category: 'Invoices' },
  { id: 'invoice.paid', label: 'Invoice Paid', category: 'Invoices' },
];

const eventsByCategory = WEBHOOK_EVENTS.reduce((acc, event) => {
  if (!acc[event.category]) acc[event.category] = [];
  acc[event.category].push(event);
  return acc;
}, {} as Record<string, typeof WEBHOOK_EVENTS>);

interface WebhookManagerProps {
  credentialId?: string;
}

export function WebhookManager({ credentialId }: WebhookManagerProps) {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<WebhookSubscription | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [subscriptionLogs, setSubscriptionLogs] = useState<DeliveryLog[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [formData, setFormData] = useState({
    url: "",
    description: "",
    events: [] as string[],
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchDeliveryLogs();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/admin/webhooks");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveryLogs = async () => {
    try {
      const res = await fetch("/api/admin/webhook-logs?limit=50");
      if (res.ok) {
        const data = await res.json();
        setDeliveryLogs(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const fetchSubscriptionLogs = async (subscriptionId: string) => {
    try {
      const res = await fetch(`/api/admin/webhooks/${subscriptionId}/logs`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptionLogs(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch subscription logs:", error);
    }
  };

  const createSubscription = async () => {
    if (!formData.url) {
      toast({ title: "Error", description: "URL is required", variant: "destructive" });
      return;
    }
    if (formData.events.length === 0) {
      toast({ title: "Error", description: "Select at least one event", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setNewWebhookSecret(data.data.secret);
        setShowCreateModal(false);
        setShowSecretModal(true);
        fetchSubscriptions();
        setFormData({ url: "", description: "", events: [] });
        toast({ title: "Webhook Created", description: "Save the secret - it won't be shown again!" });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create webhook", variant: "destructive" });
    }
  };

  const toggleSubscription = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (res.ok) {
        fetchSubscriptions();
        toast({ title: isActive ? "Webhook Enabled" : "Webhook Disabled" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update webhook", variant: "destructive" });
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSubscriptions();
        toast({ title: "Webhook Deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete webhook", variant: "destructive" });
    }
  };

  const testWebhook = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/admin/webhooks/${id}/test`, { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Test Successful", description: `Status: ${data.statusCode}` });
      } else {
        toast({ title: "Test Failed", description: data.error || "Delivery failed", variant: "destructive" });
      }
      fetchSubscriptions();
      fetchDeliveryLogs();
    } catch (error) {
      toast({ title: "Error", description: "Failed to send test", variant: "destructive" });
    } finally {
      setTestingId(null);
    }
  };

  const copySecret = async () => {
    if (newWebhookSecret) {
      await navigator.clipboard.writeText(newWebhookSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const toggleEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const selectAllEvents = () => {
    setFormData(prev => ({
      ...prev,
      events: WEBHOOK_EVENTS.map(e => e.id)
    }));
  };

  const clearAllEvents = () => {
    setFormData(prev => ({ ...prev, events: [] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-500/20 text-green-400">Delivered</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>;
      case 'retrying':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Retrying</Badge>;
      case 'pending':
        return <Badge className="bg-blue-500/20 text-blue-400">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{status}</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Webhook className="h-5 w-5 text-cyan-400" />
            Webhook Subscriptions
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Receive real-time notifications when events occur
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          data-testid="button-create-webhook"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Webhooks Configured</h3>
            <p className="text-gray-400 text-center mb-4 max-w-md">
              Set up webhooks to receive real-time notifications when workers, jobs, timesheets, or payments are updated.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`bg-gray-800/50 border-gray-700 ${!sub.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                        <span className="text-white font-medium truncate" data-testid={`text-webhook-url-${sub.id}`}>
                          {sub.url}
                        </span>
                        <Badge variant={sub.isActive ? "default" : "secondary"} className={sub.isActive ? "bg-green-500/20 text-green-400" : ""}>
                          {sub.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {sub.description && (
                        <p className="text-gray-400 text-sm mb-2">{sub.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {sub.events?.slice(0, 5).map((event) => (
                          <Badge key={event} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {event}
                          </Badge>
                        ))}
                        {sub.events && sub.events.length > 5 && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            +{sub.events.length - 5} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {sub.totalDeliveries || 0} deliveries
                        </span>
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          {sub.successfulDeliveries || 0} successful
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                          <XCircle className="h-3 w-3" />
                          {sub.failedDeliveries || 0} failed
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last: {formatDate(sub.lastDeliveryAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={sub.isActive}
                        onCheckedChange={(checked) => toggleSubscription(sub.id, checked)}
                        data-testid={`switch-webhook-${sub.id}`}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedSubscription(sub);
                          fetchSubscriptionLogs(sub.id);
                          setShowLogsModal(true);
                        }}
                        className="text-gray-400 hover:text-white"
                        data-testid={`button-logs-${sub.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => testWebhook(sub.id)}
                        disabled={testingId === sub.id || !sub.isActive}
                        className="text-cyan-400 hover:text-cyan-300"
                        data-testid={`button-test-${sub.id}`}
                      >
                        {testingId === sub.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSubscription(sub.id)}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`button-delete-${sub.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {deliveryLogs.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Recent Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {deliveryLogs.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusBadge(log.status)}
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {log.event}
                      </Badge>
                      {log.statusCode && (
                        <span className={`text-sm ${log.statusCode < 300 ? 'text-green-400' : 'text-red-400'}`}>
                          HTTP {log.statusCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Attempts: {log.attemptCount}</span>
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create Webhook Subscription</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure an endpoint to receive real-time event notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Endpoint URL *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://your-domain.com/webhook"
                className="bg-gray-800 border-gray-600 text-white mt-1"
                data-testid="input-webhook-url"
              />
              <p className="text-xs text-gray-500 mt-1">Must be HTTPS</p>
            </div>

            <div>
              <Label className="text-gray-300">Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Production webhook for syncing worker data"
                className="bg-gray-800 border-gray-600 text-white mt-1"
                rows={2}
                data-testid="input-webhook-description"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-300">Events *</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={selectAllEvents} className="text-xs text-cyan-400">
                    Select All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearAllEvents} className="text-xs text-gray-400">
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
                {Object.entries(eventsByCategory).map(([category, events]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={event.id}
                            checked={formData.events.includes(event.id)}
                            onCheckedChange={() => toggleEvent(event.id)}
                            data-testid={`checkbox-event-${event.id}`}
                          />
                          <label
                            htmlFor={event.id}
                            className="text-sm text-gray-300 cursor-pointer"
                          >
                            {event.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {formData.events.length} of {WEBHOOK_EVENTS.length} events
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={createSubscription}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
              data-testid="button-submit-webhook"
            >
              Create Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSecretModal} onOpenChange={setShowSecretModal}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Save Your Webhook Secret
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This secret is used to verify webhook signatures. Save it now - it won't be shown again!
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-800 p-4 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-between gap-2">
              <code className="text-cyan-400 font-mono text-sm break-all flex-1">
                {newWebhookSecret}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={copySecret}
                className="flex-shrink-0"
              >
                {copiedSecret ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg text-sm text-gray-400">
            <p className="font-medium text-white mb-2">Verifying Signatures</p>
            <p className="mb-2">Each webhook request includes these headers:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><code className="text-cyan-400">X-Webhook-Signature</code> - HMAC-SHA256 signature</li>
              <li><code className="text-cyan-400">X-Webhook-Event</code> - Event type</li>
              <li><code className="text-cyan-400">X-Webhook-Timestamp</code> - ISO timestamp</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowSecretModal(false)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              I've Saved the Secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Delivery Logs</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedSubscription?.url}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-96">
            {subscriptionLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Activity className="h-8 w-8 mb-2" />
                <p>No delivery logs yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {subscriptionLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <Badge variant="outline" className="border-gray-600">
                          {log.event}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Status Code: </span>
                        <span className={log.statusCode && log.statusCode < 300 ? 'text-green-400' : 'text-red-400'}>
                          {log.statusCode || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Attempts: </span>
                        <span className="text-white">{log.attemptCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Delivered: </span>
                        <span className="text-white">
                          {log.deliveredAt ? formatDate(log.deliveredAt) : 'Not yet'}
                        </span>
                      </div>
                    </div>

                    {log.errorMessage && (
                      <div className="mt-2 text-sm text-red-400 bg-red-500/10 p-2 rounded">
                        {log.errorMessage}
                      </div>
                    )}

                    {log.nextRetryAt && log.status === 'retrying' && (
                      <div className="mt-2 text-sm text-yellow-400">
                        Next retry: {formatDate(log.nextRetryAt)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowLogsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WebhookManager;
