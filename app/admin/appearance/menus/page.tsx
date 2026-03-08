"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Trash2, 
  Search,
  Check,
  Settings,
  MousePointer2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface MenuItem {
  id: string;
  label: string;
  type: 'page' | 'custom' | 'category';
  url?: string;
  children?: MenuItem[];
  isOpen?: boolean;
}

interface Page {
  id: string;
  title: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Helper to ensure every item has a unique ID
const ensureIds = (items: any[]): MenuItem[] => {
  return items.map(item => ({
    ...item,
    id: item.id || crypto.randomUUID(),
    children: item.children ? ensureIds(item.children) : []
  }));
};

// Sortable Item Component
function SortableMenuItem({ 
  item, 
  toggleItem, 
  updateItemLabel, 
  removeItem 
}: { 
  item: MenuItem; 
  toggleItem: (id: string) => void;
  updateItemLabel: (id: string, newLabel: string) => void;
  removeItem: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-1">
      <div className="flex items-center group">
        <div className={cn(
          "flex-1 flex items-center bg-[#f6f7f7] border border-[#ccd0d4] hover:border-[#b1b4b6] transition-colors shadow-sm",
          isDragging && "border-primary ring-2 ring-primary/20 shadow-lg"
        )}>
          <div 
            {...attributes} 
            {...listeners} 
            className="p-3 border-r border-[#ccd0d4] text-gray-400 group-hover:text-gray-600 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1 px-3 py-2 flex items-center justify-between text-sm select-none">
            <span className="font-medium text-gray-700">{item.label}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-gray-100">{item.type}</span>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(item.id);
            }}
            className="p-3 border-l border-[#ccd0d4] text-gray-400 hover:text-primary hover:bg-gray-100 transition-all"
          >
            {item.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {item.isOpen && (
        <div className="ml-[41px] p-5 bg-white border border-[#ccd0d4] border-t-0 space-y-4 shadow-inner rounded-b-lg">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Navigation Label</label>
            <input 
              type="text" 
              className="w-full border border-gray-200 px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              value={item.label}
              onChange={(e) => updateItemLabel(item.id, e.target.value)}
            />
          </div>
          {item.url && (
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Original URL</label>
              <input type="text" className="w-full border border-gray-100 bg-gray-50 px-3 py-2 text-xs rounded text-gray-500 cursor-not-allowed" defaultValue={item.url} readOnly />
            </div>
          )}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeItem(item.id);
              }}
              className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Item
            </button>
            <button 
              type="button"
              className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider" 
              onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleItem(item.id);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Nested Items Rendering (Recursive) */}
      {item.children && item.children.length > 0 && (
        <div className="ml-10 space-y-1.5 mt-1.5 border-l-2 border-gray-100 pl-4">
          {item.children.map(child => (
            <div key={child.id} className="flex items-center bg-[#f6f7f7] border border-[#ccd0d4] p-3 text-sm group/child hover:border-gray-300 transition-colors">
              <span className="flex-1 font-medium text-gray-600">{child.label}</span>
              <button 
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeItem(child.id);
                }}
                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition-all"
                title="Remove Sub-item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminMenus() {
  const [activeMenuLocation, setActiveMenuLocation] = useState("header");
  const [menuName, setMenuName] = useState("Primary Menu");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data for sidebar
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  
  // Selection states
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Custom link state
  const [customLinkUrl, setCustomLinkUrl] = useState("http://");
  const [customLinkText, setCustomLinkText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(TouchSensor, {
        activationConstraint: {
            delay: 200,
            tolerance: 5,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchMenu(activeMenuLocation);
  }, [activeMenuLocation]);

  const fetchData = async () => {
    const { data: pages } = await supabase.from('pages').select('id, title, slug').eq('status', 'publish');
    if (pages) setAvailablePages(pages);

    const { data: categories } = await supabase.from('categories').select('id, name, slug');
    if (categories) setAvailableCategories(categories);
  };

  const fetchMenu = async (location: string) => {
    setLoading(true);
    const { data: menu } = await supabase
      .from('menus')
      .select('*')
      .eq('location', location)
      .single();

    if (menu) {
      setMenuName(menu.name);
      setMenuItems(ensureIds(menu.items || []));
    } else {
      setMenuName(location === 'header' ? 'Primary Menu' : 'Footer Menu');
      setMenuItems([]);
    }
    setLoading(false);
  };

  const saveMenu = async () => {
    setSaving(true);
    
    const cleanItems = (items: MenuItem[]): any[] => {
      return items.map(({ isOpen, children, ...rest }) => ({
        ...rest,
        children: children ? cleanItems(children) : []
      }));
    };

    const payload = {
      id: activeMenuLocation + '-menu', // Consistent ID
      name: menuName,
      location: activeMenuLocation,
      items: cleanItems(menuItems),
    };

    // Use upsert with explicit conflict column
    const { error } = await supabase
      .from('menus')
      .upsert(payload, { onConflict: 'location' });

    setSaving(false);
    
    if (error) {
      console.error('Save error:', error);
      alert('Error saving menu: ' + error.message);
    } else {
      alert('Menu saved successfully!');
      // Re-fetch to ensure local state matches DB exactly
      fetchMenu(activeMenuLocation);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setMenuItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleItem = (id: string) => {
    const toggleNode = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, isOpen: !item.isOpen };
        if (item.children && item.children.length > 0) {
          return { ...item, children: toggleNode(item.children) };
        }
        return item;
      });
    };
    setMenuItems(prev => toggleNode(prev));
  };

  const removeItem = (id: string) => {
    if (!id) return;
    
    const deleteNode = (items: MenuItem[]): MenuItem[] => {
      return items.reduce((acc: MenuItem[], item) => {
        if (item.id === id) return acc;
        if (item.children && item.children.length > 0) {
          return [...acc, { ...item, children: deleteNode(item.children) }];
        }
        return [...acc, item];
      }, []);
    };
    setMenuItems(prev => deleteNode(prev));
  };

  const updateItemLabel = (id: string, newLabel: string) => {
    const updateNode = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, label: newLabel };
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateNode(item.children) };
        }
        return item;
      });
    };
    setMenuItems(prev => updateNode(prev));
  };

  const addPages = () => {
    const newItems: MenuItem[] = selectedPages.map(id => {
      const page = availablePages.find(p => p.id === id);
      if (!page) return null;
      return {
        id: crypto.randomUUID(),
        label: page.title,
        type: 'page',
        url: `/${page.slug}`,
        children: []
      };
    }).filter(Boolean) as MenuItem[];

    setMenuItems(prev => [...prev, ...newItems]);
    setSelectedPages([]);
  };

  const addCategories = () => {
    const newItems: MenuItem[] = selectedCategories.map(id => {
      const cat = availableCategories.find(c => c.id === id);
      if (!cat) return null;
      return {
        id: crypto.randomUUID(),
        label: cat.name,
        type: 'category',
        url: `/${cat.slug}`, 
        children: []
      };
    }).filter(Boolean) as MenuItem[];

    setMenuItems(prev => [...prev, ...newItems]);
    setSelectedCategories([]);
  };

  const addCustomLink = () => {
    if (!customLinkUrl || !customLinkText) return;
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      label: customLinkText,
      type: 'custom',
      url: customLinkUrl,
      children: []
    };
    setMenuItems(prev => [...prev, newItem]);
    setCustomLinkText("");
    setCustomLinkUrl("http://");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[#f6f7f7] p-4 border border-[#ccd0d4]">
        <label className="text-sm font-medium">Select a menu to edit:</label>
        <div className="flex items-center space-x-2">
          <select 
            className="border border-[#ccd0d4] bg-white px-2 py-1 text-sm focus:border-[#2271b1] outline-none min-w-[200px]"
            value={activeMenuLocation}
            onChange={(e) => setActiveMenuLocation(e.target.value)}
          >
            <option value="header">Primary Menu (Header)</option>
            <option value="footer">Footer Menu</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-bold text-sm text-[#1d2327] uppercase tracking-wider">Add menu items</h3>
          
          <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-[#f6f7f7] border-b border-[#ccd0d4] font-bold text-xs uppercase tracking-widest text-gray-500">
              Pages <ChevronDown className="w-3 h-3" />
            </button>
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {availablePages.map(page => (
                <label key={page.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedPages.includes(page.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPages([...selectedPages, page.id]);
                      else setSelectedPages(selectedPages.filter(id => id !== page.id));
                    }}
                  />
                  <span>{page.title}</span>
                </label>
              ))}
            </div>
            <div className="p-2 border-t border-[#ccd0d4] bg-[#f6f7f7] flex justify-end">
              <button 
                onClick={addPages}
                disabled={selectedPages.length === 0}
                className="px-3 py-1.5 border border-[#ccd0d4] bg-white hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest rounded shadow-sm disabled:opacity-50 transition-all"
              >
                Add to Menu
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-[#f6f7f7] border-b border-[#ccd0d4] font-bold text-xs uppercase tracking-widest text-gray-500">
              Categories <ChevronDown className="w-3 h-3" />
            </button>
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {availableCategories.map(cat => (
                <label key={cat.id} className="flex items-center space-x-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCategories([...selectedCategories, cat.id]);
                      else setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                    }}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
             <div className="p-2 border-t border-[#ccd0d4] bg-[#f6f7f7] flex justify-end">
              <button 
                onClick={addCategories}
                disabled={selectedCategories.length === 0}
                className="px-3 py-1.5 border border-[#ccd0d4] bg-white hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest rounded shadow-sm disabled:opacity-50 transition-all"
              >
                Add to Menu
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#ccd0d4] rounded-lg overflow-hidden shadow-sm">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-[#f6f7f7] border-b border-[#ccd0d4] font-bold text-xs uppercase tracking-widest text-gray-500">
              Custom Links <ChevronDown className="w-3 h-3" />
            </button>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">URL</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-200 px-3 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    value={customLinkUrl}
                    onChange={(e) => setCustomLinkUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Link Text</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-200 px-3 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    value={customLinkText}
                    onChange={(e) => setCustomLinkText(e.target.value)}
                />
              </div>
              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button 
                    onClick={addCustomLink}
                    disabled={!customLinkText || !customLinkUrl}
                    className="px-3 py-1.5 border border-[#ccd0d4] bg-white hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest rounded shadow-sm disabled:opacity-50 transition-all"
                >
                    Add to Menu
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-[#ccd0d4] shadow-sm rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-[#ccd0d4] bg-[#f6f7f7] flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-700">Menu structure</h3>
              <button 
                onClick={saveMenu}
                disabled={saving}
                className="px-5 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Menu"}
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-8 bg-gray-50 p-4 border border-gray-100 rounded-xl">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Menu Name</label>
                <input 
                  type="text" 
                  className="w-full md:w-1/2 border border-gray-200 px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white" 
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-4 italic flex items-center gap-2">
                    <MousePointer2 className="w-3 h-3" />
                    Drag items to reorder. Click the arrow to edit details.
                </p>
              </div>

              {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-300 w-8 h-8" /></div>
              ) : (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext 
                    items={menuItems.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                        {menuItems.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 italic">
                                No items in this menu yet.
                            </div>
                        )}
                        
                        {menuItems.map((item) => (
                          <SortableMenuItem 
                            key={item.id} 
                            item={item} 
                            toggleItem={toggleItem} 
                            updateItemLabel={updateItemLabel}
                            removeItem={removeItem}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#ccd0d4] bg-[#f6f7f7] flex items-center justify-between mt-6">
              <button className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-widest transition-colors">Delete Menu</button>
              <button 
                onClick={saveMenu}
                disabled={saving}
                className="px-5 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Menu"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
