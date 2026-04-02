import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { PromptCard } from "./PromptCard";
import { Prompt, Category } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

interface SortablePromptCardProps {
  prompt: Prompt;
  onUpdate: () => void;
  categories: Category[];
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function SortablePromptCard({ prompt, onUpdate, categories, selectMode, selected, onToggleSelect }: SortablePromptCardProps) {
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
      {selectMode ? (
        <button
          onClick={() => onToggleSelect?.(prompt.id)}
          className="absolute top-2 left-2 z-10 p-1"
          aria-label="Select prompt"
        >
          <Checkbox checked={selected} className="pointer-events-none" />
        </button>
      ) : (
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 p-1.5 rounded-md opacity-60 sm:opacity-0 sm:group-hover/sortable:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-muted/80 hover:bg-muted touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      <div onClick={selectMode ? () => onToggleSelect?.(prompt.id) : undefined} className={selectMode ? "cursor-pointer" : ""}>
        <PromptCard prompt={prompt} onUpdate={onUpdate} categories={categories} />
      </div>
    </div>
  );
}
