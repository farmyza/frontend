export interface CoordinateProjectionParams {
  centerLat: number;
  centerLng: number;
  zoom: number;
  viewWidth: number;
  viewHeight: number;
}

export function lngToX(lng: number, params: CoordinateProjectionParams): number {
  const scale = Math.pow(2, params.zoom) * 850;
  return params.viewWidth / 2 + (lng - params.centerLng) * scale;
}

export function latToY(lat: number, params: CoordinateProjectionParams): number {
  const scale = Math.pow(2, params.zoom) * 850;
  return params.viewHeight / 2 - (lat - params.centerLat) * scale;
}

export function xToLng(x: number, params: CoordinateProjectionParams): number {
  const scale = Math.pow(2, params.zoom) * 850;
  return params.centerLng + (x - params.viewWidth / 2) / scale;
}

export function yToLat(y: number, params: CoordinateProjectionParams): number {
  const scale = Math.pow(2, params.zoom) * 850;
  return params.centerLat - (y - params.viewHeight / 2) / scale;
}

export function calculatePolygonAreaHectares(
  coordinates: Array<[number, number]>,
  centerLat: number
): number {
  if (coordinates.length < 3) return 1.0;

  let area = 0;
  const n = coordinates.length;
  const latRad = (centerLat * Math.PI) / 180;
  const metersPerLng = 111320 * Math.cos(latRad);
  const metersPerLat = 110574;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const x1 = coordinates[i][0] * metersPerLng;
    const y1 = coordinates[i][1] * metersPerLat;
    const x2 = coordinates[j][0] * metersPerLng;
    const y2 = coordinates[j][1] * metersPerLat;
    area += x1 * y2 - x2 * y1;
  }

  const areaSqMeters = Math.abs(area) / 2;
  return Math.max(0.1, Number((areaSqMeters / 10000).toFixed(2)));
}

export function scalePolygon(
  coordinates: Array<[number, number]>,
  centerLng: number,
  centerLat: number,
  multiplier: number
): Array<[number, number]> {
  return coordinates.map(([lng, lat]) => [
    Number((centerLng + (lng - centerLng) * multiplier).toFixed(5)),
    Number((centerLat + (lat - centerLat) * multiplier).toFixed(5)),
  ]);
}

export function createDefaultBoxCoordinates(
  centerLng: number,
  centerLat: number,
  delta = 0.0035
): Array<[number, number]> {
  return [
    [centerLng - delta, centerLat + delta],
    [centerLng + delta, centerLat + delta],
    [centerLng + delta, centerLat - delta],
    [centerLng - delta, centerLat - delta],
    [centerLng - delta, centerLat + delta],
  ];
}

export function createCirclePolygon(
  centerLng: number,
  centerLat: number,
  radiusMeters: number,
  numSegments = 32
): Array<[number, number]> {
  const coordinates: Array<[number, number]> = [];
  const latRad = (centerLat * Math.PI) / 180;
  const metersPerLng = 111320 * Math.cos(latRad);
  const metersPerLat = 110574;

  for (let i = 0; i <= numSegments; i++) {
    const angle = (i * 2 * Math.PI) / numSegments;
    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);

    const pointLng = Number((centerLng + dx / metersPerLng).toFixed(5));
    const pointLat = Number((centerLat + dy / metersPerLat).toFixed(5));
    coordinates.push([pointLng, pointLat]);
  }

  return coordinates;
}

export function calculateCircleAreaHectares(radiusMeters: number): number {
  const areaSqMeters = Math.PI * radiusMeters * radiusMeters;
  return Math.max(0.05, Number((areaSqMeters / 10000).toFixed(2)));
}

export function simplifyDrawnPolygon(
  rawPoints: Array<[number, number]>,
  targetVertexCount = 28
): Array<[number, number]> {
  if (rawPoints.length <= 4) return rawPoints;

  const sampled: Array<[number, number]> = [];
  const step = Math.max(1, Math.floor(rawPoints.length / targetVertexCount));

  for (let i = 0; i < rawPoints.length; i += step) {
    sampled.push(rawPoints[i]);
  }

  // Ensure polygon is closed
  if (sampled.length > 2) {
    const first = sampled[0];
    const last = sampled[sampled.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      sampled.push([first[0], first[1]]);
    }
  }

  return sampled;
}

export function computeCentroidFromPolygon(
  coordinates: Array<[number, number]>
): { lat: number; lng: number } {
  if (coordinates.length === 0) return { lat: 23.8103, lng: 90.4125 };

  let sumLng = 0;
  let sumLat = 0;
  const count = coordinates.length;

  for (let i = 0; i < count; i++) {
    sumLng += coordinates[i][0];
    sumLat += coordinates[i][1];
  }

  return {
    lat: Number((sumLat / count).toFixed(5)),
    lng: Number((sumLng / count).toFixed(5)),
  };
}

export function estimateRadiusFromAreaHectares(areaHectares: number): number {
  const areaSqMeters = areaHectares * 10000;
  return Math.round(Math.sqrt(areaSqMeters / Math.PI));
}




