import { useState } from 'react';
import { api, errorText } from '../services/api';
import useLoad from '../hooks/useLoad';
import { useToast } from './Toast';
import { loadView } from './LoadState';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import Tag from './Tag';

/**
 * Halaman CRUD admin generik.
 *  resource : nama resource di api.js (members | packages | memberships | payments)
 *  fields   : [{ name, label, type, required: true | 'create' | false, hint, options: [[value,label]], from: { resource, label(row) } }]
 *  title    : judul halaman;  item: { title(row), sub(row) };  showStatus: tampilkan tag status
 *  Opsional:
 *   badge(row)               : pengganti tag status (mis. Aktif / Tidak aktif)
 *   extra(row, {reload,toast}): tombol aksi tambahan di tiap baris
 *   filters                  : [[key, label, (row) => boolean]] → chip filter di atas daftar
 *   canRemove(row)           : false → tombol Hapus nonaktif, removeHint ditampilkan sebagai alasan
 *   removeWarn(row)          : peringatan yang muncul saat konfirmasi hapus
 */
export default function CrudPage({ title, resource, fields, item, showStatus = false, badge, extra, filters, canRemove, removeHint, removeWarn }) {
  const toast = useToast();
  const state = useLoad(async () => {
    const options = {};
    await Promise.all(fields.filter((f) => f.from).map(async (f) => {
      const rows = await api[f.from.resource].list();
      options[f.name] = rows.map((r) => [r.id, f.from.label(r)]);
    }));
    return { rows: await api[resource].list(), options };
  });

  const [form, setForm] = useState(null); // { id, values }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [filter, setFilter] = useState(0);

  const view = loadView(state);
  if (view) return view;
  const { rows, options } = state.data;
  const shown = filters ? rows.filter(filters[filter][2]) : rows;

  const openForm = (row) => {
    setError('');
    const values = Object.fromEntries(fields.map((f) => [f.name, f.type === 'password' ? '' : row?.[f.name] ?? '']));
    setForm({ id: row?.id ?? null, values });
  };

  const save = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(form.values).filter(([, v]) => v !== ''));
    setSaving(true);
    setError('');
    try {
      await (form.id ? api[resource].update(form.id, body) : api[resource].create(body));
      setForm(null);
      toast('Data disimpan');
      state.reload();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (confirmId !== id) return setConfirmId(id);
    try {
      await api[resource].remove(id);
      toast('Data dihapus');
      state.reload();
    } catch (err) {
      toast(errorText(err));
    }
    setConfirmId(null);
  };

  return (
    <>
      <div className="row">
        <h1>{title}</h1>
        <Button small onClick={() => openForm(null)}>Tambah</Button>
      </div>

      {filters && (
        <div className="chips" style={{ marginTop: 0 }}>
          {filters.map(([key, label], i) => (
            <button type="button" key={key} className={`chip${i === filter ? ' on' : ''}`} aria-pressed={i === filter} onClick={() => { setFilter(i); setConfirmId(null); }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="empty">Belum ada data. Tekan Tambah untuk membuat yang pertama.</p>
      ) : shown.length === 0 ? (
        <p className="empty">Tidak ada data untuk filter ini.</p>
      ) : (
        <div className="grid">
          {shown.map((row) => {
            const removable = canRemove ? canRemove(row) : true;
            const confirming = confirmId === row.id;
            return (
              <article className="it" key={row.id}>
                <div>
                  <h3>{item.title(row)}</h3>
                  <p className="mu">{item.sub(row)}</p>
                </div>
                {badge ? badge(row) : showStatus && <Tag status={row.status} />}
                {!removable && removeHint && <p className="mu hint">{removeHint}</p>}
                {confirming && removeWarn && <p className="mu warn" role="alert">{removeWarn(row)}</p>}
                <div className="ac">
                  {extra?.(row, { reload: state.reload, toast })}
                  <Button variant="ghost" onClick={() => openForm(row)}>Ubah</Button>
                  <Button variant="ghost-danger" disabled={!removable} onClick={() => remove(row.id)}>{confirming ? 'Yakin hapus?' : 'Hapus'}</Button>
                  {confirming && <Button variant="ghost" onClick={() => setConfirmId(null)}>Batal</Button>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {form && (
        <Modal title={`${form.id ? 'Ubah' : 'Tambah'} ${title.toLowerCase()}`} onClose={() => setForm(null)} onSubmit={save}>
          {error && <div className="err" role="alert">{error}</div>}
          {fields.map((f) => {
            const common = {
              label: f.label,
              hint: f.hint,
              value: form.values[f.name],
              required: f.required === true || (f.required === 'create' && !form.id),
              onChange: (e) => setForm({ ...form, values: { ...form.values, [f.name]: e.target.value } }),
            };
            if (f.type === 'select') {
              const opts = f.options || options[f.name] || [];
              return (
                <Input key={f.name} as="select" {...common}>
                  <option value="">Pilih…</option>
                  {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </Input>
              );
            }
            if (f.type === 'textarea') return <Input key={f.name} as="textarea" {...common} />;
            return <Input key={f.name} type={f.type || 'text'} step={f.type === 'number' ? 'any' : undefined} autoComplete="off" {...common} />;
          })}
          <div className="row" style={{ margin: '6px 0 0' }}>
            <Button variant="ghost" onClick={() => setForm(null)}>Batal</Button>
            <Button type="submit" small disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan perubahan'}</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
