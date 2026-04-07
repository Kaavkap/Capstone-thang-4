function RegisterForm({ form, onChange, onSubmit, errorMessage }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-slate-700">
          Họ và tên
        </label>
        <input
          id="register-name"
          type="text"
          value={form.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
          placeholder="Nguyễn Văn A"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          required
        />
      </div>

      <div>
        <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700">
          Địa chỉ email
        </label>
        <input
          id="register-email"
          type="email"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
          placeholder="nhap-email@example.com"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          required
        />
      </div>

      <div>
        <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700">
          Mật khẩu
        </label>
        <input
          id="register-password"
          type="password"
          value={form.password}
          onChange={(event) => onChange("password", event.target.value)}
          placeholder="********"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          minLength={6}
          required
        />
      </div>

      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-700"
      >
        Tạo tài khoản
      </button>
    </form>
  );
}

export default RegisterForm;
