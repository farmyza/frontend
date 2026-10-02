export interface NasaPowerData {
  avgTemp: number;
  annualRainfall: number;
  forecastRainfall30d: number;
  solarRad: number;
  humidity: number;
  monthlyRainfall?: Record<string, number>;
  monthlyTemp?: Record<string, number>;
}

export async function fetchNasaPowerData(
  lat: number,
  lng: number
): Promise<{ data: NasaPowerData | null; isLive: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN&community=AG&longitude=${lng.toFixed(
      4
    )}&latitude=${lat.toFixed(4)}&format=JSON`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 }, // Cache 1 hour in Next.js
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`NASA POWER API responded with status ${response.status}`);
      return { data: null, isLive: false };
    }

    const json = await response.json();
    const props = json?.properties?.parameter;

    if (!props) {
      return { data: null, isLive: false };
    }

    // Extract Climatology annual / monthly values
    const t2mAnn = props.T2M?.ANN ?? 26.5;
    const precAnn = (props.PRECTOTCORR?.ANN ?? 5.5) * 365; // mm per year
    const rh2mAnn = props.RH2M?.ANN ?? 76;
    const swAnn = props.ALLSKY_SFC_SW_DWN?.ANN ?? 17.8;

    return {
      data: {
        avgTemp: Number(t2mAnn.toFixed(1)),
        annualRainfall: Number(precAnn.toFixed(0)),
        forecastRainfall30d: Number(((props.PRECTOTCORR?.ANN ?? 5.5) * 30).toFixed(1)),
        solarRad: Number(swAnn.toFixed(1)),
        humidity: Number(rh2mAnn.toFixed(0)),
        monthlyRainfall: props.PRECTOTCORR,
        monthlyTemp: props.T2M,
      },
      isLive: true,
    };
  } catch (err: any) {
    console.warn("NASA POWER API fetch error or timeout:", err?.message || err);
    return { data: null, isLive: false };
  }
}
