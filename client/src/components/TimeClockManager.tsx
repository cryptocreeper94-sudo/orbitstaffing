import React, { useState, useEffect } from 'react';
import { Clock, Radio, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Wifi, WifiOff, Settings, ArrowRight, Activity, Download, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrbitCard } from '@/components/ui/orbit-card';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { SectionHeader } from '@/components/ui/section-header';

interface TimeClockDevice {
  id: string;
  deviceId: string;
  deviceType: string;
  vendor: string;
  name: string;
  location: string;
  ipAddress?: string;
  serialNumber?: string;
  lastPingAt?: string;
  isOnline: boolean;
  isActive: boolean;
  createdAt: string;
}

interface TimeClockPunch {
  id: string;
  deviceId?: string;
  workerId?: string;
  workerIdentifier?: string;
  punchType: string;
  punchTime: string;
  source: string;
  isValid: boolean;
  processedAt?: string;
}

interface DeviceVendor {
  id: string;
  name: string;
  description: string;
}

const DEVICE_TYPES = [
  { id: 'biometric', name: 'Biometric', description: 'Fingerprint or hand scanner' },
  { id: 'rfid', name: 'RFID/Proximity', description: 'Card or badge reader' },
  { id: 'pin', name: 'PIN Code', description: 'Keypad entry' },
  { id: 'facial', name: 'Facial Recognition', description: 'Face scan' },
  { id: 'mobile', name: 'Mobile App', description: 'Smartphone app' },
];

