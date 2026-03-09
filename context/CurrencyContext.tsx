"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useShop } from "./ShopContext";

type Currency = "USD" | "IDR";

interface CurrencyContextType {
  currency: Currency;
  formatPrice: (priceUSD: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [loading, setLoading] = useState(true);
  const { generalSettings, loading: shopLoading } = useShop();

  // Exchange rate - in a real app this should come from an API
  const EXCHANGE_RATE = 15000; // 1 USD = 15,000 IDR (approx)

  useEffect(() => {
    // Wait for shop settings to load
    if (shopLoading) return;

    if (!generalSettings.enableAutoCurrency) {
      setCurrency("USD");
      setLoading(false);
      return;
    }

    const checkLocation = async () => {
      let countryCode = "US"; // Default

      try {
        // We use a cascade of free IP geolocation services to handle rate limits and CORS
        // 1. ipapi.co (HTTPS, very reliable but strict rate limits)
        try {
          const res = await fetch("https://ipapi.co/json/");
          if (res.ok) {
            const data = await res.json();
            if (data.country_code) {
              countryCode = data.country_code;
              // If successful, skip others
              if (countryCode === "ID") setCurrency("IDR");
              else setCurrency("USD");
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          // Continue to next service
        }

        // 2. ipwho.is (HTTPS, generous free tier)
        try {
          const res = await fetch("https://ipwho.is/");
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.country_code) {
              countryCode = data.country_code;
              if (countryCode === "ID") setCurrency("IDR");
              else setCurrency("USD");
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          // Continue
        }

        // 3. ip-api.com (HTTP only for free tier - might fail on HTTPS sites but good for localhost)
        try {
           const res = await fetch("http://ip-api.com/json");
           if (res.ok) {
             const data = await res.json();
             if (data.countryCode) {
               countryCode = data.countryCode;
             }
           }
        } catch (e) {
           // All failed, stick to default
        }

      } catch (e) {
        console.warn("Currency detection failed, defaulting to USD");
      }

      if (countryCode === "ID") {
        setCurrency("IDR");
      } else {
        setCurrency("USD");
      }
      setLoading(false);
    };

    checkLocation();
  }, [generalSettings.enableAutoCurrency, shopLoading]);

  const formatPrice = (priceUSD: number) => {
    if (currency === "IDR") {
      const priceIDR = priceUSD * EXCHANGE_RATE;
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(priceIDR);
    }
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(priceUSD);
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
