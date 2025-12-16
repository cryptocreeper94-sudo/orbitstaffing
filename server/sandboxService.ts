import crypto from "crypto";

export interface SandboxWorker {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  hourlyWage: string;
  status: string;
  city: string;
  state: string;
  createdAt: string;
}

export interface SandboxJob {
  id: string;
  title: string;
  description: string;
  location: string;
  payRate: string;
  status: string;
  startDate: string;
  endDate: string | null;
  requiredSkills: string[];
  createdAt: string;
}

export interface SandboxTimesheet {
  id: string;
  workerId: string;
  workerName: string;
  jobId: string;
  date: string;
  hoursWorked: number;
  clockIn: string;
  clockOut: string;
  status: string;
  createdAt: string;
}

export interface SandboxPayrollRecord {
  id: string;
  workerId: string;
  workerName: string;
  periodStart: string;
  periodEnd: string;
  grossPay: string;
  deductions: string;
  netPay: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface SandboxLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactName: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
}

const FIRST_NAMES = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "William", "Amanda"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Anderson"];
const SKILLS = ["Forklift", "HVAC", "Electrical", "Plumbing", "Carpentry", "Welding", "CNC", "Assembly", "Warehouse", "Driving"];
const STATES = ["CA", "TX", "FL", "NY", "IL", "PA", "OH", "GA", "NC", "MI"];
const CITIES = ["Los Angeles", "Houston", "Miami", "New York", "Chicago", "Philadelphia", "Columbus", "Atlanta", "Charlotte", "Detroit"];

