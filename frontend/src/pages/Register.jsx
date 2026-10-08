import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorText } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <main className="wrap auth">
      <div className="logo">CAFU<br />GYM</div>
      <p className="mu" style={{ margin: '10px 0 22px' }}>Buat akun member untuk memilih paket dan memantau membership.</p>
      {error && <div className="err" role="alert">{error}</div>}
      <form onSubmit={submit}>
        <Input label="Nama" required autoComplete="name" value={form.name} onChange={set('name')} />
        <Input label="Email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
        <Input label="Password" type="password" required minLength={6} autoComplete="new-password" hint="Minimal 6 karakter" value={form.password} onChange={set('password')} />
        <Input label="No. HP" type="tel" required autoComplete="tel" value={form.phone} onChange={set('phone')} />
        <Input label="Alamat" required autoComplete="street-address" value={form.address} onChange={set('address')} />
        <Button type="submit" disabled={busy}>{busy ? 'Memproses…' : 'Daftar'}</Button>
      </form>
      <p className="mu" style={{ textAlign: 'center', marginTop: 14 }}>
        Sudah punya akun? <Link to="/login" className="link">Masuk</Link>
      </p>
    </main>
  );
}
