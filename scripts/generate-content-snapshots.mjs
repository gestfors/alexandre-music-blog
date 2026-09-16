import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PROJECT_ROOT = process.cwd();
const SNAPSHOT_PATH = path.join(PROJECT_ROOT, "src", "data", "contentSnapshots.js");

function sanitizeSummaryText(value, fallback, maxLength = 240) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return fallback;

  const compactText = text.replace(/\s+/g, " ");
  const hasSuspiciousBlob = /[A-Za-z0-9+/=]{120,}/.test(compactText);

  if (hasSuspiciousBlob) return fallback;

  if (compactText.length <= maxLength) return compactText;
  return `${compactText.slice(0, maxLength - 1)}...`;
}

function sanitizeImageUrl(value) {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) return null;

  // Drop malformed/base64/blob-like payloads stored by mistake.
  if (url.startsWith("data:") || url.startsWith("blob:")) return null;
  if (url.length > 600) return null;

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }

  return null;
}

function parseEnvFile(content) {
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

async function loadDotEnvFiles() {
  const envFiles = [".env", ".env.local"];

  for (const fileName of envFiles) {
    const filePath = path.join(PROJECT_ROOT, fileName);
    try {
      const raw = await readFile(filePath, "utf-8");
      const parsed = parseEnvFile(raw);
      for (const [key, value] of Object.entries(parsed)) {
        if (!(key in process.env)) process.env[key] = value;
      }
    } catch {
      // Ignore missing env files.
    }
  }
}

async function fetchBlogSnapshots(supabase) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt,image,thumbnail,category,published_at,views_count,reading_time")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(`Falha ao gerar snapshot de blog: ${error.message}`);

  return (data || []).map((row) => ({
    image: sanitizeImageUrl(row.image),
    thumbnail: sanitizeImageUrl(row.thumbnail) || sanitizeImageUrl(row.image),
    slug: row.slug,
    path: `/blog/${row.slug}`,
    title: sanitizeSummaryText(row.title, "Artigo", 120),
    excerpt: sanitizeSummaryText(
      row.excerpt,
      "Artigo sobre estrategia digital, UX, SEO e performance para negocios locais.",
      260,
    ),
    category: sanitizeSummaryText(row.category, "Conteudo", 60),
    publishedAt: row.published_at,
    viewsCount: row.views_count ?? 0,
    readingTime: sanitizeSummaryText(row.reading_time, "5 minutos", 20),
  }));
}

async function fetchProjectSnapshots(supabase) {
  const { data, error } = await supabase
    .from("projects")
    .select("slug,title,published_at,image,thumbnail,alt,badge")
    .order("published_at", { ascending: false })
    .limit(6);

  if (error) throw new Error(`Falha ao gerar snapshot de projetos: ${error.message}`);

  return (data || []).map((row) => ({
    image: sanitizeImageUrl(row.image),
    thumbnail: sanitizeImageUrl(row.thumbnail) || sanitizeImageUrl(row.image),
    slug: row.slug,
    path: `/cases/${row.slug}`,
    title: row.title,
    badge: row.badge || null,
    publishedAt: row.published_at,
    description: `Projeto ${row.title} com foco em posicionamento digital e conversao.`,
    metaDescription: `Case ${row.title}: estrategia, design e desenvolvimento orientados a resultado.`,
    alt: row.alt,
  }));
}

function buildSnapshotModule({ blogPosts, projects }) {
  return [
    "export const contentSnapshots = ",
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        blogPosts,
        projects,
      },
      null,
      2,
    ),
    ";\n",
  ].join("");
}

async function run() {
  await loadDotEnvFiles();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[snapshots] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY nao encontrados. Mantendo snapshot atual.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const [blogPosts, projects] = await Promise.all([
    fetchBlogSnapshots(supabase),
    fetchProjectSnapshots(supabase),
  ]);

  const moduleContent = buildSnapshotModule({ blogPosts, projects });
  await writeFile(SNAPSHOT_PATH, moduleContent, "utf-8");

  console.log(`[snapshots] Snapshot atualizado: ${blogPosts.length} post(s) e ${projects.length} projeto(s).`);
}

run().catch((error) => {
  console.warn(`[snapshots] ${error.message}. Mantendo snapshot atual.`);
});
