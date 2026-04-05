import { Link } from "react-router-dom";
import { useAppStore } from "../../../shared/context/AppStore";

function MovieCard({ movie }) {
  const { currentUser } = useAppStore();

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <img src={movie.imageUrl} alt={movie.title} className="h-56 w-full object-cover" />

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {movie.isNowShowing ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Đang chiếu
            </span>
          ) : null}
          {movie.isHot ? (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Hot</span>
          ) : null}
        </div>

        <h3 className="font-heading text-xl font-bold text-slate-900">{movie.title}</h3>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{movie.description}</p>

        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Thời lượng: {movie.duration} phút
        </div>

        <div className="flex flex-wrap gap-2">
          {movie.showtimes.map((slot) => (
            <span
              key={`${movie.id}-${slot}`}
              className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700"
            >
              {slot}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={movie.trailerUrl}
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
              to={`/booking/${movie.id}`}
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
