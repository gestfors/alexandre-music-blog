import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const PROJECT_ROOT = process.cwd();
const DIST_PATH = path.join(PROJECT_ROOT, "dist");
const INDEX_HTML_PATH = path.join(DIST_PATH, "index.html");

const CANONICAL_PATHS = [
  "/",
  "/criacao-de-sites",
  "/precos",
  "/servicos/ux-design",
  "/servicos/landing-page",
  "/servicos/seo",
  "/servicos/gestao-gmn",
  "/servicos/identidade-visual",
  "/cases",
  "/sobre",
  "/contato",
  "/diagnostico-claro",
  "/metodo-claro",
  "/agendamentos",
  "/cartao",
  "/privacidade",
  "/faq",
];

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function toAbsoluteUrl(pathname, siteUrl) {
  const safePath = normalizePathname(pathname);
  return safePath === "/" ? siteUrl : `${siteUrl}${safePath}`;
}

function setCanonicalAndOgUrl(html, canonicalUrl) {
  let next = html;

  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(next)) {
    next = next.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    next = next.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  if (/<meta\s+property=["']og:url["'][^>]*>/i.test(next)) {
    next = next.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  } else {
    next = next.replace("</head>", `  <meta property="og:url" content="${canonicalUrl}" />\n</head>`);
  }

  return next;
}

async function loadSnapshotProjectPaths() {
  try {
    const snapshotUrl = `${pathToFileURL(path.join(PROJECT_ROOT, "src", "data", "contentSnapshots.js")).href}?v=${Date.now()}`;
    const mod = await import(snapshotUrl);
    const projectPaths = (mod.contentSnapshots?.projects || [])
      .map((project) => normalizePathname(project.path || `/cases/${project.slug || ""}`))
      .filter((projectPath) => projectPath.startsWith("/cases/") && projectPath !== "/cases/");

    return projectPaths;
  } catch {
    return [];
  }
}

async function writeRouteHtml(indexHtml, pathname, siteUrl) {
  const canonicalUrl = toAbsoluteUrl(pathname, siteUrl);
  const routeHtml = setCanonicalAndOgUrl(indexHtml, canonicalUrl);

  if (pathname === "/") {
    await writeFile(INDEX_HTML_PATH, routeHtml, "utf-8");
    return;
  }

  const outputDir = path.join(DIST_PATH, pathname.replace(/^\//, ""));
  const outputPath = path.join(outputDir, "index.html");

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, routeHtml, "utf-8");
}

async function run() {
  const siteUrl = (process.env.VITE_SITE_URL || "https://robsonsvicero.com.br").replace(/\/$/, "");

  let indexHtml = "";
  try {
    indexHtml = await readFile(INDEX_HTML_PATH, "utf-8");
  } catch {
    console.warn("[static-html] Nao foi possivel ler dist/index.html. Rode este script apos o vite build.");
    return;
  }

  const snapshotProjectPaths = await loadSnapshotProjectPaths();
  const allPaths = [...new Set([...CANONICAL_PATHS, ...snapshotProjectPaths])].map(normalizePathname);

  for (const pathname of allPaths) {
    await writeRouteHtml(indexHtml, pathname, siteUrl);
  }

  console.log(`[static-html] HTML canonico gerado para ${allPaths.length} rota(s).`);
}

run().catch((error) => {
  console.warn(`[static-html] ${error.message}`);
});
