import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CDPReactProvider } from "@coinbase/cdp-react";
import { type Theme } from "@coinbase/cdp-react/theme";

const queryClient = new QueryClient();

export const CDP_CONFIG: Config = { projectId: "79863ddd-4e18-4eac-aaa2-2cef2c644597" };

export const APP_CONFIG: AppConfig = {
  name: "CDP React StarterKit",
  logoUrl: "http://localhost:3000/logo.svg",
  authMethods: ["email", "sms"],
};

export const theme: Partial<Theme> = {
  "colors-bg-default": "var(--cdp-example-card-bg-color)",
  "colors-bg-overlay": "var(--cdp-example-bg-overlay-color)",
  "colors-bg-skeleton": "var(--cdp-example-bg-skeleton-color)",
  "colors-bg-primary": "var(--cdp-example-accent-color)",
  "colors-bg-secondary": "var(--cdp-example-bg-low-contrast-color)",
  "colors-fg-default": "var(--cdp-example-text-color)",
  "colors-fg-muted": "var(--cdp-example-text-secondary-color)",
  "colors-fg-primary": "var(--cdp-example-accent-color)",
  "colors-fg-onPrimary": "var(--cdp-example-accent-foreground-color)",
  "colors-fg-onSecondary": "var(--cdp-example-text-color)",
  "colors-line-default": "var(--cdp-example-card-border-color)",
  "colors-line-heavy": "var(--cdp-example-text-secondary-color)",
  "colors-line-primary": "var(--cdp-example-accent-color)",
  "font-family-sans": "var(--cdp-example-font-family)",
  "font-size-base": "var(--cdp-example-base-font-size)",
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG} theme={theme}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </CDPReactProvider>
  </QueryClientProvider>
);

export default App;
