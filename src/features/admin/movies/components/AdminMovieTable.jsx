function AdminMovieTable({ movies, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-brand-50 text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Phim</th>
            <th className="px-4 py-3 font-semibold">Thời lượng</th>
            <th className="px-4 py-3 font-semibold">Suất chiếu</th>
            <th className="px-4 py-3 font-semibold">Trạng thái</th>
            <th className="px-4 py-3 font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-900">{movie.title}</p>
                <p className="line-clamp-2 text-xs text-slate-500">{movie.description}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{movie.duration} phút</td>
              <td className="px-4 py-3">
                <div className="flex max-w-[220px] flex-wrap gap-1">
                  {movie.showtimes.map((slot) => (
                    <span
                      key={`${movie.id}-slot-${slot}`}
                      className="rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className={`text-xs font-semibold ${movie.isNowShowing ? "text-emerald-700" : "text-slate-500"}`}>
                    {movie.isNowShowing ? "Đang chiếu" : "Chưa chiếu"}
                  </span>
                  <span className={`text-xs font-semibold ${movie.isHot ? "text-rose-700" : "text-slate-500"}`}>
                    {movie.isHot ? "Hot" : "Thường"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(movie)}
                    className="rounded-lg border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(movie.id)}
                    className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminMovieTable;
