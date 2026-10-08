import { api } from '../services/api';
import useLoad from '../hooks/useLoad';
import { loadView } from '../components/LoadState';
import Tag from '../components/Tag';
import { fmtDate } from '../utils/format';

export default function Membership() {
  const s = useLoad(() => api.memberships.list());
  const view = loadView(s);
  if (view) return view;

  return (
    <>
      <h1>Membership</h1>
      <div className="stack" style={{ marginTop: 14 }}>
        {s.data.length === 0 && <p className="empty">Belum ada membership. Pilih paket di menu Paket.</p>}
        {s.data.map((m) => (
          <article className="it" key={m.id}>
            <div>
              <h3>{m.package_name}</h3>
              <p className="mu">{fmtDate(m.start_date)} – {fmtDate(m.end_date)}</p>
            </div>
            <Tag status={m.status} />
          </article>
        ))}
      </div>
    </>
  );
}
