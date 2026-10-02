import { NextRequest, NextResponse } from "next/server";
import { FarmFieldInputSchema } from "@/lib/schemas";
import { evaluateAgronomicRules } from "@/lib/rule-engine";
import { fetchNasaPowerData } from "@/lib/nasa-power";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = FarmFieldInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid field parameters",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const fieldInput = parseResult.data;

    // Fetch genuine NASA POWER climatological satellite data
    const { data: nasaData, isLive } = await fetchNasaPowerData(
      fieldInput.centerCoordinates.lat,
      fieldInput.centerCoordinates.lng
    );

    const diagnosticResult = evaluateAgronomicRules(
      fieldInput,
      nasaData ?? undefined
    );

    if (!isLive) {
      diagnosticResult.metadata.liveNasaStatus = "fallback_cache";
    }

    return NextResponse.json(diagnosticResult, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Diagnostic route error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error in Agronomic Engine",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
