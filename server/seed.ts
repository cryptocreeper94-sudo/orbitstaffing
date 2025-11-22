import { db } from "./db";
import { stateCompliance } from "@shared/schema";

async function seedStateCompliance() {
  try {
    // Check if already seeded
    const existing = await db.select().from(stateCompliance);
    if (existing.length > 0) {
      console.log("✓ State compliance data already seeded");
      return;
    }

    // Seed Tennessee
    await db.insert(stateCompliance).values({
      stateCode: "TN",
      stateName: "Tennessee",
      stateTaxRate: "0.00",
      unemploymentRate: "3.50",
      workersCompRate: "4.50",
      prevailingWageEnabled: true,
      prevailingWageRates: {
        electrician: 48.50,
        plumber: 46.75,
        carpenter: 42.25,
        hvac_technician: 45.0,
        laborer_general: 38.5,
        operating_engineer: 52.0,
      },
      i9RequirementsText:
        "Form I-9 required within 3 business days of hire. Section 1 must be completed before or at hire.",
      i9ValidDocuments: {
        list_a: ["US Passport", "Permanent Resident Card", "Employment Authorization Card", "Temporary Resident Card"],
        list_b: ["Driver License", "State ID", "Passport Card", "Military ID"],
        list_c: ["SSN Card", "Birth Certificate", "Social Security Account Statement"],
      },
      minimumWage: "7.25",
      overtimeThreshold: 40,
      mealBreakRequired: false,
      restBreakRequired: false,
      specialRequirements:
        "Tennessee has no state income tax. Prevailing wage applies to public projects over $15,000. E-Verify optional but recommended.",
    });

    // Seed Kentucky
    await db.insert(stateCompliance).values({
      stateCode: "KY",
      stateName: "Kentucky",
      stateTaxRate: "5.00",
      unemploymentRate: "3.75",
      workersCompRate: "4.75",
      prevailingWageEnabled: true,
      prevailingWageRates: {
        electrician: 52.0,
        plumber: 49.25,
        carpenter: 44.75,
        hvac_technician: 48.0,
        laborer_general: 40.5,
        operating_engineer: 54.75,
      },
      i9RequirementsText: "Form I-9 required within 3 business days of hire. Kentucky requires E-Verify for eligible employers.",
      i9ValidDocuments: {
        list_a: ["US Passport", "Permanent Resident Card", "Employment Authorization Card"],
        list_b: ["Driver License (KY or other state)", "State ID", "Passport Card", "Military ID"],
        list_c: ["SSN Card", "Birth Certificate", "Social Security Account Statement"],
      },
      minimumWage: "7.25",
      overtimeThreshold: 40,
      mealBreakRequired: false,
      restBreakRequired: false,
      specialRequirements:
        "Kentucky has state income tax (2-5.75%). Prevailing wage applies to public projects over $100,000. Provides vocational rehabilitation benefits.",
    });

    console.log("✓ Tennessee and Kentucky compliance data seeded");
  } catch (error) {
    console.error("Error seeding state compliance:", error);
    throw error;
  }
}

export async function runSeed() {
  await seedStateCompliance();
}
