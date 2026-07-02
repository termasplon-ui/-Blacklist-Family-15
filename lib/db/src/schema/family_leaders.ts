import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const familyLeadersTable = pgTable("family_leaders", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  family: text("family").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFamilyLeaderSchema = createInsertSchema(familyLeadersTable).omit({ id: true, createdAt: true });
export type InsertFamilyLeader = z.infer<typeof insertFamilyLeaderSchema>;
export type FamilyLeader = typeof familyLeadersTable.$inferSelect;
