import "./globals.css";
import { Providers } from "@/components/Providers";
import ThemeProvider from "@/components/ThemeProvider";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("key,value")
      .in("key", ["site_title", "site_name", "site_tagline"]);

    if (error) throw error;

    const values = new Map((data || []).map((row) => [row.key, row.value]));
    const title = values.get("site_title") || values.get("site_name") || "CGMscale";
    const tagline = values.get("site_tagline") || "";

    return {
      title,
      description: tagline ? `${title} - ${tagline}` : `${title}`,
    };
  } catch {
    return {
      title: "CGMscale",
      description: "CGMscale",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <ThemeProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
