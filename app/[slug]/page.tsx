import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import parse from 'html-react-parser';

export const revalidate = 0; // Dynamic

async function getPage(slug: string) {
  const { data: page, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'publish')
    .single();

  if (error || !page) return null;
  return page;
}

async function getCategory(slug: string) {
    const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
    
    if (error || !category) return null;
    return category;
}

async function getCategoryProducts(categoryId: string) {
    // Fetch products and their variations
    const { data: products, error } = await supabase
        .from('products')
        .select('*, product_variations(*), categories(slug)')
        .or(`category_id.eq.${categoryId},sub_category_id.eq.${categoryId}`);
    
    if (error) return [];
    
    // Map to the frontend Product interface
    return (products || []).map(p => ({
        ...p,
        category: p.categories?.slug || '',
        variations: p.product_variations || []
    }));
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  const category = await getCategory(slug);

  // If neither page nor category exists, 404
  if (!page && !category) {
    notFound();
  }

  // Determine content source
  const title = page?.title || category?.name;
  const content = page?.content || ""; 

  // Check if we need to show products
  const showProducts = !!category;
  const categoryProducts = showProducts ? await getCategoryProducts(category.id) : [];

  return (
    <main className="min-h-screen flex flex-col bg-background-shade">
      <Header />
      
      {/* Page Header / Hero Area */}
      {(slug === 'hardware-licence' || slug === 'custom-tunes' || slug === 'dealers' || showProducts) ? (
          <div className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider">{title}</h1>
                {content && (
                    <div className="max-w-2xl mx-auto text-gray-300 prose prose-invert">
                        {parse(content)}
                    </div>
                )}
            </div>
          </div>
      ) : (
          <div className="container mx-auto px-4 py-12">
               <h1 className="text-4xl font-bold mb-8 text-gray-900">{title}</h1>
               <div className="prose max-w-none text-gray-700">
                   {parse(content)}
               </div>
          </div>
      )}

      {/* Product Grid for Categories */}
      {showProducts && (
        <ProductGrid products={categoryProducts} title={title || ""} />
      )}

      <Footer />
    </main>
  );
}
