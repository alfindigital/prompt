import { Bold, Italic, List, ListOrdered, Code, Heading2, Quote, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
}

type Action = {
  icon: React.ReactNode;
  label: string;
  prefix: string;
  suffix?: string;
  block?: boolean;
};

const actions: Action[] = [
  { icon: <Bold className="h-3.5 w-3.5" />, label: "Bold", prefix: "**", suffix: "**" },
  { icon: <Italic className="h-3.5 w-3.5" />, label: "Italic", prefix: "_", suffix: "_" },
  { icon: <Code className="h-3.5 w-3.5" />, label: "Code", prefix: "`", suffix: "`" },
  { icon: <Heading2 className="h-3.5 w-3.5" />, label: "Heading", prefix: "## ", block: true },
  { icon: <List className="h-3.5 w-3.5" />, label: "Bullet list", prefix: "- ", block: true },
  { icon: <ListOrdered className="h-3.5 w-3.5" />, label: "Numbered list", prefix: "1. ", block: true },
  { icon: <Quote className="h-3.5 w-3.5" />, label: "Quote", prefix: "> ", block: true },
  { icon: <Minus className="h-3.5 w-3.5" />, label: "Divider", prefix: "\n---\n", block: true },
];

export function useMarkdownShortcuts(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  value: string,
  onChange: (value: string) => void
) {
  const applyAction = (action: Action) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);

    let newText: string;
    let cursorPos: number;

    if (action.block) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const before = value.substring(0, lineStart);
      const after = value.substring(lineStart);
      newText = before + action.prefix + after;
      cursorPos = lineStart + action.prefix.length + (end - lineStart);
    } else {
      const wrap = action.prefix + (selected || "text") + (action.suffix || "");
      newText = value.substring(0, start) + wrap + value.substring(end);
      cursorPos = selected
        ? start + wrap.length
        : start + action.prefix.length + 4;
    }

    onChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (e.key === "b") {
      e.preventDefault();
      applyAction(actions.find((a) => a.label === "Bold")!);
    } else if (e.key === "i") {
      e.preventDefault();
      applyAction(actions.find((a) => a.label === "Italic")!);
    }
  };

  return { applyAction, handleKeyDown };
}

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  const { applyAction } = useMarkdownShortcuts(textareaRef, value, onChange);

  return (
    <div className="flex flex-wrap gap-0.5 border-b border-border/50 pb-1.5 mb-1">
      {actions.map((a) => (
        <Button
          key={a.label}
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => apply(a)}
          title={a.label}
        >
          {a.icon}
        </Button>
      ))}
    </div>
  );
}
