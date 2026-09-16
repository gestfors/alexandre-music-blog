import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const PROJECT_ROOT = process.cwd();
const SITEMAP_PATH = path.join(PROJECT_ROOT, "public", "sitemap.xml");

const STATIC_PAGES = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/criacao-de-sites", changefreq: "monthly", priority: "0.9" },
  { path: "/precos", changefreq: "monthly", priority: "0.9" },
  { path: "/servicos/ux-design", changefreq: "monthly", priority: "0.8" },
  { path: "/servicos/landing-page", changefreq: "monthly", priority: "0.8" },
  { path: "/servicos/seo", changefreq: "monthly", priority: "0.8" },
  { path: "/servicos/gestao-gmn", changefreq: "monthly", priority: "0.8" },
  { path: "/servicos/identidade-visual", changefreq: "monthly", priority: "0.8" },
  { path: "/cases", changefreq: "monthly", priority: "0.9" },
  { path: "/sobre", changefreq: "monthly", priority: "0.7" },
  { path: "/contato", changefreq: "monthly", priority: "0.7" },
  { path: "/diagnostico-claro", changefreq: "monthly", priority: "0.8" },
  { path: "/metodo-claro", changefreq: "monthly", priority: "0.8" },
  { path: "/agendamentos", changefreq: "monthly", priority: "0.8" },
  { path: "/cartao", changefreq: "monthly", priority: "0.7" },
  { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
  { path: "/faq", changefreq: "monthly", priority: "0.6" },
];

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

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function extractLoc(urlBlock) {
  const match = urlBlock.match(/<loc>([^<]+)<\/loc>/i);
  return match?.[1] || "";
}

function extractLastmod(urlBlock) {
  const match = urlBlock.match(/<lastmod>([^<]+)<\/lastmod>/i);
  return match?.[1] || "";
}

function isBlogLoc(loc) {
  if (!loc) return false;

  try {
    const pathname = new URL(loc).pathname;
    return pathname === "/blog" || pathname.startsWith("/blog/");
  } catch {
    return loc.includes("/blog");
  }
}

function normalizeDate(dateValue) {
  if (!dateValue) return new Date().toISOString().slice(0, 10);
  const normalized = String(dateValue).trim();
  if (!normalized) return new Date().toISOString().slice(0, 10);
  return normalized.includes("T") ? normalized.split("T")[0] : normalized;
}

function createUrlBlock({ loc, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${normalizeDate(lastmod)}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function getUrlsetOpenTag(xml) {
  const match = xml.match(/^[\s\S]*?<urlset[^>]*>/i);
  if (!match) throw new Error("Nao foi possivel encontrar a abertura <urlset> no sitemap.xml.");
  return match[0];
}

function getSiteOriginFromSitemap(xml) {
  const homeMatch = xml.match(/<loc>(https?:\/\/[^<]+)<\/loc>/i);
  if (!homeMatch) throw new Error("Nao foi possivel identificar o dominio base no sitemap.xml.");
  return new URL(homeMatch[1]).origin;
}

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function buildExistingEntriesMap(xml) {
  const entries = new Map();
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/gi) || [];

  for (const block of blocks) {
    const loc = extractLoc(block);
    if (!loc) continue;

    try {
      const parsed = new URL(loc);
      entries.set(normalizePathname(parsed.pathname), {
        loc,
        lastmod: normalizeDate(extractLastmod(block)),
      });
    } catch {
      // Ignore malformed URLs from old sitemap entries.
    }
  }

  return entries;
}

async function fetchBlogPosts(supabaseUrl, supabaseAnonKey) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug,published_at,updated_at")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Falha ao buscar posts do Supabase: ${error.message}`);
  }

  return data || [];
}

