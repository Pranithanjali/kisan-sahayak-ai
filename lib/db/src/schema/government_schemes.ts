import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const governmentSchemes = pgTable("government_schemes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  eligibility: text("eligibility").notNull(),
  benefits: text("benefits").notNull(),
  applicationUrl: text("application_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertGovernmentSchemeSchema = createInsertSchema(governmentSchemes).omit({ id: true, createdAt: true });
export type GovernmentScheme = typeof governmentSchemes.$inferSelect;
export type InsertGovernmentScheme = z.infer<typeof insertGovernmentSchemeSchema>;
