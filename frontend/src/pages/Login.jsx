import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password); // berhasil → AuthContext terisi, halaman ini otomatis dialihkan
    } catch (err) {
      setError(errorText(err)); // login gagal: tetap di halaman login + pesan error
      setBusy(false);
    }
  };

  return (
    <main className="wrap auth">
      <div className="logo">CAFU<br />GYM</div>
      <p className="mu" style={{ margin: '10px 0 22px' }}>Kelola latihan dan keanggotaan dalam satu tempat.</p>
      {error && <div className="err" role="alert">{error}</div>}
      <form onSubmit={submit}>
        <Input label="Email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
        <Input label="Password" type="password" required autoComplete="current-password" value={form.password} onChange={set('password')} />
        <Button type="submit" disabled={busy}>{busy ? 'Memproses…' : 'Masuk'}</Button>
      </form>
      <p className="mu" style={{ textAlign: 'center', marginTop: 14 }}>
        Belum punya akun? <Link to="/register" className="link">Daftar</Link>
      </p>
      {import.meta.env.DEV && (
        <div className="chips">
          <span className="mu">Akun contoh (hasil seed):</span>
          <button type="button" className="chip" onClick={() => setForm({ email: 'cafu@gmail.com', password: '123456' })}>Member</button>
          <button type="button" className="chip" onClick={() => setForm({ email: 'admin@cafu.com', password: 'admin123' })}>Admin</button>
        </div>
      )}
    </main>
  );
}