export function TimeClockManager() {
  const [devices, setDevices] = useState<TimeClockDevice[]>([]);
  const [punches, setPunches] = useState<TimeClockPunch[]>([]);
  const [vendors, setVendors] = useState<DeviceVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; errors: string[] } | null>(null);
  const [healthStatuses, setHealthStatuses] = useState<any[]>([]);

  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    deviceType: 'biometric',
    vendor: 'generic_api',
    name: '',
    location: '',
    ipAddress: '',
    serialNumber: '',
    apiEndpoint: '',
    apiKey: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [devicesRes, punchesRes, vendorsRes, healthRes] = await Promise.all([
        fetch('/api/admin/time-clocks/devices'),
        fetch('/api/admin/time-clocks/punches?limit=50'),
        fetch('/api/admin/time-clocks/vendors'),
        fetch('/api/admin/time-clocks/health'),
      ]);

      if (devicesRes.ok) {
        const data = await devicesRes.json();
        setDevices(data.devices || []);
      }

      if (punchesRes.ok) {
        const data = await punchesRes.json();
        setPunches(data.punches || []);
      }

      if (vendorsRes.ok) {
        const data = await vendorsRes.json();
        setVendors(data.vendors || []);
      }

      if (healthRes.ok) {
        const data = await healthRes.json();
        setHealthStatuses(data.statuses || []);
      }
    } catch (error) {
      console.error('Failed to load time clock data:', error);
    }
    setLoading(false);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/time-clocks/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice),
      });

      if (res.ok) {
        setNewDevice({
          deviceId: '',
          deviceType: 'biometric',
          vendor: 'generic_api',
          name: '',
          location: '',
          ipAddress: '',
          serialNumber: '',
          apiEndpoint: '',
          apiKey: '',
        });
        setShowAddDevice(false);
        loadData();
      }
    } catch (error) {
      console.error('Failed to add device:', error);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to remove this device?')) return;
    try {
      const res = await fetch(`/api/admin/time-clocks/devices/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to delete device:', error);
    }
  };

  const handlePingDevice = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/time-clocks/devices/${id}/ping`, {
        method: 'POST',
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to ping device:', error);
    }
  };

  const handleSync = async () => {
    try {
      const res = await fetch('/api/admin/time-clocks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setSyncResult(data);
        loadData();
      }
    } catch (error) {
      console.error('Failed to sync punches:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getPunchTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Clock In';
      case 'out': return 'Clock Out';
      case 'break_start': return 'Break Start';
      case 'break_end': return 'Break End';
      default: return type;
    }
  };

  const getPunchTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-600';
      case 'out': return 'bg-red-600';
      case 'break_start': return 'bg-yellow-600';
      case 'break_end': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const onlineCount = devices.filter(d => d.isOnline).length;
  const offlineCount = devices.filter(d => !d.isOnline && d.isActive).length;
  const unprocessedCount = punches.filter(p => !p.processedAt).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Hardware Integration"
        title="Time Clock Manager"
        subtitle="Connect physical time clocks at job sites to automatically capture worker punches"
        action={
          <div className="flex gap-2">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="border-slate-600"
              data-testid="button-refresh-time-clocks"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddDevice(!showAddDevice)}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-add-device"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </div>
        }
      />

      <BentoGrid cols={4} gap="md">
        <OrbitCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-600/20 rounded-lg">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{devices.length}</p>
              <p className="text-xs text-gray-400">Total Devices</p>
            </div>
          </div>
        </OrbitCard>

        <OrbitCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Wifi className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{onlineCount}</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
          </div>
        </OrbitCard>

        <OrbitCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <WifiOff className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{offlineCount}</p>
              <p className="text-xs text-gray-400">Offline</p>
            </div>
          </div>
        </OrbitCard>

        <OrbitCard variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{unprocessedCount}</p>
              <p className="text-xs text-gray-400">Pending Sync</p>
            </div>
          </div>
        </OrbitCard>
      </BentoGrid>

      {showAddDevice && (
        <BentoTile className="p-6 border-cyan-700/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Register New Device
          </h3>
          <form onSubmit={handleAddDevice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Device Name *</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="Main Lobby Clock"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                  data-testid="input-device-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Device ID *</label>
                <input
                  type="text"
                  value={newDevice.deviceId}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
                  placeholder="TC-001"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                  data-testid="input-device-id"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  placeholder="Building A - Main Entrance"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  data-testid="input-device-location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Device Type</label>
                <select
                  value={newDevice.deviceType}
                  onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  data-testid="select-device-type"
                >
                  {DEVICE_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Vendor</label>
                <select
                  value={newDevice.vendor}
                  onChange={(e) => setNewDevice({ ...newDevice, vendor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  data-testid="select-device-vendor"
                >
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">IP Address</label>
                <input
                  type="text"
                  value={newDevice.ipAddress}
                  onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  data-testid="input-device-ip"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={newDevice.serialNumber}
                  onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                  placeholder="SN-12345678"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  data-testid="input-device-serial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">API Endpoint</label>
                <input
                  type="text"
                  value={newDevice.apiEndpoint}
                  onChange={(e) => setNewDevice({ ...newDevice, apiEndpoint: e.target.value })}
                  placeholder="https://device.example.com/api"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  data-testid="input-device-api-endpoint"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                <input
                  type="password"
                  value={newDevice.apiKey}
                  onChange={(e) => setNewDevice({ ...newDevice, apiKey: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  data-testid="input-device-api-key"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-slate-600"
                onClick={() => setShowAddDevice(false)}
                data-testid="button-cancel-add-device"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700"
                data-testid="button-submit-device"
              >
                Register Device
              </Button>
            </div>
          </form>
        </BentoTile>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BentoTile className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              Registered Devices
            </h3>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Server className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No time clock devices registered</p>
              <p className="text-sm text-gray-500 mt-1">Add your first device to start capturing punches</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {devices.map((device) => {
                const healthStatus = healthStatuses.find(h => h.deviceId === device.deviceId);
                return (
                  <OrbitCard
                    key={device.id}
                    variant="default"
                    className="p-4"
                    data-testid={`device-card-${device.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${device.isOnline ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                          {device.isOnline ? (
                            <Wifi className="w-5 h-5 text-green-400" />
                          ) : (
                            <WifiOff className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{device.name}</h4>
                          <p className="text-sm text-gray-400">{device.location || 'No location set'}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-gray-300">
                              {device.deviceId}
                            </span>
                            <span className="text-xs bg-cyan-600/30 px-2 py-0.5 rounded text-cyan-300">
                              {DEVICE_TYPES.find(t => t.id === device.deviceType)?.name || device.deviceType}
                            </span>
                            <span className="text-xs bg-purple-600/30 px-2 py-0.5 rounded text-purple-300">
                              {vendors.find(v => v.id === device.vendor)?.name || device.vendor}
                            </span>
                          </div>
                          {healthStatus && (
                            <p className={`text-xs mt-2 ${getStatusColor(healthStatus.status)}`}>
                              {healthStatus.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePingDevice(device.id)}
                          title="Test Connection"
                          data-testid={`button-ping-${device.id}`}
                        >
                          <Activity className="w-4 h-4 text-cyan-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDevice(device.id)}
                          title="Remove Device"
                          data-testid={`button-delete-${device.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                    {device.lastPingAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last ping: {new Date(device.lastPingAt).toLocaleString()}
                      </p>
                    )}
                  </OrbitCard>
                );
              })}
            </div>
          )}
        </BentoTile>

        <BentoTile className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Recent Punches
            </h3>
            <Button
              onClick={handleSync}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-sync-punches"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Sync to Timesheets
            </Button>
          </div>

          {syncResult && (
            <div className={`mb-4 p-3 rounded-lg ${syncResult.synced > 0 ? 'bg-green-600/20 border border-green-600/30' : 'bg-yellow-600/20 border border-yellow-600/30'}`}>
              <p className="text-sm">
                <span className="font-bold">{syncResult.synced}</span> punches synced to timesheets
              </p>
              {syncResult.errors.length > 0 && (
                <p className="text-xs text-red-400 mt-1">{syncResult.errors.length} errors occurred</p>
              )}
            </div>
          )}

          {punches.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No punches recorded yet</p>
              <p className="text-sm text-gray-500 mt-1">Punches will appear here when workers clock in/out</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {punches.slice(0, 20).map((punch) => (
                <div
                  key={punch.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  data-testid={`punch-item-${punch.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPunchTypeColor(punch.punchType)}`}>
                      {getPunchTypeLabel(punch.punchType)}
                    </span>
                    <div>
                      <p className="text-sm text-white">
                        {punch.workerIdentifier || punch.workerId || 'Unknown Worker'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(punch.punchTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {punch.processedAt ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" title="Synced" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" title="Pending sync" />
                    )}
                    {!punch.isValid && (
                      <AlertCircle className="w-4 h-4 text-red-400" title="Validation error" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </BentoTile>
      </div>

      <BentoTile className="p-6 border-slate-700/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Integration Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Sending Punches via API</h4>
            <pre className="bg-slate-800 p-4 rounded-lg text-xs overflow-x-auto">
{`POST /api/time-clocks/punch
Content-Type: application/json

{
  "tenantId": "your-tenant-id",
  "deviceId": "TC-001",
  "workerIdentifier": "worker@email.com",
  "punchType": "in",
  "punchTime": "2025-01-15T08:00:00Z"
}`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Device Heartbeat</h4>
            <pre className="bg-slate-800 p-4 rounded-lg text-xs overflow-x-auto">
{`POST /api/time-clocks/heartbeat
Content-Type: application/json

{
  "tenantId": "your-tenant-id",
  "deviceId": "TC-001",
  "status": "online"
}`}
            </pre>
          </div>
        </div>
        <div className="mt-4 p-3 bg-cyan-600/10 border border-cyan-600/30 rounded-lg">
          <p className="text-sm text-cyan-300">
            <strong>Supported Vendors:</strong> {vendors.map(v => v.name).join(', ')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Configure vendor-specific settings when registering devices for enhanced integration.
          </p>
        </div>
      </BentoTile>
    </div>
  );
}
