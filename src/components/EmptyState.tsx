import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-2xl gradient-bg p-5 mb-5 glow-primary">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-lg font-bold mb-2">Mulai koleksi prompt-mu</h2>
      <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
        Ketuk tombol <span className="text-primary font-semibold">+</span> di bawah untuk menyimpan prompt pertamamu.
      </p>
    </div>
  );
}
