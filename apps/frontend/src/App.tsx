import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { ReactNode } from 'react';

function Require({ children, roles }: { children: ReactNode; roles?: Array<'CUSTOMER' | 'STAFF' | 'ADMIN'> }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<Require><CartPage /></Require>} />
          <Route path="/orders" element={<Require><OrdersPage /></Require>} />
          <Route path="/orders/:id" element={<Require><OrderDetailPage /></Require>} />
          <Route path="/kitchen" element={<Require roles={['STAFF', 'ADMIN']}><OrdersPage kitchen /></Require>} />
          <Route path="/admin" element={<Require roles={['ADMIN']}><AdminProductsPage /></Require>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
