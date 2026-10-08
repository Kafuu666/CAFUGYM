import { api } from '../services/api';
import useLoad from '../hooks/useLoad';
import Button from './Button';
import MemberCard from './MemberCard';
import Modal from './Modal';

// Pratinjau kartu member untuk admin + tombol cetak (window.print; CSS cetak hanya menampilkan kartu).
export default function CardModal({ memberId, onClose }) {
  const s = useLoad(() => api.cards.get(memberId));
  const print = (e) => {
    e.preventDefault();
    window.print();
  };

  return (
    <Modal title="Kartu member" onClose={onClose} onSubmit={print}>
      {s.loading && <p className="empty">Memuat kartu…</p>}
      {s.error && <div className="err" role="alert">{s.error}</div>}
      {s.data && <div className="idc-wrap"><MemberCard card={s.data} /></div>}
      <div className="row" style={{ margin: '16px 0 0' }}>
        <Button variant="ghost" onClick={onClose}>Tutup</Button>
        <Button type="submit" small disabled={!s.data}>Cetak kartu</Button>
      </div>
    </Modal>
  );
}
