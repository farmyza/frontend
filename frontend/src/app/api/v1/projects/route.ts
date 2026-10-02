import { NextRequest, NextResponse } from "next/server";
import { getUserProjects, getProjectById, saveUserProject, deleteUserProject } from "@/lib/db";
import { FarmFieldInputSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId") || searchParams.get("id");

    if (projectId) {
      const project = getProjectById(projectId);
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ project });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId or projectId query parameter" }, { status: 400 });
    }

    const projects = getUserProjects(userId);
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, name, district, centerLat, centerLng, areaHa, fieldInput, diagnosticResult } = body;

    if (!userId || !name || !fieldInput) {
      return NextResponse.json({ error: "Missing required project fields" }, { status: 400 });
    }

    const parsedField = FarmFieldInputSchema.safeParse(fieldInput);
    if (!parsedField.success) {
      return NextResponse.json(
        { error: "Invalid field input schema", details: parsedField.error.issues },
        { status: 400 }
      );
    }

    const projectId = id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const saved = saveUserProject({
      id: projectId,
      userId,
      name,
      district: district || fieldInput.district,
      centerLat: centerLat || fieldInput.centerCoordinates.lat,
      centerLng: centerLng || fieldInput.centerCoordinates.lng,
      areaHa: areaHa || fieldInput.areaHectares,
      fieldInput: parsedField.data,
      diagnosticResult,
    });

    return NextResponse.json({ success: true, project: saved });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save user project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId parameters" }, { status: 400 });
    }

    const success = deleteUserProject(id, userId);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user project" }, { status: 500 });
  }
}
