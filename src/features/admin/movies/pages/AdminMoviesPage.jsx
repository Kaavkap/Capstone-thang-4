import { useState } from "react";
import MovieForm from "../components/MovieForm";
import AdminMovieTable from "../components/AdminMovieTable";
import { useAppStore } from "../../../../shared/context/AppStore";

function AdminMoviesPage() {
  const { movies, addMovie, updateMovie, deleteMovie, syncMoviesFromRemote, lastSyncAt } = useAppStore();
  const [editingMovie, setEditingMovie] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitMovie = async (payload) => {
    setStatusMessage("");
    setIsSubmitting(true);
    const result = editingMovie ? await updateMovie(editingMovie.id, payload) : await addMovie(payload);
    setIsSubmitting(false);

    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }

    setStatusMessage(
      result.message || (editingMovie ? "Cập nhật phim thành công." : "Thêm phim thành công.")
    );
    setEditingMovie(null);
  };

  const handleDeleteMovie = async (movieId) => {
    const shouldDelete = window.confirm("Bạn có chắc muốn xóa phim này? Các vé liên quan sẽ bị xóa.");
    if (!shouldDelete) {
      return;
    }

    const result = await deleteMovie(movieId);
    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }

    if (editingMovie?.id === movieId) {
      setEditingMovie(null);
    }

    setStatusMessage(result.message || "Đã xóa phim.");
  };

  const handleSyncMovies = async () => {
    setIsSyncing(true);
    const result = await syncMoviesFromRemote();
    setStatusMessage(result.message);
    setIsSyncing(false);
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold text-slate-900">Quản lý phim (Admin)</h1>
        <p className="mt-1 text-sm text-slate-600">
          Thêm, sửa, xóa phim với đầy đủ tên phim, mô tả, thời lượng, link ảnh và trailer.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold text-brand-700">Tổng số phim: {movies.length}</p>
          <button
            type="button"
            onClick={handleSyncMovies}
            disabled={isSyncing}
            className="rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSyncing ? "Đang đồng bộ..." : "Đồng bộ phim từ API"}
          </button>
          {lastSyncAt ? (
            <p className="text-xs text-slate-500">Lần đồng bộ gần nhất: {new Date(lastSyncAt).toLocaleString()}</p>
          ) : null}
        </div>
      </header>

      <MovieForm editingMovie={editingMovie} onSubmit={handleSubmitMovie} onCancel={() => setEditingMovie(null)} />

      {isSubmitting ? (
        <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">Đang lưu dữ liệu...</p>
      ) : null}

      {statusMessage ? <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{statusMessage}</p> : null}

      <AdminMovieTable movies={movies} onEdit={setEditingMovie} onDelete={handleDeleteMovie} />
    </section>
  );
}

export default AdminMoviesPage;
