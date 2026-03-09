"use client";

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BuilderBlock, initialBlockContent, BlockType } from './types';
import SortableBlock from './SortableBlock';
import { Plus, Save } from 'lucide-react';

interface BuilderEditorProps {
  initialContent: string; // JSON string or empty
  onChange: (content: string) => void;
}

export default function BuilderEditor({ initialContent, onChange }: BuilderEditorProps) {
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (initialContent && initialContent.startsWith('[') && !isLoaded) {
      try {
        const parsed = JSON.parse(initialContent);
        if (Array.isArray(parsed)) {
          setBlocks(parsed);
        }
      } catch (e) {
        console.error("Failed to parse builder content", e);
      }
    }
    setIsLoaded(true);
  }, [initialContent, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
        // Debounce or only update if content changed
        const json = JSON.stringify(blocks);
        if (json !== initialContent) {
             onChange(json);
        }
    }
  }, [blocks, isLoaded]); // Removed onChange and initialContent from dependency array

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: BuilderBlock = {
      id: crypto.randomUUID(),
      type,
      content: { ...initialBlockContent[type] }
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const duplicateBlock = (block: BuilderBlock) => {
    const newBlock = {
      ...block,
      id: crypto.randomUUID(),
      content: JSON.parse(JSON.stringify(block.content))
    };
    
    const index = blocks.findIndex(b => b.id === block.id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 min-h-[500px]">
      
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {(['container', 'hero', 'text', 'image', 'button', 'columns', 'slider', 'latest-products'] as BlockType[]).map((type) => (
            <button
                key={type}
                onClick={() => addBlock(type)}
                className={`flex items-center px-4 py-2 border shadow-sm rounded-lg transition-all font-medium text-sm capitalize ${type === 'container' ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : 'bg-white border-gray-200 hover:border-blue-400 hover:text-blue-600'}`}
            >
                <Plus className="w-4 h-4 mr-2" /> {type.replace('-', ' ')}
            </button>
        ))}
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={blocks.map(b => b.id)} 
          strategy={verticalListSortingStrategy}
        >
            <div className="space-y-4 max-w-3xl mx-auto">
                {blocks.length === 0 && (
                    <div className="text-center py-12 text-gray-400 italic">
                        No blocks added yet. Click a button above to start building.
                    </div>
                )}
                {blocks.map((block) => (
                    <SortableBlock 
                        key={block.id} 
                        block={block} 
                        onDelete={() => deleteBlock(block.id)}
                        onUpdate={(id, content) => updateBlock(id, content)}
                        onDuplicate={() => duplicateBlock(block)}
                    />
                ))}
            </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
