import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorText } from '../services/api';
import useLoad from '../hooks/useLoad';
import { loadView } from '../components/LoadState';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Tag from '../components/Tag';
import { METHOD, fmtDate, rp } from '../utils/format';

// Gambar QRIS gym. Ganti frontend/public/qris.svg dengan QRIS asli, atau isi VITE_QRIS_IMAGE di .env.
const QRIS_IMAGE = import.meta.env.VITE_QRIS_IMAGE || '/qris.svg';

const OPTIONS = [
  ['QRIS', 'QRIS', 'Scan dengan e-wallet atau mobile banking'],
  ['CASH', 'Tunai', 'Bayar langsung di kasir CAFU GYM'],
];

function PayModal({ payment, onClose, onDone }) {
  const [method, setMethod] = useState('QRIS');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onDone(await api.payments.pay(payment.id, method));
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <Modal title="Pilih metode pembayaran" onClose={onClose} onSubmit={submit}>
      <p className="mu" style={{ marginBottom: 14 }}>{payment.package_name}, <b>{rp(payment.amount)}</b></p>
      {error && <div className="err" role="alert">{error}</div>}

      <div role="radiogroup" aria-label="Metode pembayaran">
        {OPTIONS.map(([value, label, hint]) => (
          <label key={value} className={`method${method === value ? ' on' : ''}`}>
            <input type="radio" name="method" value={value} checked={method === value} onChange={() => setMethod(value)} />
            <span><b>{label}</b><small>{hint}</small></span>
          </label>
        ))}
      </div>

      {method === 'QRIS' ? (
        <div className="qris">
          <img src={QRIS_IMAGE} alt="Kode QRIS CAFU GYM" />
          <p className="mu">Scan kode di atas, bayar {rp(payment.amount)}, lalu tekan tombol di bawah.</p>
        </div>
      ) : (
        <p className="mu" style={{ margin: '4px 0 14px' }}>
          Datang ke kasir dan bayar {rp(payment.amount)}. Membership aktif dan kartu member terbit setelah admin mengonfirmasi pembayaran.
        </p>
      )}

      <div className="row" style={{ margin: '6px 0 0' }}>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
        <Button type="submit" small disabled={busy}>
          {busy ? 'Memproses…' : method === 'QRIS' ? 'Saya sudah bayar' : 'Bayar di kasir'}
        </Button>
      </div>
    </Modal>
  );
}

export default function Payments() {
  const toast = useToast();
  const navigate = useNavigate();
  const s = useLoad(() => api.payments.list());
  const [paying, setPaying] = useState(null);
  const view = loadView(s);
  if (view) return view;

  // Lunas → kartu member sudah terbit, arahkan ke halaman kartu. Tunai → tetap menunggu kasir.
  const done = async ({ message, data }) => {
    setPaying(null);
    toast(message);
    if (data.status === 'PAID') navigate('/card');
    else await s.reload();
  };

  return (
    <>
      <h1>Pembayaran</h1>
      <div className="stack" style={{ marginTop: 14 }}>
        {s.data.length === 0 && <p className="empty">Belum ada riwayat pembayaran.</p>}
        {s.data.map((p) => (
          <article className="it" key={p.id}>
            <div>
              <h3>{rp(p.amount)}</h3>
              <p className="mu">{p.package_name}, {fmtDate(p.payment_date)}{p.method ? ` · ${METHOD[p.method]}` : ''}</p>
              {p.status === 'PENDING' && p.method && <p className="mu">Menunggu konfirmasi admin di kasir.</p>}
            </div>
            <Tag status={p.status} />
            {p.status === 'PENDING' && (
              <div className="ac">
                <Button small onClick={() => setPaying(p)}>{p.method ? 'Ubah metode' : 'Bayar sekarang'}</Button>
              </div>
            )}
          </article>
        ))}
      </div>
      {paying && <PayModal payment={paying} onClose={() => setPaying(null)} onDone={done} />}
    </>
  );
}
