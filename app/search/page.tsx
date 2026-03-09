"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`);

      if (error) {
        console.error('Error searching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        Search Results for "{query}"
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : products.length > 0 ? (
        <ProductGrid products={products} title={`Found ${products.length} products`} />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
}