async function fetchProjects(supabaseUrl, supabaseAnonKey) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from("projects")
    .select("slug,published_at,updated_at")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Falha ao buscar projetos do Supabase: ${error.message}`);
  }

  return data || [];
}

async function loadSnapshots() {
  const snapshotUrl = `${pathToFileURL(path.join(PROJECT_ROOT, "src", "data", "contentSnapshots.js")).href}?v=${Date.now()}`;
  const mod = await import(snapshotUrl);
  return mod.contentSnapshots || {};
}

function buildBlogBlocks(siteOrigin, posts) {
  const blogIndexLastmod = posts.length
    ? normalizeDate(posts[0].updated_at || posts[0].published_at)
    : new Date().toISOString().slice(0, 10);

  const blocks = [
    createUrlBlock({
      loc: `${siteOrigin}/blog`,
      lastmod: blogIndexLastmod,
      changefreq: "weekly",
      priority: "0.8",
    }),
  ];

  for (const post of posts) {
    if (!post?.slug) continue;

    blocks.push(
      createUrlBlock({
        loc: `${siteOrigin}/blog/${post.slug}`,
        lastmod: normalizeDate(post.updated_at || post.published_at),
        changefreq: "monthly",
        priority: "0.7",
      }),
    );
  }

  return blocks;
}

function buildProjectBlocks(siteOrigin, projects, existingEntries) {
  const blocks = [];

  for (const project of projects) {
    if (!project?.slug) continue;

    const pathName = `/cases/${project.slug}`;
    const fallbackLastmod = existingEntries.get(pathName)?.lastmod;

    blocks.push(
      createUrlBlock({
        loc: `${siteOrigin}${pathName}`,
        lastmod: normalizeDate(project.updated_at || project.published_at || fallbackLastmod),
        changefreq: "monthly",
        priority: "0.8",
      }),
    );
  }

  return blocks;
}

function buildStaticBlocks(siteOrigin, existingEntries) {
  return STATIC_PAGES.map((entry) => {
    const fallbackLastmod = existingEntries.get(entry.path)?.lastmod;
    return createUrlBlock({
      loc: `${siteOrigin}${entry.path}`,
      lastmod: normalizeDate(fallbackLastmod),
      changefreq: entry.changefreq,
      priority: entry.priority,
    });
  });
}

function buildSitemapXml({ xml, staticBlocks, projectBlocks, blogBlocks }) {
  const urlsetOpenTag = getUrlsetOpenTag(xml);
  const seen = new Set();

  const canonicalBlocks = [...staticBlocks, ...projectBlocks, ...blogBlocks].filter((block) => {
    const loc = extractLoc(block);
    if (!loc || seen.has(loc)) return false;
    seen.add(loc);
    return true;
  });

  return `${urlsetOpenTag}\n${canonicalBlocks.join("\n")}\n</urlset>\n`;
}

async function run() {
  await loadDotEnvFiles();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  const rawSitemap = await readFile(SITEMAP_PATH, "utf-8");
  const siteOrigin = getSiteOriginFromSitemap(rawSitemap);
  const existingEntries = buildExistingEntriesMap(rawSitemap);

  let posts = [];
  let projects = [];

  if (supabaseUrl && supabaseAnonKey) {
    const [fetchedPosts, fetchedProjects] = await Promise.all([
      fetchBlogPosts(supabaseUrl, supabaseAnonKey),
      fetchProjects(supabaseUrl, supabaseAnonKey),
    ]);
    posts = fetchedPosts;
    projects = fetchedProjects;
  } else {
    const snapshots = await loadSnapshots();
    posts = (snapshots.blogPosts || []).map((item) => ({
      slug: item.slug,
      published_at: item.publishedAt,
      updated_at: item.updatedAt,
    }));
    projects = (snapshots.projects || []).map((item) => ({
      slug: item.slug,
      published_at: item.publishedAt,
      updated_at: item.updatedAt,
    }));
    console.warn("[sitemap] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY nao encontrados. Usando snapshots locais.");
  }

  posts = posts.filter((post) => post?.slug);
  projects = projects.filter((project) => project?.slug);

  const staticBlocks = buildStaticBlocks(siteOrigin, existingEntries);
  const projectBlocks = buildProjectBlocks(siteOrigin, projects, existingEntries);
  const blogBlocks = buildBlogBlocks(siteOrigin, posts);
  const nextSitemap = buildSitemapXml({
    xml: rawSitemap,
    staticBlocks,
    projectBlocks,
    blogBlocks,
  });

  await writeFile(SITEMAP_PATH, nextSitemap, "utf-8");
  console.log(`[sitemap] Sitemap atualizado com ${STATIC_PAGES.length} pagina(s) estaticas, ${projects.length} case(s) e ${posts.length} artigo(s) do blog.`);
}

run().catch((error) => {
  console.warn(`[sitemap] ${error.message}. Mantendo sitemap atual.`);
});
