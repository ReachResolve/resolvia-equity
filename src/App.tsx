
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StockProvider } from "./context/StockContext";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Trade from "@/pages/Trade";
import Portfolio from "@/pages/Portfolio";
import News from "@/pages/News";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import ProtectedRoute from "@/components/ProtectedRoute";

import "./App.css";

function App() {
  return (
    <>
      <AuthProvider>
        <StockProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trade" 
                element={
                  <ProtectedRoute>
                    <Trade />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/portfolio" 
                element={
                  <ProtectedRoute>
                    <Portfolio />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/news" 
                element={
                  <ProtectedRoute>
                    <News />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </StockProvider>
      </AuthProvider>
    </>
  );
}

export default App;
