import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router";
import { Route, Routes, Navigate } from "react-router";

// Lazy load pages for code-splitting
const LoginPage = lazy(() => import("./pages/login-page"));
const VendorRegistrationPage = lazy(
  () => import("./pages/vendor-registration-page")
);
const DashboardPage = lazy(() => import("./pages/dashboard-page"));
const TopupsPage = lazy(() => import("./pages/topups-page"));
const BankAccountsPage = lazy(() => import("./pages/bank-accounts-page"));
const WalletsPage = lazy(() => import("./pages/wallets-page"));
const PaymentsPage = lazy(() => import("./pages/payments-page"));
const CreateTopupPage = lazy(() => import("./pages/create-topup-page"));
const CreateBankAccountPage = lazy(
  () => import("./pages/create-bank-account-page")
);
const EditBankAccountPage = lazy(
  () => import("./pages/edit-bank-account-page")
);
const CreateWalletPage = lazy(() => import("./pages/create-wallet-page"));
const WalletDetailsPage = lazy(() => import("./pages/wallet-details-page"));
const ChangePasswordPage = lazy(() => import("./pages/change-password-page"));
const BankAccountsReportsPage = lazy(
  () => import("./pages/bank-accounts-reports-page")
);
const FastDepositPage = lazy(() => import("./pages/fast-deposit-page"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
                path="/bank-accounts/reports"
                element={
                  <ProtectedRoute>
                    <BankAccountsReportsPage />
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
              <Route
                path="/fast-deposit"
                element={
                  <ProtectedRoute>
                    <FastDepositPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
