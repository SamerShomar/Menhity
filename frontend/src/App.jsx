import { Route, Routes } from "react-router-dom";

import { DashboardLayout, GuestOnly, PublicLayout, RequireAuth } from "@/components/layout/Layouts";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

import LandingPage from "@/pages/public/Landing";
import ScholarshipsPage from "@/pages/public/Scholarships";
import ScholarshipDetailPage from "@/pages/public/ScholarshipDetail";
import AboutPage from "@/pages/public/About";
import ContactPage from "@/pages/public/Contact";
import FaqPage from "@/pages/public/Faq";
import HelpPage from "@/pages/public/Help";
import { PrivacyPage, TermsPage } from "@/pages/public/LegalPage";
import NotFoundPage from "@/pages/public/NotFound";

import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";
import VerifyCodePage from "@/pages/auth/VerifyCode";
import ResetPasswordPage from "@/pages/auth/ResetPassword";
import ResetSuccessPage from "@/pages/auth/ResetSuccess";

import DashboardOverviewPage from "@/pages/dashboard/Overview";
import ProfilePage from "@/pages/dashboard/Profile";
import SavedPage from "@/pages/dashboard/Saved";
import DocumentsPage from "@/pages/dashboard/Documents";
import NotificationsPage from "@/pages/dashboard/Notifications";
import SettingsPage from "@/pages/dashboard/Settings";

import ToolsHubPage from "@/pages/tools/ToolsHub";
import ToolRunPage from "@/pages/tools/ToolRun";
import CvWizardPage from "@/pages/tools/CvWizard";
import CvOrderTrackingPage from "@/pages/tools/CvOrderTracking";

export function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ---------- شاشات المصادقة: بلا هيدر أو فوتر ---------- */}
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-success" element={<ResetSuccessPage />} />
        </Route>

        {/* ---------- لوحة الطالب ---------- */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardOverviewPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/saved" element={<SavedPage />} />
            <Route path="/dashboard/documents" element={<DocumentsPage />} />
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>

          {/* أدوات تتطلّب تسجيل دخول — بعرض الصفحة كاملاً */}
          <Route element={<PublicLayout />}>
            <Route path="/tools/cv-builder" element={<CvWizardPage />} />
            <Route path="/tools/cv-builder/:id" element={<CvOrderTrackingPage />} />
            <Route path="/tools/:key" element={<ToolRunPage />} />
          </Route>
        </Route>

        {/* ---------- الصفحات العامة ---------- */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/tools" element={<ToolsHubPage />} />
          <Route path="/scholarships/:slug" element={<ScholarshipDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
