import { FileText } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-2xl bg-secondary p-5 mb-4">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-1">No prompts yet</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Click "Add a new prompt" above to save your first reusable prompt.
      </p>
    </div>
  );
}
