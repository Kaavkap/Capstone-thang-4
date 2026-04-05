function LoginForm({ form, onChange, onSubmit, errorMessage }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          required
        />
      </div>

      <div>
        <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-slate-700">
          Mật khẩu
        </label>
        <input
          id="login-password"
          type="password"
          value={form.password}
          onChange={(event) => onChange("password", event.target.value)}
          placeholder="********"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          required
        />
      </div>

      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-700"
      >
        Đăng nhập
      </button>
    </form>
  );
}

export default LoginForm;
