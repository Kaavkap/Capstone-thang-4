import { useEffect, useState } from "react";
import MovieForm from "../components/MovieForm";
import AdminMovieTable from "../components/AdminMovieTable";
// Import the new functions from your API file
import { 
  fetchMoviesFromAPI, 
  addMovieAPI, 
  updateMovieAPI, 
  deleteMovieAPI 
} from "../../../../API"; 

function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const getMovies = async () => {
    setLoading(true);
    const result = await fetchMoviesFromAPI();
    if (result.ok) {
      setMovies(result.data); 
    } else {
      setStatusMessage("Không thể tải danh sách phim từ máy chủ.");
    }
    setLoading(false);
  };

  useEffect(() => {
    getMovies();
  }, []);

  const handleSubmitMovie = async (payload) => {
    setStatusMessage("Đang xử lý...");
    
    // 1. Prepare FormData as required by the instructions
    const formData = new FormData();
    
    // Appending basic fields
    formData.append("tenPhim", payload.tenPhim);
    formData.append("moTa", payload.moTa);
    formData.append("trailer", payload.trailer);
    formData.append("ngayKhoiChieu", payload.ngayKhoiChieu);
    formData.append("sapChieu", payload.sapChieu);
    formData.append("dangChieu", payload.dangChieu);
    formData.append("hot", payload.hot);
    formData.append("danhGia", payload.danhGia);
    formData.append("maNhom", "GP01"); // Mandatory Group ID

    // 2. Handle Image File
    // Ensure your MovieForm provides a File object for hinhAnh
    if (payload.hinhAnh instanceof File) {
      formData.append("File", payload.hinhAnh, payload.hinhAnh.name);
    }

    let result;
    if (editingMovie) {
      // 3. For Edit: You MUST include maPhim in the FormData
      formData.append("maPhim", editingMovie.maPhim); 
      result = await updateMovieAPI(formData);
    } else {
      // For Add: maPhim is not needed
      result = await addMovieAPI(formData);
    }

    // 4. Handle Response
    if (result.ok) {
      setStatusMessage(editingMovie ? "Cập nhật phim thành công!" : "Thêm phim thành công!");
      setEditingMovie(null);
      getMovies(); // Refresh list to see changes
    } else {
      // Display the specific error from the server (e.g., "invalid image format")
      setStatusMessage(`Lỗi: ${result.message}`);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    const shouldDelete = window.confirm("Bạn có chắc muốn xóa phim này?");
    if (!shouldDelete) return;

    setStatusMessage("Đang xóa phim...");
    const result = await deleteMovieAPI(movieId); //

    if (result.ok) {
      setStatusMessage("Xóa phim thành công.");
      getMovies(); 
    } else {
      setStatusMessage(`Lỗi khi xóa: ${result.message}`);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold text-slate-900">Quản lý phim (Admin)</h1>
        <p className="mt-1 text-sm text-slate-600">
          Dữ liệu được tải trực tiếp từ hệ thống Cybersoft.
        </p>
        <p className="mt-2 text-xs font-semibold text-brand-700">
          {loading ? "Đang tải dữ liệu..." : `Tổng số phim: ${movies.length}`}
        </p>
      </header>

      <MovieForm 
        editingMovie={editingMovie} 
        onSubmit={handleSubmitMovie} 
        onCancel={() => setEditingMovie(null)} 
      />

      {statusMessage && (
        <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 border border-brand-100">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-400 italic">Đang tải danh sách phim...</div>
      ) : (
        <AdminMovieTable 
          movies={movies} 
          onEdit={setEditingMovie} 
          onDelete={handleDeleteMovie} 
        />
      )}
    </section>
  );
}

export default AdminMoviesPage;