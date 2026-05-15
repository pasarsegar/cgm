"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Variation } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  buttonPosition?: 'left' | 'center' | 'right';
  secondButtonText?: string;
  secondButtonLink?: string;
}

export interface GeneralSettings {
  enableAutoCurrency: boolean;
}

export interface HeaderSettings {
  height: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  buttonColor: string;
  buttonTextColor: string;
  logoUrl?: string;
  logoHeight?: string;
  logoPosition?: 'left' | 'center' | 'right';
  menuPosition?: 'left' | 'center' | 'right';
  iconsPosition?: 'left' | 'center' | 'right';
  showSearch: boolean;
  showAccount: boolean;
  showCart: boolean;
}

export interface PaymentSettings {
  xenditEnabled: boolean;
  xenditApiKey: string;
  midtransEnabled: boolean;
  midtransServerKey: string;
  midtransClientKey: string;
}

export interface ThemeSettings {
  bodyBackgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  buttonColor: string;
  buttonTextColor: string;
  productButtonColor: string;
  productButtonTextColor: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  footerButtonColor: string;
  footerButtonTextColor: string;
}

interface CartItem extends Product {
  quantity: number;
  selectedVariation?: Variation;
  cartId: string; // unique id combining product id and variation id
}

interface ShopContextType {
  // Slider
  slides: Slide[];
  setSlides: (slides: Slide[]) => void;
  addSlide: (slide: Slide) => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, slide: Slide) => void;

  // General
  generalSettings: GeneralSettings;
  setGeneralSettings: (settings: GeneralSettings) => void;

  // Header
  headerSettings: HeaderSettings;
  setHeaderSettings: (settings: HeaderSettings) => void;

  // Payment
  paymentSettings: PaymentSettings;
  setPaymentSettings: (settings: PaymentSettings) => void;

  // Theme
  themeSettings: ThemeSettings;
  setThemeSettings: (settings: ThemeSettings) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variation?: Variation) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  loading: boolean;
  refreshData: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const initialGeneralSettings: GeneralSettings = {
  enableAutoCurrency: true
};

const initialHeaderSettings: HeaderSettings = {
  height: "80px",
  backgroundColor: "#ffffff",
  textColor: "#666666",
  fontSize: "14px",
  buttonColor: "#ff4d00",
  buttonTextColor: "#ffffff",
  showSearch: true,
  showAccount: true,
  showCart: true,
  logoHeight: "40px",
  logoPosition: 'left',
  menuPosition: 'center',
  iconsPosition: 'right'
};

const initialPaymentSettings: PaymentSettings = {
  xenditEnabled: false,
  xenditApiKey: "",
  midtransEnabled: false,
  midtransServerKey: "",
  midtransClientKey: ""
};

