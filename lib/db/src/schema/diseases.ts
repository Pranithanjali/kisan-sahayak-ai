import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const diseases = pgTable("diseases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameTelugu: text("name_telugu"),
  affectedCrops: text("affected_crops").notNull(),
  symptoms: text("symptoms").notNull(),
  causes: text("causes").notNull(),
  treatment: text("treatment").notNull(),
  prevention: text("prevention").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertDiseaseSchema = createInsertSchema(diseases).omit({ id: true, createdAt: true });
export type Disease = typeof diseases.$inferSelect;
export type InsertDisease = z.infer<typeof insertDiseaseSchema>;
