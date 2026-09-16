export const siteSeo = {
  siteName: "Alexandre Music Blog",
  publisher: "Alexandre Music Blog",
  defaultKeywords:
    "música, artistas, lançamentos, entrevistas, cultura musical e notícias",
  baseUrl: "http://localhost:5173",
  defaultImage: "http://localhost:5173/assets/images/og-image.webp",
  defaultTitle: "Alexandre Music Blog | Música, cultura e novidades",
  defaultDescription:
    "Notícias, entrevistas, lançamentos e histórias sobre música.",
};

export function formatTitle(title) {
  if (!title) return siteSeo.defaultTitle;
  if (title.includes(siteSeo.siteName)) return title;
  return `${title} | ${siteSeo.siteName}`;
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${siteSeo.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageSeo({
  title,
  description,
  path = "/",
  canonical,
  image,
  type = "website",
  robots = "index, follow",
  twitterCard = "summary_large_image",
  keywords = siteSeo.defaultKeywords,
  publisher = siteSeo.publisher,
}) {
  const canonicalUrl = canonical ? absoluteUrl(canonical) : absoluteUrl(path);
  const resolvedTitle = formatTitle(title);
  const resolvedDescription = description || siteSeo.defaultDescription;
  const resolvedImage = absoluteUrl(image || siteSeo.defaultImage);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    canonical: canonicalUrl,
    robots,
    keywords,
    publisher,
    openGraph: {
      type,
      url: canonicalUrl,
      title: resolvedTitle,
      description: resolvedDescription,
      image: resolvedImage,
      width: 1200,
      height: 630,
      alt: resolvedTitle,
      siteName: siteSeo.siteName,
      locale: "pt_BR",
    },
    twitter: {
      card: twitterCard,
      title: resolvedTitle,
      description: resolvedDescription,
      image: resolvedImage,
      alt: resolvedTitle,
    },
  };
}
