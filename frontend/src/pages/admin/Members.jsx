import { useState } from 'react';
import Button from '../../components/Button';
import CardModal from '../../components/CardModal';
import CrudPage from '../../components/CrudPage';
import Tag from '../../components/Tag';

const fields = [
  { name: 'name', label: 'Nama', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'password', label: 'Password', type: 'password', required: 'create', hint: 'Saat mengubah, kosongkan jika tidak diganti' },
  { name: 'phone', label: 'No. HP', type: 'tel', required: true },
  { name: 'address', label: 'Alamat', required: true },
];

const filters = [
  ['all', 'Semua', () => true],
  ['active', 'Aktif', (r) => r.is_active],
  ['inactive', 'Tidak aktif', (r) => !r.is_active],
];

export default function Members() {
  const [cardId, setCardId] = useState(null);

  return (
    <>
      <CrudPage
        title="Member"
        resource="members"
        fields={fields}
        filters={filters}
        item={{ title: (r) => r.name, sub: (r) => `${r.member_code} · ${r.email} · ${r.phone || '-'}` }}
        badge={(r) => <Tag status={r.is_active ? 'ACTIVE' : 'INACTIVE'} />}
        extra={(r) => (
          <Button variant="ghost" disabled={!r.has_paid} title={r.has_paid ? undefined : 'Kartu terbit setelah pembayaran lunas'} onClick={() => setCardId(r.id)}>
            Kartu
          </Button>
        )}
        canRemove={(r) => !r.is_active}
        removeHint="Member aktif tidak dapat dihapus. Hapus setelah membership berakhir."
        removeWarn={(r) => `Hapus ${r.name}? Riwayat membership dan pembayarannya ikut terhapus dan tidak dapat dikembalikan.`}
      />
      {cardId && <CardModal memberId={cardId} onClose={() => setCardId(null)} />}
    </>
  );
}
