"use client";

import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MenuItem, WidgetArea } from "@/lib/types";
import Link from "next/link";

export default function Footer() {
  const { themeSettings } = useShop();
  const [widgetAreas, setWidgetAreas] = useState<WidgetArea[]>([]);

  useEffect(() => {
    const fetchFooterWidgets = async () => {
        // Fetch footer areas
        const { data: areas } = await supabase
            .from('widget_areas')
            .select('*')
            .ilike('id', 'footer-%')
            .order('name');

        if (areas) {
            // Fetch widgets for these areas
            const { data: widgets } = await supabase
                .from('widgets')
                .select('*')
                .in('area_id', areas.map(a => a.id))
                .order('order');

            const fullAreas = areas.map(area => ({
                ...area,
                widgets: widgets?.filter(w => w.area_id === area.id) || []
            }));

            // Sort by id to ensure column order (footer-1, footer-2, etc)
            fullAreas.sort((a, b) => a.id.localeCompare(b.id));
            setWidgetAreas(fullAreas);
        }
    };

    fetchFooterWidgets();
  }, []);

  const renderWidget = (widget: any) => {
      switch (widget.type) {
          case 'text':
          case 'custom_html':
              return <div dangerouslySetInnerHTML={{ __html: widget.settings.text || '' }} className="text-sm opacity-80 leading-relaxed" />;
          
          case 'image':
              return widget.settings.url ? (
                  <img src={widget.settings.url} alt={widget.title} className="max-w-full h-auto rounded" />
              ) : null;

          case 'search':
              return (
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full bg-black/20 px-4 py-2 rounded focus:outline-none focus:ring-1 border border-white/10 text-sm"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    />
                </div>
              );

          // Add more widget renderers as needed
          default:
              return null;
      }
  };

  return (
    <footer 
      className="pt-12 pb-6 mt-auto transition-colors duration-300"
      style={{ backgroundColor: themeSettings.footerBackgroundColor, color: themeSettings.footerTextColor }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* If we have widgets, render them dynamically */}
            {widgetAreas.length > 0 ? (
                widgetAreas.map(area => (
                    <div key={area.id} className="footer-widget-area">
                        {area.widgets.map(widget => (
                            <div key={widget.id} className="mb-6 last:mb-0">
                                {widget.title && <h4 className="text-lg font-semibold mb-4">{widget.title}</h4>}
                                {renderWidget(widget)}
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                // Fallback / Default Footer Content if no widgets configured
                <>
                    <div>
                        <h3 className="text-xl font-bold mb-4" style={{ color: themeSettings.primaryColor }}>LCP Auto Cars</h3>
                        <p className="text-sm leading-relaxed opacity-80">
                        Your trusted partner for car tuning and auto parts. We provide fully-registered tunings and high-quality service.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
                        <ul className="space-y-3 text-sm opacity-80">
                        <li className="flex items-start space-x-3">
                            <Phone className="w-4 h-4 mt-1" style={{ color: themeSettings.primaryColor }} />
                            <span>+62 878-9674-4455</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <Mail className="w-4 h-4 mt-1" style={{ color: themeSettings.primaryColor }} />
                            <span>info@example.com</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <MapPin className="w-4 h-4 mt-1" style={{ color: themeSettings.primaryColor }} />
                            <span>123 Auto Street, Car City</span>
                        </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
                        <div className="flex flex-col space-y-3">
                        <input 
                            type="email" 
                            placeholder="Your email" 
                            className="bg-black/20 px-4 py-2 rounded focus:outline-none focus:ring-1 border border-white/10"
                            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                        />
                        <button 
                            className="px-4 py-2 rounded transition font-medium hover:opacity-90"
                            style={{ backgroundColor: themeSettings.footerButtonColor, color: themeSettings.footerButtonTextColor }}
                        >
                            Subscribe
                        </button>
                        </div>
                    </div>
                </>
            )}
        </div>
        
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center opacity-60" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-sm">&copy; {new Date().getFullYear()} LCP Auto Cars. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition"><Instagram className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
