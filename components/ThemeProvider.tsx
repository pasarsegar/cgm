"use client";

import { useShop } from "@/context/ShopContext";
import { useEffect } from "react";

export default function ThemeProvider() {
  const { themeSettings } = useShop();

  useEffect(() => {
    // Apply CSS variables to root element for broader compatibility
    const root = document.documentElement;
    root.style.setProperty('--background', themeSettings.bodyBackgroundColor);
    root.style.setProperty('--primary', themeSettings.primaryColor);
    root.style.setProperty('--secondary', themeSettings.secondaryColor);
    root.style.setProperty('--text-color', themeSettings.textColor);
    root.style.setProperty('--font-family', themeSettings.fontFamily);
    root.style.setProperty('--footer-bg', themeSettings.footerBackgroundColor);
    root.style.setProperty('--footer-text', themeSettings.footerTextColor);
  }, [themeSettings]);

  return (
    <style jsx global>{`
      :root {
        --background: ${themeSettings.bodyBackgroundColor};
        --primary: ${themeSettings.primaryColor};
        --secondary: ${themeSettings.secondaryColor};
        --text-color: ${themeSettings.textColor};
        --font-family: ${themeSettings.fontFamily};
        --footer-bg: ${themeSettings.footerBackgroundColor};
        --footer-text: ${themeSettings.footerTextColor};
      }

      body {
        background-color: var(--background);
        color: var(--text-color);
        font-family: var(--font-family), system-ui, -apple-system, sans-serif;
      }

      /* Apply Primary Color to buttons and links */
      .text-primary { color: var(--primary) !important; }
      .bg-primary { background-color: var(--primary) !important; }
      .border-primary { border-color: var(--primary) !important; }
      .hover\\:bg-primary:hover { background-color: var(--primary) !important; }
      .hover\\:text-primary:hover { color: var(--primary) !important; }

      /* Apply Secondary Color */
      .text-secondary { color: var(--secondary) !important; }
      .bg-secondary { background-color: var(--secondary) !important; }
    `}</style>
  );
}
