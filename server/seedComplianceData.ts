import { db } from "./db";
import { prevailingWages, workersCompRates, stateComplianceRules } from "@shared/schema";

export async function seedComplianceData() {
  try {
    // Check if data already exists
    const existingRules = await db.select().from(stateComplianceRules).limit(1);
    if (existingRules.length > 0) {
      console.log("✓ Compliance data already seeded");
      return;
    }

    // Seed Prevailing Wages
    await db.insert(prevailingWages).values([
      { state: "TN", jobClassification: "Electrician", skillLevel: "Journeyman", baseHourlyRate: 45.00, fringe: 8.50, totalHourlyRate: 53.50, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "TN", jobClassification: "Carpenter", skillLevel: "Journeyman", baseHourlyRate: 38.50, fringe: 7.25, totalHourlyRate: 45.75, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "TN", jobClassification: "General Laborer", skillLevel: "Standard", baseHourlyRate: 22.00, fringe: 4.00, totalHourlyRate: 26.00, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "KY", jobClassification: "Electrician", skillLevel: "Journeyman", baseHourlyRate: 42.75, fringe: 8.00, totalHourlyRate: 50.75, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "KY", jobClassification: "Carpenter", skillLevel: "Journeyman", baseHourlyRate: 36.50, fringe: 6.75, totalHourlyRate: 43.25, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "AL", jobClassification: "Electrician", skillLevel: "Journeyman", baseHourlyRate: 40.00, fringe: 7.50, totalHourlyRate: 47.50, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "AR", jobClassification: "General Laborer", skillLevel: "Standard", baseHourlyRate: 20.50, fringe: 3.75, totalHourlyRate: 24.25, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "NC", jobClassification: "Carpenter", skillLevel: "Journeyman", baseHourlyRate: 39.00, fringe: 7.25, totalHourlyRate: 46.25, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "SC", jobClassification: "Electrician", skillLevel: "Journeyman", baseHourlyRate: 41.50, fringe: 7.75, totalHourlyRate: 49.25, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "GA", jobClassification: "General Laborer", skillLevel: "Standard", baseHourlyRate: 21.50, fringe: 3.95, totalHourlyRate: 25.45, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
      { state: "MS", jobClassification: "Carpenter", skillLevel: "Journeyman", baseHourlyRate: 35.00, fringe: 6.50, totalHourlyRate: 41.50, effectiveDate: new Date("2025-01-01"), source: "US Dept of Labor", applicableProjectTypes: "public_works" },
    ]);
    console.log("✓ Prevailing wages seeded");

    // Seed Workers Comp Rates
    await db.insert(workersCompRates).values([
      { state: "TN", industryClassification: "construction", riskLevel: "high", percentageOfPayroll: 12.50, minimumPremiumPerEmployee: 500, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "TN Department of Labor" },
      { state: "TN", industryClassification: "healthcare", riskLevel: "medium", percentageOfPayroll: 6.75, minimumPremiumPerEmployee: 300, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "TN Department of Labor" },
      { state: "TN", industryClassification: "general_labor", riskLevel: "low", percentageOfPayroll: 3.50, minimumPremiumPerEmployee: 150, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "TN Department of Labor" },
      { state: "KY", industryClassification: "construction", riskLevel: "high", percentageOfPayroll: 13.00, minimumPremiumPerEmployee: 520, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "KY Department of Workers Claims" },
      { state: "KY", industryClassification: "healthcare", riskLevel: "medium", percentageOfPayroll: 7.00, minimumPremiumPerEmployee: 310, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "KY Department of Workers Claims" },
      { state: "AL", industryClassification: "construction", riskLevel: "high", percentageOfPayroll: 11.75, minimumPremiumPerEmployee: 475, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "AL Department of Labor" },
      { state: "AR", industryClassification: "general_labor", riskLevel: "low", percentageOfPayroll: 3.25, minimumPremiumPerEmployee: 140, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "AR Division of Workers Compensation" },
      { state: "NC", industryClassification: "healthcare", riskLevel: "medium", percentageOfPayroll: 6.50, minimumPremiumPerEmployee: 290, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "NC Industrial Commission" },
      { state: "SC", industryClassification: "construction", riskLevel: "high", percentageOfPayroll: 12.75, minimumPremiumPerEmployee: 510, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "SC Dept of Insurance" },
      { state: "GA", industryClassification: "general_labor", riskLevel: "low", percentageOfPayroll: 3.40, minimumPremiumPerEmployee: 145, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "GA State Board of Workers Compensation" },
      { state: "MS", industryClassification: "construction", riskLevel: "high", percentageOfPayroll: 11.50, minimumPremiumPerEmployee: 460, coverageRequired: true, effectiveDate: new Date("2025-01-01"), governingBody: "MS Workers Compensation Commission" },
    ]);
    console.log("✓ Workers comp rates seeded");

    // Seed State Compliance Rules
    await db.insert(stateComplianceRules).values([
      { state: "TN", minWagePerHour: 7.25, workersCompRequired: true, backgroundCheckRequired: false, licenseRequirementsPerTrade: { electrician: "required", plumber: "required", hvac: "required" }, prevailingWageApplies: true, specialRequirements: "Tennessee requires workers comp for all employees. Prevailing wage applies to public works projects.", departmentOfLaborUrl: "https://www.tn.gov/labor-workforce.html", lastUpdated: new Date() },
      { state: "KY", minWagePerHour: 7.25, workersCompRequired: true, backgroundCheckRequired: false, licenseRequirementsPerTrade: { electrician: "required", plumber: "required" }, prevailingWageApplies: true, specialRequirements: "Kentucky workers comp mandatory. Prevailing wage for government contracts.", departmentOfLaborUrl: "https://kcc.ky.gov/", lastUpdated: new Date() },
      { state: "AL", minWagePerHour: 7.25, workersCompRequired: true, backgroundCheckRequired: false, licenseRequirementsPerTrade: { electrician: "required", plumber: "required" }, prevailingWageApplies: true, specialRequirements: "Alabama requires workers comp. Prevailing wage applies to public works.", departmentOfLaborUrl: "https://www.alabamaworks.alabama.gov/", lastUpdated: new Date() },
      { state: "AR", minWagePerHour: 11.00, workersCompRequired: true, backgroundCheckRequired: false, licenseRequirementsPerTrade: { electrician: "required" }, prevailingWageApplies: true, specialRequirements: "Arkansas has higher minimum wage (11.00). Prevailing wage for public projects.", departmentOfLaborUrl: "https://www.arkansas.gov/labor", lastUpdated: new Date() },
      { state: "NC", minWagePerHour: 7.25, workersCompRequired: true, backgroundCheckRequired: false, licenseRequirementsPerTrade: { electrician: "required", plumber: "required" }, prevailingWageApplies: true, specialRequirements: "North Carolina requires workers comp. Prevailing wage for government contracts.", departmentOfLaborUrl: "https://www.nc.gov/business/labor", lastUpdated: new Date() },
      { state: "SC", minWagePerHour: 7.25, workersCompRequired: true, backgroundCheckRequired: false, licenseRequirementsPerTrade: { electrician: "required", plumber: "required" }, prevailingWageApplies: true, specialRequirements: "South Carolina requires workers comp. Prevailing wage for public works projects.", departmentOfLaborUrl: "https://www.sccebp.org/", lastUpdated: new Date() },
      { state: "GA", minWagePerHour: 7.25, workersCompRequired: true, backgroundCheckRequired: false, licenseRequirementsPerTrade: { electrician: "required", plumber: "required" }, prevailingWageApplies: true, specialRequirements: "Georgia requires workers comp. Prevailing wage applies to government-funded projects.", departmentOfLaborUrl: "https://www.dol.state.ga.us/", lastUpdated: new Date() },
      { state: "MS", minWagePerHour: 7.25, workersCompRequired: true, backgroundCheckRequired: false, licenseRequirementsPerTrade: { electrician: "required" }, prevailingWageApplies: true, specialRequirements: "Mississippi requires workers comp. Prevailing wage for public works.", departmentOfLaborUrl: "https://www.mdes.ms.gov/", lastUpdated: new Date() },
    ]);
    console.log("✓ State compliance rules seeded");
    console.log("✓✓✓ ALL COMPLIANCE DATA SEEDED SUCCESSFULLY");
  } catch (error) {
    console.error("Seed error:", error);
  }
}
