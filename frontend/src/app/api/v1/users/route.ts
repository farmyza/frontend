import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/db";

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve user profiles" },
      { status: 500 }
    );
  }
}
