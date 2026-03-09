"use client";

import { useState } from "react";
import { useShop, Slide } from "@/context/ShopContext";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon,
  Save,
  X,
  Upload
} from "lucide-react";

export default function AdminSlider() {
  const { slides, setSlides, addSlide, removeSlide } = useShop();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Slide | null>(null);

  const handleEdit = (slide: Slide) => {
    setIsEditing(slide.id);
    setEditForm(slide);
  };

  const handleSave = () => {
    if (editForm) {
      if (isEditing === 'new') {
        // Generate a random ID for new slides
        addSlide({ ...editForm, id: crypto.randomUUID() });
      } else {
        setSlides(slides.map(s => s.id === editForm.id ? editForm : s));
      }
      setIsEditing(null);
      setEditForm(null);
    }
  };

  const handleAddNew = () => {
    setIsEditing('new');
    setEditForm({
      id: "",
      title: "",
      subtitle: "",
      description: "",
      image: "",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      buttonPosition: "left",
      secondButtonText: "Learn More",
      secondButtonLink: "/about-us"
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (editForm) {
        setEditForm({ ...editForm, image: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Homepage Slider</h2>
        <button 
          onClick={handleAddNew}
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative h-48 bg-gray-100">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(slide)}
                    className="p-2 bg-white text-gray-900 rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeSlide(slide.id)}
                    className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{slide.subtitle}</p>
                <h3 className="text-xl font-bold italic uppercase">{slide.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing !== null && editForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">{isEditing === 'new' ? "Add New Slide" : "Edit Slide"}</h3>
              <button onClick={() => setIsEditing(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                  <input 
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subtitle</label>
                  <input 
                    value={editForm.subtitle}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image URL</label>
                <div className="flex gap-2">
                    <input 
                    value={editForm.image}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                    placeholder="https://..."
                    />
                    <button 
                        type="button"
                        onClick={() => document.getElementById('slider-upload')?.click()}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-gray-200 flex items-center gap-2 uppercase tracking-widest whitespace-nowrap"
                    >
                        <Upload className="w-4 h-4" />
                        Upload
                    </button>
                    <input 
                        id="slider-upload" 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                    />
                </div>
                {editForm.image && (
                    <div className="mt-2 h-32 w-full bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative">
                        <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Button Text</label>
                  <input 
                    value={editForm.buttonText}
                    onChange={(e) => setEditForm({ ...editForm, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Button Link</label>
                  <input 
                    value={editForm.buttonLink}
                    onChange={(e) => setEditForm({ ...editForm, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Button Position</label>
                <select 
                  value={editForm.buttonPosition || 'left'}
                  onChange={(e) => setEditForm({ ...editForm, buttonPosition: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Second Button Text (Optional)</label>
                  <input 
                    value={editForm.secondButtonText || ''}
                    onChange={(e) => setEditForm({ ...editForm, secondButtonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                    placeholder="e.g. Learn More"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Second Button Link</label>
                  <input 
                    value={editForm.secondButtonLink || ''}
                    onChange={(e) => setEditForm({ ...editForm, secondButtonLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                    placeholder="e.g. /about-us"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button 
                onClick={() => setIsEditing(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-orange-600 rounded-lg transition-colors shadow-lg shadow-primary/20"
              >
                Save Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
