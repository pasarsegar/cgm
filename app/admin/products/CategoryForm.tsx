"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Trash2 } from "lucide-react";
import { Category, SubCategory } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name required"),
  slug: z.string().min(1, "Slug required"),
  parent_id: z.string().optional().nullable(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

export default function CategoryForm({ category, categories, onClose, onSave }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      parent_id: category?.parent_id || "", // Ensure empty string for controlled input
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        parent_id: category.parent_id || "",
      });
    } else {
      reset({
        name: "",
        slug: "",
        parent_id: "",
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      parent_id: data.parent_id || null, // Convert empty string back to null
    };

    let error;
    try {
      if (category?.id) {
        const { error: updateError } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', category.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('categories')
          .insert([{ ...payload, id: crypto.randomUUID() }]);
        error = insertError;
      }

      if (error) throw error;
      onSave();
    } catch (err: any) {
      alert('Error saving category: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? "Edit Category" : "Add New Category"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
              <input 
                {...register("name")}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. Hardware"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
              <input 
                {...register("slug")}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. hardware"
              />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Category (Optional)</label>
              <select 
                {...register("parent_id")}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              >
                <option value="">None (Top Level)</option>
                {categories
                  .filter(c => !c.parent_id && c.id !== category?.id) // Only show top-level categories and prevent self-referencing
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors uppercase text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 uppercase text-sm shadow-lg shadow-primary/20">
              {isSubmitting ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
