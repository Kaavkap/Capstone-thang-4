import { useEffect, useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  duration: "",
  imageUrl: "",
  trailerUrl: "",
  showtimesText: "",
  isNowShowing: true,
  isHot: false
};

function toFormValues(movie) {
  if (!movie) {
    return emptyForm;
  }
  return {
    title: movie.title,
    description: movie.description,
    duration: String(movie.duration),
    imageUrl: movie.imageUrl,
    trailerUrl: movie.trailerUrl,
    showtimesText: movie.showtimes.join(", "),
    isNowShowing: Boolean(movie.isNowShowing),
    isHot: Boolean(movie.isHot)
  };
}

function MovieForm({ editingMovie, onSubmit, onCancel }) {
  const [form, setForm] = useState(toFormValues(editingMovie));

  useEffect(() => {
    setForm(toFormValues(editingMovie));
  }, [editingMovie]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      duration: Number(form.duration),
      imageUrl: form.imageUrl,
      trailerUrl: form.trailerUrl,
      showtimes: form.showtimesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      isNowShowing: form.isNowShowing,
      isHot: form.isHot
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-xl font-bold text-slate-900">
        {editingMovie ? "Cập nhật phim" : "Thêm phim mới"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Tên phim</label>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Mô tả</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Thời lượng (phút)</label>
          <input
            type="number"
            min={1}
            value={form.duration}
            onChange={(event) => updateField("duration", event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Suất chiếu (ngăn cách bằng dấu phẩy)</label>
          <input
            value={form.showtimesText}
            onChange={(event) => updateField("showtimesText", event.target.value)}
            placeholder="09:00, 13:30, 20:45"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Link ảnh poster</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(event) => updateField("imageUrl", event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Link video trailer</label>
          <input
            type="url"
            value={form.trailerUrl}
            onChange={(event) => updateField("trailerUrl", event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            required
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.isNowShowing}
            onChange={(event) => updateField("isNowShowing", event.target.checked)}
          />
          Đang chiếu
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.isHot} onChange={(event) => updateField("isHot", event.target.checked)} />
          Phim hot
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-700"
        >
          {editingMovie ? "Lưu thay đổi" : "Thêm phim"}
        </button>
        {editingMovie ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Hủy sửa
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default MovieForm;
