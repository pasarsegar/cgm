"use client";

import { BuilderBlock } from './types';
import parse from 'html-react-parser';
import { Package, Image as ImageIcon, ShoppingBag } from 'lucide-react';

interface BlockPreviewProps {
  block: BuilderBlock;
}

export default function BlockPreview({ block }: BlockPreviewProps) {
  switch (block.type) {
    case 'container':
        const containerStyle = {
            display: 'flex',
            flexDirection: block.content.direction === 'column' ? 'column' : 'row',
            justifyContent: block.content.justify === 'start' ? 'flex-start' : 
                          block.content.justify === 'center' ? 'center' : 
                          block.content.justify === 'end' ? 'flex-end' : 
                          block.content.justify === 'between' ? 'space-between' : 
                          block.content.justify === 'around' ? 'space-around' : 'flex-start',
            alignItems: block.content.align === 'start' ? 'flex-start' : 
                        block.content.align === 'center' ? 'center' : 
                        block.content.align === 'end' ? 'flex-end' : 
                        block.content.align === 'stretch' ? 'stretch' : 'flex-start',
            gap: `${block.content.gap || 4}px`, // Simplified px value or use tailwind classes
            padding: `${block.content.padding || 4}px`,
            backgroundColor: block.content.backgroundColor || 'transparent',
            minHeight: '100px',
            border: '1px dashed #e5e7eb', // Visual guide for container boundaries in editor
        } as React.CSSProperties;

        const children = block.content.children || [];

        return (
            <div style={containerStyle} className="relative group/container hover:border-blue-300 transition-colors">
                {children.length > 0 ? (
                    children.map((child: BuilderBlock) => (
                        <div key={child.id} className="relative group/item">
                            <BlockPreview block={child} />
                        </div>
                    ))
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm p-4 italic border border-dashed border-gray-200 rounded bg-gray-50/50">
                        Empty Container
                    </div>
                )}
            </div>
        );
    case 'product':
        return (
            <div className="p-4 border border-gray-200 rounded-lg bg-white text-center shadow-sm">
                <div className="bg-gray-100 h-32 w-full mb-3 rounded flex items-center justify-center">
                    <ShoppingBag className="text-gray-400 w-8 h-8" />
                </div>
                {block.content.showTitle && (
                    <div className="font-bold text-sm mb-1">{block.content.productId ? "Product Name" : "Select Product"}</div>
                )}
                {block.content.showPrice && (
                    <div className="text-orange-500 font-bold text-sm mb-2">$99.00</div>
                )}
                {block.content.showButton && (
                    <button className="px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded uppercase tracking-wider">
                        View Details
                    </button>
                )}
            </div>
        );
    case 'gallery':
        const galleryImages = block.content.images || [];
        return (
            <div className="p-4 border border-dashed border-gray-200 rounded bg-white">
                <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${block.content.columns || 3}, minmax(0, 1fr))` }}>
                    {galleryImages.length > 0 ? (
                        galleryImages.map((img: any, idx: number) => (
                            <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                {img.url ? (
                                    <img src={img.url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center text-gray-300">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                        ))
                    )}
                </div>
                <div className="text-center text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-wider">Image Gallery ({galleryImages.length} images)</div>
            </div>
        );
    case 'video':
        return (
            <div className="p-4 border border-dashed border-gray-200 rounded bg-white">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="z-10 text-white flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2 shadow-lg">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest">{block.content.type} Video</div>
                        <div className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate">{block.content.url || 'No URL provided'}</div>
                    </div>
                    {block.content.type === 'custom' && block.content.url && (
                        <video src={block.content.url} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                    )}
                </div>
            </div>
        );
    case 'hero':
      return (
        <div 
            className="relative bg-gray-900 text-white py-16 text-center bg-cover bg-center rounded-lg overflow-hidden min-h-[300px] flex flex-col justify-center"
            style={{ backgroundImage: block.content.backgroundImage ? `url(${block.content.backgroundImage})` : 'none' }}
        >
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative container mx-auto px-4 z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-wider">{block.content.title || 'Your Title'}</h2>
                <p className="text-lg text-gray-200 mb-6 max-w-xl mx-auto">{block.content.subtitle || 'Your Subtitle'}</p>
                {block.content.buttonText && (
                    <span className="inline-block bg-primary text-white px-6 py-2 rounded font-bold uppercase tracking-widest cursor-default">
                        {block.content.buttonText}
                    </span>
                )}
            </div>
        </div>
      );
    case 'text':
      return (
        <div 
            className="prose max-w-none p-4 border border-dashed border-gray-200 rounded min-h-[100px]"
            style={{ 
                color: block.content.color || 'inherit',
                fontSize: block.content.fontSize || 'inherit',
                fontFamily: block.content.fontFamily || 'inherit'
            }}
        >
            {block.content.html ? parse(block.content.html) : <p className="text-gray-400 italic">Start typing text...</p>}
        </div>
      );
    case 'image':
      return (
        <div className="text-center p-4 border border-dashed border-gray-200 rounded">
            {block.content.url ? (
                <img 
                    src={block.content.url} 
                    alt={block.content.alt || ''} 
                    className="max-w-full h-auto rounded shadow-sm mx-auto max-h-[300px] object-contain"
                />
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-12 bg-gray-50 rounded">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span>No Image Selected</span>
                </div>
            )}
            {block.content.caption && (
                <p className="text-sm text-gray-500 mt-2 italic">{block.content.caption}</p>
            )}
        </div>
      );
    case 'button':
        return (
            <div className={`p-4 text-${block.content.alignment || 'left'}`}>
                <span className="inline-block bg-primary text-white px-6 py-3 rounded font-bold uppercase tracking-wider cursor-default shadow-sm">
                    {block.content.text || 'Button'}
                </span>
            </div>
        );
    case 'slider':
        return (
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-8 rounded-lg text-center border-2 border-dashed border-gray-300 min-h-[200px] flex items-center justify-center">
                <div>
                    <div className="font-bold text-gray-600 text-lg mb-2">Revolution Slider</div>
                    <div className="text-sm text-gray-500 font-mono bg-white px-2 py-1 rounded inline-block">Alias: {block.content.alias || 'home-slider'}</div>
                    <p className="text-xs text-gray-400 mt-2">(Preview not available in editor)</p>
                </div>
            </div>
        );
    case 'columns':
        const columns = block.content.columns || [[], [], [], []];
        return (
            <div className="p-4 border border-dashed border-gray-200 rounded bg-gray-50/50">
                <div className={`grid gap-4 ${
                    block.content.type === '4-col' ? 'grid-cols-4' : 
                    block.content.type === '3-col' ? 'grid-cols-3' : 
                    block.content.type === '2-col-left-small' ? 'grid-cols-[1fr_2fr]' : 
                    block.content.type === '2-col-right-small' ? 'grid-cols-[2fr_1fr]' : 
                    'grid-cols-2'
                }`}>
                    {columns.map((columnBlocks: BuilderBlock[], index: number) => {
                        if (block.content.type === '2-col' && index > 1) return null;
                        if (block.content.type === '3-col' && index > 2) return null;
                        if ((block.content.type === '2-col-left-small' || block.content.type === '2-col-right-small') && index > 1) return null;
                        
                        return (
                            <div key={index} className="flex flex-col gap-2 min-h-[100px] border border-gray-200 bg-white p-2 rounded">
                                {columnBlocks && columnBlocks.length > 0 ? (
                                    columnBlocks.map((subBlock) => (
                                        <div key={subBlock.id} className="relative group">
                                            {/* Recursive preview for nested blocks */}
                                            <BlockPreview block={subBlock} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-300 text-xs py-8">Column {index + 1}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    case 'latest-products': {
        const count = block.content.count || 3;
        let columns = 3;
        if (count === 2) columns = 2;
        if (count === 4 || count === 8 || count === 12) columns = 4;
        
        return (
            <div className="p-6 border border-gray-200 rounded-lg bg-white">
                <h3 className="text-xl font-bold mb-4 text-center">{block.content.title || "Latest Products"}</h3>
                <div className={`grid gap-4 opacity-50 ${
                    columns === 2 ? 'grid-cols-2' : 
                    columns === 4 ? 'grid-cols-4' : 
                    'grid-cols-3'
                }`}>
                    {[...Array(Math.min(count, 4))].map((_, i) => (
                        <div key={i} className="border rounded p-4">
                            <div className="bg-gray-200 h-32 w-full mb-2 rounded flex items-center justify-center">
                                <Package className="text-gray-400 w-8 h-8" />
                            </div>
                            <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
                            <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="text-center text-sm text-gray-500 mt-4">
                    Dynamic Block: Shows {block.content.count || 6} latest products
                </div>
            </div>
        );
    }
    default:
      return <div className="p-4 text-red-500 bg-red-50 rounded">Unknown Block Type: {block.type}</div>;
  }
}
