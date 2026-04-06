import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SeatMap from "../components/SeatMap";
import { useAppStore } from "../../../shared/context/AppStore";

function BookingPage() {
  const { movieId } = useParams(); // This is the ID from the URL (e.g., 1283)
  const { movies, getBookedSeats, createBooking } = useAppStore();

  // 1. DATA MAPPING: Find movie using 'maPhim' and ensuring string comparison
  const movie = useMemo(() => {
    if (!movies || movies.length === 0) return null;
    return movies.find((item) => String(item.maPhim) === String(movieId));
  }, [movies, movieId]);

  const [showtime, setShowtime] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  // 2. SEAT LOGIC: Use maPhim for tracking booked seats
  const bookedSeats = movie && showtime ? getBookedSeats(movie.maPhim, showtime) : [];

  useEffect(() => {
    if (!movie) return;

    // Use API showtimes if available, otherwise fallback
    const defaultTime = movie.lstLichChieuPhim?.[0]?.ngayChieuGioChieu || "18:00";
    setShowtime(defaultTime);
    setSelectedSeats([]);
    setStatusMessage("");
  }, [movie]);

  // 3. LOADING STATE: Prevents the "Not Found" error while data is fetching
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent mb-4"></div>
        <p className="italic">Đang tải dữ liệu phim...</p>
      </div>
    );
  }

  // 4. ACTUAL ERROR STATE: Only shows if movies loaded but ID is invalid
  if (!movie) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Không tìm thấy phim</h1>
        <p className="mt-2 text-slate-600">Phim có mã số <strong>{movieId}</strong> không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-2 font-semibold text-white transition hover:bg-brand-700">
          Về trang chủ
        </Link>
      </section>
    );
  }

  const toggleSeat = (seatCode) => {
    setStatusMessage("");
    setSelectedSeats((prev) =>
      prev.includes(seatCode) ? prev.filter((item) => item !== seatCode) : [...prev, seatCode]
    );
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      setStatusMessage("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    const result = createBooking({
      movieId: movie.maPhim, //
      showtime,
      seats: selectedSeats
    });

    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }
    setSelectedSeats([]);
    setStatusMessage("Đặt vé thành công! Kiểm tra trong mục Vé của tôi.");
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[360px,1fr]">
      {/* LEFT COLUMN: MOVIE INFO */}
      <aside className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <img src={movie.hinhAnh} alt={movie.tenPhim} className="h-64 w-full rounded-xl object-cover" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-slate-900">{movie.tenPhim}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{movie.moTa || "Chưa có mô tả chi tiết."}</p>
        
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-semibold text-slate-700">Đánh giá:</span>
          <span className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">{movie.danhGia}/10</span>
        </div>

        <label htmlFor="showtime-select" className="mt-6 block text-sm font-bold text-slate-800">
          Chọn suất chiếu
        </label>
        <select
          id="showtime-select"
          value={showtime}
          onChange={(e) => setShowtime(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-100"
        >
          {/* Mapping showtimes or fallbacks */}
          {(movie.showtimes || ["18:00", "20:30", "22:00"]).map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>

        <div className="mt-6 space-y-3">
          <div className="text-sm text-slate-600">
            Ghế đã chọn: <strong className="text-brand-700">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}</strong>
          </div>
          <button
            type="button"
            onClick={handleBooking}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold uppercase text-white shadow-lg shadow-brand-100 transition hover:bg-brand-700 active:scale-[0.98]"
          >
            Xác nhận đặt vé
          </button>
          {statusMessage && <p className="text-center text-xs font-medium text-brand-600">{statusMessage}</p>}
        </div>
      </aside>

      {/* RIGHT COLUMN: SEAT MAP */}
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <SeatMap 
          selectedSeats={selectedSeats} 
          bookedSeats={bookedSeats} 
          onSelectSeat={toggleSeat} 
        />
      </div>
    </section>
  );
}

export default BookingPage;