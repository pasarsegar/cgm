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
}

export interface HeaderSettings {
  height: string;
  backgroundColor: string;
  textColor: string;
  fontSize: string;
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
  footerBackgroundColor: string;
  footerTextColor: string;
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

const initialHeaderSettings: HeaderSettings = {
  height: "80px",
  backgroundColor: "#ffffff",
  textColor: "#666666",
  fontSize: "14px"
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
  footerBackgroundColor: "#1d2327", // Default to dark footer to match server render
  footerTextColor: "#ffffff"
};

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [slides, setSlidesState] = useState<Slide[]>([]);
  const [headerSettings, setHeaderSettingsState] = useState<HeaderSettings>(initialHeaderSettings);
  const [paymentSettings, setPaymentSettingsState] = useState<PaymentSettings>(initialPaymentSettings);
  const [themeSettings, setThemeSettingsState] = useState<ThemeSettings>(initialThemeSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Slider
    const { data: sliderData } = await supabase
      .from('sliders')
      .select('*')
      .eq('active', true)
      .maybeSingle();
    
    if (sliderData) {
      setSlidesState(sliderData.slides || []);
    }

    // Fetch Settings
    const { data: settingsData } = await supabase.from('settings').select('*');
    if (settingsData) {
      const header = settingsData.find(s => s.key === 'header_settings')?.value;
      if (header) setHeaderSettingsState(prev => ({ ...prev, ...JSON.parse(header) }));

      const payment = settingsData.find(s => s.key === 'payment_settings')?.value;
      if (payment) setPaymentSettingsState(prev => ({ ...prev, ...JSON.parse(payment) }));

      const theme = settingsData.find(s => s.key === 'theme_settings')?.value;
      if (theme) setThemeSettingsState(prev => ({ ...prev, ...JSON.parse(theme) }));
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
    // In a real CMS, we'd update the 'sliders' table
    await supabase.from('sliders').upsert({
        id: 'main-slider',
        name: 'Main Slider',
        slides: newSlides,
        active: true
    });
  };

  const setHeaderSettings = async (settings: HeaderSettings) => {
    setHeaderSettingsState(settings);
    await supabase.from('settings').upsert({
        key: 'header_settings',
        value: JSON.stringify(settings)
    });
  };

  const setPaymentSettings = async (settings: PaymentSettings) => {
    setPaymentSettingsState(settings);
    await supabase.from('settings').upsert({
        key: 'payment_settings',
        value: JSON.stringify(settings)
    });
  };

  const setThemeSettings = async (settings: ThemeSettings) => {
    setThemeSettingsState(settings);
    await supabase.from('settings').upsert({
        key: 'theme_settings',
        value: JSON.stringify(settings)
    });
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

  const clearCart = () => saveCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ShopContext.Provider value={{
      slides, setSlides, addSlide, removeSlide, updateSlide,
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
