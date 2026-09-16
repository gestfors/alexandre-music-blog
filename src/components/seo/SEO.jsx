import { useEffect } from "react";
import { createPageSeo } from "../../utils/seo.js";

function setMetaByName(name, content) {
  let meta = document.querySelector(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function setMetaByProperty(property, content) {
  let meta = document.querySelector(`meta[property="${property}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

function setStructuredData(data) {
  const scriptId = "page-structured-data";
  let script = document.getElementById(scriptId);

  if (!data) {
    script?.remove();
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export default function SEO({
  title,
  description,
  path,
  canonical,
  image,
  type,
  twitterCard,
  robots,
  keywords,
  publisher,
  structuredData,
}) {
  useEffect(() => {
    const seo = createPageSeo({
      title,
      description,
      path,
      canonical,
      image,
      type,
      twitterCard,
      robots,
      keywords,
      publisher,
    });

    document.title = seo.title;
    setMetaByName("description", seo.description);
    setMetaByName("robots", seo.robots);
    setMetaByName("keywords", seo.keywords);
    setMetaByName("publisher", seo.publisher);
    setMetaByProperty("og:type", seo.openGraph.type);
    setMetaByProperty("og:url", seo.openGraph.url);
    setMetaByProperty("og:title", seo.openGraph.title);
    setMetaByProperty("og:description", seo.openGraph.description);
    setMetaByProperty("og:image", seo.openGraph.image);
    setMetaByProperty("og:image:width", seo.openGraph.width);
    setMetaByProperty("og:image:height", seo.openGraph.height);
    setMetaByProperty("og:image:alt", seo.openGraph.alt);
    setMetaByProperty("og:site_name", seo.openGraph.siteName);
    setMetaByProperty("og:locale", seo.openGraph.locale);
    setMetaByName("twitter:card", seo.twitter.card);
    setMetaByName("twitter:title", seo.twitter.title);
    setMetaByName("twitter:description", seo.twitter.description);
    setMetaByName("twitter:image", seo.twitter.image);
    setMetaByName("twitter:image:alt", seo.twitter.alt);
    setCanonical(seo.canonical);
    setStructuredData(structuredData);
  }, [title, description, path, canonical, image, type, twitterCard, robots, keywords, publisher, structuredData]);

  return null;
}
