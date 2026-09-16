const leadForm = document.querySelector("#leadForm");
const formStatus = document.querySelector("#formStatus");

if (leadForm && formStatus) {
  leadForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const name    = String(formData.get("name")    || "").trim();
    const email   = String(formData.get("email")   || "").trim();
    const project = String(formData.get("project") || "").trim();

    if (!name || !email || !project) {
      formStatus.textContent = "Preencha nome, e-mail e uma breve descrição do projeto.";
      formStatus.style.color = "var(--danger)";
      return;
    }

    const submitBtn = leadForm.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";
    formStatus.textContent = "";
    formStatus.style.color = "var(--muted)";

    try {
      const response = await fetch(leadForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        window.location.href = "/obrigado";
      } else {
        const data = await response.json();
        const errorMsg = data?.errors?.map((e) => e.message).join(", ")
          || "Erro ao enviar. Tente novamente.";
        formStatus.textContent = errorMsg;
        formStatus.style.color = "var(--danger)";
      }
    } catch (err) {
      formStatus.textContent = "Sem conexão. Verifique sua internet e tente novamente.";
      formStatus.style.color = "var(--danger)";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar mensagem";
    }
  });
}

/* ─── Menu hambúrguer ─────────────────────────────── */

const topnav     = document.querySelector(".topnav");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (topnav && menuToggle && primaryNav) {
  const closeMenu = () => {
    topnav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = topnav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!topnav.contains(event.target)) closeMenu();
  });
}

/* ─── Cookie Consent Banner ────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("cookieConsent")) {
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.innerHTML = `
      <div class="cookie-content">
        <p>Utilizamos cookies para melhorar sua experiência e analisar o tráfego do site. Ao continuar navegando, você concorda com a nossa <a href="/privacidade">Política de Privacidade</a>.</p>
        <button class="btn btn-primary btn-cookie" id="acceptCookies">Entendi e Aceito</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("acceptCookies").addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "true");
      banner.classList.add("cookie-hide");
      setTimeout(() => banner.remove(), 500);
    });
  }
});

/* ─── Cartão digital: copiar / vCard ───────────────── */

const cardCopyStatus = document.querySelector("#cardCopyStatus");
const copyButtons = document.querySelectorAll("[data-copy-value]");
const vcardButtons = document.querySelectorAll("[data-vcard-download]");

const setCardFeedback = (message, isError = false) => {
  if (!cardCopyStatus) return;

  cardCopyStatus.textContent = message;
  cardCopyStatus.style.color = isError ? "var(--danger)" : "rgba(255, 255, 255, 0.72)";
};

const copyToClipboard = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

copyButtons.forEach((button) => {
  const originalLabel = button.dataset.copyLabel || button.textContent.trim();

  button.addEventListener("click", async () => {
    const value = button.dataset.copyValue || "";

    try {
      await copyToClipboard(value);
      button.textContent = "Copiado";
      setCardFeedback(`${originalLabel} copiado para a área de transferência.`);
    } catch (error) {
      button.textContent = originalLabel;
      setCardFeedback("Não foi possível copiar agora. Use um dos links abaixo.", true);
      return;
    }

    window.clearTimeout(button._copyResetTimer);
    button._copyResetTimer = window.setTimeout(() => {
      button.textContent = originalLabel;
    }, 1600);
  });
});

vcardButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:Robson Svicero",
      "N:Svicero;Robson;;;",
      "ORG:Robson Svicero",
      "TITLE:Criação de Sites",
      "TEL;TYPE=CELL:+55 11 96493-2007",
      "EMAIL;TYPE=WORK:ola@robsonsvicero.com.br",
      "URL:https://robsonsvicero.com.br/",
      "ADR;TYPE=WORK:;;São Paulo;SP;Brasil",
      "END:VCARD",
    ].join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);

    link.href = objectUrl;
    link.download = "robson-svicero-contato.vcf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);

    setCardFeedback("vCard baixado. Pronto para salvar no celular.");
  });
});

/* ─── Voltar ao topo ────────────────────────────────── */

const backToTopBtn = document.querySelector("#backToTopBtn");

if (backToTopBtn) {
  const toggleBackToTop = () => {
    const shouldShow = window.scrollY > 420;
    backToTopBtn.classList.toggle("is-visible", shouldShow);
  };

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();
}
