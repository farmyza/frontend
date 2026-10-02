export interface PresetFieldData {
  id: string;
  name: string;
  nameBn: string;
  district: string;
  districtBn: string;
  division: string;
  upazila: string;
  aezName: string;
  aezNumber: number;
  centerCoordinates: { lat: number; lng: number };
  polygon: {
    type: "Polygon";
    coordinates: Array<Array<[number, number]>>;
  };
  areaHectares: number;
  areaBigha: number;
  soilType:
    | "clay_loam"
    | "silt_loam"
    | "sandy_loam"
    | "saline_clay"
    | "alluvial_silt"
    | "peat_basin";
  currentSalinityEC: number;
  waterAvailability:
    | "rainfed_only"
    | "limited_shallow_tubewell"
    | "deep_tubewell_secure"
    | "canal_surface_water"
    | "waterlogged_seasonal";
  currentCrop: string;
  previousCrop: string;
  defaultPriorities: Array<
    | "soil_health"
    | "maximize_profit"
    | "reduce_salinity"
    | "minimize_water"
    | "pest_break"
    | "climate_resilience"
  >;
  descriptionEn: string;
  descriptionBn: string;
}

export const PRESET_FIELDS: PresetFieldData[] = [
  {
    id: "satkhira_saline_delta",
    name: "Satkhira Coastal Salinity Zone",
    nameBn: "সাতক্ষীরা উপকূলীয় লবণাক্ত অঞ্চল",
    district: "Satkhira",
    districtBn: "সাতক্ষীরা",
    division: "Khulna",
    upazila: "Assasuni",
    aezName: "Ganges Tidal Floodplain (Saline)",
    aezNumber: 13,
    centerCoordinates: { lat: 22.548, lng: 89.176 },
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [89.172, 22.552],
          [89.181, 22.551],
          [89.183, 22.544],
          [89.174, 22.543],
          [89.172, 22.552],
        ],
      ],
    },
    areaHectares: 1.45,
    areaBigha: 10.8,
    soilType: "saline_clay",
    currentSalinityEC: 7.8,
    waterAvailability: "limited_shallow_tubewell",
    currentCrop: "transplanted_aman_rice",
    previousCrop: "fallow",
    defaultPriorities: ["reduce_salinity", "soil_health", "maximize_profit"],
    descriptionEn: "High dry-season salinity from capillary water rise. Requires salt-tolerant sunflower, BRRI dhan67/97, and organic green manuring to desalinize root zone.",
    descriptionBn: "শুষ্ক মৌসুমে লবণাক্ততার বৃদ্ধি। শিকড় অঞ্চলের লবণাক্ততা কমাতে লবণ-সহনশীল সূর্যমুখী, ব্রি ধান৬৭/৯৭ এবং সবুজ সার প্রয়োজন।",
  },
  {
    id: "mymensingh_alluvial_belt",
    name: "Mymensingh Intensive Grain Plain",
    nameBn: "ময়মনসিংহ নিবিড় শস্য বলয়",
    district: "Mymensingh",
    districtBn: "ময়মনসিংহ",
    division: "Mymensingh",
    upazila: "Trishal",
    aezName: "Old Brahmaputra Floodplain",
    aezNumber: 9,
    centerCoordinates: { lat: 24.582, lng: 90.395 },
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [90.391, 24.586],
          [90.401, 24.584],
          [90.399, 24.577],
          [90.389, 24.579],
          [90.391, 24.586],
        ],
      ],
    },
    areaHectares: 2.1,
    areaBigha: 15.6,
    soilType: "silt_loam",
    currentSalinityEC: 0.8,
    waterAvailability: "deep_tubewell_secure",
    currentCrop: "boro_rice",
    previousCrop: "transplanted_aman_rice",
    defaultPriorities: ["soil_health", "pest_break", "maximize_profit"],
    descriptionEn: "High-intensity double-rice monoculture depleting soil nitrogen and groundwater table. Inserting short-duration mustard and mung bean fixes nitrogen and breaks stem-borer cycles.",
    descriptionBn: "টানা দুই ধান চাষে মাটির নাইট্রোজেন ও ভূগর্ভস্থ পানির চাপ। স্বল্পমেয়াদী সরিষা ও মুগডাল সংযোজনে মাটির উর্বরতা পুনরুদ্ধার ও পোকার আক্রমণ প্রতিরোধ হয়।",
  },
  {
    id: "bogura_vegetable_hub",
    name: "Bogura High-Value Crop Hub",
    nameBn: "বগুড়া অর্থকরী ফসল অঞ্চল",
    district: "Bogura",
    districtBn: "বগুড়া",
    division: "Rajshahi",
    upazila: "Shibganj",
    aezName: "Karatoa-Bangali Floodplain / Level Barind",
    aezNumber: 4,
    centerCoordinates: { lat: 24.965, lng: 89.342 },
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [89.336, 24.969],
          [89.348, 24.968],
          [89.346, 24.959],
          [89.335, 24.961],
          [89.336, 24.969],
        ],
      ],
    },
    areaHectares: 1.8,
    areaBigha: 13.4,
    soilType: "sandy_loam",
    currentSalinityEC: 0.6,
    waterAvailability: "deep_tubewell_secure",
    currentCrop: "potato",
    previousCrop: "transplanted_aman_rice",
    defaultPriorities: ["maximize_profit", "soil_health", "pest_break"],
    descriptionEn: "Highly commercial potato-maize-rice corridor. High fertilizer usage requires organic biomass restitution and legume integration to protect soil microbiome.",
    descriptionBn: "বাণিজ্যিক আলু-ভুট্টা-ধান অঞ্চল। মাত্রাতিরিক্ত সার ব্যবহারের ক্ষতি কাটাতে জৈব পুষ্টি এবং ডাল শস্যের ঘূর্ণন জরুরি।",
  },
  {
    id: "rajshahi_barind_drought",
    name: "Rajshahi Barind Water-Stressed Zone",
    nameBn: "রাজশাহী বরেন্দ্র খরাপ্রবণ অঞ্চল",
    district: "Rajshahi",
    districtBn: "রাজশাহী",
    division: "Rajshahi",
    upazila: "Godagari",
    aezName: "High Barind Tract",
    aezNumber: 26,
    centerCoordinates: { lat: 24.468, lng: 88.358 },
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [88.351, 24.472],
          [88.364, 24.471],
          [88.362, 24.463],
          [88.349, 24.465],
          [88.351, 24.472],
        ],
      ],
    },
    areaHectares: 2.5,
    areaBigha: 18.7,
    soilType: "clay_loam",
    currentSalinityEC: 0.9,
    waterAvailability: "limited_shallow_tubewell",
    currentCrop: "transplanted_aman_rice",
    previousCrop: "fallow",
    defaultPriorities: ["minimize_water", "climate_resilience", "soil_health"],
    descriptionEn: "Severe aquifer depletion and high summer heat. Shifting from water-guzzling Boro rice to low-water chickpea, mustard, and drought-tolerant maize saves up to 65% irrigation water.",
    descriptionBn: "ভূগর্ভস্থ পানির স্তর হ্রাস ও তীব্র খরা। সেচনির্ভর বোরোর বদলে কম পানির ছোলা, সরিষা ও খরা-সহনশীল ভুট্টা ব্যবহারে ৬৫% পানি সাশ্রয় সম্ভব।",
  },
  {
    id: "sylhet_haor_wetland",
    name: "Sylhet Haor Flash-Flood Basin",
    nameBn: "সিলেট হাওর আকস্মিক বন্যাপ্রবণ অঞ্চল",
    district: "Sunamganj",
    districtBn: "সুনামগঞ্জ",
    division: "Sylhet",
    upazila: "Tahirpur",
    aezName: "Sylhet Basin & Surma-Kushiyara",
    aezNumber: 21,
    centerCoordinates: { lat: 25.105, lng: 91.182 },
    polygon: {
      type: "Polygon",
      coordinates: [
        [
          [91.175, 25.111],
          [91.189, 25.109],
          [91.187, 25.099],
          [91.173, 25.101],
          [91.175, 25.111],
        ],
      ],
    },
    areaHectares: 3.2,
    areaBigha: 23.9,
    soilType: "clay_loam",
    currentSalinityEC: 0.4,
    waterAvailability: "canal_surface_water",
    currentCrop: "boro_rice",
    previousCrop: "fallow",
    defaultPriorities: ["climate_resilience", "maximize_profit", "pest_break"],
    descriptionEn: "Vulnerable to pre-monsoon flash floods in April. Demands short-duration early maturing Boro varieties (BRRI dhan88/96) paired with early relay crops before seasonal inundation.",
    descriptionBn: "এপ্রিলের আগাম পাহাড়ি ঢলে ধান তলিয়ে যাওয়ার ঝুঁকি। ১৪০-১৪৫ দিনের স্বল্পমেয়াদী ব্রি ধান৮৮/৯৬ এবং আগাম রিলে শস্য চাষ অত্যাবশ্যক।",
  },
];

import type { FarmFieldInput } from "./schemas";

export function presetToFieldInput(preset: PresetFieldData): FarmFieldInput {
  return {
    id: preset.id,
    name: preset.name,
    district: preset.district,
    division: preset.division,
    upazila: preset.upazila,
    polygon: preset.polygon,
    centerCoordinates: preset.centerCoordinates,
    areaHectares: preset.areaHectares,
    areaBigha: preset.areaBigha,
    soilType: preset.soilType,
    currentSalinityEC: preset.currentSalinityEC,
    waterAvailability: preset.waterAvailability,
    currentCrop: preset.currentCrop as any,
    previousCrop: preset.previousCrop as any,
    priorities: preset.defaultPriorities,
    targetSeason: "full_annual_cycle",
  };
}

