import { useState } from "react";
import { toast } from "sonner";
import { markUsed, updatePrompt, duplicatePrompt } from "@/lib/prompts-store";
import { buildShareUrl } from "@/lib/share";
import type { Prompt } from "@/lib/types";

type Provider = "chatgpt" | "claude";

const PROVIDER_URLS: Record<Provider, string> = {
  chatgpt: "https://chatgpt.com/?q=",
  claude: "https://claude.ai/new?q=",
};

export function usePromptActions(prompt: Prompt, onUpdate: () => void) {
  const [copied, setCopied] = useState(false);

  const flash = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      markUsed(prompt.id);
      onUpdate();
      flash();
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const copyFormatted = async () => {
    const lines = [`# ${prompt.title}`, ""];
    if (prompt.tags.length > 0) lines.push(`Tags: ${prompt.tags.join(", ")}`, "");
    lines.push(prompt.content);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Copied as formatted text");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const shareLink = async () => {
    const url = buildShareUrl({ title: prompt.title, content: prompt.content, tags: prompt.tags });
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const duplicate = () => {
    duplicatePrompt(prompt.id);
    onUpdate();
    toast.success("Prompt duplicated");
  };

  const toggleFavorite = () => {
    updatePrompt(prompt.id, { is_favorite: !prompt.is_favorite });
    onUpdate();
  };

  const openIn = (provider: Provider) => {
    markUsed(prompt.id);
    onUpdate();
    window.open(PROVIDER_URLS[provider] + encodeURIComponent(prompt.content), "_blank", "noopener,noreferrer");
  };

  const markCopiedExternally = () => {
    markUsed(prompt.id);
    onUpdate();
  };

  return { copied, copy, copyFormatted, shareLink, duplicate, toggleFavorite, openIn, markCopiedExternally };
}
