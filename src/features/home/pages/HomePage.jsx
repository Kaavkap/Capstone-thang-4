import React, { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import MovieSection from "../../movies/components/MovieSection";
import { fetchMoviesFromAPI } from "../../../API"; 

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMovies = async () => {
      const result = await fetchMoviesFromAPI();
      if (result.ok) {
        setMovies(result.data || []);
      }
      setLoading(false);
    };
    getMovies();
  }, []);

  // API uses 'dangChieu' and 'hot'
  const nowShowingMovies = movies.filter((m) => m.dangChieu);
  const hotMovies = movies.filter((m) => m.hot);

  if (loading) return <div className="text-center p-20">Đang tải phim...</div>;

  return (
    <div>
      <HeroSection />
      <MovieSection title="Phim đang chiếu" movies={nowShowingMovies} />
      <MovieSection title="Phim hot" movies={hotMovies} />
    </div>
  );
}

export default HomePage;