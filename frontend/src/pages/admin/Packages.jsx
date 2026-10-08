import CrudPage from '../../components/CrudPage';
import { rp } from '../../utils/format';

const fields = [
  { name: 'name', label: 'Nama paket', required: true },
  { name: 'duration', label: 'Durasi (bulan)', type: 'number', required: true },
  { name: 'price', label: 'Harga (Rp)', type: 'number', required: true },
  { name: 'description', label: 'Deskripsi', type: 'textarea' },
];

export default function AdminPackages() {
  return (
    <CrudPage
      title="Paket Gym"
      resource="packages"
      fields={fields}
      item={{ title: (r) => r.name, sub: (r) => `${r.duration} bulan, ${rp(r.price)}` }}
    />
  );
}
