"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/lib/admin-context";
import { useShop } from "@/context/ShopContext";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: string;
  label: string;
  type: 'page' | 'custom' | 'category';
  url?: string;
  children?: MenuItem[];
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { siteName } = useAdmin();
  const { headerSettings, cartCount } = useShop();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
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

  return (
    <header 
      className="w-full border-b border-gray-100 sticky top-0 z-[50] transition-colors"
      style={{ 
        backgroundColor: headerSettings.backgroundColor,
        height: headerSettings.height
      }}
    >
      {/* Top Bar (Optional) */}
      <div className="bg-[#1d2327] text-white py-1.5 px-4 text-[11px] text-center uppercase tracking-widest font-bold">
        Free Shipping on all Tuning Parts over $500
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-black italic text-[#1d2327]">
              {siteName.split(' ')[0]}<span className="text-primary">{siteName.split(' ').slice(1).join('') || 'AUTO'}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center h-full">
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
          <div className="flex items-center space-x-5">
            <button className="hover:text-primary transition-colors" style={{ color: headerSettings.textColor }}>
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account" className="hover:text-primary transition-colors" style={{ color: headerSettings.textColor }}>
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative hover:text-primary transition-colors" style={{ color: headerSettings.textColor }}>
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 rounded-full h-4 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-text-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 animate-in slide-in-from-top-5 duration-200">
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