const initialThemeSettings: ThemeSettings = {
  bodyBackgroundColor: "#F0F3F7",
  primaryColor: "#ff4d00",
  secondaryColor: "#1d2327",
  textColor: "#333333",
  fontFamily: "Inter",
  buttonColor: "#ff4d00",
  buttonTextColor: "#ffffff",
  productButtonColor: "#ff4d00",
  productButtonTextColor: "#ffffff",
  footerBackgroundColor: "#1d2327", // Default to dark footer to match server render
  footerTextColor: "#ffffff",
  footerButtonColor: "#ff4d00",
  footerButtonTextColor: "#ffffff"
};

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [slides, setSlidesState] = useState<Slide[]>([]);
  const [generalSettings, setGeneralSettingsState] = useState<GeneralSettings>(initialGeneralSettings);
  const [headerSettings, setHeaderSettingsState] = useState<HeaderSettings>(initialHeaderSettings);
  const [paymentSettings, setPaymentSettingsState] = useState<PaymentSettings>(initialPaymentSettings);
  const [themeSettings, setThemeSettingsState] = useState<ThemeSettings>(initialThemeSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const readLocalJson = <T,>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };

  const writeLocalJson = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Slider
    try {
      const { data: sliderData, error: sliderError } = await supabase
        .from('sliders')
        .select('*')
        .eq('active', true)
        .maybeSingle();

      if (sliderError) throw sliderError;

      if (sliderData) {
        const nextSlides = sliderData.slides || [];
        setSlidesState(nextSlides);
        writeLocalJson("shop_slides", nextSlides);
      }
      setOfflineMode(false);
    } catch {
      const localSlides = readLocalJson<Slide[]>("shop_slides");
      if (localSlides) setSlidesState(localSlides);
      setOfflineMode(true);
    }

    // Fetch Settings
    try {
      const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*');
      if (settingsError) throw settingsError;

      if (settingsData) {
        const general = settingsData.find((s: any) => s.key === 'general_settings')?.value;
        if (general) {
          const parsed = JSON.parse(general);
          setGeneralSettingsState(prev => ({ ...prev, ...parsed }));
          writeLocalJson("shop_general_settings", { ...initialGeneralSettings, ...parsed });
        }

        const header = settingsData.find((s: any) => s.key === 'header_settings')?.value;
        if (header) {
          const parsed = JSON.parse(header);
          setHeaderSettingsState(prev => ({ ...prev, ...parsed }));
          writeLocalJson("shop_header_settings", { ...initialHeaderSettings, ...parsed });
        }

        const payment = settingsData.find((s: any) => s.key === 'payment_settings')?.value;
        if (payment) {
          const parsed = JSON.parse(payment);
          setPaymentSettingsState(prev => ({ ...prev, ...parsed }));
          writeLocalJson("shop_payment_settings", { ...initialPaymentSettings, ...parsed });
        }

        const theme = settingsData.find((s: any) => s.key === 'theme_settings')?.value;
        if (theme) {
          const parsed = JSON.parse(theme);
          setThemeSettingsState(prev => ({ ...prev, ...parsed }));
          writeLocalJson("shop_theme_settings", { ...initialThemeSettings, ...parsed });
        }
      }
      setOfflineMode(false);
    } catch {
      const localGeneral = readLocalJson<GeneralSettings>("shop_general_settings");
      if (localGeneral) setGeneralSettingsState(prev => ({ ...prev, ...localGeneral }));

      const localHeader = readLocalJson<HeaderSettings>("shop_header_settings");
      if (localHeader) setHeaderSettingsState(prev => ({ ...prev, ...localHeader }));

      const localPayment = readLocalJson<PaymentSettings>("shop_payment_settings");
      if (localPayment) setPaymentSettingsState(prev => ({ ...prev, ...localPayment }));

      const localTheme = readLocalJson<ThemeSettings>("shop_theme_settings");
      if (localTheme) setThemeSettingsState(prev => ({ ...prev, ...localTheme }));

      setOfflineMode(true);
    }

    // Cart stays in localStorage as it's client-side only usually
    const savedCart = localStorage.getItem("shop_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setSlides = async (newSlides: Slide[]) => {
    setSlidesState(newSlides);
    writeLocalJson("shop_slides", newSlides);
    // In a real CMS, we'd update the 'sliders' table
    try {
      await supabase.from('sliders').upsert({
          id: 'main-slider',
          name: 'Main Slider',
          slides: newSlides,
          active: true
      });
      setOfflineMode(false);
    } catch {
      setOfflineMode(true);
    }
  };

  const setGeneralSettings = async (settings: GeneralSettings) => {
    setGeneralSettingsState(settings);
    writeLocalJson("shop_general_settings", settings);
    try {
      await supabase.from('settings').upsert({
          key: 'general_settings',
          value: JSON.stringify(settings)
      });
      setOfflineMode(false);
    } catch {
      setOfflineMode(true);
    }
  };

  const setHeaderSettings = async (settings: HeaderSettings) => {
    setHeaderSettingsState(settings);
    writeLocalJson("shop_header_settings", settings);
    try {
      await supabase.from('settings').upsert({
          key: 'header_settings',
          value: JSON.stringify(settings)
      });
      setOfflineMode(false);
    } catch {
      setOfflineMode(true);
    }
  };

  const setPaymentSettings = async (settings: PaymentSettings) => {
    setPaymentSettingsState(settings);
    writeLocalJson("shop_payment_settings", settings);
    try {
      await supabase.from('settings').upsert({
          key: 'payment_settings',
          value: JSON.stringify(settings)
      });
      setOfflineMode(false);
    } catch {
      setOfflineMode(true);
    }
  };

  const setThemeSettings = async (settings: ThemeSettings) => {
    setThemeSettingsState(settings);
    writeLocalJson("shop_theme_settings", settings);
    try {
      await supabase.from('settings').upsert({
          key: 'theme_settings',
          value: JSON.stringify(settings)
      });
      setOfflineMode(false);
    } catch {
      setOfflineMode(true);
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("shop_cart", JSON.stringify(newCart));
  };

  const addSlide = (slide: Slide) => setSlides([...slides, slide]);
  const removeSlide = (id: string) => setSlides(slides.filter(s => s.id !== id));
  const updateSlide = (id: string, slide: Slide) => setSlides(slides.map(s => s.id === id ? slide : s));

  const addToCart = (product: Product, quantity = 1, variation?: Variation) => {
    const cartId = variation ? `${product.id}-${variation.id}` : product.id;
    const existing = cart.find(c => c.cartId === cartId);
    
    // Calculate price based on variation if selected
    const price = variation ? variation.price : product.price;

    if (existing) {
      saveCart(cart.map(c => c.cartId === cartId ? { ...c, quantity: c.quantity + quantity } : c));
    } else {
      saveCart([...cart, { ...product, quantity, selectedVariation: variation, cartId, price }]);
    }
  };

  const removeFromCart = (cartId: string) => saveCart(cart.filter(c => c.cartId !== cartId));
  
  const updateCartQuantity = (cartId: string, delta: number) => {
    saveCart(cart.map(c => {
      if (c.cartId === cartId) {
        return { ...c, quantity: Math.max(1, c.quantity + delta) };
      }
      return c;
    }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("shop_cart");
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ShopContext.Provider value={{
      slides, setSlides, addSlide, removeSlide, updateSlide,
      generalSettings, setGeneralSettings,
      headerSettings, setHeaderSettings,
      paymentSettings, setPaymentSettings,
      themeSettings, setThemeSettings,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount,
      loading, refreshData: fetchData
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
