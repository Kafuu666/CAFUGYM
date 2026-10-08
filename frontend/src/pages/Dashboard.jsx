import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useLoad from '../hooks/useLoad';
import { loadView } from '../components/LoadState';
import Card from '../components/Card';
import Tag from '../components/Tag';
import { fmtDate, rp } from '../utils/format';

const C = 276.5; // keliling lingkaran r=44

function MembershipPass({ m }) {
  const day = 864e5;
  const total = Math.max(1, (new Date(`${m.end_date}T00:00:00`) - new Date(`${m.start_date}T00:00:00`)) / day + 1);
  const left = Math.max(0, Math.ceil((new Date(`${m.end_date}T23:59:59`) - Date.now()) / day));
  return (
    <section className="pass">
      <div>
        <small>Membership saya</small>
        <h2>{m.package_name}</h2>
        <Tag status={m.status} />
        <p style={{ marginTop: 10 }}><small>{fmtDate(m.start_date)} – {fmtDate(m.end_date)}</small></p>
      </div>
      <div className="ring" role="img" aria-label={`${left} hari lagi`}>
        <svg width="104" height="104" viewBox="0 0 104 104">
          <circle cx="52" cy="52" r="44" fill="none" stroke="rgba(232,181,61,.18)" strokeWidth="9" />
          <circle cx="52" cy="52" r="44" fill="none" stroke="var(--ac)" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(1, left / total))} />
        </svg>
        <b>{left}<span>hari lagi</span></b>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const s = useLoad(async () => {
    const [memberships, payments] = await Promise.all([api.memberships.list(), api.payments.list()]);
    return { memberships, payments };
  });
  const view = loadView(s);
  if (view) return view;

  const { memberships, payments } = s.data;
  const active = memberships.find((m) => m.status === 'ACTIVE');
  const paid = payments.filter((p) => p.status === 'PAID').reduce((t, p) => t + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <>
      <h1>Halo, {user.name.split(' ')[0]}</h1>
      <div className="stack" style={{ marginTop: 14 }}>
        {active ? (
          <MembershipPass m={active} />
        ) : (
          <Card className="empty">
            <h3>Belum ada membership aktif</h3>
            <p className="mu" style={{ marginTop: 6 }}>Pilih paket untuk mulai latihan di CAFU GYM.</p>
          </Card>
        )}
        <Link to="/packages" className="btn">Lihat Paket</Link>
        <Card>
          <h3>Ringkasan pembayaran</h3>
          <p className="mu" style={{ marginTop: 4 }}>Total lunas {rp(paid)}</p>
          <p className="mu">{pending ? `${pending} pembayaran menunggu` : 'Tidak ada tagihan tertunda'}</p>
          {pending > 0 && <Link to="/payments" className="link" style={{ paddingLeft: 0 }}>Bayar sekarang</Link>}
        </Card>
      </div>
    </>
  );
}
