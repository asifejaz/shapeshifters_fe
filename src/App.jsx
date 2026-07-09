import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Subscribers = lazy(() => import('./pages/Subscribers'));
const SubscriberForm = lazy(() => import('./pages/SubscriberForm'));
const SubscriberDetail = lazy(() => import('./pages/SubscriberDetail'));
const Branches = lazy(() => import('./pages/Branches'));
const Services = lazy(() => import('./pages/Services'));
const FeePlans = lazy(() => import('./pages/FeePlans'));
const Checkins = lazy(() => import('./pages/Checkins'));
const Payments = lazy(() => import('./pages/Payments'));
const CmsPages = lazy(() => import('./pages/cms/CmsPages'));
const CmsPageForm = lazy(() => import('./pages/cms/CmsPageForm'));
const CmsMenus = lazy(() => import('./pages/cms/CmsMenus'));
const CmsSettings = lazy(() => import('./pages/cms/CmsSettings'));
const CmsSliders = lazy(() => import('./pages/cms/CmsSliders'));
const CmsPosters = lazy(() => import('./pages/cms/CmsPosters'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const Gallery = lazy(() => import('./pages/Gallery'));
const ProductCategories = lazy(() => import('./pages/shop/ProductCategories'));
const Products = lazy(() => import('./pages/shop/Products'));
const Orders = lazy(() => import('./pages/shop/Orders'));
const BiometricDevices = lazy(() => import('./pages/biometric/BiometricDevices'));
const BiometricEnrollments = lazy(() => import('./pages/biometric/BiometricEnrollments'));
const AttendanceLogs = lazy(() => import('./pages/biometric/AttendanceLogs'));
const OrdersReport = lazy(() => import('./pages/reports/OrdersReport'));
const SubscribersReport = lazy(() => import('./pages/reports/SubscribersReport'));
const SubscribersReportDetails = lazy(() => import('./pages/reports/SubscribersReportDetails'));
const PublicLayout = lazy(() => import('./pages/public/PublicLayout'));
const HomePage = lazy(() => import('./pages/public/HomePage'));
const PublicPage = lazy(() => import('./pages/public/PublicPage'));
const DesignedPage = lazy(() => import('./pages/public/DesignedPage'));
const PostersPage = lazy(() => import('./pages/public/PostersPage'));
const ShopPage = lazy(() => import('./pages/public/ShopPage'));
const CheckoutPage = lazy(() => import('./pages/public/CheckoutPage'));
const ProductDetailsPage = lazy(() => import('./pages/public/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/public/CartPage'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/admin" />;
  return children;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/programs" element={<DesignedPage slug="programs" />} />
              <Route path="/trainers" element={<DesignedPage slug="trainers" />} />
              <Route path="/pricing" element={<DesignedPage slug="pricing" />} />
              <Route path="/contact" element={<DesignedPage slug="contact" />} />
              <Route path="/posters" element={<PostersPage />} />
              <Route path="/page/gallery" element={<Navigate to="/" />} />
              <Route path="/page/:slug" element={<PublicPage />} />
              <Route path="/gallery" element={<Navigate to="/" />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:slug" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

            {/* Admin panel */}
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/subscribers" element={<ProtectedRoute><Subscribers /></ProtectedRoute>} />
            <Route path="/admin/subscribers/new" element={<ProtectedRoute><SubscriberForm /></ProtectedRoute>} />
            <Route path="/admin/subscribers/:id" element={<ProtectedRoute><SubscriberDetail /></ProtectedRoute>} />
            <Route path="/admin/subscribers/:id/edit" element={<ProtectedRoute><SubscriberForm /></ProtectedRoute>} />
            <Route path="/admin/branches" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/admin/fee-plans" element={<ProtectedRoute><FeePlans /></ProtectedRoute>} />
            <Route path="/admin/checkins" element={<ProtectedRoute><Checkins /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<Navigate to="/admin/reports/orders" />} />
            <Route path="/admin/reports/orders" element={<ProtectedRoute><OrdersReport /></ProtectedRoute>} />
            <Route path="/admin/reports/subscribers" element={<ProtectedRoute><SubscribersReport /></ProtectedRoute>} />
            <Route path="/admin/reports/subscribers/details" element={<ProtectedRoute><SubscribersReportDetails /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />

            {/* Biometric / ZKTeco */}
            <Route path="/admin/biometric/devices" element={<ProtectedRoute><BiometricDevices /></ProtectedRoute>} />
            <Route path="/admin/biometric/enrollments" element={<ProtectedRoute><BiometricEnrollments /></ProtectedRoute>} />
            <Route path="/admin/biometric/attendance" element={<ProtectedRoute><AttendanceLogs /></ProtectedRoute>} />

            {/* CMS Admin */}
            <Route path="/cms/pages" element={<ProtectedRoute><CmsPages /></ProtectedRoute>} />
            <Route path="/cms/pages/new" element={<ProtectedRoute><CmsPageForm /></ProtectedRoute>} />
            <Route path="/cms/pages/:id/edit" element={<ProtectedRoute><CmsPageForm /></ProtectedRoute>} />
            <Route path="/cms/menus" element={<ProtectedRoute><CmsMenus /></ProtectedRoute>} />
            <Route path="/cms/settings" element={<ProtectedRoute><CmsSettings /></ProtectedRoute>} />
            <Route path="/cms/sliders" element={<ProtectedRoute><CmsSliders /></ProtectedRoute>} />
            <Route path="/cms/posters" element={<ProtectedRoute><CmsPosters /></ProtectedRoute>} />
            <Route path="/cms/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />

            {/* Shop Admin */}
            <Route path="/shop/categories" element={<ProtectedRoute><ProductCategories /></ProtectedRoute>} />
            <Route path="/shop/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/shop/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
