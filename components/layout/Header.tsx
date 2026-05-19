"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/lib/admin-context";
import { useShop } from "@/context/ShopContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/CurrencyContext";
import BuilderRendererLite from "@/components/builder/BuilderRendererLite";
import parse from "html-react-parser";

interface MenuItem {
  id: string;
  label: string;
  type: 'page' | 'custom' | 'category';
  url?: string;
  children?: MenuItem[];
}

type WidgetType = "search" | "recent_posts" | "categories" | "custom_html" | "text" | "image";
type HeaderWidget = {
  id: string;
  type: WidgetType;
  title: string;
  settings: Record<string, any>;
};

type HeaderBarSettings = {
  backgroundColor: string;
  textColor: string;
  message: string;
  messageAlign: "left" | "center" | "right";
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { siteName } = useAdmin();
  const { headerSettings, cartCount } = useShop();
  const { currency } = useCurrency();
  const router = useRouter();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [headerTopContent, setHeaderTopContent] = useState<string>("");
  const [headerTopWidgets, setHeaderTopWidgets] = useState<HeaderWidget[]>([]);
  const [secondaryMenuItems, setSecondaryMenuItems] = useState<MenuItem[]>([]);
  const [headerBarSettings, setHeaderBarSettings] = useState<HeaderBarSettings>({
    backgroundColor: "#1d2327",
    textColor: "#ffffff",
    message: "",
    messageAlign: "center",
  });

  useEffect(() => {
    fetchMenu();
    fetchHeaderTop();
    fetchHeaderTopWidgets();
    fetchSecondaryMenu();
    fetchHeaderBarSettings();
  }, []);

  const fetchMenu = async () => {
    const { data: menu } = await supabase
      .from('menus')
      .select('items')
      .eq('location', 'header')
      .single();

    if (menu && menu.items) {
      setMenuItems(menu.items);
    } else {
      // Fallback if no menu is defined
      setMenuItems([
        { id: '1', label: 'Shop', type: 'page', url: '/shop' },
        { id: '2', label: 'Tuning', type: 'page', url: '/tuning' },
        { id: '3', label: 'Services', type: 'page', url: '/services' },
        { id: '4', label: 'About', type: 'page', url: '/about' },
        { id: '5', label: 'Contact', type: 'page', url: '/contact' }
      ]);
    }
    setLoading(false);
  };

  const fetchSecondaryMenu = async () => {
    const { data: menu } = await supabase
      .from("menus")
      .select("items")
      .eq("location", "header-secondary")
      .maybeSingle();

    if (menu && (menu as any).items) {
      setSecondaryMenuItems((menu as any).items);
    } else {
      setSecondaryMenuItems([]);
    }
  };

  const fetchHeaderBarSettings = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "header_bar_settings")
        .maybeSingle();

      if (data?.value) {
        const parsed = JSON.parse(data.value);
        setHeaderBarSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  };

  const fetchHeaderTop = async () => {
    const readLocal = () => {
      try {
        const raw = localStorage.getItem("local_pages_v1");
        if (!raw) return "";
        const pages = JSON.parse(raw);
        if (!Array.isArray(pages)) return "";
        const page = pages.find((p: any) => p?.slug === "site-header" && p?.status === "publish");
        return page?.content || "";
      } catch {
        return "";
      }
    };

    try {
      const { data, error } = await supabase
        .from("pages")
        .select("content")
        .eq("slug", "site-header")
        .eq("status", "publish")
        .limit(1);

      if (error) {
        setHeaderTopContent(readLocal());
        return;
      }
      const content = (data && (data as any[])[0]?.content) || "";
      setHeaderTopContent(content);
    } catch {
      setHeaderTopContent(readLocal());
    }
  };

  const fetchHeaderTopWidgets = async () => {
    const readLocal = (): HeaderWidget[] => {
      try {
        const raw = localStorage.getItem("local_widget_areas_v1");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const area = parsed.find((a: any) => a?.id === "header-top");
        const widgets = (area?.widgets || []) as any[];
        return widgets.map((w) => ({
          id: w.id,
          type: w.type,
          title: w.title,
          settings: w.settings || {},
        }));
      } catch {
        return [];
      }
    };

    const local = readLocal();
    if (local.length > 0) setHeaderTopWidgets(local);

    try {
      const { data: widgets, error } = await supabase
        .from("widgets")
        .select("*")
        .eq("area_id", "header-top")
        .order("order");

      if (error) throw error;
      const normalized = (widgets || []).map((w: any) => ({
        id: w.id,
        type: w.type,
        title: w.title,
        settings: w.settings || {},
      }));
      setHeaderTopWidgets(normalized);
    } catch {
      // keep local
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header 
      className="w-full border-b border-gray-100 sticky top-0 z-[50] transition-colors"
      style={{ 
        backgroundColor: headerSettings.backgroundColor,
        height: headerSettings.height
      }}
    >
      {/* Top Bar (Optional) */}
      {headerSettings.topBarShow && (
        <div 
          className="py-1.5 px-4 text-[11px] text-center uppercase tracking-widest font-bold"
          style={{ 
            backgroundColor: headerSettings.topBarBackgroundColor, 
            color: headerSettings.topBarTextColor 
          }}
        >
          {headerSettings.topBarMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className={cn(
            "flex items-center h-full relative",
            headerSettings.logoPosition === 'center' ? 'justify-center' : 'justify-between'
        )}>
          {/* Logo */}
          <div className={cn(
              "flex-shrink-0 flex items-center z-20",
              headerSettings.logoPosition === 'center' ? 'absolute left-1/2 -translate-x-1/2' : 
              headerSettings.logoPosition === 'right' ? 'order-last' : 'order-first'
          )}>
            <Link href="/" className="flex items-center">
                {headerSettings.logoUrl ? (
                    <img src={headerSettings.logoUrl} alt={siteName} style={{ height: headerSettings.logoHeight || '40px' }} />
                ) : (
                    <span className="text-2xl font-black italic" style={{ color: headerSettings.textColor }}>
                    {siteName}
                    </span>
                )}
                
                {/* ID Country Badge */}
                {currency === "IDR" && (
                    <span className="ml-3 text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-wider">
                        ID
                    </span>
                )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className={cn(
              "hidden md:flex space-x-8 items-center h-full z-10",
              headerSettings.menuPosition === 'center' ? 'absolute left-1/2 -translate-x-1/2' : 
              headerSettings.menuPosition === 'right' ? 'ml-auto mr-20' : 'mr-auto ml-20'
          )}>
            {menuItems.map((item) => (
              <div key={item.id} className="relative group h-full flex items-center">
                <Link 
                  href={item.url || '#'} 
                  className="font-bold hover:text-primary uppercase tracking-wider transition-colors flex items-center h-full"
                  style={{ 
                    color: headerSettings.textColor,
                    fontSize: headerSettings.fontSize
                  }}
                >
                  {item.label}
                  {item.children && item.children.length > 0 && (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </Link>
                
                {/* Dropdown for sub-items */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute top-full left-0 w-48 bg-white shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    {item.children.map(child => (
                      <Link 
                        key={child.id}
                        href={child.url || '#'}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary border-b border-gray-50 last:border-0"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Icons */}
          <div className={cn(
              "flex items-center space-x-5 z-20",
              headerSettings.iconsPosition === 'left' ? 'order-first mr-auto' : 'ml-auto'
          )}>
            {headerSettings.showSearch && (
                <div className="relative">
                    {isSearchOpen ? (
                        <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm w-64 animate-in fade-in slide-in-from-right-4 duration-200 z-50">
                            <Search className="w-4 h-4 text-gray-400 mr-2" />
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Search..." 
                                className="flex-1 bg-transparent border-none outline-none text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => !searchQuery && setIsSearchOpen(false)}
                            />
                            <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-2 text-gray-400 hover:text-gray-600">
                                <X className="w-3 h-3" />
                            </button>
                        </form>
                    ) : (
                        <button 
                            className="hover:text-primary transition-colors" 
                            style={{ color: headerSettings.textColor }}
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )}
            
            {headerSettings.showAccount && (
                <Link href="/account" className="hover:text-primary transition-colors" style={{ color: headerSettings.textColor }}>
                    <User className="w-5 h-5" />
                </Link>
            )}
            
            {headerSettings.showCart && (
                <Link href="/cart" className="relative hover:text-primary transition-colors" style={{ color: headerSettings.textColor }}>
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                        <span 
                        className="absolute -top-2 -right-2 text-[10px] font-bold px-1.5 rounded-full h-4 flex items-center justify-center"
                        style={{ backgroundColor: headerSettings.buttonColor, color: headerSettings.buttonTextColor }}
                        >
                        {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                </Link>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-text-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ color: headerSettings.textColor }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {(secondaryMenuItems.length > 0 || headerBarSettings.message) && (
        <div
          className="border-t border-black/10"
          style={{ backgroundColor: headerBarSettings.backgroundColor, color: headerBarSettings.textColor }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              {headerBarSettings.message ? (
                <div
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest",
                    headerBarSettings.messageAlign === "left"
                      ? "text-left"
                      : headerBarSettings.messageAlign === "right"
                        ? "text-right"
                        : "text-center"
                  )}
                  style={{ color: headerBarSettings.textColor }}
                >
                  {headerBarSettings.message}
                </div>
              ) : (
                <div />
              )}

              {secondaryMenuItems.length > 0 && (
                <nav className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-widest">
                  {secondaryMenuItems.map((item) => (
                    <Link
                      key={item.id || item.label}
                      href={item.url || "#"}
                      className="hover:opacity-80 transition-opacity"
                      style={{ color: headerBarSettings.textColor }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 animate-in slide-in-from-top-5 duration-200">
          {headerSettings.showSearch && (
            <form onSubmit={handleSearch} className="mb-4 relative">
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          )}

          {menuItems.map((item) => (
            <div key={item.id}>
              <Link 
                href={item.url || '#'} 
                className="block text-sm font-bold text-text-muted hover:text-primary uppercase tracking-wider"
                onClick={() => !item.children?.length && setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
              {/* Mobile Submenu */}
              {item.children && item.children.length > 0 && (
                <div className="pl-4 mt-2 space-y-2 border-l border-gray-100">
                  {item.children.map(child => (
                    <Link
                      key={child.id}
                      href={child.url || '#'}
                      className="block text-sm text-gray-500 hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
