"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy,
  Loader2,
  Image as ImageIcon,
  FolderTree
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import ProductForm from "./ProductForm";
import CategoryForm from "./CategoryForm";

export default function AdminProducts() {
  const [view, setView] = useState<string | null>(null);
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    const updateFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      setView(params.get("view"));
    };

    updateFromLocation();

    const onPopState = () => updateFromLocation();
    window.addEventListener("popstate", onPopState);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (this: any, ...args: any[]) {
      originalPushState.apply(this, args as any);
      updateFromLocation();
    } as any;

    history.replaceState = function (this: any, ...args: any[]) {
      originalReplaceState.apply(this, args as any);
      updateFromLocation();
    } as any;

    return () => {
      window.removeEventListener("popstate", onPopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch products
    const { data: productsData } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (productsData) setProducts(productsData);
    if (categoriesData) setCategories(categoriesData);
    
    setLoading(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleProductIds = filteredProducts.map((p) => p.id as string);
  const visibleCategoryIds = filteredCategories.map((c) => c.id as string);

  const allVisibleProductsSelected =
    visibleProductIds.length > 0 && visibleProductIds.every((id) => selectedProductIds.includes(id));
  const allVisibleCategoriesSelected =
    visibleCategoryIds.length > 0 && visibleCategoryIds.every((id) => selectedCategoryIds.includes(id));

  const handleDuplicate = async (product: any) => {
    if (!confirm(`Duplicate "${product.name}"?`)) return;
    setLoading(true);

    try {
      // 1. Fetch full product details
      const { data: fullProduct, error: fetchError } = await supabase
        .from('products')
        .select('*, product_variations(*)')
        .eq('id', product.id)
        .single();

      if (fetchError || !fullProduct) throw new Error("Failed to fetch original product");

      // 2. Prepare new product data
      // Remove system fields and relations
      const { id, created_at, product_variations, categories, ...productData } = fullProduct;
      
      // We explicitly construct the payload to avoid sending extra fields (like 'slug' if it doesn't exist in DB)
      // and to ensure we send all required fields.
      const newProductData: any = {
        name: `${productData.name} (Copy)`,
        price: productData.price,
        image: productData.image,
        gallery: productData.gallery || [], // Ensure gallery is included (it's text[] in DB)
        description: productData.description,
        category_id: productData.category_id,
        sub_category_id: productData.sub_category_id,
        rating: productData.rating || 0,
        type: productData.type
      };

      // Remove undefined values
      Object.keys(newProductData).forEach(key => newProductData[key] === undefined && delete newProductData[key]);

      // 3. Insert new product
      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
            ...newProductData,
            id: crypto.randomUUID()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Duplicate variations if they exist
      if (product_variations && product_variations.length > 0) {
        const newVariations = product_variations.map((v: any) => {
          // Remove system fields from variation
          const { id, product_id, created_at, ...variationData } = v;
          return {
            ...variationData,
            id: crypto.randomUUID(),
            product_id: newProduct.id
          };
        });

        const { error: variationsError } = await supabase
          .from('product_variations')
          .insert(newVariations);

        if (variationsError) console.error("Error duplicating variations:", variationsError);
      }

      await fetchData();

    } catch (error: any) {
      alert('Error duplicating product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error deleting product: ' + error.message);
      } else {
        setSelectedProductIds((prev) => prev.filter((x) => x !== id));
        fetchData();
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error deleting category: ' + error.message);
      } else {
        setSelectedCategoryIds((prev) => prev.filter((x) => x !== id));
        fetchData();
      }
    }
  };

  const toggleSelectAllProducts = () => {
    if (allVisibleProductsSelected) {
      const visible = new Set(visibleProductIds);
      setSelectedProductIds((prev) => prev.filter((id) => !visible.has(id)));
      return;
    }
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleProductIds])));
  };

  const toggleSelectAllCategories = () => {
    if (allVisibleCategoriesSelected) {
      const visible = new Set(visibleCategoryIds);
      setSelectedCategoryIds((prev) => prev.filter((id) => !visible.has(id)));
      return;
    }
    setSelectedCategoryIds((prev) => Array.from(new Set([...prev, ...visibleCategoryIds])));
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectCategory = (id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const deleteSelectedProducts = async () => {
    const ids = selectedProductIds.filter((id) => visibleProductIds.includes(id));
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected product(s)?`)) return;

    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) {
      alert("Error deleting products: " + error.message);
      return;
    }
    setSelectedProductIds((prev) => prev.filter((id) => !ids.includes(id)));
    fetchData();
  };

  const deleteSelectedCategories = async () => {
    const ids = selectedCategoryIds.filter((id) => visibleCategoryIds.includes(id));
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected category(s)?`)) return;

    const { error } = await supabase.from("categories").delete().in("id", ids);
    if (error) {
      alert("Error deleting categories: " + error.message);
      return;
    }
    setSelectedCategoryIds((prev) => prev.filter((id) => !ids.includes(id)));
    fetchData();
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder={view === 'categories' ? "Search categories..." : "Search products..."}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {view === "categories" ? (
            <button
              onClick={deleteSelectedCategories}
              disabled={selectedCategoryIds.filter((id) => visibleCategoryIds.includes(id)).length === 0}
              className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 font-bold text-sm uppercase tracking-wider border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                Delete Selected ({selectedCategoryIds.filter((id) => visibleCategoryIds.includes(id)).length})
              </span>
            </button>
          ) : (
            <button
              onClick={deleteSelectedProducts}
              disabled={selectedProductIds.filter((id) => visibleProductIds.includes(id)).length === 0}
              className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 font-bold text-sm uppercase tracking-wider border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>
                Delete Selected ({selectedProductIds.filter((id) => visibleProductIds.includes(id)).length})
              </span>
            </button>
          )}
          <button 
            onClick={handleAddCategory}
            className="bg-secondary/10 hover:bg-secondary/20 text-secondary px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 font-bold text-sm uppercase tracking-wider border border-secondary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          {view !== 'categories' && (
            <button 
              onClick={handleAdd}
              className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
      ) : view === 'categories' ? (
        <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={allVisibleCategoriesSelected}
                    onChange={toggleSelectAllCategories}
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {filteredCategories.map((category) => {
                  const parent = categories.find(c => c.id === category.parent_id);
                  return (
                    <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedCategoryIds.includes(category.id)}
                            onChange={() => toggleSelectCategory(category.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex-shrink-0 flex items-center justify-center text-orange-500">
                                <FolderTree className="w-4 h-4" />
                            </div>
                            <div className="font-bold text-gray-900 text-sm">{category.name}</div>
                        </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono bg-gray-50/50 rounded px-2">
                            {category.slug}
                        </td>
                        <td className="px-6 py-4 text-sm">
                            {parent ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                                    {parent.name}
                                </span>
                            ) : (
                                <span className="text-gray-400 text-xs italic">-</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                            <button 
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            >
                            <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        </td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No categories found.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={allVisibleProductsSelected}
                    onChange={toggleSelectAllProducts}
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (USD)</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                        )}
                        </div>
                        <div>
                        <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {product.id.substring(0, 8)}...</div>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-800">
                        {product.categories?.name || 'Uncategorized'}
                    </span>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 text-sm">
                    {formatCurrency(product.price, "USD")}
                    </td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                        <button 
                        onClick={() => handleDuplicate(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Duplicate Product"
                        >
                        <Copy className="w-4 h-4" />
                        </button>
                        <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                        <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
                {filteredProducts.length === 0 && (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No products found.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      )}

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          categories={categories}
          onClose={() => setIsFormOpen(false)}
          onSave={() => {
            fetchData();
            setIsFormOpen(false);
          }}
        />
      )}

      {/* Category Form Modal */}
      {isCategoryFormOpen && (
        <CategoryForm 
          category={editingCategory}
          categories={categories}
          onClose={() => setIsCategoryFormOpen(false)}
          onSave={() => {
            fetchData();
            setIsCategoryFormOpen(false);
          }}
        />
      )}
    </div>
  );
}
