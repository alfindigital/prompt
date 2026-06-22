import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <HelmetProvider>
    <TooltipProvider>
      <Sonner />
      <InstallPrompt />
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </HelmetProvider>
);

export default App;
