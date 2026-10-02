import { z } from "zod";

export const GeoCoordinateSchema = z.tuple([z.number(), z.number()]); // [lng, lat] or [lat, lng]

export const GeoPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(GeoCoordinateSchema)),
});

export const FarmFieldInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Field name is required"),
  district: z.string().min(1, "District is required"),
  division: z.string().optional(),
  upazila: z.string().optional(),
  polygon: GeoPolygonSchema,
  centerCoordinates: z.object({
    lat: z.number().min(20).max(27),
    lng: z.number().min(88).max(93),
  }),
  areaHectares: z.number().positive("Area must be positive"),
  areaBigha: z.number().positive().optional(),
  soilType: z.enum([
    "clay_loam",
    "silt_loam",
    "sandy_loam",
    "saline_clay",
    "alluvial_silt",
    "peat_basin",
  ]).default("silt_loam"),
  currentSalinityEC: z.number().min(0).max(25).default(2.5), // dS/m
  waterAvailability: z.enum([
    "rainfed_only",
    "limited_shallow_tubewell",
    "deep_tubewell_secure",
    "canal_surface_water",
    "waterlogged_seasonal",
  ]).default("limited_shallow_tubewell"),
  currentCrop: z.enum([
    "fallow",
    "transplanted_aman_rice",
    "boro_rice",
    "aus_rice",
    "jute",
    "mustard",
    "potato",
    "mung_bean",
    "lentil",
    "maize",
    "sunflower",
    "vegetables",
  ]).default("transplanted_aman_rice"),
  previousCrop: z.enum([
    "fallow",
    "transplanted_aman_rice",
    "boro_rice",
    "aus_rice",
    "jute",
    "mustard",
    "potato",
    "mung_bean",
    "lentil",
    "maize",
    "sunflower",
    "vegetables",
  ]).default("boro_rice"),
  priorities: z.array(
    z.enum([
      "soil_health",
      "maximize_profit",
      "reduce_salinity",
      "minimize_water",
      "pest_break",
      "climate_resilience",
    ])
  ).min(1, "At least one priority must be chosen"),
  targetSeason: z.enum([
    "rabi", // Nov - Mar (Winter)
    "kharif_1", // Mar - Jul (Pre-monsoon)
    "kharif_2", // Jul - Nov (Monsoon / Aman)
    "full_annual_cycle", // 3-crop 12 month rotation
  ]).default("full_annual_cycle"),
});

export type FarmFieldInput = z.infer<typeof FarmFieldInputSchema>;

export const CropStepSchema = z.object({
  step: z.number(),
  cropKey: z.string(),
  cropNameEn: z.string(),
  cropNameBn: z.string(),
  varietyRecommended: z.string(),
  season: z.enum(["Rabi", "Kharif-1", "Kharif-2", "Full Year"]),
  sowingWindow: z.string(),
  harvestWindow: z.string(),
  durationDays: z.number(),
  role: z.enum([
    "nitrogen_fixer",
    "cash_yield",
    "salinity_sink",
    "pest_break",
    "low_water_cover",
    "biomass_builder",
  ]),
  roleLabel: z.string(),
  soilHealthImpact: z.string(),
  waterDemandLevel: z.enum(["very_low", "low", "moderate", "high", "very_high"]),
  waterDemandMm: z.number(),
  expectedYieldPerAcre: z.string(),
  estimatedNetProfitBdtPerAcre: z.number(),
  confidence: z.number().min(0).max(1),
  primaryRationaleEn: z.string(),
  primaryRationaleBn: z.string(),
  managementTipsEn: z.array(z.string()),
  managementTipsBn: z.array(z.string()),
  keyRisks: z.array(z.string()),
  scientificName: z.string().optional(),
});

export type CropStep = z.infer<typeof CropStepSchema>;

