"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type AdminLayoutStyle = "wordpress" | "modern" | "minimal";

interface AdminContextType {
  layoutStyle: AdminLayoutStyle;
  setLayoutStyle: (style: AdminLayoutStyle) => void;
  siteName: string;
  setSiteName: (name: string) => void;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [layoutStyle, setLayoutStyleState] = useState<AdminLayoutStyle>("wordpress");
  const [siteName, setSiteNameState] = useState("LCP Auto Cars");
  const [adminEmail, setAdminEmailState] = useState("admin@lcpautocars.com");
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

        const email = data.find(s => s.key === 'admin_email')?.value;
        if (email) setAdminEmailState(email);
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
    await supabase.from("settings").upsert([
      { key: "site_name", value: name },
      { key: "site_title", value: name },
    ]);
  };

  const setAdminEmail = async (email: string) => {
    setAdminEmailState(email);
    await supabase.from("settings").upsert({
      key: "admin_email",
      value: email
    });
  };

  return (
    <AdminContext.Provider value={{ 
      layoutStyle, 
      setLayoutStyle, 
      siteName, 
      setSiteName, 
      adminEmail, 
      setAdminEmail, 
      loading 
    }}>
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
