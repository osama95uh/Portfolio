import { MongoClient, Db, OptionalUnlessRequiredId } from "mongodb";
import fs from "fs";
import path from "path";
import { projects as defaultProjects, Project } from "@/src/data/projects";

// Define Visitor Document Interface
export interface VisitorRecord {
  _id?: string;
  ip: string;
  maskedIp: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  isp: string;
  asn: string;
  protocol: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  securityStatus: "CLEAN" | "VPN/PROXY" | "SUSPICIOUS" | "INTERNAL";
  firstVisited: string;
  lastVisited: string;
  visitCount: number;
}

export interface SiteConfig {
  displayName: string;
  primaryRole: string;
  statusTerminal: string;
  countryTag: string;
  githubUsername: string;
  avatarUrl: string;
  lastUpdated: string;
}

export interface SiteConfigDoc extends SiteConfig {
  key: string;
}

// Default fallback config
const DEFAULT_CONFIG: SiteConfig = {
  displayName: "Siam Khan",
  primaryRole: "Network Security Analyst",
  statusTerminal: "Monitoring Traffic",
  countryTag: "BD",
  githubUsername: "osama95uh",
  avatarUrl: "/mew.png",
  lastUpdated: new Date().toISOString(),
};

// Global MongoDB connection cache for serverless / Next.js
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.MONGODB_DB || "siam_portfolio";

// Local storage fallback paths
const DATA_DIR = path.join(process.cwd(), "src", "data", "storage");
const VISITORS_FILE = path.join(DATA_DIR, "visitors.json");
const CONFIG_FILE = path.join(DATA_DIR, "site_config.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

function ensureLocalDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if cannot write
    }
  }
}

function readLocalVisitors(): VisitorRecord[] {
  ensureLocalDir();
  try {
    if (fs.existsSync(VISITORS_FILE)) {
      const data = fs.readFileSync(VISITORS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Failed to read local visitors file:", err);
  }
  return [];
}

function saveLocalVisitors(visitors: VisitorRecord[]) {
  ensureLocalDir();
  try {
    fs.writeFileSync(VISITORS_FILE, JSON.stringify(visitors, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save local visitors file:", err);
  }
}

function readLocalConfig(): SiteConfig {
  ensureLocalDir();
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.warn("Failed to read local config file:", err);
  }
  return DEFAULT_CONFIG;
}

function saveLocalConfig(config: SiteConfig) {
  ensureLocalDir();
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save local config file:", err);
  }
}

let clientPromise: Promise<MongoClient> | null = null;

if (MONGODB_URI) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }
}

async function getMongoDb(): Promise<Db | null> {
  if (!clientPromise) return null;
  try {
    const client = await clientPromise;
    return client.db(DB_NAME);
  } catch (err) {
    console.warn("MongoDB connection unavailable, using local persistence:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Public Database Methods
// ─────────────────────────────────────────────────────────────

export async function recordVisitor(data: Omit<VisitorRecord, "firstVisited" | "lastVisited" | "visitCount">): Promise<VisitorRecord> {
  const now = new Date().toISOString();
  const db = await getMongoDb();

  if (db) {
    try {
      const collection = db.collection<VisitorRecord>("visitors");
      const existing = await collection.findOne({ ip: data.ip });

      if (existing) {
        await collection.updateOne(
          { ip: data.ip },
          {
            $set: {
              lastVisited: now,
              country: data.country,
              countryCode: data.countryCode,
              city: data.city,
              isp: data.isp,
              asn: data.asn,
              protocol: data.protocol,
              userAgent: data.userAgent,
              browser: data.browser,
              os: data.os,
              device: data.device,
              securityStatus: data.securityStatus,
            },
            $inc: { visitCount: 1 },
          }
        );
        return {
          ...existing,
          lastVisited: now,
          visitCount: existing.visitCount + 1,
        };
      } else {
        const newRecord: VisitorRecord = {
          ...data,
          firstVisited: now,
          lastVisited: now,
          visitCount: 1,
        };
        await collection.insertOne(newRecord as OptionalUnlessRequiredId<VisitorRecord>);
        return newRecord;
      }
    } catch (err) {
      console.warn("MongoDB recordVisitor failed, falling back to local file:", err);
    }
  }

  // Fallback to local file
  const localList = readLocalVisitors();
  const existingIdx = localList.findIndex((v) => v.ip === data.ip);

  if (existingIdx >= 0) {
    const item = localList[existingIdx];
    item.lastVisited = now;
    item.visitCount = (item.visitCount || 1) + 1;
    item.country = data.country || item.country;
    item.city = data.city || item.city;
    item.isp = data.isp || item.isp;
    item.asn = data.asn || item.asn;
    item.protocol = data.protocol || item.protocol;
    item.browser = data.browser || item.browser;
    item.os = data.os || item.os;
    item.device = data.device || item.device;
    item.securityStatus = data.securityStatus || item.securityStatus;
    saveLocalVisitors(localList);
    return item;
  } else {
    const newRecord: VisitorRecord = {
      ...data,
      firstVisited: now,
      lastVisited: now,
      visitCount: 1,
    };
    localList.unshift(newRecord);
    saveLocalVisitors(localList);
    return newRecord;
  }
}

export async function getVisitors(limit = 100): Promise<{
  visitors: VisitorRecord[];
  totalVisitors: number;
  uniqueIps: number;
  countryStats: Record<string, number>;
}> {
  const db = await getMongoDb();

  if (db) {
    try {
      const collection = db.collection<VisitorRecord>("visitors");
      const visitors = await collection
        .find({})
        .sort({ lastVisited: -1 })
        .limit(limit)
        .toArray();
      const uniqueIps = await collection.countDocuments();
      const allForStats = await collection.find({}, { projection: { country: 1, visitCount: 1 } }).toArray();

      let totalVisits = 0;
      const countryStats: Record<string, number> = {};

      allForStats.forEach((v) => {
        totalVisits += v.visitCount || 1;
        const country = v.country || "Unknown";
        countryStats[country] = (countryStats[country] || 0) + 1;
      });

      return {
        visitors,
        totalVisitors: totalVisits,
        uniqueIps,
        countryStats,
      };
    } catch (err) {
      console.warn("MongoDB getVisitors failed, falling back to local file:", err);
    }
  }

  // Local fallback
  const localList = readLocalVisitors();
  let totalVisits = 0;
  const countryStats: Record<string, number> = {};

  localList.forEach((v) => {
    totalVisits += v.visitCount || 1;
    const country = v.country || "Unknown";
    countryStats[country] = (countryStats[country] || 0) + 1;
  });

  return {
    visitors: localList.slice(0, limit),
    totalVisitors: totalVisits,
    uniqueIps: localList.length,
    countryStats,
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection<SiteConfigDoc>("site_config");
      const config = await collection.findOne({ key: "main_config" });
      if (config) {
        return { ...DEFAULT_CONFIG, ...config };
      }
    } catch (err) {
      console.warn("MongoDB getSiteConfig failed:", err);
    }
  }
  return readLocalConfig();
}

export async function updateSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig> {
  const now = new Date().toISOString();
  const current = await getSiteConfig();
  const updated: SiteConfig = {
    ...current,
    ...updates,
    lastUpdated: now,
  };

  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection("site_config");
      await collection.updateOne(
        { key: "main_config" },
        { $set: { ...updated, key: "main_config" } },
        { upsert: true }
      );
      return updated;
    } catch (err) {
      console.warn("MongoDB updateSiteConfig failed:", err);
    }
  }

  saveLocalConfig(updated);
  return updated;
}

