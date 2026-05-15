import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import { Product } from "@/lib/types";

export const revalidate = 0;

async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variations(*), categories(slug)")
    .ilike("name", `%${query}%`);

  if (error || !data) return [];

  return (data as any[]).map((p) => ({
    ...p,
    category: p.categories?.slug || "",
    variations: p.product_variations || [],
  })) as Product[];
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const sp = (await searchParams) || {};
  const query = (sp.q || "").toString();
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        Search Results for "{query}"
      </h1>

      {products.length > 0 ? (
        <ProductGrid products={products} title={`Found ${products.length} products`} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {query ? "No products found matching your search." : "Type something to search."}
          </p>
        </div>
      )}
    </div>
  );
}
