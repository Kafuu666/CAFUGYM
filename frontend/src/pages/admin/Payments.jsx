import CrudPage from '../../components/CrudPage';
import Button from '../../components/Button';
import { api, errorText } from '../../services/api';
import { METHOD, fmtDate, rp } from '../../utils/format';

const fields = [
  {
    name: 'membership_id', label: 'Membership', type: 'select', required: true,
    from: { resource: 'memberships', label: (m) => `#${m.id} ${m.member_name}, ${m.package_name}` },
  },
  { name: 'amount', label: 'Jumlah (Rp)', type: 'number', hint: 'Kosongkan untuk harga paket' },
  { name: 'payment_date', label: 'Tanggal bayar', type: 'date', hint: 'Kosongkan untuk hari ini' },
  { name: 'method', label: 'Metode', type: 'select', options: [['CASH', 'Tunai'], ['QRIS', 'QRIS']], hint: 'Wajib diisi jika status Lunas' },
  { name: 'status', label: 'Status', type: 'select', options: [['PENDING', 'Menunggu'], ['PAID', 'Lunas'], ['CANCELLED', 'Dibatalkan']] },
];

// Konfirmasi pembayaran yang diterima di kasir (tunai) atau yang dananya sudah masuk (QRIS).
// Membership menjadi aktif dan kartu member terbit.
async function settle(row, method, { reload, toast }) {
  try {
    await api.payments.pay(row.id, method);
    toast('Pembayaran dikonfirmasi');
    reload();
  } catch (e) {
    toast(errorText(e));
  }
}

export default function AdminPayments() {
  return (
    <CrudPage
      title="Pembayaran"
      resource="payments"
      fields={fields}
      showStatus
      item={{
        title: (r) => rp(r.amount),
        sub: (r) => `${r.member_name}, ${r.package_name}, ${fmtDate(r.payment_date)}${r.method ? ` · ${METHOD[r.method]}` : ''}`,
      }}
      extra={(r, ctx) => r.status === 'PENDING' && (
        <>
          <Button small onClick={() => settle(r, 'CASH', ctx)}>Terima tunai</Button>
          <Button variant="ghost" onClick={() => settle(r, 'QRIS', ctx)}>Terima QRIS</Button>
        </>
      )}
    />
  );
}
