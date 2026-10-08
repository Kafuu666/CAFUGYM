import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Navbar from './Navbar';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="shell">
      <Navbar admin={isAdmin} />
      <div className="main">
        <header className="top">
          <span className="logo">CAFU GYM</span>
          <span className="where">{isAdmin ? 'Panel admin' : 'Area member'}</span>
          <div className="who">
            <div className="nm">{user?.name}<small>{isAdmin ? 'Admin' : 'Member'}</small></div>
            <span className="avatar" aria-hidden="true">{initial}</span>
            <Button variant="ghost" onClick={logout}>Keluar</Button>
          </div>
        </header>
        <main className="wrap">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
