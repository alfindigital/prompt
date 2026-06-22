import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";
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
  dragDisabled?: boolean;
}

function SortablePromptCardImpl({
  prompt, onUpdate, categories, selectMode, selected, onToggleSelect, dragDisabled,
}: SortablePromptCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prompt.id, disabled: dragDisabled || selectMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {selectMode ? (
        <>
          {/* Full-card overlay handles selection; the card itself is inert below. */}
          <button
            onClick={() => onToggleSelect?.(prompt.id)}
            className="absolute inset-0 z-10 rounded-[28px] cursor-pointer"
            aria-label={selected ? "Deselect prompt" : "Select prompt"}
            aria-pressed={selected}
          />
          <span className="absolute top-3 left-3 z-20 pointer-events-none">
            <Checkbox checked={selected} className="bg-card shadow-sm" />
          </span>
        </>
      ) : (
        !dragDisabled && (
          <button
            {...attributes}
            {...listeners}
            className="absolute top-1 left-1/2 -translate-x-1/2 z-10 px-2 py-1 rounded-full opacity-60 sm:opacity-0 sm:group-hover/sortable:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-muted/80 hover:bg-muted touch-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Drag to reorder (use arrow keys when focused)"
          >
            <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )
      )}
      <div className={selectMode ? "pointer-events-none select-none" : ""}>
        <PromptCard prompt={prompt} onUpdate={onUpdate} categories={categories} />
      </div>
    </div>
  );
}

export const SortablePromptCard = memo(SortablePromptCardImpl);
