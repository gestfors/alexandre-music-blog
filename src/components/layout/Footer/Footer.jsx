import { Link } from "react-router-dom";
import { footerContent } from "../../../content/siteContent.js";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12a12 12 0 1 0-13.88 11.86v-8.4H7.08V12h3.04V9.36c0-3 1.79-4.66 4.52-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.93-1.95 1.88V12h3.32l-.53 3.46h-2.79v8.4A12 12 0 0 0 24 12Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5ZM17.5 6A1.5 1.5 0 1 1 17.5 9 1.5 1.5 0 0 1 17.5 6Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.39.58A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.12c1.87.58 9.39.58 9.39.58s7.52 0 9.39-.58a3 3 0 0 0 2.11-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

const socialIconMap = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
};

export default function Footer() {
  return (
    <footer className="pagefoot" data-od-id="footer" aria-label="Rodape do site Alexandre Ivo">
      <div className="container footer-main content">
        <img
          src="/assets/images/Logo_horizontal.png"
          alt="Alexandre Ivo"
          className="footer-logo"
          width={227}
          height={42}
        />
        <div className="footer-contact">
          <strong>Quer falar conosco?</strong>
          <a href="https://wa.me/5511998895254" target="_blank" rel="noreferrer noopener">
            <span aria-hidden="true">◉</span> Tel.: (11) 99889-5254
          </a>
        </div>
        
        <div className="footer-socials">
          {["facebook", "instagram", "youtube"].map((icon) => {
            const Icon = socialIconMap[icon];
            return <a key={icon} href="#" className={`footer-social-link footer-social-link--${icon}`} aria-label={icon}>{Icon && <Icon />}</a>;
          })}
        </div>
      </div>
      <div className="container footer-bottom content">
        <span className="footer-copyright">Copyright © {footerContent.copyright}</span>
        <div className="footer-bottom-links">
          <Link to="/termos-de-uso">Termos de Uso</Link>
          <span aria-hidden="true">|</span>
          <Link to="/politica-de-privacidade">Política de Privacidade</Link>
        </div>
        <div className="footer-credit">
          <span>Desenvolvido por: <img src="/assets/images/logo_robson.png" alt="Robson Svicero" width={80} /></span>
          
        </div>
      </div>
    </footer>
  );
}
