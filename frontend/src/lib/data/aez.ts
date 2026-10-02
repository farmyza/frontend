export interface AgroEcologicalZone {
  aezNumber: number;
  aezName: string;
}

export function getAezByDistrict(district: string): AgroEcologicalZone {
  const distLower = district.toLowerCase();

  if (
    distLower.includes("satkhira") ||
    distLower.includes("khulna") ||
    distLower.includes("bagerhat") ||
    distLower.includes("patuakhali")
  ) {
    return {
      aezNumber: 13,
      aezName: "Ganges Tidal Floodplain (Saline Delta)",
    };
  }

  if (
    distLower.includes("rajshahi") ||
    distLower.includes("chapai") ||
    distLower.includes("naogaon")
  ) {
    return {
      aezNumber: 26,
      aezName: "High Barind Tract",
    };
  }

  if (
    distLower.includes("bogura") ||
    distLower.includes("bogra") ||
    distLower.includes("rangpur") ||
    distLower.includes("dinajpur")
  ) {
    return {
      aezNumber: 4,
      aezName: "Karatoa-Bangali Floodplain & Level Barind",
    };
  }

  if (
    distLower.includes("sylhet") ||
    distLower.includes("sunamganj") ||
    distLower.includes("habiganj") ||
    distLower.includes("moulvibazar")
  ) {
    return {
      aezNumber: 21,
      aezName: "Sylhet Basin & Surma-Kushiyara Floodplain",
    };
  }

  if (
    distLower.includes("jashore") ||
    distLower.includes("jessore") ||
    distLower.includes("kushtia") ||
    distLower.includes("faridpur")
  ) {
    return {
      aezNumber: 12,
      aezName: "Low Ganges River Floodplain",
    };
  }

  return {
    aezNumber: 9,
    aezName: "Old Brahmaputra Floodplain",
  };
}
