import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RevSlider from "@/components/home/RevSlider";
import ProductGrid from "@/components/ProductGrid";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Dynamic

async function getLatestProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, product_variations(*), categories(slug)')
    .order('created_at', { ascending: false })
    .limit(6);
  
  if (error) return [];
  
  return (products || []).map(p => ({
    ...p,
    category: p.categories?.slug || '',
    variations: p.product_variations || []
  }));
}

export default async function Home() {
  const products = await getLatestProducts();

  return (
    <main className="min-h-screen flex flex-col bg-background-shade">
      <Header />
      <div className="flex-grow">
        <RevSlider />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductGrid products={products} title="Latest Tuning Parts" />
        </div>
      </div>
      <Footer />
    </main>
  );
}
