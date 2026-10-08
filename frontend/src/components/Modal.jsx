import { useEffect } from 'react';

// Lembar form dari bawah layar. Tekan Esc untuk menutup.
export default function Modal({ title, onClose, onSubmit, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="mod" role="dialog" aria-modal="true" aria-label={title}>
      <form onSubmit={onSubmit}>
        <h2 style={{ marginBottom: 14 }}>{title}</h2>
        {children}
      </form>
    </div>
  );
}
