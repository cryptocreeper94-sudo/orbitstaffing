import { db } from "./db";
import { chatChannels } from "@shared/schema";
import { eq } from "drizzle-orm";

const DEFAULT_CHANNELS = [
  { name: "general", description: "General discussion for the ecosystem", category: "ecosystem", isDefault: true },
  { name: "announcements", description: "Official announcements and updates", category: "ecosystem", isDefault: true },
  { name: "darkwavestudios-support", description: "Support for DarkWave Studios apps", category: "app-support", isDefault: false },
  { name: "orbit-support", description: "Support for ORBIT Staffing OS", category: "app-support", isDefault: false },
  { name: "trusthome-support", description: "Support for TrustHome", category: "app-support", isDefault: false },
  { name: "trustvault-support", description: "Support for TrustVault", category: "app-support", isDefault: false },
  { name: "thevoid-support", description: "Support for The Void", category: "app-support", isDefault: false },
  { name: "happyeats-support", description: "Support for HappyEats", category: "app-support", isDefault: false },
  { name: "verdara-support", description: "Support for Verdara", category: "app-support", isDefault: false },
  { name: "tldriverconnect-support", description: "Support for TL Driver Connect", category: "app-support", isDefault: false },
  { name: "brewandboard-support", description: "Support for Brew & Board", category: "app-support", isDefault: false },
  { name: "garagebot-support", description: "Support for GarageBot", category: "app-support", isDefault: false },
  { name: "paintpros-support", description: "Support for PaintPros", category: "app-support", isDefault: false },
  { name: "tlid-marketing", description: "Trust Layer ID marketing and outreach", category: "app-support", isDefault: false },
  { name: "guardian-ai", description: "Guardian AI discussion and support", category: "app-support", isDefault: false },
];

export async function seedChatChannels() {
  for (const channel of DEFAULT_CHANNELS) {
    const existing = await db.select().from(chatChannels).where(eq(chatChannels.name, channel.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(chatChannels).values(channel);
    }
  }
}
