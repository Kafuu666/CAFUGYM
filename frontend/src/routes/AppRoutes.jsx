import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Packages from '../pages/Packages';
import Membership from '../pages/Membership';
import Payments from '../pages/Payments';
import MyCard from '../pages/MyCard';
import AdminDashboard from '../pages/admin/Dashboard';
import Members from '../pages/admin/Members';
import AdminPackages from '../pages/admin/Packages';
import Memberships from '../pages/admin/Memberships';
import AdminPayments from '../pages/admin/Payments';

const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/');

// Halaman login/register: user yang sudah masuk dialihkan ke beranda sesuai role.
function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return <p className="empty">Memuat…</p>;
  return user ? <Navigate to={homeFor(user)} replace /> : <Outlet />;
}

// Halaman privat: belum login → /login; role tidak sesuai → beranda role-nya.
function RequireRole({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="empty">Memuat…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Layout />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<RequireRole role="member" />}>
        <Route index element={<Dashboard />} />
        <Route path="packages" element={<Packages />} />
        <Route path="membership" element={<Membership />} />
        <Route path="payments" element={<Payments />} />
        <Route path="card" element={<MyCard />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="admin" element={<RequireRole role="admin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="memberships" element={<Memberships />} />
        <Route path="payments" element={<AdminPayments />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
