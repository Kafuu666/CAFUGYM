const { ApiError } = require('./http');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const isRealDate = (s) => DATE.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;

// Satu aturan per field: { type, required, max, min, values }
const types = {
  raw: (v) => ({ value: String(v) }), // tanpa trim, untuk password saat login
  string: (v, r) => {
    const s = String(v).trim();
    if (r.max && s.length > r.max) return { error: `maksimal ${r.max} karakter` };
    return { value: s };
  },
  email: (v) => {
    const s = String(v).trim().toLowerCase();
    if (!EMAIL.test(s) || s.length > 150) return { error: 'format email tidak valid' };
    return { value: s };
  },
  password: (v) => {
    const s = String(v);
    if (s.length < 6) return { error: 'minimal 6 karakter' };
    if (Buffer.byteLength(s) > 72) return { error: 'maksimal 72 karakter' };
    return { value: s };
  },
  int: (v, r) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < (r.min ?? 1)) return { error: `harus bilangan bulat >= ${r.min ?? 1}` };
    return { value: n };
  },
  number: (v, r) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < (r.min ?? 0)) return { error: `harus angka >= ${r.min ?? 0}` };
    return { value: n };
  },
  date: (v) => (isRealDate(String(v)) ? { value: String(v) } : { error: 'format tanggal harus YYYY-MM-DD' }),
  enum: (v, r) => {
    const s = String(v).toUpperCase();
    return r.values.includes(s) ? { value: s } : { error: `harus salah satu dari: ${r.values.join(', ')}` };
  },
};

/**
 * Validasi body terhadap aturan. Field yang kosong dan tidak wajib dilewati.
 * partial=true: semua field opsional (untuk PUT), tetapi minimal satu field harus dikirim.
 */
function parse(body, rules, { partial = false } = {}) {
  const data = {};
  const errors = {};
  for (const [key, rule] of Object.entries(rules)) {
    const v = body?.[key];
    const empty = v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
    if (empty) {
      if (rule.required && !partial) errors[key] = 'wajib diisi';
      continue;
    }
    const res = types[rule.type](v, rule);
    if (res.error) errors[key] = res.error;
    else data[key] = res.value;
  }
  if (partial && !Object.keys(errors).length && !Object.keys(data).length) {
    errors._ = 'tidak ada data yang diubah';
  }
  if (Object.keys(errors).length) throw new ApiError(422, 'Validasi gagal.', errors);
  return data;
}

module.exports = { parse };
