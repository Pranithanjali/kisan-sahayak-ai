import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const seasonalTips = pgTable("seasonal_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  season: text("season").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSeasonalTipSchema = createInsertSchema(seasonalTips).omit({ id: true, createdAt: true });
export type SeasonalTip = typeof seasonalTips.$inferSelect;
export type InsertSeasonalTip = z.infer<typeof insertSeasonalTipSchema>;
