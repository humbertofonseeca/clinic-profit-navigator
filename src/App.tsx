import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Clinicas from "./pages/Clinicas";
import Pacientes from "./pages/Pacientes";
import Consultas from "./pages/Consultas";
import Procedimentos from "./pages/Procedimentos";
import Investimentos from "./pages/Investimentos";
import Despesas from "./pages/Despesas";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Index />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/clinicas" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Clinicas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/pacientes" element={
              <ProtectedRoute>
                <Layout>
                  <Pacientes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/consultas" element={
              <ProtectedRoute>
                <Layout>
                  <Consultas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/procedimentos" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Procedimentos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/investimentos" element={
              <ProtectedRoute>
                <Layout>
                  <Investimentos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/despesas" element={
              <ProtectedRoute>
                <Layout>
                  <Despesas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Layout>
                  <Relatorios />
                </Layout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
