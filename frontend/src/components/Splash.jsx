import { useEffect, useState } from 'react';

// Splash screen: logo + FITNESS CENTER, hilang otomatis.
export default function Splash() {
  const [off, setOff] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setOff(true), 1100);
    const b = setTimeout(() => setGone(true), 1700);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  if (gone) return null;
  return (
    <div className={`splash${off ? ' off' : ''}`} aria-hidden="true">
      <div><b>CAFU GYM</b><span>FITNESS CENTER</span></div>
    </div>
  );
}
