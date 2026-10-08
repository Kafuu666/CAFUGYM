import { NavLink } from 'react-router-dom';

const ICONS = {
  dash: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  pkg: 'M20 12l-8 8-9-9V3h8z',
  ms: 'M3 6h18v12H3zM3 10h18',
  pay: 'M4 7h16v12H4zM4 7l3-3h10l3 3M16 13h2',
  card: 'M3 5h18v14H3zM8.5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5.5 16c0-1.4 1.3-2.4 3-2.4s3 1 3 2.4M14 9h4M14 13h4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
};

const MEMBER = [
  ['/', 'Home', 'home', true],
  ['/packages', 'Paket', 'pkg'],
  ['/membership', 'Membership', 'ms'],
  ['/payments', 'Bayar', 'pay'],
  ['/card', 'Kartu', 'card'],
  ['/profile', 'Profil', 'user'],
];
const ADMIN = [
  ['/admin', 'Dashboard', 'dash', true],
  ['/admin/members', 'Member', 'user'],
  ['/admin/packages', 'Paket', 'pkg'],
  ['/admin/memberships', 'Membership', 'ms'],
  ['/admin/payments', 'Bayar', 'pay'],
];

export default function Navbar({ admin }) {
  return (
    <nav className="side" aria-label="Menu utama">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">C</span>
        <div><b>CAFU GYM</b><span>Fitness center</span></div>
      </div>
      <div className="links">
        {(admin ? ADMIN : MEMBER).map(([to, label, icon, end]) => (
          <NavLink key={to} to={to} end={end}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[icon]} /></svg>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
