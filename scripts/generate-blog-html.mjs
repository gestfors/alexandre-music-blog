import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();
const DIST_PATH = path.join(PROJECT_ROOT, "dist");
const INDEX_HTML_PATH = path.join(DIST_PATH, "index.html");

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

function createSocialHtml(indexHtml, { title, description, image, url, type = "website" }) {
  let html = indexHtml;

  html = html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
  html = html.replace(/<meta\s+(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");

  const metaTags = `
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:site_name" content="Alexandre Music Blog" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />
  `;

  return html.replace("</head>", `${metaTags}\n</head>`);
}

async function generateBlogHtmls() {
  await loadDotEnvFiles();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const siteUrl = process.env.VITE_SITE_URL || "https://alexandre-music-blog.vercel.app";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[blog-html] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY nao encontrados. " +
      "Mantendo apenas o HTML gerado pelo Vite.",
    );
    return;
  }

  let indexHtml = "";
  try {
    indexHtml = await readFile(INDEX_HTML_PATH, "utf-8");
  } catch (error) {
    console.error("[blog-html] Nao foi possivel ler o dist/index.html. Certifique-se de rodar este script APOS o vite build.");
    return;
  }

  // A página individual é servida pela função /api/blog-meta, que consulta o
  // Supabase em cada acesso e injeta os metadados atuais do artigo.
  const blogDirPath = path.join(DIST_PATH, "blog");
  await mkdir(blogDirPath, { recursive: true });
  const blogHtml = createSocialHtml(indexHtml, {
    title: "Alexandre Music Blog | Música, cultura e novidades",
    description: "Notícias, entrevistas, lançamentos e histórias sobre música.",
    image: `${siteUrl}/assets/images/og_image.jpg`,
    url: `${siteUrl}/blog/`,
  });
  await writeFile(path.join(blogDirPath, "index.html"), blogHtml, "utf-8");
  console.log("[blog-html] HTML estatico gerado para a listagem do blog.");
}

generateBlogHtmls().catch((error) => {
  console.warn(
    `[blog-html] Nao foi possivel gerar os HTMLs estaticos: ${error.message}. ` +
    "Mantendo o build gerado pelo Vite.",
  );
});
