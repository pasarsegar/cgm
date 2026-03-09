import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RevSlider from "@/components/home/RevSlider";
import ProductGrid from "@/components/ProductGrid";
import { supabase } from "@/lib/supabase";
import parse from 'html-react-parser';
import BuilderRenderer from "@/components/builder/BuilderRenderer";

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

async function getHomePageContent() {
    const { data: page } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'home')
        .eq('status', 'publish')
        .single();
    return page;
}

export default async function Home() {
  const products = await getLatestProducts();
  const homePage = await getHomePageContent();

  return (
    <main className="min-h-screen flex flex-col bg-background-shade">
      <Header />
      <div className="flex-grow">
        {homePage ? (
            homePage.content && homePage.content.trim().startsWith('[') ? (
                <BuilderRenderer content={homePage.content} />
            ) : (
                <div className="prose max-w-none text-gray-700 dark:text-gray-300">
                    {parse(homePage.content)}
                </div>
            )
        ) : (
            <>
                <RevSlider />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <ProductGrid products={products} title="Latest Tuning Parts" />
                </div>
            </>
        )}
      </div>
      <Footer />
    </main>
  );
}
