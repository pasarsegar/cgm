"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BuilderBlock, initialBlockContent, BlockType } from './types';
import { GripVertical, Trash2, ChevronDown, ChevronUp, Edit3, Eye, ShoppingBag, Copy, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import BlockPreview from './BlockPreview';
import { supabase } from '@/lib/supabase';

interface SortableBlockProps {
  block: BuilderBlock;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: any) => void;
  onDuplicate?: (block: BuilderBlock) => void;
}

export default function SortableBlock({ block, onDelete, onUpdate, onDuplicate }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [products, setProducts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch products for dropdowns if needed
    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('id, name').order('name');
        if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  const renderEditor = () => {
    switch (block.type) {
      case 'hero':
        // No duplication logic needed here for now
        return (
          <div className="space-y-3">
            <input 
                type="text" 
                placeholder="Hero Title"
                className="w-full p-2 border rounded"
                value={block.content.title}
                onChange={(e) => onUpdate(block.id, { ...block.content, title: e.target.value })}
            />
            <input 
                type="text" 
                placeholder="Hero Subtitle"
                className="w-full p-2 border rounded"
                value={block.content.subtitle}
                onChange={(e) => onUpdate(block.id, { ...block.content, subtitle: e.target.value })}
            />
            <input 
                type="text" 
                placeholder="Background Image URL"
                className="w-full p-2 border rounded"
                value={block.content.backgroundImage}
                onChange={(e) => onUpdate(block.id, { ...block.content, backgroundImage: e.target.value })}
            />
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            <textarea 
              className="w-full p-2 border rounded h-32"
              value={block.content.html}
              onChange={(e) => onUpdate(block.id, { ...block.content, html: e.target.value })}
              placeholder="Enter HTML content..."
            />
            
            <div className="grid grid-cols-2 gap-4 bg-white p-4 border rounded shadow-sm">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Text Color</label>
                    <div className="flex items-center space-x-2">
                        <input 
                            type="color" 
                            className="w-8 h-8 rounded border-0 cursor-pointer p-0"
                            value={block.content.color || "#333333"}
                            onChange={(e) => onUpdate(block.id, { ...block.content, color: e.target.value })}
                        />
                        <input 
                            type="text" 
                            className="flex-1 p-1.5 border rounded text-xs font-mono uppercase"
                            value={block.content.color || "#333333"}
                            onChange={(e) => onUpdate(block.id, { ...block.content, color: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Font Size</label>
                    <div className="flex items-center space-x-2">
                        <select 
                            className="w-full p-1.5 border rounded text-sm"
                            value={block.content.fontSize || "16px"}
                            onChange={(e) => onUpdate(block.id, { ...block.content, fontSize: e.target.value })}
                        >
                            <option value="12px">12px (Small)</option>
                            <option value="14px">14px</option>
                            <option value="16px">16px (Normal)</option>
                            <option value="18px">18px</option>
                            <option value="20px">20px (Large)</option>
                            <option value="24px">24px (XL)</option>
                            <option value="32px">32px (2XL)</option>
                            <option value="48px">48px (3XL)</option>
                            <option value="64px">64px (4XL)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Font Family</label>
                    <div className="flex items-center space-x-2">
                        <select 
                            className="w-full p-1.5 border rounded text-sm"
                            value={block.content.fontFamily || "inherit"}
                            onChange={(e) => onUpdate(block.id, { ...block.content, fontFamily: e.target.value })}
                        >
                            <option value="inherit">Default</option>
                            <option value="Inter, sans-serif">Inter (Sans)</option>
                            <option value="Merriweather, serif">Merriweather (Serif)</option>
                            <option value="ui-monospace, monospace">Monospace</option>
                        </select>
                    </div>
                </div>
                <div className="col-span-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={block.content.noContainer}
                            onChange={(e) => onUpdate(block.id, { ...block.content, noContainer: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Remove default padding/max-width container</span>
                    </label>
                </div>
            </div>
          </div>
        );
      case 'image':
        return (
            <div className="space-y-3">
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                        {block.content.url ? (
                            <img src={block.content.url} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="text-gray-300 w-8 h-8" />
                        )}
                        <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-[10px] uppercase font-bold transition-all">
                            Upload
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => onUpdate(block.id, { ...block.content, url: reader.result as string });
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                    </div>
                    <div className="flex-1 space-y-2">
                        <input 
                            type="text" 
                            placeholder="Image URL"
                            className="w-full p-2 border rounded text-sm"
                            value={block.content.url}
                            onChange={(e) => onUpdate(block.id, { ...block.content, url: e.target.value })}
                        />
                        <input 
                            type="text" 
                            placeholder="Alt Text"
                            className="w-full p-2 border rounded text-sm"
                            value={block.content.alt}
                            onChange={(e) => onUpdate(block.id, { ...block.content, alt: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        );
      case 'gallery':
        const addGalleryImage = () => {
            onUpdate(block.id, { 
                ...block.content, 
                images: [...(block.content.images || []), { url: "", alt: "" }] 
            });
        };
        const removeGalleryImage = (index: number) => {
            const newImages = [...(block.content.images || [])];
            newImages.splice(index, 1);
            onUpdate(block.id, { ...block.content, images: newImages });
        };
        const updateGalleryImage = (index: number, update: any) => {
            const newImages = [...(block.content.images || [])];
            newImages[index] = { ...newImages[index], ...update };
            onUpdate(block.id, { ...block.content, images: newImages });
        };
        const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) return;
            const fileArray = Array.from(files);
            
            fileArray.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const currentImages = block.content.images || [];
                    onUpdate(block.id, { 
                        ...block.content, 
                        images: [...currentImages, { url: reader.result as string, alt: "" }] 
                    });
                };
                reader.readAsDataURL(file);
            });
        };

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Columns</label>
                        <select 
                            className="w-full p-2 border rounded text-sm"
                            value={block.content.columns}
                            onChange={(e) => onUpdate(block.id, { ...block.content, columns: e.target.value })}
                        >
                            <option value="2">2 Columns</option>
                            <option value="3">3 Columns</option>
                            <option value="4">4 Columns</option>
                            <option value="5">5 Columns</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gap (px)</label>
                        <input 
                            type="number"
                            className="w-full p-2 border rounded text-sm"
                            value={block.content.gap}
                            onChange={(e) => onUpdate(block.id, { ...block.content, gap: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase flex justify-between">
                        <span>Gallery Images</span>
                        <span className="text-[10px] text-blue-500">{(block.content.images || []).length} items</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {(block.content.images || []).map((img: any, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-2 rounded border group">
                                <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                                    {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-400 m-4" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <input 
                                        type="text" 
                                        placeholder="Image URL"
                                        className="w-full p-1.5 border rounded text-xs"
                                        value={img.url}
                                        onChange={(e) => updateGalleryImage(idx, { url: e.target.value })}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Alt text"
                                        className="w-full p-1.5 border rounded text-xs"
                                        value={img.alt}
                                        onChange={(e) => updateGalleryImage(idx, { alt: e.target.value })}
                                    />
                                </div>
                                <button 
                                    onClick={() => removeGalleryImage(idx)}
                                    className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center justify-center py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 cursor-pointer transition-all text-xs font-medium">
                            + Upload Multiple
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                        </label>
                        <button 
                            onClick={addGalleryImage}
                            className="py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:bg-gray-50 text-xs font-medium transition-all"
                        >
                            + Add URL
                        </button>
                    </div>
                </div>
            </div>
        );
      case 'video':
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video Source</label>
                    <select 
                        className="w-full p-2 border rounded text-sm mb-2"
                        value={block.content.type}
                        onChange={(e) => onUpdate(block.id, { ...block.content, type: e.target.value })}
                    >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="custom">Direct URL (MP4)</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder={block.content.type === 'custom' ? "Direct MP4 URL" : "Video URL or ID"}
                        className="w-full p-2 border rounded"
                        value={block.content.url}
                        onChange={(e) => onUpdate(block.id, { ...block.content, url: e.target.value })}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 italic">
                        {block.content.type === 'youtube' && "Paste full URL or ID (e.g. dQw4w9WgXcQ)"}
                        {block.content.type === 'vimeo' && "Paste full URL or ID (e.g. 76979871)"}
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center text-xs space-x-2">
                        <input 
                            type="checkbox" 
                            checked={block.content.autoPlay}
                            onChange={(e) => onUpdate(block.id, { ...block.content, autoPlay: e.target.checked })}
                            className="rounded border-gray-300"
                        />
                        <span>Autoplay</span>
                    </label>
                    <label className="flex items-center text-xs space-x-2">
                        <input 
                            type="checkbox" 
                            checked={block.content.loop}
                            onChange={(e) => onUpdate(block.id, { ...block.content, loop: e.target.checked })}
                            className="rounded border-gray-300"
                        />
                        <span>Loop</span>
                    </label>
                    <label className="flex items-center text-xs space-x-2">
                        <input 
                            type="checkbox" 
                            checked={block.content.muted}
                            onChange={(e) => onUpdate(block.id, { ...block.content, muted: e.target.checked })}
                            className="rounded border-gray-300"
                        />
                        <span>Muted</span>
                    </label>
                </div>
            </div>
        );
      case 'button':
        return (
            <div className="space-y-3">
                <input 
                    type="text" 
                    placeholder="Button Text"
                    className="w-full p-2 border rounded"
                    value={block.content.text}
                    onChange={(e) => onUpdate(block.id, { ...block.content, text: e.target.value })}
                />
                <input 
                    type="text" 
                    placeholder="Button URL"
                    className="w-full p-2 border rounded"
                    value={block.content.url}
                    onChange={(e) => onUpdate(block.id, { ...block.content, url: e.target.value })}
                />
                <select 
                    className="w-full p-2 border rounded"
                    value={block.content.alignment}
                    onChange={(e) => onUpdate(block.id, { ...block.content, alignment: e.target.value })}
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </div>
        );
      case 'slider':
        return (
            <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
                Revolution Slider (Default Home Slider)
            </div>
        );
      case 'product':
        return (
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Select Product</label>
                    <select 
                        className="w-full p-2 border rounded"
                        value={block.content.productId}
                        onChange={(e) => onUpdate(block.id, { ...block.content, productId: e.target.value })}
                    >
                        <option value="">-- Choose a Product --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex space-x-4">
                    <label className="flex items-center text-sm">
                        <input 
                            type="checkbox" 
                            checked={block.content.showTitle}
                            onChange={(e) => onUpdate(block.id, { ...block.content, showTitle: e.target.checked })}
                            className="mr-2"
                        />
                        Show Title
                    </label>
                    <label className="flex items-center text-sm">
                        <input 
                            type="checkbox" 
                            checked={block.content.showPrice}
                            onChange={(e) => onUpdate(block.id, { ...block.content, showPrice: e.target.checked })}
                            className="mr-2"
                        />
                        Show Price
                    </label>
                </div>
            </div>
        );
      case 'container':
        // Helper to update container children
        const updateChildren = (newChildren: BuilderBlock[]) => {
            onUpdate(block.id, { ...block.content, children: newChildren });
        };

        const addChildBlock = (type: string) => {
            const blockType = type as BlockType;
            const newBlock: BuilderBlock = {
                id: crypto.randomUUID(),
                type: blockType,
                content: { ...initialBlockContent[blockType] }
            };
            updateChildren([...(block.content.children || []), newBlock]);
        };

        const removeChildBlock = (childId: string) => {
            updateChildren((block.content.children || []).filter((b: BuilderBlock) => b.id !== childId));
        };
        
        // Update a child block content
        const updateChildBlock = (childId: string, newContent: any) => {
             updateChildren((block.content.children || []).map((b: BuilderBlock) => 
                b.id === childId ? { ...b, content: newContent } : b
             ));
        };

        const duplicateBlock = (colIndex: number, blockId: string) => {
    const currentBlocks = columns[colIndex] || [];
    const blockToDuplicate = currentBlocks.find((b: BuilderBlock) => b.id === blockId);
    if (!blockToDuplicate) return;

    const newBlock = {
      ...blockToDuplicate,
      id: crypto.randomUUID(),
      content: JSON.parse(JSON.stringify(blockToDuplicate.content))
    };

    const blockIndex = currentBlocks.findIndex((b: BuilderBlock) => b.id === blockId);
    const newBlocks = [...currentBlocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    
    updateColumn(colIndex, newBlocks);
  };

  const duplicateContainerChildBlock = (childId: string) => {
    const blockToDuplicate = (block.content.children || []).find((b: BuilderBlock) => b.id === childId);
    if (!blockToDuplicate) return;

    const newBlock = {
      ...blockToDuplicate,
      id: crypto.randomUUID(),
      content: JSON.parse(JSON.stringify(blockToDuplicate.content)) // Deep copy content
    };

    const blockIndex = (block.content.children || []).findIndex((b: BuilderBlock) => b.id === childId);
    const newChildren = [...(block.content.children || [])];
    newChildren.splice(blockIndex + 1, 0, newBlock);
    
    updateChildren(newChildren);
  };

  return (
      <div className="space-y-4">
                <div className="bg-gray-100 p-3 rounded-lg space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-500">Container Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Direction</label>
                            <select 
                                className="w-full p-2 border rounded text-sm"
                                value={block.content.direction}
                                onChange={(e) => onUpdate(block.id, { ...block.content, direction: e.target.value })}
                            >
                                <option value="row">Row (Horizontal)</option>
                                <option value="column">Column (Vertical)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Gap (px)</label>
                            <input 
                                type="number" 
                                className="w-full p-2 border rounded text-sm"
                                value={block.content.gap}
                                onChange={(e) => onUpdate(block.id, { ...block.content, gap: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Justify Content</label>
                            <select 
                                className="w-full p-2 border rounded text-sm"
                                value={block.content.justify}
                                onChange={(e) => onUpdate(block.id, { ...block.content, justify: e.target.value })}
                            >
                                <option value="start">Start</option>
                                <option value="center">Center</option>
                                <option value="end">End</option>
                                <option value="between">Space Between</option>
                                <option value="around">Space Around</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Align Items</label>
                            <select 
                                className="w-full p-2 border rounded text-sm"
                                value={block.content.align}
                                onChange={(e) => onUpdate(block.id, { ...block.content, align: e.target.value })}
                            >
                                <option value="start">Start</option>
                                <option value="center">Center</option>
                                <option value="end">End</option>
                                <option value="stretch">Stretch</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border border-dashed border-gray-300 rounded p-4 bg-gray-50 min-h-[100px]">
                    <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Child Widgets</h4>
                    
                    <div className="space-y-2 mb-4">
                        {(block.content.children || []).map((child: BuilderBlock, index: number) => (
                            <div key={child.id} className="bg-white border border-gray-200 rounded p-3 relative group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-xs uppercase text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{child.type}</span>
                                    <button 
                                        onClick={() => duplicateContainerChildBlock(child.id)}
                                        className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded"
                                        title="Duplicate Widget"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={() => removeChildBlock(child.id)}
                                        className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                        title="Remove Widget"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                
                                {/* Inline Editing for Child Widgets */}
                                {child.type === 'text' && (
                                    <textarea 
                                        className="w-full text-xs border rounded p-2 h-20 font-mono"
                                        value={child.content.html}
                                        onChange={(e) => updateChildBlock(child.id, { ...child.content, html: e.target.value })}
                                        placeholder="HTML Content..."
                                    />
                                )}
                                {child.type === 'image' && (
                                    <div className="space-y-2">
                                        <input 
                                            type="text"
                                            className="w-full text-xs border rounded p-2"
                                            placeholder="Image URL"
                                            value={child.content.url}
                                            onChange={(e) => updateChildBlock(child.id, { ...child.content, url: e.target.value })}
                                        />
                                    </div>
                                )}
                                {child.type === 'button' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="text"
                                            className="w-full text-xs border rounded p-2"
                                            placeholder="Button Text"
                                            value={child.content.text}
                                            onChange={(e) => updateChildBlock(child.id, { ...child.content, text: e.target.value })}
                                        />
                                        <input 
                                            type="text"
                                            className="w-full text-xs border rounded p-2"
                                            placeholder="URL"
                                            value={child.content.url}
                                            onChange={(e) => updateChildBlock(child.id, { ...child.content, url: e.target.value })}
                                        />
                                    </div>
                                )}
                                {child.type === 'latest-products' && (
                                    <div className="space-y-2">
                                        <input 
                                            type="text"
                                            className="w-full text-xs border rounded p-2"
                                            placeholder="Section Title"
                                            value={child.content.title}
                                            onChange={(e) => updateChildBlock(child.id, { ...child.content, title: e.target.value })}
                                        />
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500">Count:</span>
                                            <input 
                                                type="number"
                                                className="w-16 text-xs border rounded p-1"
                                                value={child.content.count}
                                                onChange={(e) => updateChildBlock(child.id, { ...child.content, count: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                )}
                                {child.type === 'product' && (
                                     <div className="space-y-2">
                                         <select 
                                             className="w-full text-xs border rounded p-2"
                                             value={child.content.productId}
                                             onChange={(e) => updateChildBlock(child.id, { ...child.content, productId: e.target.value })}
                                         >
                                             <option value="">Select Product</option>
                                             {products.map(p => (
                                                 <option key={p.id} value={p.id}>{p.name}</option>
                                             ))}
                                         </select>
                                     </div>
                                 )}
                                 {(child.type !== 'text' && child.type !== 'image' && child.type !== 'button' && child.type !== 'latest-products' && child.type !== 'product') && (
                                     <div className="text-xs text-gray-400 italic bg-gray-50 p-2 rounded text-center">
                                         Complex widget (edit in main block settings if needed)
                                     </div>
                                 )}
                            </div>
                        ))}
                        {(block.content.children || []).length === 0 && (
                            <div className="text-center py-8 text-gray-400 italic text-sm">
                                No widgets added yet.
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-gray-200">
                        {['text', 'image', 'button', 'product'].map(type => (
                            <button 
                                key={type}
                                onClick={() => addChildBlock(type)}
                                className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-medium rounded shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center"
                            >
                                <span className="mr-1">+</span> {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
      case 'columns':
        const columns = block.content.columns || [[], [], []];
        
        // Helper to update a column's blocks
        const updateColumn = (colIndex: number, newBlocks: BuilderBlock[]) => {
            const newColumns = [...columns];
            newColumns[colIndex] = newBlocks;
            onUpdate(block.id, { ...block.content, columns: newColumns });
        };

        // Helper to add a block to a column
        const addBlockToColumn = (colIndex: number, type: string) => {
            const blockType = type as BlockType;
            const newBlock: BuilderBlock = {
                id: crypto.randomUUID(),
                type: blockType,
                content: { ...initialBlockContent[blockType] }
            };
            const currentBlocks = columns[colIndex] || [];
            updateColumn(colIndex, [...currentBlocks, newBlock]);
        };

        // Helper to remove a block from a column
        const removeBlockFromColumn = (colIndex: number, blockId: string) => {
            const currentBlocks = columns[colIndex] || [];
            updateColumn(colIndex, currentBlocks.filter((b: BuilderBlock) => b.id !== blockId));
        };

        // Helper to update a block inside a column
        const updateBlockInColumn = (colIndex: number, blockId: string, content: any) => {
            const currentBlocks = columns[colIndex] || [];
            const newBlocks = currentBlocks.map((b: BuilderBlock) => b.id === blockId ? { ...b, content } : b);
            updateColumn(colIndex, newBlocks);
        };

        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name={`col-type-${block.id}`}
                            checked={block.content.type === '2-col'} 
                            onChange={() => onUpdate(block.id, { ...block.content, type: '2-col' })}
                            className="mr-2"
                        />
                        2 Col
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name={`col-type-${block.id}`}
                            checked={block.content.type === '3-col'} 
                            onChange={() => onUpdate(block.id, { ...block.content, type: '3-col' })}
                            className="mr-2"
                        />
                        3 Col
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name={`col-type-${block.id}`}
                            checked={block.content.type === '4-col'} 
                            onChange={() => onUpdate(block.id, { ...block.content, type: '4-col' })}
                            className="mr-2"
                        />
                        4 Col
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name={`col-type-${block.id}`}
                            checked={block.content.type === '2-col-left-small'} 
                            onChange={() => onUpdate(block.id, { ...block.content, type: '2-col-left-small' })}
                            className="mr-2"
                        />
                        Left Small
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name={`col-type-${block.id}`}
                            checked={block.content.type === '2-col-right-small'} 
                            onChange={() => onUpdate(block.id, { ...block.content, type: '2-col-right-small' })}
                            className="mr-2"
                        />
                        Right Small
                    </label>
                </div>
                
                <div className="grid gap-4" style={{ 
                    gridTemplateColumns: 
                        block.content.type === '4-col' ? '1fr 1fr 1fr 1fr' : 
                        block.content.type === '3-col' ? '1fr 1fr 1fr' : 
                        block.content.type === '2-col-left-small' ? '1fr 2fr' : 
                        block.content.type === '2-col-right-small' ? '2fr 1fr' : 
                        '1fr 1fr' // Default 2-col
                }}>
                    {[0, 1, 2, 3].map((colIndex) => {
                        // Skip columns based on type
                        if (block.content.type === '2-col' && colIndex > 1) return null;
                        if (block.content.type === '3-col' && colIndex > 2) return null;
                        if ((block.content.type === '2-col-left-small' || block.content.type === '2-col-right-small') && colIndex > 1) return null;
                        
                        return (
                            <div key={colIndex} className="border border-dashed border-gray-300 rounded p-2 bg-gray-50 min-h-[200px]">
                                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Column {colIndex + 1}</div>
                                
                                <div className="space-y-2 mb-3">
                                    {columns[colIndex]?.map((subBlock: BuilderBlock) => (
                                        <div key={subBlock.id} className="bg-white border border-gray-200 rounded p-2 text-sm relative group">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-xs uppercase text-gray-600">{subBlock.type}</span>
                                                <div className="flex items-center space-x-1">
                                                    <button 
                                                        onClick={() => duplicateBlock(colIndex, subBlock.id)}
                                                        className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded"
                                                        title="Duplicate Block"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                    <button 
                                                        onClick={() => removeBlockFromColumn(colIndex, subBlock.id)}
                                                        className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                                        title="Remove Block"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Simple inline editor for nested blocks */}
                                            {subBlock.type === 'text' && (
                                                <textarea 
                                                    className="w-full text-xs border rounded p-1 h-16"
                                                    value={subBlock.content.html}
                                                    onChange={(e) => updateBlockInColumn(colIndex, subBlock.id, { ...subBlock.content, html: e.target.value })}
                                                />
                                            )}
                                            {subBlock.type === 'image' && (
                                                <input 
                                                    type="text"
                                                    className="w-full text-xs border rounded p-1"
                                                    placeholder="Image URL"
                                                    value={subBlock.content.url}
                                                    onChange={(e) => updateBlockInColumn(colIndex, subBlock.id, { ...subBlock.content, url: e.target.value })}
                                                />
                                            )}
                                            {subBlock.type === 'button' && (
                                                <div className="space-y-1">
                                                    <input 
                                                        type="text"
                                                        className="w-full text-xs border rounded p-1"
                                                        placeholder="Text"
                                                        value={subBlock.content.text}
                                                        onChange={(e) => updateBlockInColumn(colIndex, subBlock.id, { ...subBlock.content, text: e.target.value })}
                                                    />
                                                    <input 
                                                        type="text"
                                                        className="w-full text-xs border rounded p-1"
                                                        placeholder="URL"
                                                        value={subBlock.content.url}
                                                        onChange={(e) => updateBlockInColumn(colIndex, subBlock.id, { ...subBlock.content, url: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                            {subBlock.type === 'latest-products' && (
                                                <div className="space-y-2">
                                                    <input 
                                                        type="text"
                                                        className="w-full text-xs border rounded p-1"
                                                        placeholder="Section Title"
                                                        value={subBlock.content.title}
                                                        onChange={(e) => updateBlockInColumn(colIndex, subBlock.id, { ...subBlock.content, title: e.target.value })}
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500">Count:</span>
                                                        <input 
                                                            type="number"
                                                            className="w-16 text-xs border rounded p-1"
                                                            value={subBlock.content.count}
                                                            onChange={(e) => updateBlockInColumn(colIndex, subBlock.id, { ...subBlock.content, count: parseInt(e.target.value) })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {subBlock.type === 'product' && (
                                                <div className="space-y-2">
                                                    <select 
                                                        className="w-full text-xs border rounded p-1"
                                                        value={subBlock.content.productId}
                                                        onChange={(e) => updateBlockInColumn(colIndex, subBlock.id, { ...subBlock.content, productId: e.target.value })}
                                                    >
                                                        <option value="">Select Product</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {/* For other types, just show a label or simplified view for now to avoid deep nesting complexity */}
                                            {(subBlock.type !== 'text' && subBlock.type !== 'image' && subBlock.type !== 'button' && subBlock.type !== 'latest-products' && subBlock.type !== 'product') && (
                                                <div className="text-xs text-gray-400 italic">Settings available in main block</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-1">
                                    {['text', 'image', 'button', 'product'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => addBlockToColumn(colIndex, type)}
                                            className="px-2 py-1 bg-white border border-gray-200 text-xs rounded hover:bg-blue-50 text-gray-600"
                                        >
                                            + {type.replace('-', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
      case 'latest-products':
        return (
            <div className="space-y-3">
                <input 
                    type="text" 
                    placeholder="Section Title"
                    className="w-full p-2 border rounded"
                    value={block.content.title}
                    onChange={(e) => onUpdate(block.id, { ...block.content, title: e.target.value })}
                />
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Product Count:</span>
                    <select 
                        className="w-24 p-2 border rounded"
                        value={block.content.count}
                        onChange={(e) => onUpdate(block.id, { ...block.content, count: parseInt(e.target.value) })}
                    >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={6}>6</option>
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                    </select>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-500">
                    Displays a grid of latest products dynamically.
                </div>
            </div>
        );
      default:
        return <div>Unknown Block Type</div>;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100 rounded-t-lg group">
        <div className="flex items-center space-x-3">
            <button {...attributes} {...listeners} className="cursor-grab hover:text-blue-600 text-gray-400 p-1 rounded hover:bg-gray-200">
                <GripVertical className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm uppercase text-gray-600">{block.type.replace('-', ' ')}</span>
        </div>
        <div className="flex items-center space-x-2">
            {onDuplicate && (
                <button 
                    onClick={() => onDuplicate(block)} 
                    className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition-colors"
                    title="Duplicate Block"
                >
                    <Copy className="w-4 h-4" />
                </button>
            )}
            <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`flex items-center px-3 py-1 text-xs font-medium rounded border transition-colors ${isEditing ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
                {isEditing ? (
                    <>
                        <Eye className="w-3 h-3 mr-1.5" /> Preview
                    </>
                ) : (
                    <>
                        <Edit3 className="w-3 h-3 mr-1.5" /> Edit
                    </>
                )}
            </button>
            <button onClick={() => onDelete(block.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      <div className="relative">
          {/* Editor Mode */}
          {isEditing && (
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                {renderEditor()}
            </div>
          )}

          {/* Preview Mode */}
          <div className={`${isEditing ? 'opacity-50 grayscale pointer-events-none p-4' : 'p-0'} transition-all duration-300`}>
             <BlockPreview block={block} />
          </div>
      </div>
    </div>
  );
}
