import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameTelugu: text("name_telugu"),
  season: text("season").notNull(),
  growingConditions: text("growing_conditions").notNull(),
  soilType: text("soil_type").notNull(),
  waterRequirement: text("water_requirement").notNull(),
  harvestPeriod: text("harvest_period").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertCropSchema = createInsertSchema(crops).omit({ id: true, createdAt: true });
export type Crop = typeof crops.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;
