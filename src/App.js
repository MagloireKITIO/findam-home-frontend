// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import IdentityVerification from './pages/IdentityVerification';
import PropertySearch from './pages/PropertySearch';
import PropertyDetail from './pages/PropertyDetail';
import PropertyReviews from './pages/PropertyReviews';
import BookingNew from './pages/BookingNew';
import BookingList from './pages/BookingList';
import BookingDetail from './pages/BookingDetail';
import TenantBookingCalendarPage from './pages/TenantBookingCalendarPage';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import OwnerBookingList from './pages/owner/OwnerBookingList';
import OwnerBookingDetail from './pages/owner/OwnerBookingDetail';
// Nouvelles pages d'authentification
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import WelcomePage from './pages/WelcomePage';
import CompleteProfile from './pages/CompleteProfile';

// Pages de l'espace propriétaire
import OwnerDashboard from './pages/owner/OwnerDashboard';
import PropertyManagement from './pages/owner/PropertyManagement';
import PropertyEditor from './pages/owner/PropertyEditor';
import BookingManagement from './pages/owner/BookingManagement';
import BookingCalendarPage from './pages/owner/BookingCalendarPage';
import PromoCodeManagement from './pages/owner/PromoCodeManagement';
import OwnerSubscription from './pages/owner/OwnerSubscription';
import OwnerSubscriptionPayment from './pages/owner/OwnerSubscriptionPayment';
import SubscriptionSuccess from './pages/owner/SubscriptionSuccess';
import SubscriptionCancel from './pages/owner/SubscriptionCancel';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/properties" element={<PropertySearch />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/properties/:id/reviews" element={<PropertyReviews />} />
            
            {/* Nouvelles routes d'authentification */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/complete-profile" element={<CompleteProfile />} />

            {/* Page d'accès non autorisé */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Pages privées - Accueil et profil */}
            <Route 
              path="/welcome" 
              element={
                <PrivateRoute>
                  <WelcomePage />
                </PrivateRoute>
              } 
            />
            
            {/* Pages privées - Profil et vérification */}
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile/verify" 
              element={
                <PrivateRoute>
                  <IdentityVerification />
                </PrivateRoute>
              } 
            />
            
            {/* Pages privées - Réservations (LOCATAIRES UNIQUEMENT) */}
            <Route 
              path="/booking/new" 
              element={
                <PrivateRoute tenantOnly={true}>
                  <BookingNew />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <PrivateRoute tenantOnly={true}>
                  <BookingList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings/calendar" 
              element={
                <PrivateRoute tenantOnly={true}>
                  <TenantBookingCalendarPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings/:id" 
              element={
                <PrivateRoute tenantOnly={true}>
                  <BookingDetail />
                </PrivateRoute>
              } 
            />
            
            {/* Pages privées - Communications */}
            <Route 
              path="/messages" 
              element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              } 
            />
            
            {/* Pages privées - Espace propriétaire (PROPRIÉTAIRES UNIQUEMENT) */}
            <Route 
              path="/owner/dashboard" 
              element={
                <PrivateRoute ownerOnly={true} requireVerified={true}>
                  <OwnerDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties" 
              element={
                <PrivateRoute ownerOnly={true} requireVerified={true}>
                  <PropertyManagement />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties/new" 
              element={
                <PrivateRoute ownerOnly={true} requireVerified={true}>
                  <PropertyEditor />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties/:id/edit" 
              element={
                <PrivateRoute ownerOnly={true} requireVerified={true}>
                  <PropertyEditor />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/bookings" 
              element={
                <PrivateRoute ownerOnly={true} requireVerified={true}>
                  <OwnerBookingList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/bookings/:id" 
              element={
                <PrivateRoute ownerOnly={true} requireVerified={true}>
                  <OwnerBookingDetail />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/calendar" 
              element={
                <PrivateRoute ownerOnly={true} requireVerified={true}>
                  <BookingCalendarPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/promo-codes" 
              element={
                <PrivateRoute ownerOnly={true} requireVerified={true}>
                  <PromoCodeManagement />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/subscription" 
              element={
                <PrivateRoute ownerOnly={true}>
                  <OwnerSubscription />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/subscription/:id/payment" 
              element={
                <PrivateRoute ownerOnly={true}>
                  <OwnerSubscriptionPayment />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/subscription/success" 
              element={
                <PrivateRoute ownerOnly={true}>
                  <SubscriptionSuccess />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/subscription/cancel" 
              element={
                <PrivateRoute ownerOnly={true}>
                  <SubscriptionCancel />
                </PrivateRoute>
              } 
            />
            
            {/* Redirection et 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;