import CrudPage from '../../components/CrudPage';
import { fmtDate } from '../../utils/format';

const fields = [
  { name: 'member_id', label: 'Member', type: 'select', required: true, from: { resource: 'members', label: (m) => m.name } },
  { name: 'package_id', label: 'Paket', type: 'select', required: true, from: { resource: 'packages', label: (p) => p.name } },
  { name: 'start_date', label: 'Tanggal mulai', type: 'date', hint: 'Kosongkan untuk hari ini' },
  { name: 'end_date', label: 'Tanggal berakhir', type: 'date', hint: 'Kosongkan untuk otomatis sesuai durasi paket' },
  { name: 'status', label: 'Status', type: 'select', options: [['PENDING', 'Menunggu'], ['ACTIVE', 'Aktif'], ['EXPIRED', 'Berakhir']] },
];

export default function Memberships() {
  return (
    <CrudPage
      title="Membership"
      resource="memberships"
      fields={fields}
      showStatus
      item={{ title: (r) => r.member_name, sub: (r) => `${r.package_name}, ${fmtDate(r.start_date)} – ${fmtDate(r.end_date)}` }}
    />
  );
}
