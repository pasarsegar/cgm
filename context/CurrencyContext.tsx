"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

  // Exchange rate - in a real app this should come from an API
  const EXCHANGE_RATE = 15000; // 1 USD = 15,000 IDR (approx)

  useEffect(() => {
    const checkLocation = async () => {
      let countryCode = "US"; // Default

      try {
        // Try ipwho.is (Free, no key, supports SSL & CORS)
        const response = await fetch("https://ipwho.is/");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            countryCode = data.country_code;
          }
        }
      } catch (e) {
        console.warn("IP detection failed, defaulting to USD", e);
      }

      if (countryCode === "ID") {
        setCurrency("IDR");
      } else {
        setCurrency("USD");
      }
      setLoading(false);
    };

    checkLocation();
  }, []);

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
