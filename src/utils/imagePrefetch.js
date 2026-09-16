export function prefetchImages(urls, { limit = 6 } = {}) {
  if (typeof window === "undefined" || !Array.isArray(urls) || urls.length === 0) return;

  const uniqueUrls = [...new Set(urls.filter((url) => typeof url === "string" && url.trim().length > 0))]
    .slice(0, limit);

  if (uniqueUrls.length === 0) return;

  const startPrefetch = () => {
    for (const url of uniqueUrls) {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
    }
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(startPrefetch, { timeout: 1000 });
    return;
  }

  window.setTimeout(startPrefetch, 0);
}
