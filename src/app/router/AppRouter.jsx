import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import HomePage from "../../features/home/pages/HomePage";
import LoginPage from "../../features/auth/login/pages/LoginPage";
import RegisterPage from "../../features/auth/register/pages/RegisterPage";
import BookingPage from "../../features/booking/pages/BookingPage";
import MyTicketsPage from "../../features/tickets/pages/MyTicketsPage";
import AdminMoviesPage from "../../features/admin/movies/pages/AdminMoviesPage";
import ProtectedRoute from "../../shared/components/ProtectedRoute";

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/booking/:movieId"
          element={
            <ProtectedRoute requireRole="user">
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute requireRole="user">
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/movies"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminMoviesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
