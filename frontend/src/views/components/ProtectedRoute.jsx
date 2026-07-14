import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import useAuth from '../../controllers/useAuth';

export default function ProtectedRoute() {
  const { user, token, status } = useAuth();

  if (token && status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
