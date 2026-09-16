import { Check, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

const brandPaths = {
  WhatsApp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.89-9.884a9.83 9.83 0 0 1 6.987 2.896 9.825 9.825 0 0 1 2.9 6.988c-.003 5.45-4.437 9.884-9.893 9.884M20.52 3.449A11.815 11.815 0 0 0 12.058 0C5.495 0 .156 5.335.153 11.893c0 2.096.547 4.142 1.588 5.945L.051 24l6.3-1.652a11.9 11.9 0 0 0 5.703 1.454h.005c6.56 0 11.899-5.335 11.902-11.893a11.821 11.821 0 0 0-3.44-8.46",
  LinkedIn: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zM3.559 9h3.556v11.452H3.559V9zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  Instagram: "M12 2.163c3.204 0 3.584.012 4.849.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.265.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
};

function BrandIcon({ name }) {
  return (
    <svg className="blog-share-brand-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={brandPaths[name]} />
    </svg>
  );
}

export default function BlogShare({ title, url }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;

    const timeout = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const shareLinks = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  async function shareOnInstagram() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    await copyLink();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const didCopy = document.execCommand("copy");
      input.remove();
      setCopied(didCopy);
    }
  }

  return (
    <section className="blog-share" aria-labelledby="blog-share-title">
      <div>
        <p className="eyebrow">Gostou do conteúdo?</p>
        <h2 id="blog-share-title">Compartilhe este artigo</h2>
      </div>
      <div className="blog-share-actions">
        {shareLinks.map(({ label, href }) => (
          <a
            className="blog-share-button"
            href={href}
            key={label}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Compartilhar no ${label}`}
            title={`Compartilhar no ${label}`}
          >
            <BrandIcon name={label} />
          </a>
        ))}
        <button
          className="blog-share-button"
          type="button"
          onClick={shareOnInstagram}
          aria-label="Compartilhar no Instagram"
          title="Compartilhar no Instagram"
        >
          <BrandIcon name="Instagram" />
        </button>
        <button
          className="blog-share-button"
          type="button"
          onClick={copyLink}
          aria-label={copied ? "Link copiado" : "Copiar link"}
          title={copied ? "Link copiado" : "Copiar link"}
        >
          {copied ? <Check aria-hidden="true" /> : <LinkIcon aria-hidden="true" />}
        </button>
      </div>
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Link do artigo copiado para a área de transferência." : ""}
      </span>
    </section>
  );
}
