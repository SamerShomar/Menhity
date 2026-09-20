import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import {
  AdminLayout,
  DashboardLayout,
  ExpertLayout,
  GuestOnly,
  PublicLayout,
  RequireAdmin,
  RequireAuth,
  RequireExpert,
} from "@/components/layout/Layouts";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { FullPageLoader } from "@/components/ui/Spinner";

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
import VerifyEmailPage from "@/pages/auth/VerifyEmail";
import ResetPasswordPage from "@/pages/auth/ResetPassword";
import ResetSuccessPage from "@/pages/auth/ResetSuccess";

import DashboardOverviewPage from "@/pages/dashboard/Overview";
import ProfilePage from "@/pages/dashboard/Profile";
import SavedPage from "@/pages/dashboard/Saved";
import DocumentsPage from "@/pages/dashboard/Documents";
import NotificationsPage from "@/pages/dashboard/Notifications";
import SettingsPage from "@/pages/dashboard/Settings";

import ToolsHubPage from "@/pages/tools/ToolsHub";
import CvWizardPage from "@/pages/tools/CvWizard";
import ServiceRequestPage from "@/pages/tools/ServiceRequest";
import CvOrderTrackingPage from "@/pages/tools/CvOrderTracking";

/* لوحة الإدارة تُحمَّل عند الطلب — لا يحتاجها الطالب ولا الزائر */
const AdminDashboardPage = lazy(() => import("@/pages/admin/Dashboard"));
const AdminScholarshipsPage = lazy(() => import("@/pages/admin/Scholarships"));
const AdminScholarshipFormPage = lazy(
  () => import("@/pages/admin/ScholarshipForm"),
);
const AdminUsersPage = lazy(() => import("@/pages/admin/Users"));
const AdminAiToolsPage = lazy(() => import("@/pages/admin/AiTools"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/Orders"));
const AdminNotificationsPage = lazy(
  () => import("@/pages/admin/Notifications"),
);
const AdminReportsPage = lazy(() => import("@/pages/admin/Reports"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/Settings"));
/* مساحة الخبير مستقلّة أيضاً — لا يحتاجها الطالب ولا الزائر */
const ExpertOrdersPage = lazy(() => import("@/pages/expert/Orders"));

/**
 * إشعارات أُنشئت قبل تصحيح الرابط تحمل مساراً بقطعة «orders/» زائدة لا
 * تطابق أي مسار مسجَّل، فتصل 404. الرابط الصحيح بلا هذه القطعة، فنحوّل
 * إليه بدل أن يُطبع الخطأ إلى الأبد في كل إشعار قديم مخزَّن.
 */
function RedirectToOrder() {
  const { id } = useParams();
  return <Navigate to={`/tools/cv-builder/${id}`} replace />;
}

export function App() {
  return (
    <>
      <ScrollToTop />

      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          {/* ---------- شاشات المصادقة: بلا هيدر أو فوتر ---------- */}
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-code" element={<VerifyCodePage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
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
              <Route
                path="/dashboard/notifications"
                element={<NotificationsPage />}
              />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
            </Route>

            {/* أدوات تتطلّب تسجيل دخول — بعرض الصفحة كاملاً */}
            <Route element={<PublicLayout />}>
              <Route path="/tools/cv-builder" element={<CvWizardPage />} />
              <Route
                path="/tools/cv-builder/:id"
                element={<CvOrderTrackingPage />}
              />
              {/* رابط قديم في إشعارات سابقة — عوّجناه، فنعيد توجيهه بدل 404 */}
              <Route
                path="/tools/cv-builder/orders/:id"
                element={<RedirectToOrder />}
              />
              <Route path="/tools/request" element={<ServiceRequestPage />} />
            </Route>
          </Route>

          {/* ---------- لوحة الإدارة ---------- */}
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route
                path="/admin/scholarships"
                element={<AdminScholarshipsPage />}
              />
              <Route
                path="/admin/scholarships/new"
                element={<AdminScholarshipFormPage />}
              />
              <Route
                path="/admin/scholarships/:slug"
                element={<AdminScholarshipFormPage />}
              />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/ai-tools" element={<AdminAiToolsPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route
                path="/admin/notifications"
                element={<AdminNotificationsPage />}
              />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* ---------- مساحة عمل الخبير ---------- */}
          <Route element={<RequireExpert />}>
            <Route element={<ExpertLayout />}>
              <Route path="/expert" element={<ExpertOrdersPage />} />
            </Route>
          </Route>

          {/* ---------- الصفحات العامة ---------- */}
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/tools" element={<ToolsHubPage />} />
            <Route
              path="/scholarships/:slug"
              element={<ScholarshipDetailPage />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
