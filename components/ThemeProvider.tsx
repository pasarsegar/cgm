"use client";

import { useShop } from "@/context/ShopContext";
import { useEffect } from "react";

export default function ThemeProvider() {
  const { themeSettings, headerSettings } = useShop();

  useEffect(() => {
    // Apply CSS variables to root element for broader compatibility
    const root = document.documentElement;
    root.style.setProperty('--background', themeSettings.bodyBackgroundColor);
    root.style.setProperty('--primary', themeSettings.primaryColor);
    root.style.setProperty('--secondary', themeSettings.secondaryColor);
    root.style.setProperty('--text-color', themeSettings.textColor);
    root.style.setProperty('--font-family', themeSettings.fontFamily);
    
    // Global Buttons
    root.style.setProperty('--button-bg', themeSettings.buttonColor);
    root.style.setProperty('--button-text', themeSettings.buttonTextColor);

    // Product Buttons
    root.style.setProperty('--product-button-bg', themeSettings.productButtonColor);
    root.style.setProperty('--product-button-text', themeSettings.productButtonTextColor);

    // Header Buttons
    root.style.setProperty('--header-button-bg', headerSettings.buttonColor);
    root.style.setProperty('--header-button-text', headerSettings.buttonTextColor);

    // Footer
    root.style.setProperty('--footer-bg', themeSettings.footerBackgroundColor);
    root.style.setProperty('--footer-text', themeSettings.footerTextColor);
    root.style.setProperty('--footer-button-bg', themeSettings.footerButtonColor);
    root.style.setProperty('--footer-button-text', themeSettings.footerButtonTextColor);
  }, [themeSettings, headerSettings]);

  return (
    <style jsx global>{`
      :root {
        --background: ${themeSettings.bodyBackgroundColor};
        --primary: ${themeSettings.primaryColor};
        --secondary: ${themeSettings.secondaryColor};
        --text-color: ${themeSettings.textColor};
        --font-family: ${themeSettings.fontFamily};
        
        --button-bg: ${themeSettings.buttonColor};
        --button-text: ${themeSettings.buttonTextColor};

        --product-button-bg: ${themeSettings.productButtonColor};
        --product-button-text: ${themeSettings.productButtonTextColor};

        --header-button-bg: ${headerSettings.buttonColor};
        --header-button-text: ${headerSettings.buttonTextColor};

        --footer-bg: ${themeSettings.footerBackgroundColor};
        --footer-text: ${themeSettings.footerTextColor};
        --footer-button-bg: ${themeSettings.footerButtonColor};
        --footer-button-text: ${themeSettings.footerButtonTextColor};
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

      /* Override buttons with specific button color settings */
      button.bg-primary, .button-primary {
        background-color: var(--button-bg) !important;
        color: var(--button-text) !important;
      }

      /* Specific Product Button Override */
      .product-button, button[aria-label="Add to cart"] {
        background-color: var(--product-button-bg) !important;
        color: var(--product-button-text) !important;
      }
      
      /* Apply Secondary Color */
      .text-secondary { color: var(--secondary) !important; }
      .bg-secondary { background-color: var(--secondary) !important; }
    `}</style>
  );
}
