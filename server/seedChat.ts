import { db } from "./db";
import { chatChannels } from "@shared/schema";
import { eq } from "drizzle-orm";

const DEFAULT_CHANNELS = [
  { name: "general", description: "General discussion for the ecosystem", category: "ecosystem", isDefault: true },
  { name: "announcements", description: "Official announcements and updates", category: "ecosystem", isDefault: true },
  { name: "darkwavestudios-support", description: "Support for DarkWave Studios apps", category: "app-support", isDefault: false },
  { name: "garagebot-support", description: "Support for GarageBot", category: "app-support", isDefault: false },
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
