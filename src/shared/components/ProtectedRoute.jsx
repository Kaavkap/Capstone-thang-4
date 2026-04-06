import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../context/AppStore";

function ProtectedRoute({ children, requireRole }) {
  const { currentUser } = useAppStore();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (requireRole && currentUser.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

