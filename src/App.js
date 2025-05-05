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
import NotFound from './pages/NotFound';

// Pour l'instant, importons des composants temporaires pour les routes à développer plus tard
const TemporaryPage = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">{title} - À développer prochainement</h1>
  </div>
);

const PropertySearch = () => <TemporaryPage title="Recherche de logements" />;
const PropertyDetail = () => <TemporaryPage title="Détail d'un logement" />;

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
            
            {/* Pages privées */}
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