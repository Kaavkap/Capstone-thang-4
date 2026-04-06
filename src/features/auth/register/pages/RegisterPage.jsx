import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { useAppStore } from "../../../../shared/context/AppStore";

function RegisterPage() {
  const { registerUser } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");
    const result = registerUser(form);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <section className="mx-auto max-w-xl">
      <div className="mb-5 rounded-2xl bg-white/70 p-5">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Đăng ký</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tạo tài khoản người dùng để chọn ghế và đặt vé xem phim.
        </p>
      </div>
      <RegisterForm form={form} onChange={handleChange} onSubmit={handleSubmit} errorMessage={errorMessage} />
      <p className="mt-4 text-sm text-slate-600">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Đăng nhập tại đây
        </Link>
      </p>
    </section>
  );
}

export default RegisterPage;
