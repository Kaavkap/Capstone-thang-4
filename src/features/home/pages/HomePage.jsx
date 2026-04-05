import HeroSection from "../components/HeroSection";
import { useAppStore } from "../../../shared/context/AppStore";
import MovieSection from "../../movies/components/MovieSection";

function HomePage() {
  const { movies } = useAppStore();
  const nowShowingMovies = movies.filter((movie) => movie.isNowShowing);
  const hotMovies = movies.filter((movie) => movie.isHot);

  return (
    <div>
      <HeroSection />
      <MovieSection
        title="Phim đang chiếu"
        subtitle="Danh sách phim hiện đang mở đặt vé"
        movies={nowShowingMovies}
      />
      <MovieSection title="Phim hot" subtitle="Các phim được quan tâm nhiều trong tuần" movies={hotMovies} />
    </div>
  );
}

export default HomePage;
