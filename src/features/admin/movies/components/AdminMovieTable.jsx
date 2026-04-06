import React from "react";

function AdminMovieTable({ movies, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-brand-50 text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Phim</th>
            <th className="px-4 py-3 font-semibold">Thông tin</th>
            <th className="px-4 py-3 font-semibold">Trạng thái</th>
            <th className="px-4 py-3 font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => {
            // Mapping Cybersoft API keys to local variables
            const id = movie.maPhim; 
            const title = movie.tenPhim; 
            const description = movie.moTa;
            const poster = movie.hinhAnh;
            const isNowShowing = movie.dangChieu;
            const isHot = movie.hot;

            return (
              <tr key={id || Math.random()} className="border-t border-slate-100 align-top transition hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <img 
                      src={poster} 
                      alt={title} 
                      className="h-16 w-11 rounded object-cover shadow-sm bg-slate-100"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150x220?text=No+Image'; }}
                    />
                    <div className="max-w-[200px]">
                      <p className="font-bold text-slate-900 line-clamp-1">{title || "N/A"}</p>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {description || "Phim hiện chưa có nội dung mô tả chi tiết."}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <p className="text-xs font-medium text-slate-400">Mã phim: {id}</p>
                  <p className="text-xs italic text-slate-400">Suất chiếu: Xem tại Lịch Chiếu</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold uppercase ${isNowShowing ? "text-emerald-600" : "text-slate-400"}`}>
                      {isNowShowing ? "• Đang chiếu" : "• Sắp chiếu"}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${isHot ? "text-rose-600" : "text-slate-400"}`}>
                      {isHot ? "• Hot" : "• Thường"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(movie)}
                      className="rounded-md border border-brand-200 px-3 py-1 text-xs font-bold text-brand-700 hover:bg-brand-50"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(id)}
                      className="rounded-md border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminMovieTable;