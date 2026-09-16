import { useState } from "react";

export function useHomeInteractions() {
  const [showCookieBanner, setShowCookieBanner] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem("cookieConsent");
  });

  const acceptCookies = () => {
    window.localStorage.setItem("cookieConsent", "true");
    setShowCookieBanner(false);
  };

  return { showCookieBanner, acceptCookies };
}
