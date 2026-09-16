import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function absoluteUrl(value, siteUrl) {
  const fallbackImage = `${siteUrl}/assets/images/og-image.webp`;
  if (!value) return fallbackImage;

  try {
    return new URL(value, `${siteUrl}/`).href;
  } catch {
    return fallbackImage;
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
  <meta property="og:site_name" content="Robson Svicero" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${title}" />
  `;

  return html.replace("</head>", `${metaTags}\n</head>`);
}

async function fetchBlogPosts(supabaseUrl, supabaseAnonKey) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, seo_title, seo_description, image, thumbnail, canonical_url")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Falha ao buscar posts do Supabase: ${error.message}`);
  }
  return data || [];
}

async function generateBlogHtmls() {
  await loadDotEnvFiles();

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const siteUrl = process.env.VITE_SITE_URL || "https://robsonsvicero.com.br";

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

  const posts = await fetchBlogPosts(supabaseUrl, supabaseAnonKey);

  // A pasta /blog passa a existir quando os HTMLs dos posts sao gerados. Sem
  // um index.html nela, o LiteSpeed bloqueia a listagem do diretorio com 403 e
  // nao chega ao fallback da SPA definido no .htaccess.
  const blogDirPath = path.join(DIST_PATH, "blog");
  await mkdir(blogDirPath, { recursive: true });
  const blogHtml = createSocialHtml(indexHtml, {
    title: "Blog sobre Criação de sites, UX, SEO e Landing Pages | Robson Svicero",
    description: "Artigos sobre criação de sites, UX Design, SEO técnico, landing pages, interfaces digitais e estratégia para presença digital.",
    image: `${siteUrl}/assets/images/og-image.webp`,
    url: `${siteUrl}/blog/`,
  });
  await writeFile(path.join(blogDirPath, "index.html"), blogHtml, "utf-8");

  for (const post of posts) {
    if (!post.slug) continue;

    const title = escapeHtml(post.seo_title || post.title || "Artigo | Robson Svicero");
    const description = escapeHtml(
      post.seo_description || post.excerpt || "Artigo publicado por Robson Svicero.",
    );
    const image = escapeHtml(absoluteUrl(post.image || post.thumbnail, siteUrl));
    const url = escapeHtml(post.canonical_url || `${siteUrl}/blog/${post.slug}`);

    const postHtml = createSocialHtml(indexHtml, {
      title,
      description,
      image,
      url,
      type: "article",
    });

    const dirPath = path.join(DIST_PATH, "blog", post.slug);
    await mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, "index.html");
    await writeFile(filePath, postHtml, "utf-8");
  }

  console.log(`[blog-html] Foram gerados ${posts.length} arquivos HTML estaticos para o blog.`);
}

generateBlogHtmls().catch((error) => {
  console.warn(
    `[blog-html] Nao foi possivel gerar os HTMLs estaticos: ${error.message}. ` +
    "Mantendo o build gerado pelo Vite.",
  );
});
