import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SeatMap from "../components/SeatMap";
import { useAppStore } from "../../../shared/context/AppStore";

function BookingPage() {
  const { movieId } = useParams();
  const { movies, getBookedSeats, createBooking } = useAppStore();
  const movie = useMemo(() => movies.find((item) => item.id === movieId), [movies, movieId]);
  const [showtime, setShowtime] = useState(movie?.showtimes?.[0] || "");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  const bookedSeats = movie && showtime ? getBookedSeats(movie.id, showtime) : [];

  useEffect(() => {
    if (!movie) {
      setShowtime("");
      setSelectedSeats([]);
      return;
    }
    setShowtime(movie.showtimes[0] || "");
    setSelectedSeats([]);
    setStatusMessage("");
  }, [movieId, movie]);

  if (!movie) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Không tìm thấy phim</h1>
        <p className="mt-2 text-sm text-slate-600">Phim có thể đã bị quản trị viên xóa.</p>
        <Link to="/" className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
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
    const result = createBooking({
      movieId: movie.id,
      showtime,
      seats: selectedSeats
    });
    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }
    setSelectedSeats([]);
    setStatusMessage("Đặt vé thành công. Bạn có thể xem lại trong mục Vé của tôi.");
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[340px,1fr]">
      <aside className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
        <img src={movie.imageUrl} alt={movie.title} className="h-56 w-full rounded-xl object-cover" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-slate-900">{movie.title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{movie.description}</p>
        <p className="mt-3 text-sm font-semibold text-slate-700">Thời lượng: {movie.duration} phút</p>

        <label htmlFor="showtime-select" className="mt-4 block text-sm font-semibold text-slate-700">
          Chọn suất chiếu
        </label>
        <select
          id="showtime-select"
          value={showtime}
          onChange={(event) => {
            setShowtime(event.target.value);
            setSelectedSeats([]);
            setStatusMessage("");
          }}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          {movie.showtimes.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        <div className="mt-4 text-sm text-slate-600">
          Ghế đã chọn:{" "}
          <strong className="text-slate-900">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}</strong>
        </div>

        <button
          type="button"
          onClick={handleBooking}
          className="mt-4 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-700"
        >
          Xác nhận đặt vé
        </button>

        {statusMessage ? <p className="mt-3 text-sm text-brand-700">{statusMessage}</p> : null}
      </aside>

      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">Trống</span>
          <span className="rounded-full bg-brand-600 px-3 py-1 text-white">Đang chọn</span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-500">Đã đặt</span>
        </div>
        <SeatMap selectedSeats={selectedSeats} bookedSeats={bookedSeats} onSelectSeat={toggleSeat} />
      </div>
    </section>
  );
}

export default BookingPage;
