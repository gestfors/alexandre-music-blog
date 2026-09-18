function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function absoluteUrl(value, siteUrl) {
  if (!value) return `${siteUrl}/assets/images/og_image.jpg`;

  try {
    return new URL(value, `${siteUrl}/`).href;
  } catch {
    return `${siteUrl}/assets/images/og_image.jpg`;
  }
}

function replaceOrAddMeta(html, pattern, tag) {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `  ${tag}\n</head>`);
}

function applySocialMetadata(html, { title, description, image, url }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(url);
  const metadata = [
    [`<title>${safeTitle}</title>`, /<title>.*?<\/title>/is],
    [`<meta name="description" content="${safeDescription}" />`, /<meta\s+name=["']description["'][^>]*>/i],
    [`<link rel="canonical" href="${safeUrl}" />`, /<link\s+rel=["']canonical["'][^>]*>/i],
    [`<meta property="og:type" content="article" />`, /<meta\s+property=["']og:type["'][^>]*>/i],
    [`<meta property="og:url" content="${safeUrl}" />`, /<meta\s+property=["']og:url["'][^>]*>/i],
    [`<meta property="og:title" content="${safeTitle}" />`, /<meta\s+property=["']og:title["'][^>]*>/i],
    [`<meta property="og:description" content="${safeDescription}" />`, /<meta\s+property=["']og:description["'][^>]*>/i],
    [`<meta property="og:image" content="${safeImage}" />`, /<meta\s+property=["']og:image["'][^>]*>/i],
    [`<meta property="og:image:secure_url" content="${safeImage}" />`, /<meta\s+property=["']og:image:secure_url["'][^>]*>/i],
    [`<meta name="twitter:title" content="${safeTitle}" />`, /<meta\s+name=["']twitter:title["'][^>]*>/i],
    [`<meta name="twitter:description" content="${safeDescription}" />`, /<meta\s+name=["']twitter:description["'][^>]*>/i],
    [`<meta name="twitter:image" content="${safeImage}" />`, /<meta\s+name=["']twitter:image["'][^>]*>/i],
  ];

  return metadata.reduce((currentHtml, [tag, pattern]) => replaceOrAddMeta(currentHtml, pattern, tag), html);
}

async function fetchPost(slug) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || !slug) return null;

  try {
    const endpoint = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/blog_posts`);
    endpoint.searchParams.set("select", "title,excerpt,seo_title,seo_description,image,thumbnail,canonical_url,slug");
    endpoint.searchParams.set("slug", `eq.${slug}`);
    endpoint.searchParams.set("limit", "1");

    const response = await fetch(endpoint, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });
    if (!response.ok) return null;

    const posts = await response.json();
    return posts[0] || null;
  } catch (error) {
    console.error("[blog-meta] Falha ao consultar o artigo:", error);
    return null;
  }
}

export default async function handler(request, response) {
  const requestOrigin = `${request.headers["x-forwarded-proto"] || "https"}://${request.headers.host}`;
  const siteUrl = (process.env.VITE_SITE_URL || requestOrigin).replace(/\/$/, "");
  const slug = String(request.query?.slug || "").replace(/^\/+|\/+$/g, "").split("/")[0];

  let shell;
  try {
    const shellResponse = await fetch(`${requestOrigin}/index.html`);
    shell = await shellResponse.text();
  } catch (error) {
    console.error("[blog-meta] Falha ao carregar o HTML base:", error);
    response.statusCode = 502;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Nao foi possivel carregar o artigo.");
    return;
  }

  const post = await fetchPost(slug);

  if (!post) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(shell);
    return;
  }

  try {
    const url = post.canonical_url || `${siteUrl}/blog/${post.slug}`;
    const html = applySocialMetadata(shell, {
      title: post.seo_title || post.title || "Artigo | Alexandre Ivo",
      description: post.seo_description || post.excerpt || "Artigo publicado por Alexandre Ivo.",
      image: absoluteUrl(post.thumbnail || post.image, siteUrl),
      url,
    });

    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    response.end(html);
  } catch (error) {
    console.error("[blog-meta] Falha ao gerar metadados do artigo:", error);
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end("<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\"><title>Alexandre Music Blog</title></head><body></body></html>");
  }
}