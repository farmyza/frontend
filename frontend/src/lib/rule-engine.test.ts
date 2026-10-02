import test from "node:test";
import assert from "node:assert/strict";
import { PRESET_FIELDS, evaluateAgronomicRules } from "./rule-engine.ts";
import { FarmFieldInputSchema, DiagnosticResponseSchema } from "./schemas.ts";

test("Rule Engine - Satkhira Saline Field Regression Test", () => {
  const satkhiraPreset = PRESET_FIELDS.find((p) => p.id === "satkhira_saline_delta");
  assert.ok(satkhiraPreset, "Satkhira preset must exist");

  const validatedInput = FarmFieldInputSchema.parse({
    name: satkhiraPreset.name,
    district: satkhiraPreset.district,
    polygon: satkhiraPreset.polygon,
    centerCoordinates: satkhiraPreset.centerCoordinates,
    areaHectares: satkhiraPreset.areaHectares,
    areaBigha: satkhiraPreset.areaBigha,
    soilType: satkhiraPreset.soilType,
    currentSalinityEC: satkhiraPreset.currentSalinityEC,
    waterAvailability: satkhiraPreset.waterAvailability,
    currentCrop: satkhiraPreset.currentCrop,
    previousCrop: satkhiraPreset.previousCrop,
    priorities: satkhiraPreset.defaultPriorities,
    targetSeason: "full_annual_cycle",
  });

  const result = evaluateAgronomicRules(validatedInput, {
    avgTemp: 27.5,
    annualRainfall: 1850,
    forecastRainfall30d: 35.0,
    solarRad: 18.0,
    humidity: 78,
  });

  const validatedResponse = DiagnosticResponseSchema.safeParse(result);
  assert.ok(validatedResponse.success, "Response must conform to DiagnosticResponseSchema");

  assert.equal(result.diagnostics.soil.salinityCategory, "moderately_saline");
  assert.equal(result.fieldOverview.aezNumber, 13);
  assert.ok(result.recommendations.optimalSequence.length >= 3);
  assert.equal(result.recommendations.optimalSequence[0].cropKey, "sunflower_bari_3");
  assert.equal(result.recommendations.optimalSequence[1].cropKey, "green_manure_sesbania");
});

test("Rule Engine - Water Stressed Barind Regression Test", () => {
  const rajshahiPreset = PRESET_FIELDS.find((p) => p.id === "rajshahi_barind_drought");
  assert.ok(rajshahiPreset, "Rajshahi preset must exist");

  const validatedInput = FarmFieldInputSchema.parse({
    name: rajshahiPreset.name,
    district: rajshahiPreset.district,
    polygon: rajshahiPreset.polygon,
    centerCoordinates: rajshahiPreset.centerCoordinates,
    areaHectares: rajshahiPreset.areaHectares,
    areaBigha: rajshahiPreset.areaBigha,
    soilType: rajshahiPreset.soilType,
    currentSalinityEC: rajshahiPreset.currentSalinityEC,
    waterAvailability: rajshahiPreset.waterAvailability,
    currentCrop: rajshahiPreset.currentCrop,
    previousCrop: rajshahiPreset.previousCrop,
    priorities: rajshahiPreset.defaultPriorities,
    targetSeason: "full_annual_cycle",
  });

  const result = evaluateAgronomicRules(validatedInput);

  assert.equal(result.fieldOverview.aezNumber, 26);
  assert.equal(result.recommendations.optimalSequence[0].cropKey, "mustard_bari_14");
  assert.equal(result.recommendations.optimalSequence[1].cropKey, "mung_bean_bari_6");
  assert.ok(result.recommendations.cycleSummary.waterSavingsComparedToMonoculturePct >= 40);
});

test("Rule Engine - Alluvial Intensive Plain Regression Test", () => {
  const mymensinghPreset = PRESET_FIELDS.find((p) => p.id === "mymensingh_alluvial_belt");
  assert.ok(mymensinghPreset, "Mymensingh preset must exist");

  const validatedInput = FarmFieldInputSchema.parse({
    name: mymensinghPreset.name,
    district: mymensinghPreset.district,
    polygon: mymensinghPreset.polygon,
    centerCoordinates: mymensinghPreset.centerCoordinates,
    areaHectares: mymensinghPreset.areaHectares,
    areaBigha: mymensinghPreset.areaBigha,
    soilType: mymensinghPreset.soilType,
    currentSalinityEC: mymensinghPreset.currentSalinityEC,
    waterAvailability: mymensinghPreset.waterAvailability,
    currentCrop: mymensinghPreset.currentCrop,
    previousCrop: mymensinghPreset.previousCrop,
    priorities: mymensinghPreset.defaultPriorities,
    targetSeason: "full_annual_cycle",
  });

  const result = evaluateAgronomicRules(validatedInput);

  assert.equal(result.fieldOverview.aezNumber, 9);
  assert.equal(result.recommendations.optimalSequence[0].cropKey, "mustard_bari_14");
  assert.equal(result.recommendations.optimalSequence[1].cropKey, "high_yield_boro_rice");
});
