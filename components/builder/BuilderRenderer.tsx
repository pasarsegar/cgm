import { BuilderBlock } from './types';
import parse from 'html-react-parser';
import Link from 'next/link';
import RevSlider from '@/components/home/RevSlider';
import ProductGrid from '@/components/ProductGrid';
import { supabase } from '@/lib/supabase';

interface BuilderRendererProps {
  content: string; // JSON string
}

async function getLatestProducts(count: number) {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, product_variations(*), categories(slug)')
    .order('created_at', { ascending: false })
    .limit(count);
  
  if (error) return [];
  
  return (products || []).map(p => ({
    ...p,
    category: p.categories?.slug || '',
    variations: p.product_variations || []
  }));
}

async function getProductById(id: string) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variations(*), categories(slug)')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  
  return {
    ...data,
    category: data.categories?.slug || '',
    variations: data.product_variations || []
  };
}

export default async function BuilderRenderer({ content }: BuilderRendererProps) {
  let blocks: BuilderBlock[] = [];

  try {
    if (content && content.startsWith('[')) {
        blocks = JSON.parse(content);
    }
  } catch (e) {
    console.error("Failed to render builder content", e);
    return null;
  }

  if (!blocks || blocks.length === 0) return null;

  // Recursive function to pre-fetch data
  const enrichBlocksWithData = async (blocks: BuilderBlock[]): Promise<any[]> => {
      return Promise.all(blocks.map(async (block) => {
          // Handle Latest Products
          if (block.type === 'latest-products') {
              const products = await getLatestProducts(block.content.count || 6);
              return { ...block, data: products };
          }

          // Handle Individual Product
          if (block.type === 'product' && block.content.productId) {
              const product = await getProductById(block.content.productId);
              return { ...block, data: product };
          }
          
          // Handle Nested Containers
          if (block.type === 'container' && block.content.children) {
              const enrichedChildren = await enrichBlocksWithData(block.content.children);
              // We need to pass the enriched children down. 
              // However, the current renderBlock function expects children in block.content.children
              // So we update the content with the enriched children, OR pass data separately.
              // A cleaner way is to attach data to the child blocks themselves.
              return { 
                  ...block, 
                  content: { 
                      ...block.content, 
                      children: enrichedChildren 
                  } 
              };
          }

          // Handle Legacy Columns
          if (block.type === 'columns' && block.content.columns) {
              const enrichedColumns = await Promise.all(block.content.columns.map(async (colBlocks: BuilderBlock[]) => {
                  return await enrichBlocksWithData(colBlocks);
              }));
              return {
                  ...block,
                  content: {
                      ...block.content,
                      columns: enrichedColumns
                  }
              };
          }

          return block;
      }));
  };

  const blocksWithData = await enrichBlocksWithData(blocks);

  return (
    <div className="builder-content">
      {blocksWithData.map((block) => (
        <div key={block.id} className="builder-block">
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: BuilderBlock & { data?: any }) {
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
            gap: `${block.content.gap || 4}px`,
            padding: `${block.content.padding || 4}px`,
            backgroundColor: block.content.backgroundColor || 'transparent',
        } as React.CSSProperties;

        const children = block.content.children || [];

         return (
             <div style={containerStyle} className="container-block">
                 {children.map((child: BuilderBlock & { data?: any }) => (
                     <div key={child.id} className="container-child">
                          {renderBlock(child)}
                     </div>
                 ))}
             </div>
         );
    case 'hero':
      return (
        <div 
            className="relative bg-gray-900 text-white py-24 text-center bg-cover bg-center"
            style={{ backgroundImage: block.content.backgroundImage ? `url(${block.content.backgroundImage})` : 'none' }}
        >
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative container mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-wider">{block.content.title}</h1>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">{block.content.subtitle}</p>
                {block.content.buttonText && (
                    <Link 
                        href={block.content.buttonLink || '#'} 
                        className="inline-block bg-primary text-white px-8 py-3 rounded font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all"
                    >
                        {block.content.buttonText}
                    </Link>
                )}
            </div>
        </div>
      );
    case 'text':
      return (
        <div className="container mx-auto px-4 py-8">
            <div className="prose max-w-none text-gray-700 dark:text-gray-300">
                {parse(block.content.html || '')}
            </div>
        </div>
      );
    case 'image':
      return (
        <div className="container mx-auto px-4 py-8 text-center">
            {block.content.url && (
                <img 
                    src={block.content.url} 
                    alt={block.content.alt || ''} 
                    className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                />
            )}
            {block.content.caption && (
                <p className="text-sm text-gray-500 mt-2 italic">{block.content.caption}</p>
            )}
        </div>
      );
    case 'button':
        return (
            <div className={`container mx-auto px-4 py-4 text-${block.content.alignment || 'left'}`}>
                <Link 
                    href={block.content.url || '#'}
                    className="inline-block bg-primary text-white px-6 py-3 rounded font-bold uppercase tracking-wider hover:opacity-90 transition-all"
                >
                    {block.content.text}
                </Link>
            </div>
        );
    case 'slider':
        return <RevSlider />;
    case 'columns':
        const columns = block.content.columns || [[], [], [], []];
        return (
            <div className="container mx-auto px-4 py-8">
                <div className={`grid gap-8 ${
                    block.content.type === '4-col' ? 'md:grid-cols-4' : 
                    block.content.type === '3-col' ? 'md:grid-cols-3' : 
                    block.content.type === '2-col-left-small' ? 'md:grid-cols-[1fr_2fr]' : 
                    block.content.type === '2-col-right-small' ? 'md:grid-cols-[2fr_1fr]' : 
                    'md:grid-cols-2'
                }`}>
                    {columns.map((columnBlocks: BuilderBlock[], index: number) => {
                        if (block.content.type === '2-col' && index > 1) return null;
                        if (block.content.type === '3-col' && index > 2) return null;
                        if ((block.content.type === '2-col-left-small' || block.content.type === '2-col-right-small') && index > 1) return null;
                        
                        return (
                            <div key={index} className="flex flex-col gap-4">
                                {columnBlocks && columnBlocks.length > 0 ? (
                                    columnBlocks.map((subBlock) => (
                                        <div key={subBlock.id}>
                                            {renderBlock(subBlock)}
                                        </div>
                                    ))
                                ) : (
                                    // Fallback for legacy text content if any, though we are moving away from it
                                    <div className="min-h-[50px]"></div> 
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <ProductGrid 
                    products={block.data || []} 
                    title={block.content.title || "Latest Products"} 
                    columns={columns}
                />
            </div>
        );
    }
    case 'product':
        const product = block.data;
        if (!product) return null;
        
        return (
            <div className="p-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                    {/* Simplified product card render - reusing ProductGrid logic would be better but this is a standalone block */}
                    <div className="relative aspect-[4/3] bg-gray-100">
                        {product.image_url ? (
                            <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-sm">No Image</span>
                            </div>
                        )}
                    </div>
                    <div className="p-4">
                        {block.content.showTitle && (
                            <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                        )}
                        <div className="flex items-center justify-between mt-2">
                            {block.content.showPrice && (
                                <span className="text-orange-500 font-bold">
                                    ${product.price?.toFixed(2)}
                                </span>
                            )}
                            {block.content.showButton && (
                                <Link 
                                    href={`/product/${product.id}`}
                                    className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded hover:bg-orange-600 transition-colors uppercase"
                                >
                                    View
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    default:
      return null;
  }
}
