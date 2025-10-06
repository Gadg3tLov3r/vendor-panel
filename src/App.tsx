import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router";
import LoginPage from "./pages/login-page";
import VendorRegistrationPage from "./pages/vendor-registration-page";
import DashboardPage from "./pages/dashboard-page";
import TopupsPage from "./pages/topups-page";
import BankAccountsPage from "./pages/bank-accounts-page";
import WalletsPage from "./pages/wallets-page";
import PaymentsPage from "./pages/payments-page";
import CreateTopupPage from "./pages/create-topup-page";
import CreateBankAccountPage from "./pages/create-bank-account-page";
import EditBankAccountPage from "./pages/edit-bank-account-page";
import CreateWalletPage from "./pages/create-wallet-page";
import WalletDetailsPage from "./pages/wallet-details-page";
import ChangePasswordPage from "./pages/change-password-page";

import { Route, Routes, Navigate } from "react-router";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<VendorRegistrationPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/top-ups"
              element={
                <ProtectedRoute>
                  <TopupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-accounts"
              element={
                <ProtectedRoute>
                  <BankAccountsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallets"
              element={
                <ProtectedRoute>
                  <WalletsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallets/:id"
              element={
                <ProtectedRoute>
                  <WalletDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/top-ups/create"
              element={
                <ProtectedRoute>
                  <CreateTopupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-accounts/create"
              element={
                <ProtectedRoute>
                  <CreateBankAccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank-accounts/:id/edit"
              element={
                <ProtectedRoute>
                  <EditBankAccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallets/create"
              element={
                <ProtectedRoute>
                  <CreateWalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
