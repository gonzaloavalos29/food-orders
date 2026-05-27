import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import './AuthForm.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await register({ email, password, name });
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="fo-auth">
      <h2>Crear cuenta</h2>
      <label>Nombre
        <input required value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label>Email
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label>Contraseña (mín 8)
        <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      {error && <div className="fo-auth__error">{error}</div>}
      <Button type="submit" disabled={busy}>{busy ? 'Creando…' : 'Crear cuenta'}</Button>
      <p>¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </form>
  );
}
