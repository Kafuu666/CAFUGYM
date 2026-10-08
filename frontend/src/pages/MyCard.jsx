import { Link } from 'react-router-dom';
import { api } from '../services/api';
import useLoad from '../hooks/useLoad';
import { loadView } from '../components/LoadState';
import Card from '../components/Card';
import MemberCard from '../components/MemberCard';

export default function MyCard() {
  const s = useLoad(() => api.cards.mine());
  const view = loadView(s);
  if (view) return view;

  return (
    <>
      <h1>Kartu Member</h1>
      <div className="stack" style={{ marginTop: 14 }}>
        {s.data ? (
          <>
            <div className="idc-wrap"><MemberCard card={s.data} /></div>
            <p className="mu" style={{ textAlign: 'center' }}>
              Tunjukkan kartu ini ke resepsionis. Kartu fisik dapat dicetak oleh admin CAFU GYM.
            </p>
          </>
        ) : (
          <Card className="empty">
            <h3>Kartu belum tersedia</h3>
            <p className="mu" style={{ margin: '6px 0 14px' }}>Kartu member terbit setelah pembayaran lunas.</p>
            <Link to="/payments" className="btn">Ke pembayaran</Link>
          </Card>
        )}
      </div>
    </>
  );
}
