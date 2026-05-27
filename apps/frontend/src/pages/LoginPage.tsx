import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import './AuthForm.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="fo-auth">
      <h2>Iniciar sesión</h2>
      <label>Email
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label>Contraseña
        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      {error && <div className="fo-auth__error">{error}</div>}
      <Button type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Button>
      <p>¿No tenés cuenta? <Link to="/register">Registrarse</Link></p>
    </form>
  );
}
