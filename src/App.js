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
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

// Pages de l'espace propriétaire
import OwnerDashboard from './pages/owner/OwnerDashboard';
import PropertyManagement from './pages/owner/PropertyManagement';
import PropertyEditor from './pages/owner/PropertyEditor';

// Pour l'instant, importons des composants temporaires pour les routes à développer plus tard
const TemporaryPage = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">{title} - À développer prochainement</h1>
  </div>
);

// Pages qui seront développées dans les prochaines étapes
const BookingManagement = () => <TemporaryPage title="Gestion des réservations" />;
const PromoCodeCreation = () => <TemporaryPage title="Création de codes promo" />;
const OwnerSubscription = () => <TemporaryPage title="Abonnement propriétaire" />;
const OwnerSubscriptionPayment = () => <TemporaryPage title="Paiement de l'abonnement" />;

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
            
            {/* Pages privées - Réservations */}
            <Route 
              path="/booking/new" 
              element={
                <PrivateRoute>
                  <BookingNew />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <PrivateRoute>
                  <BookingList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings/:id" 
              element={
                <PrivateRoute>
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
            
            {/* Pages privées - Espace propriétaire */}
            <Route 
              path="/owner/dashboard" 
              element={
                <PrivateRoute requireVerified={true}>
                  <OwnerDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties" 
              element={
                <PrivateRoute requireVerified={true}>
                  <PropertyManagement />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties/new" 
              element={
                <PrivateRoute requireVerified={true}>
                  <PropertyEditor />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties/:id/edit" 
              element={
                <PrivateRoute requireVerified={true}>
                  <PropertyEditor />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/bookings" 
              element={
                <PrivateRoute requireVerified={true}>
                  <BookingManagement />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/promo-codes" 
              element={
                <PrivateRoute requireVerified={true}>
                  <PromoCodeCreation />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/subscription" 
              element={
                <PrivateRoute>
                  <OwnerSubscription />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/subscription/:id/payment" 
              element={
                <PrivateRoute>
                  <OwnerSubscriptionPayment />
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