import { Link } from "react-router-dom";
import { useAppStore } from "../../../shared/context/AppStore";

function MovieCard({ movie }) {
  const { currentUser } = useAppStore();

  // 1. Map API keys to your component's variables
  const title = movie.tenPhim || movie.title;
  const image = movie.hinhAnh || movie.imageUrl;
  const description = movie.moTa || movie.description;
  const isHot = movie.hot || movie.isHot;
  const isNowShowing = movie.dangChieu || movie.isNowShowing;
  const trailerUrl = movie.trailer || movie.trailerUrl;
  const id = movie.maPhim || movie.id;

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <img src={image} alt={title} className="h-56 w-full object-cover" />

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {isNowShowing ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Đang chiếu
            </span>
          ) : null}
          {isHot ? (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Hot</span>
          ) : null}
        </div>

        <h3 className="font-heading text-xl font-bold text-slate-900">{title}</h3>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{description || "Chưa có mô tả cho phim này."}</p>

        {/* movie.duration is not in the API list, so we provide a default or hide it */}
        {movie.duration && (
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Thời lượng: {movie.duration} phút
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {/* 2. THE CRITICAL FIX: Only map if showtimes exists */}
          {(movie.showtimes || []).map((slot) => (
            <span
              key={`${id}-${slot}`}
              className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700"
            >
              {slot}
            </span>
          ))}
          {(!movie.showtimes || movie.showtimes.length === 0) && (
             <span className="text-xs text-slate-400 italic">Chưa có lịch chiếu</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={trailerUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-brand-200 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Xem trailer
          </a>

          {!currentUser ? (
            <Link
              to="/login"
              className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
            >
              Đăng nhập để đặt vé
            </Link>
          ) : null}

          {currentUser?.role === "user" ? (
            <Link
              to={`/booking/${id}`}
              className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
            >
              Chọn ghế đặt vé
            </Link>
          ) : null}

          {currentUser?.role === "admin" ? (
            <Link
              to="/admin/movies"
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              Quản lý phim
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default MovieCard;