function generateSandboxPrefix(): string {
  return `sb_${crypto.randomBytes(4).toString("hex")}`;
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

class SandboxDataService {
  private sandboxDataCache: Map<string, {
    workers: SandboxWorker[];
    jobs: SandboxJob[];
    timesheets: SandboxTimesheet[];
    payrollRecords: SandboxPayrollRecord[];
    locations: SandboxLocation[];
    createdAt: Date;
  }> = new Map();

  generateMockWorkers(prefix: string, count: number = 10): SandboxWorker[] {
    const workers: SandboxWorker[] = [];
    for (let i = 0; i < count; i++) {
      const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lastName = LAST_NAMES[i % LAST_NAMES.length];
      workers.push({
        id: generateId(prefix),
        fullName: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@sandbox.orbit.test`,
        phone: `555-${String(100 + i).padStart(3, "0")}-${String(1000 + i).padStart(4, "0")}`,
        skills: [SKILLS[i % SKILLS.length], SKILLS[(i + 3) % SKILLS.length]],
        hourlyWage: `${18 + (i * 2)}.00`,
        status: i < 8 ? "active" : "inactive",
        city: CITIES[i % CITIES.length],
        state: STATES[i % STATES.length],
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
      });
    }
    return workers;
  }

  generateMockJobs(prefix: string, count: number = 5): SandboxJob[] {
    const jobs: SandboxJob[] = [];
    const jobTitles = [
      "Warehouse Associate",
      "Forklift Operator",
      "General Laborer",
      "Assembly Line Worker",
      "Shipping Coordinator"
    ];
    const descriptions = [
      "Handle inventory and shipping tasks in warehouse environment",
      "Operate forklift and manage material movement",
      "Perform various manual labor tasks as needed",
      "Work on production line assembling products",
      "Coordinate shipping and receiving operations"
    ];

    for (let i = 0; i < count; i++) {
      jobs.push({
        id: generateId(prefix),
        title: jobTitles[i],
        description: descriptions[i],
        location: `${CITIES[i % CITIES.length]}, ${STATES[i % STATES.length]}`,
        payRate: `${20 + (i * 3)}.00`,
        status: i < 4 ? "open" : "closed",
        startDate: new Date(Date.now() + (i * 86400000)).toISOString().split("T")[0],
        endDate: i < 2 ? null : new Date(Date.now() + ((i + 30) * 86400000)).toISOString().split("T")[0],
        requiredSkills: [SKILLS[i % SKILLS.length]],
        createdAt: new Date(Date.now() - (i * 172800000)).toISOString(),
      });
    }
    return jobs;
  }

  generateMockTimesheets(prefix: string, workers: SandboxWorker[], jobs: SandboxJob[]): SandboxTimesheet[] {
    const timesheets: SandboxTimesheet[] = [];
    const today = new Date();

    for (let day = 0; day < 7; day++) {
      for (let w = 0; w < Math.min(5, workers.length); w++) {
        const worker = workers[w];
        const job = jobs[w % jobs.length];
        const date = new Date(today.getTime() - (day * 86400000));
        const hours = 6 + Math.floor(Math.random() * 4);
        const clockIn = new Date(date);
        clockIn.setHours(8, 0, 0, 0);
        const clockOut = new Date(clockIn.getTime() + (hours * 3600000));

        timesheets.push({
          id: generateId(prefix),
          workerId: worker.id,
          workerName: worker.fullName,
          jobId: job.id,
          date: date.toISOString().split("T")[0],
          hoursWorked: hours,
          clockIn: clockIn.toISOString(),
          clockOut: clockOut.toISOString(),
          status: day < 2 ? "pending" : "approved",
          createdAt: clockOut.toISOString(),
        });
      }
    }
    return timesheets;
  }

  generateMockPayrollRecords(prefix: string, workers: SandboxWorker[]): SandboxPayrollRecord[] {
    const records: SandboxPayrollRecord[] = [];
    const today = new Date();
    const periodEnd = new Date(today);
    periodEnd.setDate(periodEnd.getDate() - periodEnd.getDay());
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 6);

    for (let i = 0; i < Math.min(5, workers.length); i++) {
      const worker = workers[i];
      const hours = 35 + Math.floor(Math.random() * 10);
      const hourlyRate = parseFloat(worker.hourlyWage);
      const gross = hours * hourlyRate;
      const deductions = gross * 0.22;
      const net = gross - deductions;

      records.push({
        id: generateId(prefix),
        workerId: worker.id,
        workerName: worker.fullName,
        periodStart: periodStart.toISOString().split("T")[0],
        periodEnd: periodEnd.toISOString().split("T")[0],
        grossPay: gross.toFixed(2),
        deductions: deductions.toFixed(2),
        netPay: net.toFixed(2),
        status: i < 3 ? "paid" : "pending",
        paidAt: i < 3 ? new Date(periodEnd.getTime() + 259200000).toISOString() : null,
        createdAt: periodEnd.toISOString(),
      });
    }
    return records;
  }

  generateMockLocations(prefix: string, count: number = 3): SandboxLocation[] {
    const locations: SandboxLocation[] = [];
    const locationNames = ["Main Warehouse", "Distribution Center", "Manufacturing Plant"];
    const addresses = ["123 Industrial Blvd", "456 Commerce Way", "789 Factory Lane"];

    for (let i = 0; i < count; i++) {
      locations.push({
        id: generateId(prefix),
        name: locationNames[i] || `Location ${i + 1}`,
        address: addresses[i] || `${100 + i} Business Rd`,
        city: CITIES[i % CITIES.length],
        state: STATES[i % STATES.length],
        zipCode: `${90000 + (i * 111)}`,
        contactName: `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`,
        contactPhone: `555-LOC-${String(1000 + i).padStart(4, "0")}`,
        isActive: true,
        createdAt: new Date(Date.now() - (i * 604800000)).toISOString(),
      });
    }
    return locations;
  }

  initializeSandboxData(credentialId: string, prefix: string): void {
    if (this.sandboxDataCache.has(credentialId)) {
      return;
    }

    const workers = this.generateMockWorkers(prefix);
    const jobs = this.generateMockJobs(prefix);
    const timesheets = this.generateMockTimesheets(prefix, workers, jobs);
    const payrollRecords = this.generateMockPayrollRecords(prefix, workers);
    const locations = this.generateMockLocations(prefix);

    this.sandboxDataCache.set(credentialId, {
      workers,
      jobs,
      timesheets,
      payrollRecords,
      locations,
      createdAt: new Date(),
    });

    console.log(`[Sandbox] Initialized sandbox data for credential ${credentialId} with prefix ${prefix}`);
  }

  getSandboxData(credentialId: string, prefix: string) {
    if (!this.sandboxDataCache.has(credentialId)) {
      this.initializeSandboxData(credentialId, prefix);
    }
    return this.sandboxDataCache.get(credentialId)!;
  }

  getWorkers(credentialId: string, prefix: string): SandboxWorker[] {
    return this.getSandboxData(credentialId, prefix).workers;
  }

  getJobs(credentialId: string, prefix: string): SandboxJob[] {
    return this.getSandboxData(credentialId, prefix).jobs;
  }

  getTimesheets(credentialId: string, prefix: string): SandboxTimesheet[] {
    return this.getSandboxData(credentialId, prefix).timesheets;
  }

  getPayrollRecords(credentialId: string, prefix: string): SandboxPayrollRecord[] {
    return this.getSandboxData(credentialId, prefix).payrollRecords;
  }

  getLocations(credentialId: string, prefix: string): SandboxLocation[] {
    return this.getSandboxData(credentialId, prefix).locations;
  }

  resetSandboxData(credentialId: string, prefix: string): void {
    this.sandboxDataCache.delete(credentialId);
    this.initializeSandboxData(credentialId, prefix);
    console.log(`[Sandbox] Reset sandbox data for credential ${credentialId}`);
  }

  generateNewPrefix(): string {
    return generateSandboxPrefix();
  }

  simulateCreateOperation(resourceType: string, data: any, prefix: string): any {
    return {
      id: generateId(prefix),
      ...data,
      _sandbox: true,
      _note: "This resource was created in sandbox mode and will not be persisted",
      createdAt: new Date().toISOString(),
    };
  }

  simulateUpdateOperation(resourceType: string, id: string, data: any): any {
    return {
      id,
      ...data,
      _sandbox: true,
      _note: "This resource was updated in sandbox mode and changes will not be persisted",
      updatedAt: new Date().toISOString(),
    };
  }

  simulateDeleteOperation(resourceType: string, id: string): { success: boolean; message: string } {
    return {
      success: true,
      message: `[Sandbox] Resource ${id} was deleted in sandbox mode (not persisted)`,
    };
  }

  getAnalytics(credentialId: string, prefix: string): any {
    const data = this.getSandboxData(credentialId, prefix);
    return {
      _sandbox: true,
      workers: {
        total: data.workers.length,
        active: data.workers.filter(w => w.status === "active").length,
        inactive: data.workers.filter(w => w.status === "inactive").length,
      },
      jobs: {
        total: data.jobs.length,
        open: data.jobs.filter(j => j.status === "open").length,
        closed: data.jobs.filter(j => j.status === "closed").length,
      },
      timesheets: {
        total: data.timesheets.length,
        pending: data.timesheets.filter(t => t.status === "pending").length,
        approved: data.timesheets.filter(t => t.status === "approved").length,
        totalHours: data.timesheets.reduce((sum, t) => sum + t.hoursWorked, 0),
      },
      payroll: {
        total: data.payrollRecords.length,
        pending: data.payrollRecords.filter(p => p.status === "pending").length,
        paid: data.payrollRecords.filter(p => p.status === "paid").length,
        totalGross: data.payrollRecords.reduce((sum, p) => sum + parseFloat(p.grossPay), 0).toFixed(2),
      },
    };
  }

  getBillingInfo(credentialId: string, prefix: string): any {
    return {
      _sandbox: true,
      plan: "Enterprise (Sandbox)",
      billingCycle: "monthly",
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      currentBalance: "0.00",
      currency: "USD",
      paymentMethod: {
        type: "credit_card",
        last4: "4242",
        brand: "Visa",
        expiresAt: "12/2027",
      },
      invoices: [
        {
          id: generateId(prefix),
          amount: "999.00",
          status: "paid",
          date: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
        },
        {
          id: generateId(prefix),
          amount: "999.00",
          status: "paid",
          date: new Date(Date.now() - 60 * 86400000).toISOString().split("T")[0],
        },
      ],
    };
  }
}

export const sandboxService = new SandboxDataService();
