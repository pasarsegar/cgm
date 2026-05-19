"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import BuilderEditor from "@/components/builder/BuilderEditor";
import { 
  Search, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Layout,
  FileText,
  Edit,
  ExternalLink
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
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>}>
      <AdminPagesContent />
    </Suspense>
  );
}

function AdminPagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const editId = searchParams.get("edit");
  const urlSlug = searchParams.get("slug");
  
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

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
    fetchPages();
  }, []);

  useEffect(() => {
    // Determine what data to show based on URL
    if (action === "edit" && editId) {
      const pageToEdit = pages.find(p => p.id === editId);
      if (pageToEdit) {
        setFormData(pageToEdit);
        setUseBuilder(pageToEdit.content?.trim().startsWith('[') || false);
      }
    } else if (action === "new") {
        const isHome = urlSlug === 'home';
        const isSiteHeader = urlSlug === 'site-header';
        const isSiteFooter = urlSlug === 'site-footer';
        
        // Default new page state
        setFormData({
            title: urlSlug ? urlSlug.charAt(0).toUpperCase() + urlSlug.slice(1).replace("-", " ") : "",
            slug: urlSlug || "",
            content: "",
            status: isHome || isSiteHeader || isSiteFooter ? "publish" : "draft"
        });
        setUseBuilder(true);

        // Pre-fill content for special slugs
        if (isHome) {
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
                            [{ id: crypto.randomUUID(), type: 'product', content: { productId: "", showTitle: true, showPrice: true, showButton: true } }],
                            [{ id: crypto.randomUUID(), type: 'product', content: { productId: "", showTitle: true, showPrice: true, showButton: true } }],
                            [{ id: crypto.randomUUID(), type: 'product', content: { productId: "", showTitle: true, showPrice: true, showButton: true } }]
                        ]
                    }
                }
            ]);
            setFormData(prev => ({ ...prev, content: defaultHomeContent }));
        } else if (isSiteHeader) {
            setFormData(prev => ({ ...prev, title: "Site Header", content: JSON.stringify([{ id: crypto.randomUUID(), type: "text", content: { noContainer: true, html: `<div class="bg-[#1d2327] text-white py-1.5 px-4 text-[11px] text-center uppercase tracking-widest font-bold">Free Shipping on all Tuning Parts over $500</div>` } }]) }));
        } else if (isSiteFooter) {
            setFormData(prev => ({ ...prev, title: "Site Footer", content: JSON.stringify([
                {
                    id: crypto.randomUUID(),
                    type: "columns",
                    content: {
                        type: "4-col",
                        columns: [
                            [{ id: crypto.randomUUID(), type: "text", content: { noContainer: true, html: `<div class="space-y-6"><a href="/" class="flex items-center"><span class="text-2xl font-black italic" style="color: var(--footer-text)">CGM<span class="text-primary">scale</span></span></a><p class="text-sm leading-relaxed opacity-70">Your premier partner for high-precision industrial scaling solutions and measurement systems. Based in Jakarta, serving industries worldwide.</p><div class="flex items-center space-x-4"><a href="#" class="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">IG</a><a href="#" class="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">FB</a><a href="#" class="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">X</a><a href="#" class="p-2 bg-white/5 hover:bg-primary rounded-full transition-all text-current">YT</a></div></div>` } }],
                            [{ id: crypto.randomUUID(), type: "text", content: { noContainer: true, html: `<div class="space-y-6"><h4 class="text-sm font-black uppercase tracking-widest text-primary">Quick Links</h4><ul class="space-y-3 text-sm opacity-70"><li><a href="/" class="hover:opacity-100 transition-opacity">Home</a></li><li><a href="/about" class="hover:opacity-100 transition-opacity">About Us</a></li><li><a href="/gallery" class="hover:opacity-100 transition-opacity">Gallery</a></li><li><a href="/our-services" class="hover:opacity-100 transition-opacity">Our Services</a></li><li><a href="/contact" class="hover:opacity-100 transition-opacity">Contact Us</a></li></ul></div>` } }],
                            [{ id: crypto.randomUUID(), type: "text", content: { noContainer: true, html: `<div class="space-y-6"><h4 class="text-sm font-black uppercase tracking-widest text-primary">Contact Us</h4><ul class="space-y-4 text-sm opacity-70"><li>Industrial Area, Jakarta Selatan, 12190</li><li>+62 21 555 1234</li><li>info@cgmscale.com</li></ul></div>` } }],
                            [{ id: crypto.randomUUID(), type: "text", content: { noContainer: true, html: `<div class="space-y-6"><h4 class="text-sm font-black uppercase tracking-widest text-primary">Newsletter</h4><p class="text-sm opacity-70">Subscribe to get latest industry news and special offers.</p><div class="flex space-x-2"><input type="email" placeholder="Your email" class="flex-1 bg-current/5 border-none px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none text-current placeholder:text-current/50" /><button class="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20" style="background-color: var(--footer-button-bg); color: var(--footer-button-text);">Join</button></div></div>` } }]
                        ]
                    }
                },
                { id: crypto.randomUUID(), type: "text", content: { noContainer: true, html: `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-current/10 flex flex-col md:flex-row items-center justify-between text-xs opacity-50 space-y-4 md:space-y-0 uppercase tracking-widest font-bold"><p>© 2026 CGMSCALE. ALL RIGHTS RESERVED.</p><div class="flex space-x-6"><a href="/privacy" class="hover:opacity-100">Privacy Policy</a><a href="/terms" class="hover:opacity-100">Terms of Service</a></div></div>` } }
            ]) }));
        }
    } else {
        // Reset if we're just on the list page
        setFormData({ title: "", slug: "", content: "", status: "draft" });
        setUseBuilder(false);
    }
  }, [action, editId, pages, urlSlug]);

  const fetchPages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    let data: any[] | null = null;
    try {
      const res = await supabase.from('pages').select('*');
      data = res.data as any[] | null;
      if (res.error) throw res.error;
      setOfflineMode(false);
    } catch (error) {
      setOfflineMode(true);
      setPages(readLocalPages());
      setLoading(false);
      return;
    }

    const sorted = (data || []).slice().sort((a: any, b: any) => {
      const aDate = a.updated_at || a.created_at || "";
      const bDate = b.updated_at || b.created_at || "";
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
    setPages(sorted);
    persistLocalPages(sorted as any);
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (!formData.title) return showNotification('error', "Title is required");
    
    setSaving(true);
    const slug = formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || "";
    
    const payload = {
      title: formData.title,
      slug: slug,
      content: formData.content,
      status: formData.status,
      updated_at: new Date().toISOString()
    };

    // Optimistic Update
    const tempId = editId || crypto.randomUUID();
    const optimisticPage = { ...payload, id: tempId, created_at: new Date().toISOString() } as Page;
    
    setPages(prev => {
        const idx = prev.findIndex(p => p.id === tempId);
        if (idx >= 0) {
            const next = [...prev];
            next[idx] = optimisticPage;
            return next;
        }
        return [optimisticPage, ...prev];
    });

    let error: any;
    
    if (editId) {
      const { error: updateError } = await supabase.from('pages').update(payload).eq('id', editId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('pages').insert([{ ...payload, id: tempId }]);
      error = insertError;
    }

    setSaving(false);

    if (error) {
      showNotification('error', error.message || 'Failed to save to cloud. Saved locally.');
      upsertLocalPage(optimisticPage);
      setOfflineMode(true);
    } else {
      showNotification('success', 'Page saved successfully');
      upsertLocalPage(optimisticPage);
      router.push('/admin/pages');
      fetchPages(true); // Silent refresh
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    // Optimistic Delete
    const originalPages = [...pages];
    setPages(prev => prev.filter(p => p.id !== id));

    try {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (error) throw error;
      showNotification('success', 'Page deleted');
      deleteLocalPage(id);
    } catch (e: any) {
      setPages(originalPages);
      showNotification('error', e.message || 'Failed to delete');
    }
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

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {loading && pages.length === 0 ? (
        <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
      ) : (
        <>
          {action === "new" || (action === "edit") ? (
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push('/admin/pages')} className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">{action === "edit" ? "Edit Page" : "New Page"}</h2>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 md:flex-none bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20 disabled:opacity-70 active:scale-95"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>{saving ? 'Saving...' : 'Publish'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
                <div className="lg:col-span-9 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-6 space-y-4">
                      <input 
                        type="text" 
                        className="w-full border-none px-0 text-3xl md:text-4xl font-black tracking-tight focus:ring-0 placeholder:text-gray-200" 
                        placeholder="Add title" 
                        value={formData.title || ""}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="font-mono">/{formData.slug || '...'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
                    <div className="border-b border-gray-100 p-4 flex items-center justify-between bg-gray-50/50">
                        <div className="flex p-1 bg-gray-200/50 rounded-lg">
                            <button 
                                onClick={() => setUseBuilder(true)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${useBuilder ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Visual Builder
                            </button>
                            <button 
                                onClick={() => setUseBuilder(false)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!useBuilder ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Legacy Editor
                            </button>
                        </div>
                    </div>

                    <div className="p-0">
                      {useBuilder ? (
                        <BuilderEditor 
                            key={editId || "new-page"}
                            initialContent={formData.content || ""} 
                            onChange={(newContent) => setFormData({...formData, content: newContent})}
                        />
                      ) : (
                        <textarea 
                          className="w-full h-[600px] p-6 font-mono text-sm border-none focus:ring-0 resize-none"
                          placeholder="Write your page content here..."
                          value={formData.content || ""}
                          onChange={e => setFormData({...formData, content: e.target.value})}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-8">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Status</label>
                      <select 
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                        className="w-full bg-gray-50 border-gray-100 rounded-lg text-sm font-bold focus:ring-primary focus:border-primary"
                      >
                        <option value="draft">Draft</option>
                        <option value="publish">Published</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">URL Slug</label>
                      <input 
                        type="text" 
                        className="w-full bg-gray-50 border-gray-100 rounded-lg text-sm font-mono focus:ring-primary focus:border-primary" 
                        placeholder="auto-generated" 
                        value={formData.slug || ""}
                        onChange={e => setFormData({...formData, slug: e.target.value})}
                      />
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-gray-400 mb-4">
                            <Clock className="w-4 h-4" />
                            <div className="text-[10px] font-bold uppercase tracking-wider">
                                Last updated: {formData.updated_at ? new Date(formData.updated_at).toLocaleDateString() : 'Never'}
                            </div>
                        </div>
                        {editId && (
                            <button 
                                onClick={() => handleDelete(editId)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Page
                            </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-900">Pages</h1>
                  <p className="text-sm text-gray-500 mt-1 font-medium">Manage your website content and structure</p>
                </div>
                <button 
                  onClick={() => router.push('/admin/pages?action=new')}
                  className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Page</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search pages..." 
                      className="w-full pl-11 pr-4 py-3 bg-white border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-3 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all text-gray-500">
                        <Filter className="w-4 h-4" />
                    </button>
                    {selectedPageIds.length > 0 && (
                        <button 
                            onClick={deleteSelectedPages}
                            className="flex items-center gap-2 px-4 py-3 text-red-600 font-bold text-xs uppercase tracking-widest bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete ({selectedPageIds.length})
                        </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="p-5 w-12">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Slug</th>
                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Status</th>
                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Date</th>
                        <th className="p-5 w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPages.map(page => (
                        <tr key={page.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="p-5">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                              checked={selectedPageIds.includes(page.id)}
                              onChange={() => toggleSelectPage(page.id)}
                            />
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    page.slug === 'home' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'
                                } group-hover:scale-110 transition-transform`}>
                                    {page.slug === 'home' ? <Layout className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <div>
                                    <button 
                                      onClick={() => router.push(`/admin/pages?action=edit&edit=${page.id}`)}
                                      className="text-sm font-bold text-gray-900 hover:text-primary transition-colors block text-left"
                                    >
                                      {page.title}
                                    </button>
                                    <div className="flex items-center gap-2 mt-1 md:hidden">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            page.status === 'publish' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {page.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-mono">/{page.slug}</span>
                                    </div>
                                </div>
                            </div>
                          </td>
                          <td className="p-5 hidden md:table-cell">
                            <span className="text-xs font-mono text-gray-400">/{page.slug}</span>
                          </td>
                          <td className="p-5 hidden sm:table-cell">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              page.status === "publish" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${page.status === "publish" ? "bg-green-600" : "bg-gray-600"}`}></span>
                              {page.status}
                            </span>
                          </td>
                          <td className="p-5 hidden lg:table-cell">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-700">{new Date(page.updated_at || page.created_at).toLocaleDateString()}</span>
                                <span className="text-[10px] text-gray-400 font-medium">Last Modified</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => router.push(`/admin/pages?action=edit&edit=${page.id}`)}
                                className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg text-gray-400 hover:text-primary transition-all"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(page.id)}
                                className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-red-100 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <a 
                                href={`/${page.slug === 'home' ? '' : page.slug}`}
                                target="_blank"
                                className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg text-gray-400 hover:text-gray-900 transition-all"
                                title="View Live"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
