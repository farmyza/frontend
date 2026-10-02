export * from "@/lib/schemas";

export interface PresetField {
  id: string;
  name: string;
  nameBn: string;
  district: string;
  districtBn: string;
  division: string;
  upazila: string;
  aezName: string;
  aezNumber: number;
  centerCoordinates: {
    lat: number;
    lng: number;
  };
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