export const DiagnosticResponseSchema = z.object({
  schemaVersion: z.string().default("1.0.0"),
  timestamp: z.string(),
  status: z.enum(["success", "warning", "error"]),
  fieldOverview: z.object({
    name: z.string(),
    district: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    areaHectares: z.number(),
    areaBigha: z.number(),
    aezName: z.string(),
    aezNumber: z.number(),
  }),
  diagnostics: z.object({
    soil: z.object({
      ecValue: z.number(), // dS/m
      ecUnit: z.literal("dS/m"),
      salinityCategory: z.enum(["non_saline", "slightly_saline", "moderately_saline", "strongly_saline", "severely_saline"]),
      salinityAssessment: z.string(),
      organicMatterPct: z.number(),
      nitrogenStatus: z.enum(["deficient", "low", "medium", "optimal"]),
      ph: z.number(),
      texture: z.string(),
      source: z.string(),
      isSimulated: z.boolean(),
    }),
    weather: z.object({
      currentTempC: z.number(),
      avgMaxTempC: z.number(),
      avgMinTempC: z.number(),
      forecastRainfall30dMm: z.number(),
      historicalAnnualRainfallMm: z.number(),
      solarRadiationMjM2Day: z.number(),
      relativeHumidityPct: z.number(),
      seasonalRiskWarning: z.string().nullable(),
      source: z.string(),
      isLiveNasa: z.boolean(),
    }),
    water: z.object({
      waterStressLevel: z.enum(["low", "moderate", "high", "critical"]),
      groundwaterSustainabilityRisk: z.enum(["low", "medium", "high"]),
      irrigationAdviceEn: z.string(),
      irrigationAdviceBn: z.string(),
      seasonalWaterDeficitMm: z.number(),
    }),
    vegetation: z.object({
      ndviMean: z.number(),
      biomassIndex: z.number(),
      vegetationStateEn: z.string(),
      vegetationStateBn: z.string(),
      isSimulated: z.boolean(),
    }),
  }),
  recommendations: z.object({
    optimalSequence: z.array(CropStepSchema),
    alternativeSequence: z.array(CropStepSchema),
    cycleSummary: z.object({
      cycleName: z.string(),
      totalDurationMonths: z.number(),
      netNitrogenFixationKgHa: z.number(),
      waterSavingsComparedToMonoculturePct: z.number(),
      projectedAnnualProfitBdtPerAcre: z.number(),
      soilOrganicMatterImprovementPct: z.number(),
      pestBreakEffectivenessPct: z.number(),
      salinityMitigationRating: z.enum(["High", "Moderate", "Neutral", "Critical Required"]),
      overallConfidenceScore: z.number().min(0).max(100),
    }),
    whyThisRecommendation: z.array(
      z.object({
        driver: z.string(),
        driverBn: z.string(),
        impact: z.enum(["high", "medium", "moderate"]),
        explanationEn: z.string(),
        explanationBn: z.string(),
      })
    ),
  }),
  evidence: z.object({
    nasaPowerTimeSeries: z.array(
      z.object({
        date: z.string(),
        precipitationMm: z.number(),
        tempMaxC: z.number(),
        tempMinC: z.number(),
        solarRadiation: z.number(),
      })
    ),
    ruleEngineTriggers: z.array(
      z.object({
        parameter: z.string(),
        observedValue: z.string(),
        triggeredRule: z.string(),
        impactOnSelection: z.string(),
      })
    ),
    scientificCitations: z.array(
      z.object({
        title: z.string(),
        institution: z.string(),
        year: z.union([z.number(), z.string()]),
      })
    ),
  }),
  metadata: z.object({
    engineVersion: z.string(),
    isMockSimulation: z.boolean(),
    liveNasaStatus: z.enum(["connected", "fallback_cache", "offline"]),
    dataSourceLabels: z.object({
      nasaPower: z.string(),
      soilData: z.string(),
      ruleEngine: z.string(),
    }),
  }),
});

export type DiagnosticResponse = z.infer<typeof DiagnosticResponseSchema>;

export const AssistantRequestSchema = z.object({
  message: z.string().min(1),
  locale: z.enum(["en", "bn"]).default("en"),
  context: z.object({
    fieldOverview: z.any().optional(),
    diagnostics: z.any().optional(),
    recommendations: z.any().optional(),
  }),
});

export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export const AssistantResponseSchema = z.object({
  replyEn: z.string(),
  replyBn: z.string(),
  suggestedFollowUps: z.array(z.string()),
  referencedFactors: z.array(z.string()),
});

export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;
