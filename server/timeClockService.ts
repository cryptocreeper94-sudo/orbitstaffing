import { db } from "./db";
import { eq, desc, and, isNull, gte, lte, sql } from "drizzle-orm";
import {
  timeClockDevices,
  timeClockPunches,
  timesheets,
  workers,
  type TimeClockDevice,
  type InsertTimeClockDevice,
  type TimeClockPunch,
  type InsertTimeClockPunch,
  TIME_CLOCK_VENDORS,
  type TimeClockVendor,
} from "@shared/schema";

export interface PunchPayload {
  deviceId: string;
  workerIdentifier: string;
  punchType: 'in' | 'out' | 'break_start' | 'break_end';
  punchTime: Date;
  latitude?: number;
  longitude?: number;
  rawData?: Record<string, any>;
}

export interface DeviceHealthStatus {
  deviceId: string;
  isOnline: boolean;
  lastPingAt: Date | null;
  status: 'healthy' | 'warning' | 'offline' | 'error';
  message: string;
}

class TimeClockService {
  private readonly OFFLINE_THRESHOLD_MS = 5 * 60 * 1000;

  async registerDevice(data: InsertTimeClockDevice): Promise<TimeClockDevice> {
    const result = await db.insert(timeClockDevices).values({
      ...data,
      isOnline: false,
      isActive: true,
    }).returning();
    return result[0];
  }

