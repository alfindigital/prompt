import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { PromptCard } from "./PromptCard";
import { Prompt, Category } from "@/lib/types";

interface SortablePromptCardProps {
  prompt: Prompt;
  onUpdate: () => void;
  categories: Category[];
}

export function SortablePromptCard({ prompt, onUpdate, categories }: SortablePromptCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1 rounded-md opacity-0 group-hover/sortable:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-muted/80 hover:bg-muted"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      <PromptCard prompt={prompt} onUpdate={onUpdate} categories={categories} />
    </div>
  );
}
