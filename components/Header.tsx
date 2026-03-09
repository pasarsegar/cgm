"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useShop } from "@/context/ShopContext";
import { supabase } from "@/lib/supabase";
import { MenuItem } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { currency } = useCurrency();
  const { headerSettings, cartCount } = useShop();
  const router = useRouter();

  useEffect(() => {
    const fetchMenu = async () => {
      const { data } = await supabase
        .from('menus')
        .select('items')
        .eq('location', 'header')
        .single();
      
      if (data?.items) {
        setMenuItems(data.items);
      }
    };

    fetchMenu();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const renderMenuItem = (item: MenuItem, isMobile = false) => {
    if (item.children && item.children.length > 0) {
      return (
        <div key={item.id} className={`group relative ${isMobile ? 'w-full' : ''}`}>
          <button 
            className={`flex items-center justify-between w-full ${isMobile ? 'py-2' : 'py-4'} text-${headerSettings.textColor} hover:text-${headerSettings.buttonColor} transition font-medium`}
            style={{ color: headerSettings.textColor }}
          >
            {item.label}
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
          
          <div className={`${isMobile ? 'pl-4 space-y-2' : 'absolute top-full left-0 bg-white shadow-lg min-w-[200px] py-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'}`}>
            {item.children.map(child => (
              <Link 
                key={child.id}
                href={child.url || '#'} 
                className={`block ${isMobile ? 'py-2' : 'px-4 py-2 hover:bg-gray-50'} text-sm text-gray-700`}
                onClick={() => isMobile && setIsMenuOpen(false)}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link 
        key={item.id}
        href={item.url || '#'} 
        className={`${isMobile ? 'py-2' : ''} transition font-medium`}
        style={{ color: headerSettings.textColor }}
        onClick={() => isMobile && setIsMenuOpen(false)}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header 
      className="bg-white shadow-md sticky top-0 z-50 transition-all duration-300"
      style={{ 
        backgroundColor: headerSettings.backgroundColor,
        height: isMenuOpen ? 'auto' : headerSettings.height 
      }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between" style={{ minHeight: headerSettings.height }}>
        <Link href="/" className="text-2xl font-bold flex items-center" style={{ color: headerSettings.buttonColor }}>
          {headerSettings.logoUrl ? (
            <img src={headerSettings.logoUrl} alt="LCP Auto Cars" style={{ height: headerSettings.logoHeight || '40px' }} />
          ) : (
            <>
                LCP Auto Cars
                {currency === "IDR" && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200">ID</span>}
            </>
          )}
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {menuItems.length > 0 ? (
            menuItems.map(item => renderMenuItem(item))
          ) : (
            // Fallback if no menu is set
            <>
                <Link href="/" className="transition font-medium" style={{ color: headerSettings.textColor }}>Home</Link>
                <Link href="/shop" className="transition font-medium" style={{ color: headerSettings.textColor }}>Shop</Link>
                <Link href="/about-us" className="transition font-medium" style={{ color: headerSettings.textColor }}>About Us</Link>
                <Link href="/contact" className="transition font-medium" style={{ color: headerSettings.textColor }}>Contact</Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {headerSettings.showSearch && (
            <div className="relative">
                {isSearchOpen ? (
                    <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm w-64 animate-in fade-in slide-in-from-right-4 duration-200">
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
                        className="hover:opacity-80 transition hidden sm:block"
                        style={{ color: headerSettings.textColor }}
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="w-5 h-5" />
                    </button>
                )}
            </div>
          )}
          
          {headerSettings.showAccount && (
            <Link href="/account" className="hover:opacity-80 transition hidden sm:block" style={{ color: headerSettings.textColor }}>
                <User className="w-5 h-5" />
            </Link>
          )}
          
          {headerSettings.showCart && (
            <Link href="/cart" className="hover:opacity-80 transition relative" style={{ color: headerSettings.textColor }}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                    <span 
                        className="absolute -top-2 -right-2 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                        style={{ backgroundColor: headerSettings.buttonColor, color: headerSettings.buttonTextColor }}
                    >
                        {cartCount}
                    </span>
                )}
            </Link>
          )}
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden hover:opacity-80 transition"
            style={{ color: headerSettings.textColor }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg absolute w-full left-0 z-50">
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
          
          <nav className="flex flex-col space-y-4">
            {menuItems.length > 0 ? (
                menuItems.map(item => renderMenuItem(item, true))
            ) : (
                <>
                    <Link href="/" className="text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link href="/shop" className="text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Shop</Link>
                    <Link href="/about-us" className="text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                    <Link href="/contact" className="text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
