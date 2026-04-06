import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAppStore } from "../../../../shared/context/AppStore";

function LoginPage() {
  const { loginUser } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");

  const fromPath = location.state?.from || "/";

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");
    const result = loginUser(form);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    navigate(result.user.role === "admin" ? "/admin/movies" : fromPath, { replace: true });
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="mb-5 rounded-2xl bg-white/70 p-5">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-600">
          Đăng nhập tài khoản người dùng để đặt vé, hoặc đăng nhập tài khoản quản trị để quản lý phim.
        </p>
        <p className="mt-2 text-xs font-semibold text-brand-700">Tài khoản admin mẫu: admin@cinema.local / admin123</p>
      </div>
      <LoginForm form={form} onChange={handleChange} onSubmit={handleSubmit} errorMessage={errorMessage} />
      <p className="mt-4 text-sm text-slate-600">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-brand-700 hover:underline">
          Đăng ký tại đây
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;
