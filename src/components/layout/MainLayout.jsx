import { NavLink, Outlet } from "react-router-dom";
import { useAppStore } from "../../shared/context/AppStore";

function MainLayout() {
  const { currentUser, logoutUser } = useAppStore();
  const roleLabel = currentUser?.role === "admin" ? "Quản trị viên" : "Người dùng";

  const navLinks = [{ label: "Trang chủ", to: "/" }];

  if (!currentUser) {
    navLinks.push({ label: "Đăng nhập", to: "/login" }, { label: "Đăng ký", to: "/register" });
  } else if (currentUser.role === "user") {
    navLinks.push({ label: "Vé của tôi", to: "/my-tickets" });
  } else if (currentUser.role === "admin") {
    navLinks.push({ label: "Quản lý phim", to: "/admin/movies" });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <p className="font-heading text-xl font-bold text-brand-700">CinemaHub</p>
          <nav className="flex flex-wrap items-center gap-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-brand-600 text-white shadow-soft" : "text-slate-700 hover:bg-brand-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                {currentUser.fullName} ({roleLabel})
              </p>
              <button
                type="button"
                onClick={logoutUser}
                className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
              >
                Đăng xuất
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-brand-100 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-slate-600">
          <p>© 2026 CinemaHub</p>
          <p>Credit: Lê Hoàng Thống và Lê Quốc Bảo</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
