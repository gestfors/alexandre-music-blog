import { useState } from "react";
import { Link } from "react-router-dom";
import { footerContent } from "../../../content/siteContent.js";

/* ── Social icon SVGs ── */
function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0Zm5.14 6.27-1.89 8.91c-.14.63-.52.79-1.05.49l-2.9-2.13-1.4 1.35c-.15.15-.28.28-.58.28l.21-2.94 5.35-4.83c.23-.2-.05-.31-.35-.11L7.76 12.4l-2.9-.9c-.63-.2-.64-.63.13-.94l11.38-4.39c.53-.2 1 .12.82.92Z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.528 5.852L0 24l6.335-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.878 9.878 0 01-5.032-1.374l-.36-.214-3.733.888.937-3.637-.234-.374A9.856 9.856 0 012.118 12C2.118 6.535 6.535 2.118 12 2.118c5.464 0 9.882 4.417 9.882 9.882 0 5.464-4.418 9.882-9.882 9.882z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconBehance() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z" />
    </svg>
  );
}

const socialIconMap = {
  telegram: TelegramIcon,
  whatsapp: IconWhatsApp,
  instagram: IconInstagram,
  github: IconGitHub,
  behance: IconBehance,
};

export default function Footer() {
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <footer className="pagefoot" data-od-id="footer" aria-label="Rodape do site de Robson Svicero">

      {/* ── Main area ── */}
      <div className="footer-main content">

        {/* Left: logo + description + socials */}
        <div className="footer-brand">
          <img
            src="/assets/images/logo-vazado-roxo.png"
            alt="Robson Svicero logo"
            className="footer-logo-symbol"
            width={72}
            height={72}
          />
          <p className="footer-desc">{footerContent.description}</p>

          <div className="footer-socials">
            {footerContent.socials.map((s) => {
              const Icon = socialIconMap[s.icon];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener me"
                  title={s.label}
                  className="footer-social-link"
                  aria-label={s.label}
                >
                  {Icon && <Icon />}
                </a>
              );
            })}
          </div>
        </div>

        {/* Right: nav columns */}
        <div className="footer-nav-cols">
          <nav className="footer-nav-col" aria-label={footerContent.navEstudio.label}>
            <span className="footer-nav-heading">{footerContent.navEstudio.label}</span>
            {footerContent.navEstudio.links.map((link) => {
              const hasSubmenu = !!link.items;
              return (
                <div key={link.label} className="footer-nav-group">
                  {hasSubmenu ? (
                    <button
                      type="button"
                      className={`footer-nav-toggle-btn ${servicesOpen ? "is-open" : ""}`}
                      onClick={() => setServicesOpen(!servicesOpen)}
                      aria-expanded={servicesOpen}
                    >
                      {link.label}
                      <svg
                        className="footer-nav-caret"
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1L5 5L9 1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ) : (
                    <Link to={link.href} className="footer-nav-link">
                      {link.label}
                    </Link>
                  )}
                  {hasSubmenu && servicesOpen && (
                    <div className="footer-nav-sublinks">
                      {link.items.map((subItem) => (
                        <Link key={subItem.label} to={subItem.to} className="footer-nav-sublink">
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <nav className="footer-nav-col" aria-label={footerContent.navSuporte.label}>
            <span className="footer-nav-heading">{footerContent.navSuporte.label}</span>
            {footerContent.navSuporte.links.map((link) => (
              <Link key={link.label} to={link.href} className="footer-nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="footer-divider" />

      {/* ── Bottom bar ── */}
      <div className="footer-bottom content">
        <span className="footer-copyright">© {footerContent.copyright}</span>

        <div className="footer-bottom-links">
          {footerContent.bottomLinks.map((link, i) => (
            <span key={link.label} className="footer-bottom-item">
              {i > 0 && <span className="footer-bottom-sep" aria-hidden="true">/</span>}
              <Link to={link.href} className="footer-bottom-link">
                {link.label}
              </Link>
            </span>
          ))}
          <span className="footer-bottom-item">
            <span className="footer-bottom-sep" aria-hidden="true">/</span>
            <span className="footer-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {footerContent.location}
            </span>
          </span>
        </div>
      </div>

      {/* ── Giant brand name ── */}
      <div className="footer-wordmark" aria-hidden="true">
        <img
          src="/assets/images/logo-hor-base.webp"
          alt="Robson Svicero Desenvolvimento de sites"
          className="footer-wordmark-img"
        />
      </div>

    </footer>
  );
}
