import { Link } from "react-router-dom";
import { useAppStore } from "../../../shared/context/AppStore";

function HeroSection() {
  const { movies, bookings, currentUser } = useAppStore();
  const nowShowingCount = movies.filter((movie) => movie.isNowShowing).length;
  const hotCount = movies.filter((movie) => movie.isHot).length;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white md:px-12 md:py-16">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-500/35 blur-3xl" />
      <div className="absolute -bottom-24 left-12 h-52 w-52 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="relative z-10 max-w-3xl">
        <p className="mb-3 inline-block rounded-full border border-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          CinemaHub
        </p>
        <h1 className="font-heading text-3xl font-bold leading-tight md:text-5xl">
          Đặt vé xem phim trực tuyến với chọn ghế theo thời gian thực
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
          Khám phá phim đang chiếu và phim hot, sau đó đăng nhập để chọn ghế và xác nhận đặt vé chỉ trong vài bước.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-300">Đang chiếu</p>
            <p className="mt-1 text-2xl font-bold">{nowShowingCount}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-300">Phim hot</p>
            <p className="mt-1 text-2xl font-bold">{hotCount}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-300">Vé đã đặt</p>
            <p className="mt-1 text-2xl font-bold">{bookings.length}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {!currentUser ? (
            <>
              <Link
                to="/register"
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-brand-600"
              >
                Tạo tài khoản
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-white/10"
              >
                Đăng nhập
              </Link>
            </>
          ) : (
            <Link
              to={currentUser.role === "admin" ? "/admin/movies" : "/"}
              className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-brand-600"
            >
              {currentUser.role === "admin" ? "Vào trang quản trị" : "Đặt vé ngay"}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
