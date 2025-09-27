import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./Login";
import Dashboard from "./Dashboard";
import TopupPage from "./pages/TopupPage";
import WalletPage from "./pages/WalletPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/topup"
              element={
                <ProtectedRoute>
                  <TopupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
