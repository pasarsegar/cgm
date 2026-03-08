"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type AdminLayoutStyle = "wordpress" | "modern" | "minimal";

interface AdminContextType {
  layoutStyle: AdminLayoutStyle;
  setLayoutStyle: (style: AdminLayoutStyle) => void;
  siteName: string;
  setSiteName: (name: string) => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [layoutStyle, setLayoutStyleState] = useState<AdminLayoutStyle>("wordpress");
  const [siteName, setSiteNameState] = useState("LCP Auto Cars");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const layout = data.find(s => s.key === 'admin_layout_style')?.value;
        if (layout) setLayoutStyleState(layout as AdminLayoutStyle);
        
        const name = data.find(s => s.key === 'site_name')?.value;
        if (name) setSiteNameState(name);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const setLayoutStyle = async (style: AdminLayoutStyle) => {
    setLayoutStyleState(style);
    await supabase.from('settings').upsert({
        key: 'admin_layout_style',
        value: style
    });
  };

  const setSiteName = async (name: string) => {
    setSiteNameState(name);
    await supabase.from('settings').upsert({
        key: 'site_name',
        value: name
    });
  };

  return (
    <AdminContext.Provider value={{ layoutStyle, setLayoutStyle, siteName, setSiteName, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