  async updateDevice(id: string, updates: Partial<InsertTimeClockDevice>): Promise<TimeClockDevice | null> {
    const result = await db.update(timeClockDevices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(timeClockDevices.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await db.delete(timeClockDevices)
      .where(eq(timeClockDevices.id, id))
      .returning();
    return result.length > 0;
  }

  async getDevice(id: string): Promise<TimeClockDevice | null> {
    const result = await db.select()
      .from(timeClockDevices)
      .where(eq(timeClockDevices.id, id))
      .limit(1);
    return result[0] || null;
  }

  async getDeviceByDeviceId(deviceId: string, tenantId: string): Promise<TimeClockDevice | null> {
    const result = await db.select()
      .from(timeClockDevices)
      .where(and(
        eq(timeClockDevices.deviceId, deviceId),
        eq(timeClockDevices.tenantId, tenantId)
      ))
      .limit(1);
    return result[0] || null;
  }

  async listDevices(tenantId: string): Promise<TimeClockDevice[]> {
    return await db.select()
      .from(timeClockDevices)
      .where(eq(timeClockDevices.tenantId, tenantId))
      .orderBy(desc(timeClockDevices.createdAt));
  }

  async processIncomingPunch(tenantId: string, payload: PunchPayload): Promise<TimeClockPunch> {
    const device = await this.getDeviceByDeviceId(payload.deviceId, tenantId);
    
    const worker = await this.resolveWorker(tenantId, payload.workerIdentifier);

    const punch: InsertTimeClockPunch = {
      tenantId,
      deviceId: device?.id || null,
      workerId: worker?.id || null,
      punchType: payload.punchType,
      punchTime: payload.punchTime,
      source: 'device',
      workerIdentifier: payload.workerIdentifier,
      latitude: payload.latitude?.toString(),
      longitude: payload.longitude?.toString(),
      rawData: payload.rawData,
      isValid: !!worker,
      validationErrors: !worker ? { error: 'Worker not found' } : null,
    };

    const result = await db.insert(timeClockPunches).values(punch).returning();
    return result[0];
  }

  async resolveWorker(tenantId: string, identifier: string): Promise<{ id: string } | null> {
    const byEmail = await db.select({ id: workers.id })
      .from(workers)
      .where(and(
        eq(workers.tenantId, tenantId),
        eq(workers.email, identifier)
      ))
      .limit(1);
    if (byEmail.length > 0) return byEmail[0];

    const byPhone = await db.select({ id: workers.id })
      .from(workers)
      .where(and(
        eq(workers.tenantId, tenantId),
        eq(workers.phone, identifier)
      ))
      .limit(1);
    if (byPhone.length > 0) return byPhone[0];

    const byId = await db.select({ id: workers.id })
      .from(workers)
      .where(and(
        eq(workers.tenantId, tenantId),
        eq(workers.id, identifier)
      ))
      .limit(1);
    if (byId.length > 0) return byId[0];

    return null;
  }

  async listPunches(
    tenantId: string,
    options: {
      deviceId?: string;
      workerId?: string;
      startDate?: Date;
      endDate?: Date;
      unprocessedOnly?: boolean;
      limit?: number;
    } = {}
  ): Promise<TimeClockPunch[]> {
    const conditions = [eq(timeClockPunches.tenantId, tenantId)];
    
    if (options.deviceId) {
      conditions.push(eq(timeClockPunches.deviceId, options.deviceId));
    }
    if (options.workerId) {
      conditions.push(eq(timeClockPunches.workerId, options.workerId));
    }
    if (options.startDate) {
      conditions.push(gte(timeClockPunches.punchTime, options.startDate));
    }
    if (options.endDate) {
      conditions.push(lte(timeClockPunches.punchTime, options.endDate));
    }
    if (options.unprocessedOnly) {
      conditions.push(isNull(timeClockPunches.processedAt));
    }

    return await db.select()
      .from(timeClockPunches)
      .where(and(...conditions))
      .orderBy(desc(timeClockPunches.punchTime))
      .limit(options.limit || 100);
  }

  async syncPunchesToTimesheets(tenantId: string): Promise<{ synced: number; errors: string[] }> {
    const unprocessedPunches = await this.listPunches(tenantId, {
      unprocessedOnly: true,
    });

    const grouped: Map<string, TimeClockPunch[]> = new Map();
    for (const punch of unprocessedPunches) {
      if (!punch.workerId) continue;
      const dateKey = `${punch.workerId}-${new Date(punch.punchTime).toISOString().split('T')[0]}`;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(punch);
    }

    let synced = 0;
    const errors: string[] = [];

    for (const [key, punches] of grouped) {
      try {
        const sorted = punches.sort((a, b) => 
          new Date(a.punchTime).getTime() - new Date(b.punchTime).getTime()
        );
        
        const clockIn = sorted.find(p => p.punchType === 'in');
        const clockOut = sorted.find(p => p.punchType === 'out');
        
        if (clockIn && clockOut && clockIn.workerId) {
          const clockInTime = new Date(clockIn.punchTime);
          const clockOutTime = new Date(clockOut.punchTime);
          const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

          const timesheetResult = await db.insert(timesheets).values({
            tenantId,
            workerId: clockIn.workerId,
            date: clockInTime.toISOString().split('T')[0],
            clockIn: clockInTime,
            clockOut: clockOutTime,
            hoursWorked: hoursWorked.toFixed(2),
            status: 'pending',
          }).returning();

          for (const punch of punches) {
            await db.update(timeClockPunches)
              .set({ 
                processedAt: new Date(),
                timesheetId: timesheetResult[0].id 
              })
              .where(eq(timeClockPunches.id, punch.id));
          }
          
          synced++;
        }
      } catch (error) {
        errors.push(`Failed to sync ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { synced, errors };
  }

  async handleHeartbeat(deviceId: string, tenantId: string): Promise<TimeClockDevice | null> {
    const device = await this.getDeviceByDeviceId(deviceId, tenantId);
    if (!device) return null;

    const result = await db.update(timeClockDevices)
      .set({ 
        lastPingAt: new Date(),
        isOnline: true,
        updatedAt: new Date(),
      })
      .where(eq(timeClockDevices.id, device.id))
      .returning();

    return result[0] || null;
  }

  async pingDevice(id: string): Promise<DeviceHealthStatus> {
    const device = await this.getDevice(id);
    if (!device) {
      return {
        deviceId: id,
        isOnline: false,
        lastPingAt: null,
        status: 'error',
        message: 'Device not found',
      };
    }

    if (device.apiEndpoint) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        await fetch(device.apiEndpoint, {
          method: 'GET',
          headers: device.apiKey ? { 'Authorization': `Bearer ${device.apiKey}` } : {},
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        await db.update(timeClockDevices)
          .set({ 
            lastPingAt: new Date(),
            isOnline: true,
            updatedAt: new Date(),
          })
          .where(eq(timeClockDevices.id, id));

        return {
          deviceId: device.deviceId,
          isOnline: true,
          lastPingAt: new Date(),
          status: 'healthy',
          message: 'Device responded successfully',
        };
      } catch (error) {
        await db.update(timeClockDevices)
          .set({ isOnline: false, updatedAt: new Date() })
          .where(eq(timeClockDevices.id, id));

        return {
          deviceId: device.deviceId,
          isOnline: false,
          lastPingAt: device.lastPingAt,
          status: 'offline',
          message: error instanceof Error ? error.message : 'Connection failed',
        };
      }
    }

    return {
      deviceId: device.deviceId,
      isOnline: device.isOnline || false,
      lastPingAt: device.lastPingAt,
      status: device.isOnline ? 'healthy' : 'warning',
      message: device.isOnline ? 'Device online (no API configured)' : 'No API endpoint configured',
    };
  }

  async monitorDeviceHealth(tenantId: string): Promise<DeviceHealthStatus[]> {
    const devices = await this.listDevices(tenantId);
    const now = Date.now();
    const statuses: DeviceHealthStatus[] = [];

    for (const device of devices) {
      if (!device.isActive) {
        statuses.push({
          deviceId: device.deviceId,
          isOnline: false,
          lastPingAt: device.lastPingAt,
          status: 'offline',
          message: 'Device inactive',
        });
        continue;
      }

      if (device.lastPingAt) {
        const timeSinceLastPing = now - new Date(device.lastPingAt).getTime();
        
        if (timeSinceLastPing > this.OFFLINE_THRESHOLD_MS) {
          if (device.isOnline) {
            await db.update(timeClockDevices)
              .set({ isOnline: false, updatedAt: new Date() })
              .where(eq(timeClockDevices.id, device.id));
          }
          
          statuses.push({
            deviceId: device.deviceId,
            isOnline: false,
            lastPingAt: device.lastPingAt,
            status: 'offline',
            message: `No heartbeat for ${Math.round(timeSinceLastPing / 60000)} minutes`,
          });
        } else if (timeSinceLastPing > this.OFFLINE_THRESHOLD_MS / 2) {
          statuses.push({
            deviceId: device.deviceId,
            isOnline: true,
            lastPingAt: device.lastPingAt,
            status: 'warning',
            message: 'Heartbeat interval slower than expected',
          });
        } else {
          statuses.push({
            deviceId: device.deviceId,
            isOnline: true,
            lastPingAt: device.lastPingAt,
            status: 'healthy',
            message: 'Device operating normally',
          });
        }
      } else {
        statuses.push({
          deviceId: device.deviceId,
          isOnline: false,
          lastPingAt: null,
          status: 'warning',
          message: 'No heartbeat received yet',
        });
      }
    }

    return statuses;
  }

  getSupportedVendors(): { id: TimeClockVendor; name: string; description: string }[] {
    return [
      { id: 'generic_api', name: 'Generic API', description: 'REST API compatible devices' },
      { id: 'adp', name: 'ADP', description: 'ADP Time & Attendance integration' },
      { id: 'kronos', name: 'Kronos/UKG', description: 'Kronos Workforce Ready integration' },
      { id: 'timeforce', name: 'TimeForce', description: 'TimeForce II time clock systems' },
      { id: 'ukg', name: 'UKG Pro', description: 'UKG Pro Workforce Management' },
      { id: 'paychex', name: 'Paychex', description: 'Paychex Flex Time integration' },
    ];
  }
}

export const timeClockService = new TimeClockService();
