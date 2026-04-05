import { useState } from "react";
import MovieForm from "../components/MovieForm";
import AdminMovieTable from "../components/AdminMovieTable";
import { useAppStore } from "../../../../shared/context/AppStore";

function AdminMoviesPage() {
  const { movies, addMovie, updateMovie, deleteMovie } = useAppStore();
  const [editingMovie, setEditingMovie] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmitMovie = (payload) => {
    setStatusMessage("");
    const result = editingMovie ? updateMovie(editingMovie.id, payload) : addMovie(payload);
    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }
    setStatusMessage(editingMovie ? "Cập nhật phim thành công." : "Thêm phim thành công.");
    setEditingMovie(null);
  };

  const handleDeleteMovie = (movieId) => {
    const shouldDelete = window.confirm("Bạn có chắc muốn xóa phim này? Các vé liên quan sẽ bị xóa.");
    if (!shouldDelete) {
      return;
    }
    deleteMovie(movieId);
    if (editingMovie?.id === movieId) {
      setEditingMovie(null);
    }
    setStatusMessage("Đã xóa phim.");
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold text-slate-900">Quản lý phim (Admin)</h1>
        <p className="mt-1 text-sm text-slate-600">
          Thêm, sửa, xóa phim với đầy đủ tên phim, mô tả, thời lượng, link ảnh và trailer.
        </p>
        <p className="mt-2 text-xs font-semibold text-brand-700">Tổng số phim: {movies.length}</p>
      </header>

      <MovieForm editingMovie={editingMovie} onSubmit={handleSubmitMovie} onCancel={() => setEditingMovie(null)} />
      {statusMessage ? <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{statusMessage}</p> : null}

      <AdminMovieTable movies={movies} onEdit={setEditingMovie} onDelete={handleDeleteMovie} />
    </section>
  );
}

export default AdminMoviesPage;
