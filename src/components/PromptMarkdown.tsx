import { useRef, useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

/** Fenced code block with a hover-reveal copy button. */
function CodeBlock({ children }: ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      toast.success("Code copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className="code-block-wrap">
      <pre ref={ref}>{children}</pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="rounded-md bg-card/90 border border-border p-1.5 text-foreground/70 hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2.25} /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

interface PromptMarkdownProps {
  children: string;
  className?: string;
}

export function PromptMarkdown({ children, className }: PromptMarkdownProps) {
  return (
    <div className={`prose-prompt ${className ?? ""}`}>
      <ReactMarkdown components={{ pre: CodeBlock }}>{children}</ReactMarkdown>
    </div>
  );
}
