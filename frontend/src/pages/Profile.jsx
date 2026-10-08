import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';

const Field = ({ label, value }) => (
  <div>
    <p className="mu">{label}</p>
    <p>{value || '-'}</p>
  </div>
);

export default function Profile() {
  const { user, logout } = useAuth();
  return (
    <>
      <h1>Profil</h1>
      <Card className="stack" style={{ marginTop: 14 }}>
        <div>
          <p className="mu">Nama</p>
          <h3>{user.name}</h3>
        </div>
        <Field label="Email" value={user.email} />
        <Field label="No. HP" value={user.phone} />
        <Field label="Alamat" value={user.address} />
      </Card>
      <Button variant="danger" onClick={logout} style={{ marginTop: 16 }}>Keluar</Button>
    </>
  );
}
