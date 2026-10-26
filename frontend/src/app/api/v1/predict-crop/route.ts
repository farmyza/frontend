import { NextRequest, NextResponse } from "next/server";
import { PredictCropRequestSchema, PredictCropResponseSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function mlServiceUrl(): string {
  const url = process.env.ML_SERVICE_URL;
  if (!url && process.env.NODE_ENV === "production") {
    throw new Error("Missing env ML_SERVICE_URL");
  }
  return url || "http://localhost:8000";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = PredictCropRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${mlServiceUrl()}/predict-crop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error("ML service error:", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "ml_service_error" }, { status: 502 });
    }

    const data = await res.json();
    const validated = PredictCropResponseSchema.safeParse(data);
    if (!validated.success) {
      console.error("ML response validation failed:", validated.error);
      return NextResponse.json({ error: "invalid_ml_response" }, { status: 502 });
    }
    return NextResponse.json(validated.data);
  } catch (e) {
    clearTimeout(timer);
    console.error("ML service unavailable:", e);
    return NextResponse.json({ error: "ml_service_unavailable" }, { status: 503 });
  }
}