// ─────────────────────────────────────────────────────────────
// Project Images (MongoDB + Local Fallback)
//
// Uploaded images are ALWAYS written to local disk, and ALSO saved into
// MongoDB whenever it is configured. This matters on internet hosting
// (Vercel, Docker, VPS redeploys) where the local filesystem is ephemeral
// or read-only - the database copy keeps the images alive.
// ─────────────────────────────────────────────────────────────

export interface ProjectImageDoc {
  filename: string;
  data: string; // base64
  contentType: string;
  size: number;
  uploadedAt: string;
}

const IMAGE_UPLOAD_DIR = path.join(process.cwd(), "src", "data", "storage", "uploads");

export async function saveProjectImage(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  try {
    fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(IMAGE_UPLOAD_DIR, filename), buffer);
  } catch (err) {
    console.warn("Failed to persist uploaded image locally:", err);
  }

  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection<ProjectImageDoc>("project_images");
      await collection.updateOne(
        { filename },
        {
          $set: {
            filename,
            data: buffer.toString("base64"),
            contentType,
            size: buffer.length,
            uploadedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    } catch (err) {
      console.warn("MongoDB saveProjectImage failed, local copy kept:", err);
    }
  }
}

export async function getProjectImage(
  filename: string
): Promise<{ data: Buffer; contentType: string } | null> {
  // Database copy first - survives hosting redeploys / ephemeral disks.
  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection<ProjectImageDoc>("project_images");
      const doc = await collection.findOne({ filename });
      if (doc && typeof doc.data === "string" && doc.data.length > 0) {
        return {
          data: Buffer.from(doc.data, "base64"),
          contentType: doc.contentType || "application/octet-stream",
        };
      }
    } catch (err) {
      console.warn("MongoDB getProjectImage failed, trying local file:", err);
    }
  }

  try {
    const data = await fs.promises.readFile(path.join(IMAGE_UPLOAD_DIR, filename));
    const ext = path.extname(filename).toLowerCase();
    const types: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };
    return { data, contentType: types[ext] || "application/octet-stream" };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Project Management (MongoDB + Local Fallback)
// ─────────────────────────────────────────────────────────────

function readLocalProjects(): Project[] {
  ensureLocalDir();
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read local projects file:", err);
  }
  return defaultProjects;
}

function saveLocalProjects(list: Project[]) {
  ensureLocalDir();
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save local projects file:", err);
  }
}

export async function getProjects(): Promise<Project[]> {
  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection<Project>("projects");
      const list = await collection.find({}).toArray();
      if (list && list.length > 0) {
        return list;
      }
    } catch (err) {
      console.warn("MongoDB getProjects failed:", err);
    }
  }
  return readLocalProjects();
}

export async function addProject(project: Project): Promise<Project> {
  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection<Project>("projects");
      await collection.updateOne(
        { id: project.id },
        { $set: project },
        { upsert: true }
      );
      return project;
    } catch (err) {
      console.warn("MongoDB addProject failed:", err);
    }
  }

  const current = readLocalProjects();
  const existingIdx = current.findIndex((p) => p.id === project.id);
  if (existingIdx >= 0) {
    current[existingIdx] = project;
  } else {
    // Add new project right before any coming soon or at the top
    const firstComingSoonIdx = current.findIndex((p) => p.comingSoon);
    if (firstComingSoonIdx >= 0) {
      current.splice(firstComingSoonIdx, 0, project);
    } else {
      current.unshift(project);
    }
  }
  saveLocalProjects(current);
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection<Project>("projects");
      await collection.deleteOne({ id });
      return true;
    } catch (err) {
      console.warn("MongoDB deleteProject failed:", err);
    }
  }

  const current = readLocalProjects();
  const filtered = current.filter((p) => p.id !== id);
  saveLocalProjects(filtered);
  return true;
}

