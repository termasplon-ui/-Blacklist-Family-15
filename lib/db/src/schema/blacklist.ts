import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blacklistTable = pgTable("blacklist", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  reason: text("reason").notNull(),
  issuedBy: text("issued_by").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  daysCount: integer("days_count").notNull(),
  amnesty: boolean("amnesty").notNull().default(false),
  active: boolean("active").notNull().default(true),
  removedBy: text("removed_by"),
  removedAt: timestamp("removed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBlacklistSchema = createInsertSchema(blacklistTable).omit({ id: true, createdAt: true });
export type InsertBlacklist = z.infer<typeof insertBlacklistSchema>;
export type Blacklist = typeof blacklistTable.$inferSelect;
