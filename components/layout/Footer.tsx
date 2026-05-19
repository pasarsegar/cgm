"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BuilderRendererLite from "@/components/builder/BuilderRendererLite";
import parse from "html-react-parser";
import { useAdmin } from "@/lib/admin-context";
import { useShop } from "@/context/ShopContext";
import { MenuItem } from "@/lib/types";

type WidgetType = "search" | "recent_posts" | "categories" | "custom_html" | "text" | "image" | "contact_info" | "social_links" | "nav_menu";
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
  const { themeSettings } = useShop();
  const [footerContent, setFooterContent] = useState<string>("");
  const [footerWidgetAreas, setFooterWidgetAreas] = useState<FooterWidgetArea[]>([]);
  const [menus, setMenus] = useState<Record<string, MenuItem[]>>({});

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const { data } = await supabase.from('menus').select('*');
        if (data) {
          const menuMap: Record<string, MenuItem[]> = {};
          data.forEach((m: any) => {
            menuMap[m.id] = m.items || [];
          });
          setMenus(menuMap);
        }
      } catch (err) {
        console.error('Error fetching menus for footer:', err);
      }
    };
    fetchMenus();
  }, []);

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
          .ilike("id", "footer-%")
          .order("id");
        if (areasError) throw areasError;

        const { data: widgets, error: widgetsError } = await supabase
          .from("widgets")
          .select("*")
          .ilike("area_id", "footer-%")
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

  const hasFooterWidgets = footerWidgetAreas.some((a) => (a.widgets || []).length > 0);

  // 1. If we have widgets in Supabase, show them
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
                    ) : widget.type === "contact_info" ? (
                      <ul className="space-y-4 text-sm opacity-70">
                        {widget.settings.address && (
                          <li className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{widget.settings.address}</span>
                          </li>
                        )}
                        {widget.settings.phone && (
                          <li className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{widget.settings.phone}</span>
                          </li>
                        )}
                        {widget.settings.email && (
                          <li className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{widget.settings.email}</span>
                          </li>
                        )}
                      </ul>
                    ) : widget.type === "social_links" ? (
                      <div className="flex items-center space-x-4">
                        {widget.settings.instagram && (
                          <Link href={widget.settings.instagram} target="_blank" className="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">
                            <Instagram className="w-4 h-4" />
                          </Link>
                        )}
                        {widget.settings.facebook && (
                          <Link href={widget.settings.facebook} target="_blank" className="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">
                            <Facebook className="w-4 h-4" />
                          </Link>
                        )}
                        {widget.settings.twitter && (
                          <Link href={widget.settings.twitter} target="_blank" className="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">
                            <Twitter className="w-4 h-4" />
                          </Link>
                        )}
                        {widget.settings.youtube && (
                          <Link href={widget.settings.youtube} target="_blank" className="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">
                            <Youtube className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    ) : widget.type === "nav_menu" ? (
                      <ul className="space-y-3 text-sm opacity-70">
                        {(menus[widget.settings.menuId] || []).map((item) => (
                          <li key={item.id}>
                            <Link href={item.url || "#"} className="hover:opacity-100 transition-opacity">
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
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
            <p>&copy; {themeSettings.footerYear || new Date().getFullYear()} {themeSettings.footerCopyrightText || `${siteName}. ALL RIGHTS RESERVED.`}</p>
            <div className="flex space-x-6">
              {themeSettings.showFooterPrivacy === true && (
                <Link href="/privacy" className="hover:opacity-100">
                  Privacy Policy
                </Link>
              )}
              {themeSettings.showFooterTerms === true && (
                <Link href="/terms" className="hover:opacity-100">
                  Terms of Service
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // 2. If NO widgets, but there is "Site Footer" page content, show that
  if (footerContent && footerContent.trim().length > 0) {
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

  // 3. If everything is empty, show absolutely nothing
  return null;
}
