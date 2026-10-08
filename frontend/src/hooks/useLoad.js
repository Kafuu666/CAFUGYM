import { useCallback, useEffect, useRef, useState } from 'react';
import { errorText } from '../services/api';

// Memuat data async saat komponen tampil. Mengembalikan { data, loading, error, reload }.
export default function useLoad(fn) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const reload = useCallback(async () => {
    try {
      setState({ data: await fnRef.current(), loading: false, error: '' });
    } catch (e) {
      setState({ data: null, loading: false, error: errorText(e) });
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}
