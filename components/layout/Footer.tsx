"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BuilderRendererLite from "@/components/builder/BuilderRendererLite";
import parse from "html-react-parser";
import { useAdmin } from "@/lib/admin-context";

type WidgetType = "search" | "recent_posts" | "categories" | "custom_html" | "text" | "image";
type FooterWidget = {
  id: string;
  type: WidgetType;
  title: string;
  settings: Record<string, any>;
};

type FooterWidgetArea = {
  id: string;
  name: string;
  description?: string;
  widgets: FooterWidget[];
};

export default function Footer() {
  const { siteName } = useAdmin();
  const [footerContent, setFooterContent] = useState<string>("");
  const [footerWidgetAreas, setFooterWidgetAreas] = useState<FooterWidgetArea[]>([]);

  useEffect(() => {
    const fetchFooter = async () => {
      const readLocal = () => {
        try {
          const raw = localStorage.getItem("local_pages_v1");
          if (!raw) return "";
          const pages = JSON.parse(raw);
          if (!Array.isArray(pages)) return "";
          const page = pages.find((p: any) => p?.slug === "site-footer" && p?.status === "publish");
          return page?.content || "";
        } catch {
          return "";
        }
      };

      try {
        const { data, error } = await supabase
          .from("pages")
          .select("content")
          .eq("slug", "site-footer")
          .eq("status", "publish")
          .limit(1);

        if (error) {
          setFooterContent(readLocal());
          return;
        }
        const content = (data && (data as any[])[0]?.content) || "";
        setFooterContent(content);
      } catch {
        setFooterContent(readLocal());
      }
    };

    fetchFooter();
  }, []);

  useEffect(() => {
    const readLocal = () => {
      try {
        const raw = localStorage.getItem("local_widget_areas_v1");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed as FooterWidgetArea[];
      } catch {
        return [];
      }
    };

    const fetchFooterWidgets = async () => {
      const local = readLocal();
      if (local.length > 0) setFooterWidgetAreas(local);

      try {
        const { data: areas, error: areasError } = await supabase
          .from("widget_areas")
          .select("*")
          .in("id", ["footer-1", "footer-2", "footer-3", "footer-4"])
          .order("name");
        if (areasError) throw areasError;

        const { data: widgets, error: widgetsError } = await supabase
          .from("widgets")
          .select("*")
          .in("area_id", ["footer-1", "footer-2", "footer-3", "footer-4"])
          .order("order");
        if (widgetsError) throw widgetsError;

        const combined: FooterWidgetArea[] = (areas || []).map((area: any) => ({
          ...area,
          widgets: (widgets || [])
            .filter((w: any) => w.area_id === area.id)
            .map((w: any) => ({
              id: w.id,
              type: w.type,
              title: w.title,
              settings: w.settings || {},
            })),
        }));

        setFooterWidgetAreas(combined);
      } catch {
        // keep local
      }
    };

    fetchFooterWidgets();
  }, []);

  if (footerContent) {
    return (
      <footer style={{ backgroundColor: "var(--footer-bg)", color: "var(--footer-text)" }}>
        {footerContent.trim().startsWith("[") ? (
          <BuilderRendererLite content={footerContent} />
        ) : (
          <>{parse(footerContent)}</>
        )}
      </footer>
    );
  }

  const hasFooterWidgets = footerWidgetAreas.some((a) => (a.widgets || []).length > 0);

  if (hasFooterWidgets) {
    return (
      <footer className="pt-16 pb-8" style={{ backgroundColor: "var(--footer-bg)", color: "var(--footer-text)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {footerWidgetAreas.map((area) => (
              <div key={area.id} className="space-y-6">
                {area.widgets.map((widget) => (
                  <div key={widget.id} className="space-y-3">
                    {widget.title ? (
                      <h4 className="text-sm font-black uppercase tracking-widest text-primary">{widget.title}</h4>
                    ) : null}
                    {widget.type === "text" || widget.type === "custom_html" ? (
                      <div className="text-sm opacity-70">{parse(widget.settings.text || "")}</div>
                    ) : widget.type === "image" ? (
                      widget.settings.url ? (
                        widget.settings.link ? (
                          <a href={widget.settings.link} className="inline-block">
                            <img
                              src={widget.settings.url}
                              alt={widget.settings.alt || ""}
                              className="max-w-full h-auto rounded"
                            />
                          </a>
                        ) : (
                          <img
                            src={widget.settings.url}
                            alt={widget.settings.alt || ""}
                            className="max-w-full h-auto rounded"
                          />
                        )
                      ) : null
                    ) : widget.type === "search" ? (
                      <form action="/search" className="flex space-x-2">
                        <input
                          name="q"
                          placeholder="Search..."
                          className="flex-1 bg-current/5 border-none px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-current placeholder:text-current/50"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                          style={{ backgroundColor: "var(--footer-button-bg)", color: "var(--footer-button-text)" }}
                        >
                          Search
                        </button>
                      </form>
                    ) : (
                      <div className="text-sm opacity-70" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-current/10 flex flex-col md:flex-row items-center justify-between text-xs opacity-50 space-y-4 md:space-y-0 uppercase tracking-widest font-bold">
            <p>© 2024 {siteName}. ALL RIGHTS RESERVED.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:opacity-100">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:opacity-100">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="pt-16 pb-8" style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--footer-text)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black italic" style={{ color: 'var(--footer-text)' }}>
                {siteName.split(" ")[0]}
                <span className="text-primary">{siteName.split(" ").slice(1).join("")}</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-70">
              Your premier partner for high-performance automotive tuning and premium car parts. Based in Jakarta, serving enthusiasts worldwide.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="#" className="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current"><Instagram className="w-4 h-4" /></Link>
              <Link href="#" className="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current"><Facebook className="w-4 h-4" /></Link>
              <Link href="#" className="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current"><Twitter className="w-4 h-4" /></Link>
              <Link href="#" className="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current"><Youtube className="w-4 h-4" /></Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary">Quick Links</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li><Link href="/shop" className="hover:opacity-100 transition-opacity">Shop All Parts</Link></li>
              <li><Link href="/tuning" className="hover:opacity-100 transition-opacity">Tuning Services</Link></li>
              <li><Link href="/about" className="hover:opacity-100 transition-opacity">Our Story</Link></li>
              <li><Link href="/contact" className="hover:opacity-100 transition-opacity">Contact Support</Link></li>
              <li><Link href="/shipping" className="hover:opacity-100 transition-opacity">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary">Contact Us</h4>
            <ul className="space-y-4 text-sm opacity-70">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Jl. Sudirman No. 45, Jakarta Selatan, 12190</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>+62 21 555 1234</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>info@lcpautocars.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-primary">Newsletter</h4>
            <p className="text-sm opacity-70">Subscribe to get latest tuning news and special offers.</p>
            <form className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 bg-current/5 border-none px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-current placeholder:text-current/50"
              />
              <button 
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                style={{ backgroundColor: 'var(--footer-button-bg)', color: 'var(--footer-button-text)' }}
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-current/10 flex flex-col md:flex-row items-center justify-between text-xs opacity-50 space-y-4 md:space-y-0 uppercase tracking-widest font-bold">
          <p>© 2024 {siteName}. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="hover:opacity-100">Privacy Policy</Link>
            <Link href="/terms" className="hover:opacity-100">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
