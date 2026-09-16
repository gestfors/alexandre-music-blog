const allowedTags = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "EM",
  "DIV",
  "H2",
  "H3",
  "I",
  "IMG",
  "LI",
  "OL",
  "P",
  "SPAN",
  "STRONG",
  "SUB",
  "SUP",
  "S",
  "STRIKE",
  "U",
  "UL",
]);

const allowedStyleProps = new Set([
  "font-weight",
  "font-style",
  "text-decoration",
  "text-align",
  "color",
  "background-color",
]);

const safeStyleValuePattern = /^[#(),.%\-\s\w]+$/;

function sanitizeStyleValue(value) {
  const normalized = (value || "").trim();
  if (!normalized) return "";
  if (!safeStyleValuePattern.test(normalized)) return "";
  return normalized;
}

function sanitizeInlineStyles(styleValue = "") {
  if (!styleValue) return "";

  const declarations = styleValue
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const safeDeclarations = declarations
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(":");
      if (separatorIndex === -1) return null;

      const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
      const value = declaration.slice(separatorIndex + 1).trim();

      if (!allowedStyleProps.has(property)) return null;
      const safeValue = sanitizeStyleValue(value);
      if (!safeValue) return null;

      return `${property}: ${safeValue}`;
    })
    .filter(Boolean);

  return safeDeclarations.join("; ");
}

function normalizeWordMarkup(element) {
  if (!element) return;

  const tagName = element.tagName;
  if (!tagName) return;

  if (tagName === "P") {
    const text = (element.textContent || "").trim();
    if (/^[\u2022\-]\s+/.test(text)) {
      const li = document.createElement("li");
      li.textContent = text.replace(/^[\u2022\-]\s+/, "").trim();
      element.replaceWith(li);
      return;
    }
  }
}

function cleanNode(node) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) return;

    if (child.nodeType !== Node.ELEMENT_NODE || !allowedTags.has(child.tagName)) {
      child.replaceWith(...Array.from(child.childNodes));
      return;
    }

    normalizeWordMarkup(child);

    Array.from(child.attributes).forEach((attribute) => {
      if (attribute.name === "style") {
        const safeStyles = sanitizeInlineStyles(attribute.value);
        if (safeStyles) {
          child.setAttribute("style", safeStyles);
        } else {
          child.removeAttribute("style");
        }
        return;
      }

      const isAllowedLinkAttribute =
        child.tagName === "A" && ["href", "target", "rel"].includes(attribute.name);

      const isAllowedImageAttribute =
        child.tagName === "IMG" && ["src", "alt", "width", "height", "loading"].includes(attribute.name);

      if (!isAllowedLinkAttribute && !isAllowedImageAttribute) {
        child.removeAttribute(attribute.name);
      }
    });

    if (child.tagName === "A") {
      const href = child.getAttribute("href") || "";
      if (!href.startsWith("http://") && !href.startsWith("https://")) {
        child.removeAttribute("href");
      }
      child.setAttribute("target", "_blank");
      child.setAttribute("rel", "noreferrer noopener");
    }

    if (child.tagName === "IMG") {
      const src = child.getAttribute("src") || "";
      if (!src.startsWith("https://") && !src.startsWith("/assets/")) {
        child.remove();
        return;
      }
      child.setAttribute("loading", "lazy");
      child.setAttribute("alt", child.getAttribute("alt") || "");
    }

    cleanNode(child);
  });
}

export function sanitizeRichText(html = "") {
  if (!html) return "";

  const template = document.createElement("template");
  template.innerHTML = html;
  cleanNode(template.content);

  return template.innerHTML;
}
