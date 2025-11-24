/**
 * Demo Data Seeding
 * Generates realistic sandbox data for testing
 */

import { db } from "./db";
import { 
  users, companies, workers, clients, jobs, 
  assignments, timesheets, payroll, invoices 
} from "@shared/schema";

export async function seedDemoData() {
  try {
    console.log("🌱 Seeding demo data...");

    // Clear existing demo data
    await db.delete(invoices).where(db.ne(invoices.id, null));
    await db.delete(payroll).where(db.ne(payroll.id, null));
    await db.delete(timesheets).where(db.ne(timesheets.id, null));
    await db.delete(assignments).where(db.ne(assignments.id, null));
    await db.delete(jobs).where(db.ne(jobs.id, null));
    await db.delete(clients).where(db.ne(clients.id, null));
    await db.delete(workers).where(db.ne(workers.id, null));
    await db.delete(companies).where(db.ne(companies.id, null));
    await db.delete(users).where(db.ne(users.id, null));

    // Create demo owner
    const owner = await db.insert(users).values({
      email: "owner@superiostaffing.com",
      passwordHash: "demo_password_hash", // Mock password
      role: "owner",
      fullName: "John Superior",
      phone: "615-555-0100",
      verified: true,
      verifiedAt: new Date(),
    }).returning();

    // Create demo company
    const company = await db.insert(companies).values({
      name: "Demo Staffing Company",
      industry: "staffing",
      email: "info@demostaffing.com",
      phone: "615-555-0100",
      addressLine1: "100 Main Street",
      city: "Nashville",
      state: "TN",
      zipCode: "37201",
      ownerId: owner[0].id,
      billingModel: "fixed",
      billingTier: "growth",
      monthlyBillingAmount: "5000.00",
      paymentStatus: "active",
    }).returning();

    // Create demo clients
    const client1 = await db.insert(clients).values({
      name: "Acme Manufacturing",
      companyId: company[0].id,
      contactName: "Bob Smith",
      contactEmail: "bob@acme.com",
      contactPhone: "615-555-0200",
      addressLine1: "500 Industry Way",
      city: "Nashville",
      state: "TN",
      billingRate: "25.50",
    }).returning();

    const client2 = await db.insert(clients).values({
      name: "Downtown Hotel",
      companyId: company[0].id,
      contactName: "Sarah Johnson",
      contactEmail: "sarah@downtown.com",
      contactPhone: "615-555-0300",
      addressLine1: "1 Hotel Plaza",
      city: "Nashville",
      state: "TN",
      billingRate: "18.75",
    }).returning();

    // Create demo workers (50 workers)
    const workerNames = [
      { first: "James", last: "Wilson" },
      { first: "Maria", last: "Garcia" },
      { first: "Michael", last: "Chen" },
      { first: "Sarah", last: "Anderson" },
      { first: "David", last: "Brown" },
      // Add 45 more...
    ];

    const workers_records = [];
    for (let i = 0; i < 50; i++) {
      const w = await db.insert(workers).values({
        companyId: company[0].id,
        firstName: `Worker${i}`,
        lastName: `Demo${i}`,
        email: `worker${i}@demo.orbitstaffing.net`,
        phone: `615-555-${String(1000 + i).slice(-4)}`,
        hourlyRate: `${(20 + Math.random() * 15).toFixed(2)}`,
        ssn: "XXX-XX-1234",
        verified: true,
        verifiedAt: new Date(),
      }).returning();
      workers_records.push(w[0]);
    }

    // Create demo jobs
    const job1 = await db.insert(jobs).values({
      companyId: company[0].id,
      clientId: client1[0].id,
      title: "Factory Assembly Line",
      description: "Manufacturing assembly work",
      location: "500 Industry Way, Nashville, TN",
      latitude: 36.1627,
      longitude: -86.7816,
      workersNeeded: 15,
      hourlyRate: "22.50",
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }).returning();

    const job2 = await db.insert(jobs).values({
      companyId: company[0].id,
      clientId: client2[0].id,
      title: "Hotel Housekeeping",
      description: "Room cleaning and maintenance",
      location: "1 Hotel Plaza, Nashville, TN",
      latitude: 36.1599,
      longitude: -86.7829,
      workersNeeded: 10,
      hourlyRate: "17.50",
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }).returning();

    // Create assignments for first 10 workers on job1
    const assignments_records = [];
    for (let i = 0; i < 10; i++) {
      const a = await db.insert(assignments).values({
        companyId: company[0].id,
        jobId: job1[0].id,
        workerId: workers_records[i].id,
        clientId: client1[0].id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
        status: "assigned",
        gpsVerified: Math.random() > 0.3, // 70% GPS verified
      }).returning();
      assignments_records.push(a[0]);
    }

    // Create assignments for next 8 workers on job2
    for (let i = 10; i < 18; i++) {
      const a = await db.insert(assignments).values({
        companyId: company[0].id,
        jobId: job2[0].id,
        workerId: workers_records[i].id,
        clientId: client2[0].id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        status: "assigned",
        gpsVerified: Math.random() > 0.2,
      }).returning();
      assignments_records.push(a[0]);
    }

    // Create timesheets for completed assignments
    for (let i = 0; i < Math.min(5, assignments_records.length); i++) {
      const a = assignments_records[i];
      await db.insert(timesheets).values({
        assignmentId: a.id,
        workerId: a.workerId,
        companyId: company[0].id,
        clockInTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        clockOutTime: new Date(Date.now() - 1000),
        hoursWorked: 7.9,
        gpsVerified: true,
        startLocation: "500 Industry Way",
        endLocation: "500 Industry Way",
      }).returning();
    }

    // Create payroll records
    for (let i = 0; i < 10; i++) {
      await db.insert(payroll).values({
        companyId: company[0].id,
        workerId: workers_records[i].id,
        periodStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEndDate: new Date(),
        regularHours: 40,
        overtimeHours: 0,
        regularPay: `${(workers_records[i].hourlyRate as any * 40).toFixed(2)}`,
        overtimePay: "0.00",
        bonus: `${(100 + Math.random() * 400).toFixed(2)}`,
        deductions: "0.00",
        netPay: `${(workers_records[i].hourlyRate as any * 40 + 100).toFixed(2)}`,
        status: "processed",
        processedDate: new Date(),
      }).returning();
    }

    console.log("✅ Demo data seeded successfully!");
    console.log(`   - 1 company: Superior Staffing`);
    console.log(`   - 50 workers`);
    console.log(`   - 2 clients`);
    console.log(`   - 2 jobs`);
    console.log(`   - 18 assignments`);
    console.log(`   - 10 payroll records`);

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.main) {
  seedDemoData().catch(console.error);
}
