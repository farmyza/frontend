import Database from "better-sqlite3";
import path from "path";
import { FarmFieldInput, DiagnosticResponse } from "@/lib/schemas";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  district: string;
  createdAt: string;
}

export interface UserProject {
  id: string;
  userId: string;
  name: string;
  district: string;
  centerLat: number;
  centerLng: number;
  areaHa: number;
  fieldInput: FarmFieldInput;
  diagnosticResult?: DiagnosticResponse;
  createdAt: string;
  updatedAt: string;
}

const dbPath = path.resolve(process.cwd(), "farmyza.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    avatar TEXT,
    district TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    center_lat REAL NOT NULL,
    center_lng REAL NOT NULL,
    area_ha REAL NOT NULL,
    field_input_json TEXT NOT NULL,
    diagnostic_result_json TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

const seedUsers = [
  {
    id: "user_rafiq",
    name: "Md. Rafiqul Islam",
    email: "rafiq@farmyza.bd",
    role: "Coastal Rice & Sunflower Farmer",
    avatar: "🌾",
    district: "Satkhira",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_amina",
    name: "Dr. Amina Khatun",
    email: "amina@barc.gov.bd",
    role: "Agronomy Specialist (BARC / BARI)",
    avatar: "🔬",
    district: "Rajshahi",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_haor",
    name: "Subir Chakraborty",
    email: "subir@haorfarm.bd",
    role: "Haor Basin Boro Grower",
    avatar: "🛶",
    district: "Sunamganj",
    createdAt: new Date().toISOString(),
  },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, role, avatar, district, created_at)
  VALUES (@id, @name, @email, @role, @avatar, @district, @createdAt)
`);

seedUsers.forEach((u) => insertUser.run(u));

export function getAllUsers(): UserAccount[] {
  const rows = db.prepare("SELECT * FROM users ORDER BY created_at ASC").all() as Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    district: string;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    avatar: r.avatar,
    district: r.district,
    createdAt: r.created_at,
  }));
}

export function getUserProjects(userId: string): UserProject[] {
  const rows = db
    .prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId) as Array<{
    id: string;
    user_id: string;
    name: string;
    district: string;
    center_lat: number;
    center_lng: number;
    area_ha: number;
    field_input_json: string;
    diagnostic_result_json: string | null;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    district: r.district,
    centerLat: r.center_lat,
    centerLng: r.center_lng,
    areaHa: r.area_ha,
    fieldInput: JSON.parse(r.field_input_json),
    diagnosticResult: r.diagnostic_result_json ? JSON.parse(r.diagnostic_result_json) : undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function saveUserProject(project: {
  id: string;
  userId: string;
  name: string;
  district: string;
  centerLat: number;
  centerLng: number;
  areaHa: number;
  fieldInput: FarmFieldInput;
  diagnosticResult?: DiagnosticResponse;
}): UserProject {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO projects (
      id, user_id, name, district, center_lat, center_lng, area_ha,
      field_input_json, diagnostic_result_json, created_at, updated_at
    ) VALUES (
      @id, @userId, @name, @district, @centerLat, @centerLng, @areaHa,
      @fieldInputJson, @diagnosticResultJson, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      district = excluded.district,
      center_lat = excluded.center_lat,
      center_lng = excluded.center_lng,
      area_ha = excluded.area_ha,
      field_input_json = excluded.field_input_json,
      diagnostic_result_json = excluded.diagnostic_result_json,
      updated_at = excluded.updated_at
  `);

  stmt.run({
    id: project.id,
    userId: project.userId,
    name: project.name,
    district: project.district,
    centerLat: project.centerLat,
    centerLng: project.centerLng,
    areaHa: project.areaHa,
    fieldInputJson: JSON.stringify(project.fieldInput),
    diagnosticResultJson: project.diagnosticResult ? JSON.stringify(project.diagnosticResult) : null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    ...project,
    createdAt: now,
    updatedAt: now,
  };
}

export function getProjectById(projectId: string): UserProject | null {
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(projectId) as {
    id: string;
    user_id: string;
    name: string;
    district: string;
    center_lat: number;
    center_lng: number;
    area_ha: number;
    field_input_json: string;
    diagnostic_result_json: string | null;
    created_at: string;
    updated_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    district: row.district,
    centerLat: row.center_lat,
    centerLng: row.center_lng,
    areaHa: row.area_ha,
    fieldInput: JSON.parse(row.field_input_json),
    diagnosticResult: row.diagnostic_result_json ? JSON.parse(row.diagnostic_result_json) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function deleteUserProject(projectId: string, userId: string): boolean {
  const info = db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(projectId, userId);
  return info.changes > 0;
}

export { db };