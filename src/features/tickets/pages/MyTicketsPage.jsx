import { useAppStore } from "../../../shared/context/AppStore";

function MyTicketsPage() {
  const { userTickets } = useAppStore();

  return (
    <section>
      <h1 className="font-heading text-3xl font-bold text-slate-900">Vé của tôi</h1>
      <p className="mt-1 text-sm text-slate-600">Danh sách tất cả vé đã đặt bằng tài khoản của bạn.</p>

      {userTickets.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {userTickets.map((ticket) => (
            <article key={ticket.id} className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
              <img src={ticket.movieImage} alt={ticket.movieTitle} className="h-36 w-full object-cover" />
              <div className="space-y-2 p-4">
                <h2 className="font-heading text-xl font-bold text-slate-900">{ticket.movieTitle}</h2>
                <p className="text-sm text-slate-600">
                  Suất chiếu: <strong className="text-slate-900">{ticket.showtime}</strong>
                </p>
                <p className="text-sm text-slate-600">
                  Ghế: <strong className="text-slate-900">{ticket.seats.join(", ")}</strong>
                </p>
                <p className="text-xs text-slate-500">Thời gian đặt: {new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Bạn chưa có vé nào. Hãy chọn phim ở trang chủ để bắt đầu đặt vé.
        </div>
      )}
    </section>
  );
}

export default MyTicketsPage;
