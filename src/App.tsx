import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AgentChatBot from "./pages/AgentChatBot";
import { DataProvider } from "./context/DataContext";

// Removed QueryClientProvider since ThirdwebProvider already includes one

const App = () => (
  <TooltipProvider>
    <DataProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/agent" element={<AgentChatBot />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  </TooltipProvider>
);

export default App;
