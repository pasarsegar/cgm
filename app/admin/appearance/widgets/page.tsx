"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Trash2, 
  Plus, 
  Layout, 
  FileText, 
  Image as ImageIcon, 
  Code, 
  List,
  MousePointer2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Widget, WidgetArea } from "@/lib/types";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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

const availableWidgets: { type: Widget['type']; name: string; icon: any; desc: string }[] = [
  { type: 'search', name: 'Search', icon: Search, desc: 'A search form for your site.' },
  { type: 'recent_posts', name: 'Recent Posts', icon: FileText, desc: 'Your site’s most recent posts.' },
  { type: 'categories', name: 'Categories', icon: List, desc: 'A list or dropdown of categories.' },
  { type: 'custom_html', name: 'Custom HTML', icon: Code, desc: 'Arbitrary HTML code.' },
  { type: 'text', name: 'Text', icon: FileText, desc: 'Arbitrary text or HTML.' },
  { type: 'image', name: 'Image', icon: ImageIcon, desc: 'Displays an image.' },
];

function SortableWidget({ 
  widget, 
  expanded, 
  toggleExpand, 
  removeWidget, 
  updateWidget 
}: { 
  widget: Widget; 
  expanded: boolean; 
  toggleExpand: () => void; 
  removeWidget: () => void;
  updateWidget: (updated: Partial<Widget>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-0.5">
      <div className="flex items-center bg-white border border-[#ccd0d4] hover:border-[#b1b4b6] transition-colors group">
        <div 
          {...attributes} 
          {...listeners}
          className="p-2 border-r border-[#ccd0d4] text-gray-400 group-hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 px-3 py-2 flex items-center justify-between text-sm">
          <span className="font-medium">{widget.title}</span>
          <span className="text-[10px] text-gray-400 italic uppercase">{widget.type}</span>
        </div>
        <button 
          onClick={toggleExpand}
          className="p-2 border-l border-[#ccd0d4] text-gray-400 hover:text-[#2271b1] transition-colors"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
      
      {expanded && (
        <div className="bg-white border border-[#ccd0d4] border-t-0 p-4 space-y-4 shadow-inner text-xs animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block mb-1 text-gray-600 font-bold">Title</label>
            <input 
              type="text" 
              className="w-full border border-[#ccd0d4] px-2 py-1.5 outline-none focus:border-[#2271b1]" 
              value={widget.title} 
              onChange={(e) => updateWidget({ title: e.target.value })}
            />
          </div>
          {widget.type === 'recent_posts' && (
            <div>
              <label className="block mb-1 text-gray-600 font-bold">Number of posts to show</label>
              <input 
                type="number" 
                className="w-20 border border-[#ccd0d4] px-2 py-1.5 outline-none focus:border-[#2271b1]" 
                value={widget.settings.count || 5} 
                onChange={(e) => updateWidget({ settings: { ...widget.settings, count: parseInt(e.target.value) } })}
              />
            </div>
          )}
          {(widget.type === 'text' || widget.type === 'custom_html') && (
            <div>
              <label className="block mb-1 text-gray-600 font-bold">Content</label>
              <textarea 
                className="w-full border border-[#ccd0d4] px-2 py-1.5 outline-none focus:border-[#2271b1] h-32 resize-none" 
                value={widget.settings.text || ""} 
                onChange={(e) => updateWidget({ settings: { ...widget.settings, text: e.target.value } })}
              />
            </div>
          )}
          {widget.type === 'image' && (
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-gray-600 font-bold">Image URL</label>
                <input
                  type="text"
                  className="w-full border border-[#ccd0d4] px-2 py-1.5 outline-none focus:border-[#2271b1]"
                  value={widget.settings.url || ""}
                  onChange={(e) => updateWidget({ settings: { ...widget.settings, url: e.target.value } })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 font-bold">Alt Text</label>
                <input
                  type="text"
                  className="w-full border border-[#ccd0d4] px-2 py-1.5 outline-none focus:border-[#2271b1]"
                  value={widget.settings.alt || ""}
                  onChange={(e) => updateWidget({ settings: { ...widget.settings, alt: e.target.value } })}
                  placeholder="Describe the image"
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600 font-bold">Link URL (optional)</label>
                <input
                  type="text"
                  className="w-full border border-[#ccd0d4] px-2 py-1.5 outline-none focus:border-[#2271b1]"
                  value={widget.settings.link || ""}
                  onChange={(e) => updateWidget({ settings: { ...widget.settings, link: e.target.value } })}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f1]">
            <button 
              onClick={removeWidget}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
            <button onClick={toggleExpand} className="text-gray-500 hover:underline">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminWidgets() {
  const [widgetAreas, setWidgetAreas] = useState<WidgetArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWidgets, setExpandedWidgets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const LOCAL_WIDGET_AREAS_KEY = "local_widget_areas_v1";

  const getDefaultAreas = (): WidgetArea[] => ([
    { id: 'main-sidebar', name: 'Main Sidebar', description: 'Appears on the right of blog posts.', widgets: [] },
    { id: 'header-top', name: 'Header Top Bar', description: 'Appears above the main header navigation.', widgets: [] },
    { id: 'footer-1', name: 'Footer Column 1', description: 'First column in the footer.', widgets: [] },
    { id: 'footer-2', name: 'Footer Column 2', description: 'Second column in the footer.', widgets: [] },
    { id: 'footer-3', name: 'Footer Column 3', description: 'Third column in the footer.', widgets: [] },
    { id: 'footer-4', name: 'Footer Column 4', description: 'Fourth column in the footer.', widgets: [] },
  ]);

  const readLocalAreas = (): WidgetArea[] => {
    try {
      const raw = localStorage.getItem(LOCAL_WIDGET_AREAS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  };

  const persistLocalAreas = (areas: WidgetArea[]) => {
    try {
      localStorage.setItem(LOCAL_WIDGET_AREAS_KEY, JSON.stringify(areas));
    } catch {
      // ignore
    }
  };

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
    fetchWidgetAreas();
  }, []);

  const fetchWidgetAreas = async () => {
    setLoading(true);
    // Fetch areas
    let areas: any[] | null = null;
    try {
      const res = await supabase
        .from('widget_areas')
        .select('*')
        .order('name');
      areas = res.data as any[] | null;
      if (res.error) {
        throw res.error;
      }
      setOfflineMode(false);
    } catch (err) {
      console.error('Error fetching widget areas:', err);
      setOfflineMode(true);
      const local = readLocalAreas();
      setWidgetAreas(local.length > 0 ? local : getDefaultAreas());
      setLoading(false);
      return;
    }

    // Fetch widgets for all areas
    let widgets: any[] | null = null;
    try {
      const res = await supabase
        .from('widgets')
        .select('*')
        .order('order');
      widgets = res.data as any[] | null;
      if (res.error) {
        console.error('Error fetching widgets:', res.error);
      }
    } catch (err) {
      console.error('Error fetching widgets:', err);
    }

    // Combine
    const fullAreas = (areas || []).map(area => ({
        ...area,
        widgets: widgets?.filter(w => w.area_id === area.id) || []
    }));

    // If no areas exist, create defaults (for first run)
    if (fullAreas.length === 0) {
        const defaults = getDefaultAreas().map(({ widgets: _w, ...rest }) => rest);
        
        // Insert defaults
        for (const def of defaults) {
            await supabase.from('widget_areas').upsert(def);
        }
        
        // Re-fetch
        fetchWidgetAreas();
        return;
    }

    setWidgetAreas(fullAreas);
    persistLocalAreas(fullAreas);
    setLoading(false);
  };

  const toggleWidget = (id: string) => {
    setExpandedWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const removeWidget = async (areaId: string, widgetId: string) => {
    // Optimistic update
    const nextAreas = widgetAreas.map(area => {
      if (area.id === areaId) {
        return { ...area, widgets: area.widgets.filter(w => w.id !== widgetId) };
      }
      return area;
    });
    setWidgetAreas(nextAreas);
    persistLocalAreas(nextAreas);

    // DB update
    if (!offlineMode) {
      await supabase.from('widgets').delete().eq('id', widgetId);
    }
  };

  const addWidget = async (areaId: string, type: Widget['type']) => {
    const area = widgetAreas.find(a => a.id === areaId);
    if (!area) return;

    const newWidget: any = {
      id: crypto.randomUUID(),
      area_id: areaId,
      type,
      title: availableWidgets.find(w => w.type === type)?.name || "New Widget",
      settings: {},
      order: area.widgets.length // Append to end
    };
    
    // Optimistic update
    const nextAreas = widgetAreas.map(a => {
      if (a.id === areaId) {
        return { ...a, widgets: [...a.widgets, newWidget] };
      }
      return a;
    });
    setWidgetAreas(nextAreas);
    persistLocalAreas(nextAreas);
    toggleWidget(newWidget.id);

    // DB Insert
    if (!offlineMode) {
      const { error } = await supabase.from('widgets').insert(newWidget);
      if (error) console.error('Error adding widget:', error);
    }
  };

  const updateWidget = async (areaId: string, widgetId: string, updated: Partial<Widget>) => {
    // Optimistic update
    const nextAreas = widgetAreas.map(area => {
      if (area.id === areaId) {
        return { 
            ...area, 
            widgets: area.widgets.map(w => w.id === widgetId ? { ...w, ...updated } : w) 
        };
      }
      return area;
    });
    setWidgetAreas(nextAreas);
    persistLocalAreas(nextAreas);

    // Debounced DB update could go here, but for now we'll rely on the "Save" button for major edits
    // or direct updates for small things if needed. 
    // Actually, for better UX, let's just update local state and have a save button for the specific widget?
    // The current UI shows a "Save" button inside the expanded widget. Let's make that trigger the DB update.
  };

  const saveWidgetToDB = async (widget: Widget) => {
      if (offlineMode) {
        toggleWidget(widget.id);
        return;
      }
      setSaving(true);
      const { error } = await supabase
        .from('widgets')
        .update({
            title: widget.title,
            settings: widget.settings
        })
        .eq('id', widget.id);
      
      setSaving(false);
      if (error) alert('Error saving widget: ' + error.message);
      else toggleWidget(widget.id); // Close on save
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Find source and destination areas
    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which area contains the active widget
    const sourceArea = widgetAreas.find(area => area.widgets.some(w => w.id === activeId));
    // The overId could be a widget ID or an area ID (if empty)
    let destArea = widgetAreas.find(area => area.id === overId);
    if (!destArea) {
        destArea = widgetAreas.find(area => area.widgets.some(w => w.id === overId));
    }

    if (!sourceArea || !destArea) return;

    // If moving within the same area
    if (sourceArea.id === destArea.id) {
        const oldIndex = sourceArea.widgets.findIndex(w => w.id === activeId);
        const newIndex = sourceArea.widgets.findIndex(w => w.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newWidgets = arrayMove(sourceArea.widgets, oldIndex, newIndex);
            
            // Optimistic update
            const nextAreas = widgetAreas.map(a => 
                a.id === sourceArea.id ? { ...a, widgets: newWidgets } : a
            );
            setWidgetAreas(nextAreas);
            persistLocalAreas(nextAreas);

            // DB Update orders
            const updates = newWidgets.map((w, index) => ({
                id: w.id,
                order: index,
                area_id: sourceArea.id // Ensure area_id is set
            }));

            if (!offlineMode) {
              await supabase.from('widgets').upsert(updates);
            }
        }
    } else {
        // Moving between areas - more complex, for now let's stick to same-area sorting
        // or simple add/remove. Drag-between-lists requires careful handling of IDs.
        // For simplicity in this iteration, we'll only support reordering within the same list.
    }
  };

  return (
    <div className="space-y-6">
      {offlineMode && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 rounded text-sm">
          Supabase is not reachable. Widgets are running in local mode (saved in this browser only).
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Available Widgets */}
        <div className="w-full md:w-1/3 space-y-4">
          <h3 className="font-bold text-sm text-[#1d2327]">Available Widgets</h3>
          <p className="text-xs text-gray-500 mb-4 italic">Click "Add" to add a widget to an area.</p>
          
          <div className="grid grid-cols-1 gap-2">
            {availableWidgets.map((widget) => (
              <div 
                key={widget.type}
                className="bg-white border border-[#ccd0d4] p-3 hover:border-[#b1b4b6] transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-50 rounded text-gray-400 group-hover:text-[#2271b1]">
                    <widget.icon className="w-5 h-5" />
                    </div>
                    <div>
                    <h4 className="text-sm font-bold text-[#1d2327] group-hover:text-[#2271b1]">{widget.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{widget.desc}</p>
                    </div>
                </div>
                {/* Dropdown to add to specific area */}
                <div className="relative group/add">
                    <button className="p-1 hover:bg-gray-100 rounded text-[#2271b1]">
                        <Plus className="w-5 h-5" />
                    </button>
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-lg hidden group-hover/add:block z-[9999] py-1 max-h-80 overflow-y-auto">
                        {widgetAreas.map(area => (
                            <button
                                key={area.id}
                                onClick={() => addWidget(area.id, widget.type)}
                                className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700 border-b border-gray-100 last:border-0"
                            >
                                <span className="font-semibold block">{area.name}</span>
                                {area.description && <span className="text-xs text-gray-400 block mt-0.5 truncate">{area.description}</span>}
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Widget Areas */}
        <div className="flex-1 space-y-4">
          <h3 className="font-bold text-sm text-[#1d2327]">Widget Areas</h3>
          
          {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
          ) : (
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="space-y-4">
                    {widgetAreas.map((area) => (
                    <div key={area.id} className="bg-white border border-[#ccd0d4] shadow-sm">
                        <div className="px-4 py-3 border-b border-[#ccd0d4] bg-[#f6f7f7] flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-sm">{area.name}</h4>
                            {area.description && <p className="text-[11px] text-gray-500 mt-0.5">{area.description}</p>}
                        </div>
                        </div>
                        
                        <div className="p-4 min-h-[60px] bg-[#f0f0f1]/30">
                            <SortableContext 
                                items={area.widgets.map(w => w.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {area.widgets.length > 0 ? (
                                        area.widgets.map((widget) => (
                                            <div key={widget.id}>
                                                <SortableWidget 
                                                    widget={widget}
                                                    expanded={expandedWidgets.includes(widget.id)}
                                                    toggleExpand={() => toggleWidget(widget.id)}
                                                    removeWidget={() => removeWidget(area.id, widget.id)}
                                                    updateWidget={(updated) => updateWidget(area.id, widget.id, updated)}
                                                />
                                                {expandedWidgets.includes(widget.id) && (
                                                    <div className="flex justify-end px-4 pb-4 bg-white border-x border-b border-[#ccd0d4] -mt-0.5">
                                                        <button 
                                                            onClick={() => saveWidgetToDB(widget)}
                                                            disabled={saving}
                                                            className="px-3 py-1 bg-[#2271b1] text-white font-bold rounded shadow-sm hover:bg-[#135e96] transition-colors text-xs disabled:opacity-50"
                                                        >
                                                            {saving ? "Saving..." : "Save"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="border-2 border-dashed border-[#ccd0d4] rounded-lg p-6 text-center text-gray-400 text-xs italic">
                                            Add widgets here using the list on the left.
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    </div>
                    ))}
                </div>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
