export const routes = {
  home: "/",
  blog: "/blog",
  adminLogin: "/admin/login",
  admin: "/admin",
};

export const contactLinks = {
  whatsapp: "https://wa.me/5511964932007?text=Ol%C3%A1!%20Gostaria%20de%20conversar%20sobre%20o%20meu%20projeto.",
  telegram: "https://t.me/robsonsvicero?text=Ol%C3%A1!%20Gostaria%20de%20conversar%20sobre%20o%20meu%20projeto.%0A%0A",
};

export const headerContent = {
  logo: {
    href: "/blog",
    src: "/assets/images/logo.png",
    alt: "Alexandre Music Blog - Início",
    width: 91,
    height: 64,
  },
  navItems: [
    { label: "Blog", to: routes.blog },
    { label: "Admin", to: routes.adminLogin },
  ],
  cta: {
    label: "Entrar no painel",
    href: routes.adminLogin,
    phone: "",
  },
};

export const faqContent = {
  eyebrow: "Perguntas frequentes",
  title: "Dúvidas rápidas sobre o blog e o painel administrativo.",
  lead: "Informações simples para acompanhar as publicações e a gestão do conteúdo.",
  questions: [
    {
      question: "Como acessar o painel administrativo?",
      answer: "Acesse /admin e faça login com uma conta que tenha o papel de administrador.",
    },
    {
      question: "Como publicar um artigo novo?",
      answer: "No painel, vá até a seção de artigos e crie ou edite uma publicação com título, conteúdo e imagem.",
    },
    {
      question: "O blog é público?",
      answer: "Sim. A navegação pública do blog fica acessível em /blog e em cada artigo individual.",
    },
  ],
};

export const homeFaqContent = {
  eyebrow: "Perguntas frequentes",
  title: "Dúvidas rápidas sobre o blog e o painel administrativo.",
  lead: "Informações simples para acompanhar as publicações e a gestão do conteúdo.",
  questions: faqContent.questions,
};

export const faqPageContent = {
  eyebrow: "Perguntas frequentes",
  title: "Dúvidas rápidas sobre o blog e o painel administrativo.",
  lead: "Informações simples para acompanhar as publicações e a gestão do conteúdo.",
  questions: faqContent.questions,
};

export const contactContent = {
  eyebrow: "Contato",
  title: "Entre em contato",
  lead: "Use o canal preferido para falar com a equipe ou entrar no painel administrativo.",
  links: [
    { label: "Falar no Telegram", href: contactLinks.telegram, variant: "btn-telegram" },
    { label: "Falar no WhatsApp", href: contactLinks.whatsapp, variant: "btn-whatsapp" },
    { label: "Entrar no painel", href: routes.adminLogin, variant: "outline" },
  ],
  meta: "Acesso ao blog e ao painel administrativo",
  formAction: "",
};

export const pageCtaContent = {
  home: {
    eyebrow: "Próximo passo",
    title: "Acesse o blog ou o painel administrativo.",
    lead: "Navegue pelas publicações ou entre no painel para gerenciar autores e artigos.",
    bandClass: "cta-home-band",
    primaryAction: {
      label: "Ver blog",
      href: routes.blog,
      newTab: false,
    },
    secondaryAction: {
      label: "Entrar no painel",
      to: routes.adminLogin,
    },
  },
};

export const footerContent = {
  copyright: "2026 Alexandre Music Blog",
  description: "Blog editorial com gestão de conteúdo e painel administrativo para autores e artigos.",
  socials: [
    { label: "Telegram", href: contactLinks.telegram, icon: "telegram" },
    { label: "WhatsApp", href: contactLinks.whatsapp, icon: "whatsapp" },
    { label: "Instagram", href: "https://www.instagram.com/robson.svicero", icon: "instagram" },
    { label: "GitHub", href: "https://github.com/robsonsvicero", icon: "github" },
    { label: "Behance", href: "https://www.behance.net/robsonsvicero", icon: "behance" },
  ],
  navEstudio: {
    label: "NAVEGAÇÃO",
    links: [
      { label: "Início", href: routes.home },
      { label: "Blog", href: routes.blog },
      { label: "Painel", href: routes.adminLogin },
    ],
  },
  navSuporte: {
    label: "SUPORTE",
    links: [
      { label: "Admin", href: routes.adminLogin },
      { label: "Contato", href: contactLinks.whatsapp },
    ],
  },
  bottomLinks: [],
  location: "Brasil",
  links: [
    { label: "WhatsApp", href: contactLinks.whatsapp },
    { label: "Telegram", href: contactLinks.telegram },
  ],
  privacy: {
    label: "Blog",
    href: routes.blog,
  },
  faq: {
    label: "FAQ",
    href: routes.blog,
  },
  services: {
    label: "Painel",
    href: routes.adminLogin,
  },
};
