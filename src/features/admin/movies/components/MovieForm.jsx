import { useEffect, useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  trailerUrl: "",
  isNowShowing: true,
  isHot: false
};

function toFormValues(movie) {
  if (!movie) return emptyForm;
  return {
    title: movie.tenPhim || "",
    description: movie.moTa || "",
    imageUrl: movie.hinhAnh || "",
    trailerUrl: movie.trailer || "",
    isNowShowing: Boolean(movie.dangChieu),
    isHot: Boolean(movie.hot)
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
    // Payload mapped back to Vietnamese keys for API submission
    const payload = {
      maPhim: editingMovie?.maPhim || 0,
      tenPhim: form.title,
      moTa: form.description,
      trailer: form.trailerUrl,
      hinhAnh: form.imageUrl,
      maNhom: "GP01",
      dangChieu: form.isNowShowing,
      hot: form.isHot,
      sapChieu: !form.isNowShowing,
      ngayKhoiChieu: editingMovie?.ngayKhoiChieu || "01/01/2024",
      danhGia: editingMovie?.danhGia || 10
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-md">
      <h2 className="text-xl font-bold text-slate-900">
        {editingMovie ? "Cập nhật phim" : "Thêm phim mới"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-bold text-slate-700">Tên phim</label>
          <input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-bold text-slate-700">Mô tả</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Link ảnh Poster</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => updateField("imageUrl", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">Link Trailer</label>
          <input
            type="url"
            value={form.trailerUrl}
            onChange={(e) => updateField("trailerUrl", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 outline-none"
            required
          />
        </div>
      </div>

      <div className="flex gap-6 py-2">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isNowShowing}
            onChange={(e) => updateField("isNowShowing", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          Đang chiếu
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isHot}
            onChange={(e) => updateField("isHot", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          Phim Hot
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700">
          {editingMovie ? "Lưu thay đổi" : "Thêm phim"}
        </button>
        {editingMovie && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

export default MovieForm;