export const rp = (n) => 'Rp' + Number(n ?? 0).toLocaleString('id-ID');

export const fmtDate = (s) =>
  s ? new Date(`${String(s).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// label Indonesia + warna tag untuk status membership / pembayaran
export const STATUS = {
  ACTIVE: ['Aktif', 'ok'],
  PAID: ['Lunas', 'ok'],
  PENDING: ['Menunggu', 'wn'],
  EXPIRED: ['Berakhir', 'bd'],
  CANCELLED: ['Dibatalkan', 'bd'],
  INACTIVE: ['Tidak aktif', 'mu'], // status member tanpa membership aktif
};

export const METHOD = { QRIS: 'QRIS', CASH: 'Tunai' };
