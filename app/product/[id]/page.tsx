"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product, Variation } from "@/lib/types";
import { useShop } from "@/context/ShopContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2, ShoppingCart, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const { addToCart } = useShop();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variations(*), categories(slug, name)')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
        return;
      }

      const formattedProduct: Product = {
        ...data,
        category: data.categories?.slug || '',
        variations: data.product_variations || []
      };

      setProduct(formattedProduct);
      
      // Auto-select first variation if exists
      if (formattedProduct.variations && formattedProduct.variations.length > 0) {
        setSelectedVariation(formattedProduct.variations[0]);
      }
      
      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    setAdding(true);
    addToCart(product, quantity, selectedVariation || undefined);
    
    setTimeout(() => {
      setAdding(false);
      router.push('/cart');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background-shade">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background-shade">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link href="/" className="text-primary hover:underline font-bold">Return to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedVariation ? selectedVariation.price : product.price;

  return (
    <main className="min-h-screen flex flex-col bg-background-shade">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary mb-8 uppercase tracking-wider">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Shop
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="p-8 bg-gray-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
              <div className="aspect-square w-full max-w-md relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-auto">
                <div className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">
                  {product.categories?.name || "Product"}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 italic uppercase mb-4">
                  {product.name}
                </h1>
                
                <div className="text-3xl font-black text-gray-900 mb-8">
                  {formatCurrency(currentPrice, "USD")}
                </div>

                <div className="prose prose-sm text-gray-600 mb-8">
                  <p>{product.description || "No description available."}</p>
                </div>

                {/* Variations */}
                {product.type === 'variable' && product.variations && product.variations.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-3">
                      Select Option
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.variations.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariation(v)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all uppercase tracking-wider ${
                            selectedVariation?.id === v.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <label className="block text-xs font-black text-gray-900 uppercase tracking-widest mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 text-gray-500 hover:text-primary transition-colors"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 text-gray-500 hover:text-primary transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 border-t border-gray-100">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {adding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding to Cart...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
