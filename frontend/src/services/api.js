// Semua komunikasi ke backend memakai Fetch API di file ini.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const KEY = 'cafu_token';

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const readStored = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};
let token = readStored();

export const getToken = () => token;
export function setToken(t) {
  token = t;
  try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* penyimpanan tidak tersedia */ }
}

// Dipanggil AuthContext: jika token ditolak server (401), sesi dibersihkan.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { ...(body && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Pastikan backend berjalan.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data.message || 'Terjadi kesalahan.', data.errors);
  }
  return data;
}

// Pesan error siap tampil, termasuk alasan per field dari validasi backend (HTTP 422).
export function errorText(e) {
  const fields = e?.errors && Object.entries(e.errors).map(([k, v]) => (k === '_' ? v : `${k}: ${v}`));
  return fields?.length ? `${e.message} ${fields.join('; ')}` : e?.message || 'Terjadi kesalahan.';
}

const resource = (name) => ({
  list: () => request('GET', `/${name}`).then((r) => r.data),
  get: (id) => request('GET', `/${name}/${id}`).then((r) => r.data),
  create: (body) => request('POST', `/${name}`, body).then((r) => r.data),
  update: (id, body) => request('PUT', `/${name}/${id}`, body).then((r) => r.data),
  remove: (id) => request('DELETE', `/${name}/${id}`),
});

export const api = {
  auth: {
    register: (body) => request('POST', '/auth/register', body),
    login: (body) => request('POST', '/auth/login', body),
    profile: () => request('GET', '/auth/profile').then((r) => r.data),
  },
  members: resource('members'),
  packages: resource('packages'),
  memberships: resource('memberships'),
  // method: 'QRIS' | 'CASH'. Mengembalikan { message, data } karena hasilnya bergantung pada role & pengaturan server
  // (QRIS member bisa langsung lunas, tunai tetap menunggu konfirmasi kasir).
  payments: { ...resource('payments'), pay: (id, method) => request('PATCH', `/payments/${id}/pay`, { method }) },
  cards: {
    mine: () => request('GET', '/cards/me').then((r) => r.data), // null jika kartu belum terbit
    get: (memberId) => request('GET', `/cards/${memberId}`).then((r) => r.data), // admin
  },
  stats: { get: () => request('GET', '/stats').then((r) => r.data) },
};
