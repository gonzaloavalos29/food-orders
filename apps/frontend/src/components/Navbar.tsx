import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from './Button';
import './Navbar.css';

export function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="fo-nav">
      <Link to="/" className="fo-nav__brand">🍕 Food Orders</Link>
      <div className="fo-nav__links">
        <Link to="/">Productos</Link>
        {user && <Link to="/cart">Carrito</Link>}
        {user && <Link to="/orders">Mis pedidos</Link>}
        {user?.role === 'STAFF' && <Link to="/kitchen">Cocina</Link>}
        {user?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
      </div>
      <div className="fo-nav__auth">
        {user ? (
          <>
            <span className="fo-nav__user">{user.name} ({user.role})</span>
            <Button size="sm" variant="secondary" onClick={logout}>Salir</Button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
