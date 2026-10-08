import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import useLoad from '../../hooks/useLoad';
import { loadView } from '../../components/LoadState';
import Card from '../../components/Card';
import { rp } from '../../utils/format';

const MENU = [
  ['/admin/members', 'Member'],
  ['/admin/packages', 'Paket Gym'],
  ['/admin/memberships', 'Membership'],
  ['/admin/payments', 'Pembayaran'],
];

// Segmen donut: urutan menentukan warna (emas terang → emas redup → abu).
const SEGMENTS = [
  ['ACTIVE', 'Aktif', '#E8B53D'],
  ['PENDING', 'Menunggu', '#8A6A22'],
  ['OTHER', 'Berakhir / batal', '#3A3A3E'],
];

const short = (n) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n % 1e6 ? 1 : 0).replace('.', ',')}jt`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}rb`;
  return String(n);
};

// Pendapatan (pembayaran Lunas) per bulan, 6 bulan terakhir.
function monthlyRevenue(payments) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('id-ID', { month: 'short' }), total: 0 };
  });
  payments.filter((p) => p.status === 'PAID').forEach((p) => {
    const m = months.find((x) => x.key === String(p.payment_date).slice(0, 7));
    if (m) m.total += Number(p.amount);
  });
  return months;
}

function MembershipDonut({ memberships }) {
  const counts = { ACTIVE: 0, PENDING: 0, OTHER: 0 };
  memberships.forEach((m) => { counts[m.status in counts ? m.status : 'OTHER'] += 1; });
  const total = memberships.length;
  let offset = 0;
  return (
    <Card>
      <div className="ch-hd"><h3>Status membership</h3><span className="mu">{total} total</span></div>
      <div className="donut-row">
        <div className="donut" role="img" aria-label={`${counts.ACTIVE} dari ${total} membership aktif`}>
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="60" fill="none" stroke="#2A2A2D" strokeWidth="14" />
            {total > 0 && SEGMENTS.map(([key, , color]) => {
              const pct = (counts[key] / total) * 100;
              const el = pct > 0 && (
                <circle key={key} cx="75" cy="75" r="60" fill="none" stroke={color} strokeWidth="14" pathLength="100" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} />
              );
              offset += pct;
              return el;
            })}
          </svg>
          <b>{counts.ACTIVE}<span>aktif</span></b>
        </div>
        <div className="legend">
          {SEGMENTS.map(([key, label, color]) => (
            <div key={key}><i style={{ background: color }} />{label}<b>{counts[key]}</b></div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function RevenueBars({ payments }) {
  const months = monthlyRevenue(payments);
  const max = Math.max(...months.map((m) => m.total), 1);
  return (
    <Card>
      <div className="ch-hd"><h3>Pendapatan 6 bulan terakhir</h3><span className="mu">Pembayaran lunas</span></div>
      <div className="bars" role="img" aria-label={months.map((m) => `${m.label}: ${rp(m.total)}`).join(', ')}>
        {months.map((m) => (
          <div className="bar" key={m.key}>
            <small>{m.total ? short(m.total) : ''}</small>
            <i className={m.total ? '' : 'zero'} style={{ height: `${Math.max(2, (m.total / max) * 78)}%` }} />
          </div>
        ))}
      </div>
      <div className="bar-lb">{months.map((m) => <span key={m.key}>{m.label}</span>)}</div>
    </Card>
  );
}

export default function AdminDashboard() {
  const s = useLoad(async () => {
    const [stats, memberships, payments] = await Promise.all([api.stats.get(), api.memberships.list(), api.payments.list()]);
    return { stats, memberships, payments };
  });
  const view = loadView(s);
  if (view) return view;
  const { stats: d, memberships, payments } = s.data;

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stats" style={{ margin: '16px 0 0' }}>
        <Card className="stat"><p className="mu">Total member</p><b>{d.total_members}</b></Card>
        <Card className="stat"><p className="mu">Membership aktif</p><b>{d.active_memberships}</b></Card>
        <Card className="stat gold"><p className="mu">Pendapatan</p><b>{rp(d.revenue)}</b></Card>
        <Card className="stat"><p className="mu">Menunggu konfirmasi</p><b>{d.pending_payments}</b></Card>
      </div>

      <div className="charts">
        <MembershipDonut memberships={memberships} />
        <RevenueBars payments={payments} />
      </div>

      <div className="grid" style={{ marginTop: 12 }}>
        {MENU.map(([to, label]) => (
          <Link key={to} to={to} className="card" style={{ fontWeight: 600 }}>
            {label}<br /><span className="mu" style={{ fontWeight: 400 }}>Kelola data {label.toLowerCase()}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
