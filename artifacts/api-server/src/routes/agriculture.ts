import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, crops, diseases, marketPrices, governmentSchemes, seasonalTips } from "@workspace/db";
import {
  GetCropParams,
  GetDiseaseParams,
  ListCropsQueryParams,
  ListCropsResponse,
  GetCropResponse,
  ListDiseasesResponse,
  GetDiseaseResponse,
  ListMarketPricesResponse,
  ListGovernmentSchemesResponse,
  ListSeasonalTipsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatCrop(c: typeof crops.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    nameTelugu: c.nameTelugu ?? null,
    season: c.season,
    growingConditions: c.growingConditions,
    soilType: c.soilType,
    waterRequirement: c.waterRequirement,
    harvestPeriod: c.harvestPeriod,
    description: c.description,
  };
}

function formatDisease(d: typeof diseases.$inferSelect) {
  return {
    id: d.id,
    name: d.name,
    nameTelugu: d.nameTelugu ?? null,
    affectedCrops: d.affectedCrops,
    symptoms: d.symptoms,
    causes: d.causes,
    treatment: d.treatment,
    prevention: d.prevention,
  };
}

router.get("/crops", async (req, res): Promise<void> => {
  const query = ListCropsQueryParams.safeParse(req.query);
  let rows = await db.select().from(crops).orderBy(crops.name);
  if (query.success && query.data.season) {
    rows = rows.filter((c) => c.season.toLowerCase() === query.data.season!.toLowerCase());
  }
  res.json(ListCropsResponse.parse(rows.map(formatCrop)));
});

router.get("/crops/:id", async (req, res): Promise<void> => {
  const params = GetCropParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [crop] = await db.select().from(crops).where(eq(crops.id, params.data.id));
  if (!crop) {
    res.status(404).json({ error: "Crop not found" });
    return;
  }
  res.json(GetCropResponse.parse(formatCrop(crop)));
});

router.get("/diseases", async (_req, res): Promise<void> => {
  const rows = await db.select().from(diseases).orderBy(diseases.name);
  res.json(ListDiseasesResponse.parse(rows.map(formatDisease)));
});

router.get("/diseases/:id", async (req, res): Promise<void> => {
  const params = GetDiseaseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [disease] = await db.select().from(diseases).where(eq(diseases.id, params.data.id));
  if (!disease) {
    res.status(404).json({ error: "Disease not found" });
    return;
  }
  res.json(GetDiseaseResponse.parse(formatDisease(disease)));
});

router.get("/market-prices", async (_req, res): Promise<void> => {
  const rows = await db.select().from(marketPrices).orderBy(marketPrices.date);
  res.json(ListMarketPricesResponse.parse(rows.map((r) => ({
    id: r.id,
    cropName: r.cropName,
    price: Number(r.price),
    unit: r.unit,
    market: r.market,
    date: r.date,
  }))));
});

router.get("/government-schemes", async (_req, res): Promise<void> => {
  const rows = await db.select().from(governmentSchemes).orderBy(governmentSchemes.name);
  res.json(ListGovernmentSchemesResponse.parse(rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    eligibility: r.eligibility,
    benefits: r.benefits,
    applicationUrl: r.applicationUrl ?? null,
  }))));
});

router.get("/seasonal-tips", async (_req, res): Promise<void> => {
  const rows = await db.select().from(seasonalTips).orderBy(seasonalTips.season);
  res.json(ListSeasonalTipsResponse.parse(rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    season: r.season,
    category: r.category,
  }))));
});

export default router;
