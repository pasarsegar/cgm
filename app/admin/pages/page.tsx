"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import BuilderEditor from "@/components/builder/BuilderEditor";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  Calendar,
  Loader2,
  Image as ImageIcon,
  MousePointerClick,
  SlidersHorizontal,
  Code
} from "lucide-react";
import Link from "next/link";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'publish' | 'draft';
  author_id?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
}

export default function AdminPages() {
  const router = useRouter();
  const [action, setAction] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [urlSlug, setUrlSlug] = useState<string | null>(null);
  
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

  const LOCAL_PAGES_KEY = "local_pages_v1";

  const readLocalPages = (): Page[] => {
    try {
      const raw = localStorage.getItem(LOCAL_PAGES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  };

  const persistLocalPages = (next: Page[]) => {
    try {
      localStorage.setItem(LOCAL_PAGES_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const upsertLocalPage = (page: Page) => {
    const existing = readLocalPages();
    const idx = existing.findIndex(p => p.id === page.id || (p.slug && page.slug && p.slug === page.slug));
    const next = existing.slice();
    if (idx >= 0) next[idx] = page;
    else next.push(page);
    persistLocalPages(next);
  };

  const deleteLocalPage = (id: string) => {
    const existing = readLocalPages();
    const next = existing.filter(p => p.id !== id);
    persistLocalPages(next);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Page>>({
    title: "",
    slug: "",
    content: "",
    status: "draft"
  });

  const [useBuilder, setUseBuilder] = useState(false);

  useEffect(() => {
    const updateFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      setAction(params.get("action"));
      setEditId(params.get("edit"));
      setUrlSlug(params.get("slug"));
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
    fetchPages();
  }, []);

  useEffect(() => {
    if (action === "edit" && editId) {
      const pageToEdit = pages.find(p => p.id === editId);
      if (pageToEdit) {
        setFormData(pageToEdit);
        
        // Auto-detect if content is JSON builder format
        if (pageToEdit.content && pageToEdit.content.trim().startsWith('[')) {
            setUseBuilder(true);
        } else if (pageToEdit.slug === 'home' && (!pageToEdit.content || pageToEdit.content.trim() === '')) {
            // Special case for Home: if it exists but is empty/legacy, default to builder
            setUseBuilder(true);
            const defaultHomeContent = JSON.stringify([
                {
                    id: crypto.randomUUID(),
                    type: 'slider',
                    content: { alias: 'home-slider' }
                },
                {
                    id: crypto.randomUUID(),
                    type: 'columns',
                    content: { 
                        type: '3-col',
                        columns: [
                            [
                                {
                                    id: crypto.randomUUID(),
                                    type: 'product',
                                    content: { productId: "", showTitle: true, showPrice: true, showButton: true }
                                }
                            ],
                            [
                                {
                                    id: crypto.randomUUID(),
                                    type: 'product',
                                    content: { productId: "", showTitle: true, showPrice: true, showButton: true }
                                }
                            ],
                            [
                                {
                                    id: crypto.randomUUID(),
                                    type: 'product',
                                    content: { productId: "", showTitle: true, showPrice: true, showButton: true }
                                }
                            ]
                        ]
                    }
                }
            ]);
            setFormData(prev => ({ ...prev, content: defaultHomeContent }));
        }
      }
    } else if (action === "new") {
        const isHome = urlSlug === 'home';
        const isSiteHeader = urlSlug === 'site-header';
        const isSiteFooter = urlSlug === 'site-footer';
        // If creating Home page, pre-fill with Slider block and 3-Col Product Grid
        const initialContent = isHome 
            ? JSON.stringify([
                {
                    id: crypto.randomUUID(),
                    type: 'slider',
                    content: { alias: 'home-slider' }
                },
                {
                    id: crypto.randomUUID(),
                    type: 'columns',
                    content: { 
                        type: '3-col',
                        columns: [
                            [
                                {
                                    id: crypto.randomUUID(),
                                    type: 'product',
                                    content: { productId: "", showTitle: true, showPrice: true, showButton: true }
                                }
                            ],
                            [
                                {
                                    id: crypto.randomUUID(),
                                    type: 'product',
                                    content: { productId: "", showTitle: true, showPrice: true, showButton: true }
                                }
                            ],
                            [
                                {
                                    id: crypto.randomUUID(),
                                    type: 'product',
                                    content: { productId: "", showTitle: true, showPrice: true, showButton: true }
                                }
                            ]
                        ]
                    }
                }
            ])
            : isSiteHeader
              ? JSON.stringify([
                  {
                    id: crypto.randomUUID(),
                    type: "text",
                    content: {
                      noContainer: true,
                      html: `<div class="bg-[#1d2327] text-white py-1.5 px-4 text-[11px] text-center uppercase tracking-widest font-bold">Free Shipping on all Tuning Parts over $500</div>`
                    }
                  }
                ])
              : isSiteFooter
                ? JSON.stringify([
                    {
                      id: crypto.randomUUID(),
                      type: "columns",
                      content: {
                        type: "4-col",
                        columns: [
                          [
                            {
                              id: crypto.randomUUID(),
                              type: "text",
                              content: {
                                noContainer: true,
                                html: `<div class="space-y-6"><a href="/" class="flex items-center"><span class="text-2xl font-black italic" style="color: var(--footer-text)">CGM<span class="text-primary">scale</span></span></a><p class="text-sm leading-relaxed opacity-70">Your premier partner for high-precision industrial scaling solutions and measurement systems. Based in Jakarta, serving industries worldwide.</p><div class="flex items-center space-x-4"><a href="#" class="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">IG</a><a href="#" class="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">FB</a><a href="#" class="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">X</a><a href="#" class="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">YT</a></div></div>`
                              }
                            }
                          ],
                          [
                            {
                              id: crypto.randomUUID(),
                              type: "text",
                              content: {
                                noContainer: true,
                                html: `<div class="space-y-6"><h4 class="text-sm font-black uppercase tracking-widest text-primary">Quick Links</h4><ul class="space-y-3 text-sm opacity-70"><li><a href="/" class="hover:opacity-100 transition-opacity">Home</a></li><li><a href="/about" class="hover:opacity-100 transition-opacity">About Us</a></li><li><a href="/gallery" class="hover:opacity-100 transition-opacity">Gallery</a></li><li><a href="/our-services" class="hover:opacity-100 transition-opacity">Our Services</a></li><li><a href="/contact" class="hover:opacity-100 transition-opacity">Contact Us</a></li></ul></div>`
                              }
                            }
                          ],
                          [
                            {
                              id: crypto.randomUUID(),
                              type: "text",
                              content: {
                                noContainer: true,
                                html: `<div class="space-y-6"><h4 class="text-sm font-black uppercase tracking-widest text-primary">Contact Us</h4><ul class="space-y-4 text-sm opacity-70"><li>Industrial Area, Jakarta Selatan, 12190</li><li>+62 21 555 1234</li><li>info@cgmscale.com</li></ul></div>`
                              }
                            }
                          ],
                          [
                            {
                              id: crypto.randomUUID(),
                              type: "text",
                              content: {
                                noContainer: true,
                                html: `<div class="space-y-6"><h4 class="text-sm font-black uppercase tracking-widest text-primary">Newsletter</h4><p class="text-sm opacity-70">Subscribe to get latest industry news and special offers.</p><div class="flex space-x-2"><input type="email" placeholder="Your email" class="flex-1 bg-current/5 border-none px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-current placeholder:text-current/50" /><button class="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20" style="background-color: var(--footer-button-bg); color: var(--footer-button-text);">Join</button></div></div>`
                              }
                            }
                          ]
                        ]
                      }
                    },
                    {
                      id: crypto.randomUUID(),
                      type: "text",
                      content: {
                        noContainer: true,
                        html: `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-current/10 flex flex-col md:flex-row items-center justify-between text-xs opacity-50 space-y-4 md:space-y-0 uppercase tracking-widest font-bold"><p>© 2026 CGMSCALE. ALL RIGHTS RESERVED.</p><div class="flex space-x-6"><a href="/privacy" class="hover:opacity-100">Privacy Policy</a><a href="/terms" class="hover:opacity-100">Terms of Service</a></div></div>`
                      }
                    }
                  ])
            : "";

        const title =
          urlSlug === "site-header"
            ? "Site Header"
            : urlSlug === "site-footer"
              ? "Site Footer"
              : urlSlug
                ? urlSlug.charAt(0).toUpperCase() + urlSlug.slice(1).replace("-", " ")
                : "";

        setFormData({
            title,
            slug: urlSlug || "",
            content: initialContent,
            status: isHome || isSiteHeader || isSiteFooter ? "publish" : "draft"
        });
        setUseBuilder(true); // Default to builder for new pages
    }
  }, [action, editId, pages, urlSlug]);

  const fetchPages = async () => {
    setLoading(true);
    let data: any[] | null = null;
    try {
      const res = await supabase.from('pages').select('*');
      data = res.data as any[] | null;
      if (res.error) throw res.error;
      setOfflineMode(false);
    } catch (error) {
      console.error('Error fetching pages:', {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code,
        raw: error
      });
      setOfflineMode(true);
      setPages(readLocalPages());
      setLoading(false);
      return;
    }

    const sorted = (data || []).slice().sort((a: any, b: any) => {
      const aDate = a.updated_at || a.created_at || "";
      const bDate = b.updated_at || b.created_at || "";
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
    setPages(sorted);
    persistLocalPages(sorted as any);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.title) return alert("Title is required");
    
    setSaving(true);
    const slug = formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || "";
    
    const payload = {
      title: formData.title,
      slug: slug,
      content: formData.content,
      status: formData.status,
      updated_at: new Date().toISOString()
    };

    let error: any;
    let savedId = editId || "";
    
    if (editId) {
      // Update
      try {
        const { error: updateError } = await supabase
          .from('pages')
          .update(payload)
          .eq('id', editId);
        error = updateError;
      } catch (e) {
        error = e;
      }
      savedId = editId;
    } else {
      // Create
      // For ID, let's generate a random one or let DB handle it if it was uuid (but it's TEXT in schema).
      // The schema defines ID as TEXT PRIMARY KEY. Let's use a simple random string or timestamp.
      const newId = crypto.randomUUID();
      try {
        const { error: insertError } = await supabase
          .from('pages')
          .insert([{ ...payload, id: newId }]);
        error = insertError;
      } catch (e) {
        error = e;
      }
      savedId = newId;
    }

    setSaving(false);

    if (error) {
      console.error('Error saving page:', error);
      const localPage: Page = {
        id: savedId || crypto.randomUUID(),
        title: payload.title,
        slug: payload.slug,
        content: payload.content || "",
        status: payload.status || "draft",
        created_at: new Date().toISOString(),
        updated_at: payload.updated_at
      };
      upsertLocalPage(localPage);
      setOfflineMode(true);
      alert(`Supabase Error: ${error.message || 'Unknown error'}. Saved locally in this browser.`);
    } else {
      const localPage: Page = {
        id: savedId,
        title: payload.title,
        slug: payload.slug,
        content: payload.content || "",
        status: payload.status || "draft",
        created_at: new Date().toISOString(),
        updated_at: payload.updated_at
      };
      upsertLocalPage(localPage);
      fetchPages();
      router.push('/admin/pages');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (error) throw error;
      setOfflineMode(false);
    } catch {
      setOfflineMode(true);
    }
    deleteLocalPage(id);
    setSelectedPageIds(prev => prev.filter(x => x !== id));
    fetchPages();
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visiblePageIds = filteredPages.map(p => p.id);
  const allVisibleSelected = visiblePageIds.length > 0 && visiblePageIds.every(id => selectedPageIds.includes(id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      const visible = new Set(visiblePageIds);
      setSelectedPageIds(prev => prev.filter(id => !visible.has(id)));
      return;
    }
    setSelectedPageIds(prev => Array.from(new Set([...prev, ...visiblePageIds])));
  };

  const toggleSelectPage = (id: string) => {
    setSelectedPageIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const deleteSelectedPages = async () => {
    const ids = selectedPageIds.filter(id => visiblePageIds.includes(id));
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected page(s)?`)) return;

    try {
      const { error } = await supabase.from("pages").delete().in("id", ids);
      if (error) throw error;
      setOfflineMode(false);
    } catch {
      setOfflineMode(true);
    }

    ids.forEach(deleteLocalPage);
    setSelectedPageIds(prev => prev.filter(id => !ids.includes(id)));
    fetchPages();
  };

  if (loading && pages.length === 0) {
      return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>;
  }

  // EDITOR VIEW
  if (action === "new" || (action === "edit")) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl font-medium">{action === "edit" ? "Edit Page" : "Add New Page"}</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <input 
                type="text" 
                className="w-full border border-[#ccd0d4] px-4 py-3 text-xl font-medium focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" 
                placeholder="Add title" 
                value={formData.title || ""}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
             <div>
              <input 
                type="text" 
                className="w-full border border-[#ccd0d4] px-4 py-2 text-sm text-gray-600 focus:border-[#2271b1] outline-none mb-2" 
                placeholder="URL Slug (auto-generated if empty)" 
                value={formData.slug || ""}
                onChange={e => setFormData({...formData, slug: e.target.value})}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg inline-flex">
                    <button 
                        onClick={() => setUseBuilder(true)}
                        className={`px-3 py-1 text-xs font-bold rounded ${useBuilder ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Visual Builder
                    </button>
                    <button 
                        onClick={() => setUseBuilder(false)}
                        className={`px-3 py-1 text-xs font-bold rounded ${!useBuilder ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Legacy Editor
                    </button>
                </div>
              </div>

              {useBuilder ? (
                <BuilderEditor 
                    initialContent={formData.content || ""} 
                    onChange={(newContent) => setFormData({...formData, content: newContent})}
                />
              ) : (
                  <div className="border border-[#ccd0d4] bg-white">
                    <div className="flex items-center border-b border-[#ccd0d4] bg-gray-50 px-3 py-2 space-x-2 flex-wrap gap-y-2">
                      <div className="flex space-x-1 border-r border-gray-300 pr-2 mr-2">
                        <button className="px-2 py-1 text-xs font-bold border rounded hover:bg-gray-100" title="Bold">B</button>
                        <button className="px-2 py-1 text-xs italic border rounded hover:bg-gray-100" title="Italic">I</button>
                        <button className="px-2 py-1 text-xs underline border rounded hover:bg-gray-100" title="Underline">U</button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                            className="px-2 py-1 text-xs border rounded hover:bg-gray-100 flex items-center bg-white"
                            title="Insert Image"
                            onClick={() => {
                                const url = prompt("Enter image URL:");
                                if (url) {
                                    const imgTag = `<img src="${url}" alt="Image" class="max-w-full h-auto rounded-lg my-4" />`;
                                    setFormData({...formData, content: (formData.content || "") + imgTag});
                                }
                            }}
                        >
                          <ImageIcon className="w-3 h-3 mr-1" /> Image
                        </button>
                        <button 
                            className="px-2 py-1 text-xs border rounded hover:bg-gray-100 flex items-center bg-white"
                            title="Insert Button"
                            onClick={() => {
                                const text = prompt("Button Text:", "Click Here");
                                const url = prompt("Button Link:", "#");
                                if (text && url) {
                                    const btnTag = `<a href="${url}" class="inline-block px-6 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider my-2 button-primary">${text}</a>`;
                                    setFormData({...formData, content: (formData.content || "") + btnTag});
                                }
                            }}
                        >
                          <MousePointerClick className="w-3 h-3 mr-1" /> Button
                        </button>
                        <button 
                            className="px-2 py-1 text-xs border rounded hover:bg-gray-100 flex items-center bg-white"
                            title="Insert Slider Placeholder"
                            onClick={() => {
                                const sliderTag = `<div class="my-8 p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500">[RevSlider Placeholder]</div>`;
                                setFormData({...formData, content: (formData.content || "") + sliderTag});
                            }}
                        >
                          <SlidersHorizontal className="w-3 h-3 mr-1" /> Slider
                        </button>
                      </div>
                    </div>
                    <textarea 
                      className="w-full p-4 h-96 focus:outline-none resize-none font-mono text-sm" 
                      placeholder="Start writing or use the toolbar to add components..."
                      value={formData.content || ""}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                    ></textarea>
                  </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {useBuilder ? "Drag blocks to reorder. Click arrow to edit content." : "Use the toolbar to insert components. Content supports HTML and Tailwind classes."}
              </p>
            </div>
          </div>
          
          <div className="w-full lg:w-72 space-y-4">
            <div className="bg-white border border-[#ccd0d4] shadow-sm">
              <div className="px-4 py-2 font-bold text-sm border-b border-[#ccd0d4] bg-gray-50">Publish</div>
              <div className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center"><Globe className="w-3 h-3 mr-1.5" /> Visibility:</span>
                  <span className="font-bold text-[#2271b1]">Public</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1.5" /> Status:</span>
                  <select 
                    className="border border-[#ccd0d4] px-1 py-0.5"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                      <option value="draft">Draft</option>
                      <option value="publish">Published</option>
                  </select>
                </div>
                <div className="pt-3 flex items-center justify-between">
                  <button 
                    onClick={() => router.push('/admin/pages')}
                    className="text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 bg-[#2271b1] text-white font-medium hover:bg-[#135e96] transition-colors rounded disabled:opacity-50"
                  >
                    {saving ? "Saving..." : (action === "edit" ? "Update" : "Publish")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-4">
      {offlineMode && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 rounded text-sm">
          Supabase is not reachable. Pages are running in local mode (saved in this browser only).
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-3 border border-[#ccd0d4]">
        <div className="flex items-center space-x-2">
            <button
              onClick={deleteSelectedPages}
              disabled={selectedPageIds.filter(id => visiblePageIds.includes(id)).length === 0}
              className="px-3 py-1 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Selected ({selectedPageIds.filter(id => visiblePageIds.includes(id)).length})
            </button>
            <Link href="/admin/pages?action=new">
                <button className="px-3 py-1 bg-[#2271b1] text-white text-sm font-medium rounded hover:bg-[#135e96]">Add New</button>
            </Link>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search pages..." 
            className="border border-[#ccd0d4] bg-white px-3 py-1 pl-8 text-sm focus:border-[#2271b1] outline-none w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1.5" />
        </div>
      </div>

      {/* System Pages Quick Links */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-blue-900 mb-3 text-sm uppercase tracking-wide">System Pages</h3>
        <div className="flex gap-4">
            {['home', 'our-services', 'site-header', 'site-footer'].map(slug => {
                const page = pages.find(p => p.slug === slug);
                return (
                    <div key={slug} className="flex items-center bg-white border border-blue-100 px-4 py-2 rounded shadow-sm">
                        <div className="mr-3">
                            <div className="font-bold capitalize text-gray-800">{slug.replace('-', ' ')}</div>
                            <div className="text-xs text-gray-500">{page ? 'Customized' : 'Using Default'}</div>
                        </div>
                        {page ? (
                            <Link href={`/admin/pages?action=edit&edit=${page.id}`}>
                                <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300">Edit</button>
                            </Link>
                        ) : (
                            <button 
                                onClick={() => {
                                    setFormData({
                                        title: slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '),
                                        slug: slug,
                                        content: "",
                                        status: "publish"
                                    });
                                    // We need to switch to 'new' action but with pre-filled data.
                                    // Since useEffect resets data on 'new', we'll use a hack or just push URL and let user type, 
                                    // OR we can set a temporary state. 
                                    // Better: Just navigate to new and let them type, OR handle this better.
                                    // Let's use a URL param ?slug=...
                                    router.push(`/admin/pages?action=new&slug=${slug}`);
                                }}
                                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
                            >
                                Create
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      <div className="border border-[#ccd0d4] overflow-x-auto bg-white">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#ccd0d4]">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 font-semibold text-[#1d2327]">Title</th>
              <th className="px-4 py-3 font-semibold text-[#1d2327]">Slug</th>
              <th className="px-4 py-3 font-semibold text-[#1d2327]">Date</th>
              <th className="px-4 py-3 font-semibold text-[#1d2327] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <tr key={page.id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] transition-colors group">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedPageIds.includes(page.id)}
                      onChange={() => toggleSelectPage(page.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <Link href={`/admin/pages?action=edit&edit=${page.id}`} className="text-[#2271b1] font-bold hover:text-[#135e96]">
                        {page.title} {page.status === 'draft' && <span className="text-gray-400 font-normal">— Draft</span>}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    /{page.slug}
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    <div className="flex flex-col">
                      <span>{page.status === 'publish' ? 'Published' : 'Last Modified'}</span>
                      <span className="text-xs mt-1">
                        {page.updated_at
                          ? new Date(page.updated_at).toLocaleDateString()
                          : page.created_at
                            ? new Date(page.created_at).toLocaleDateString()
                            : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/admin/pages?action=edit&edit=${page.id}`} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Edit Page">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(page.id)}
                        className="p-1 hover:bg-gray-200 rounded text-red-600" title="Delete Page">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                  No pages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
