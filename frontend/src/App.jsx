import { Route, Routes } from "react-router-dom";

import { GuestOnly, PublicLayout } from "@/components/layout/Layouts";
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

        {/* ---------- الصفحات العامة ---------- */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
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
