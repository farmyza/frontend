import { NextRequest, NextResponse } from "next/server";

function monthRange(): { start: string; end: string } {
  const now = new Date();
  const endYear = now.getFullYear();
  const startYear = endYear - 1; // ~24 months, we take the last 12
  return { start: String(startYear), end: String(endYear) };
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "invalid_coords" }, { status: 400 });
  }
  try {
    const { start, end } = monthRange();
    const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M_MAX,PRECTOTCORR,RH2M,GWETROOT,T2M_MIN&community=AG&longitude=${lng.toFixed(4)}&latitude=${lat.toFixed(4)}&start=${start}&end=${end}&format=JSON`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    clearTimeout(t);
    if (!res.ok) {
      return NextResponse.json({ error: "nasa_failed" }, { status: 502 });
    }
    const json = await res.json();
    const params = json?.properties?.parameter;
    if (!params) {
      return NextResponse.json({ error: "nasa_no_data" }, { status: 502 });
    }
    const t2mMax = params.T2M_MAX || {};
    const prec = params.PRECTOTCORR || {};
    const rh = params.RH2M || {};
    const gw = params.GWETROOT || {};
    const t2mMin = params.T2M_MIN || {};
    const keys = Object.keys(t2mMax).filter((k) => k !== "ANN").sort();
    const validKeys = keys.filter((k) => {
      const vals = [t2mMax[k], prec[k], rh[k], gw[k], t2mMin[k]];
      return vals.every((v) => typeof v === "number" && Number.isFinite(v) && v !== -999);
    });
    if (validKeys.length < 12) {
      return NextResponse.json({ error: "nasa_insufficient" }, { status: 502 });
    }
    const history = validKeys.slice(-12).map((k) => [
      Number(t2mMax[k]),
      Number(prec[k]),
      Number(rh[k]),
      Number(gw[k]),
      Number(t2mMin[k]),
    ]);
    return NextResponse.json({ history });
  } catch (e: any) {
    console.error("nasa-history error:", e?.message || e);
    return NextResponse.json({ error: "nasa_error" }, { status: 502 });
  }
}