import Button from './Button';

// Pemakaian: const s = useLoad(...); const view = loadView(s); if (view) return view;
export function loadView({ loading, error, reload }) {
  if (loading) return <p className="empty">Memuat data…</p>;
  if (error) {
    return (
      <div className="stack">
        <div className="err" role="alert">{error}</div>
        <Button variant="ghost" onClick={reload}>Coba lagi</Button>
      </div>
    );
  }
  return null;
}
