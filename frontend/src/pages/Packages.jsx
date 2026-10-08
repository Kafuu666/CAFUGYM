import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorText } from '../services/api';
import useLoad from '../hooks/useLoad';
import { loadView } from '../components/LoadState';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Card from '../components/Card';
import { rp } from '../utils/format';

export default function Packages() {
  const navigate = useNavigate();
  const toast = useToast();
  const s = useLoad(() => api.packages.list());
  const [busyId, setBusyId] = useState(null);
  const view = loadView(s);
  if (view) return view;

  const pick = async (pkg) => {
    setBusyId(pkg.id);
    try {
      await api.memberships.create({ package_id: pkg.id }); // membership PENDING + tagihan PENDING
      toast(`Paket ${pkg.name} dipilih. Selesaikan pembayaran untuk mengaktifkan.`);
      navigate('/payments');
    } catch (e) {
      toast(errorText(e));
      setBusyId(null);
    }
  };

  return (
    <>
      <h1>Paket Gym</h1>
      <div className="stack" style={{ marginTop: 14 }}>
        {s.data.map((p) => (
          <Card as="article" key={p.id} className={`pk${p.name === 'Premium' ? ' hot' : ''}`}>
            <div className="row" style={{ margin: 0 }}>
              <h3>{p.name}</h3>
              <span className="tag mu">{p.duration} bulan</span>
            </div>
            <div className="price">{rp(p.price)}</div>
            <p className="mu">{p.description}</p>
            <Button disabled={busyId !== null} onClick={() => pick(p)}>{busyId === p.id ? 'Memproses…' : 'Pilih paket'}</Button>
          </Card>
        ))}
      </div>
    </>
  );
}
