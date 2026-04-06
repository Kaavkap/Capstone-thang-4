import MovieCard from "./MovieCard";

function MovieSection({ title, subtitle, movies }) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <p className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          {movies.length} phim
        </p>
      </div>

      {movies.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {movies.map((movie) => (
            /* FIX: Use maPhim (from API) or movie.id (from seed data) */
            <MovieCard key={movie.maPhim || movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Hiện chưa có phim trong danh mục này.
        </div>
      )}
    </section>
  );
}

export default MovieSection;