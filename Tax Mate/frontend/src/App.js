import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Calculator from "./pages/Calculator";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AIAssistantPage from "./pages/AIAssistantPage";
import HeroDemo from "./pages/HeroDemo";
import TaxHistory from "./pages/TaxHistory";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import TaxChatbot from "./components/TaxChatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Login />} />
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
          path="/calculator"
          element={
            <ProtectedRoute>
              <Calculator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AIAssistantPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tax-history"
          element={
            <ProtectedRoute>
              <TaxHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hero-demo"
          element={
            <ProtectedRoute>
              <HeroDemo />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

      </Routes>
      <TaxChatbot />
    </BrowserRouter>
  );
}

export default App;
