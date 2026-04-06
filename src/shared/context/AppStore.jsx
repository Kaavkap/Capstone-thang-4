import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMoviesFromAPI, fetchUsersFromAPI, isAPIConfigured } from "../../API";
import { seedMovies } from "../../features/movies/data/seedMovies";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../utils/storage";

const defaultUsers = [
  {
    id: "u-admin-001",
    fullName: "Quản trị Cinema",
    email: "admin@cinema.local",
    password: "admin123",
    role: "admin",
    createdAt: new Date().toISOString()
  }
];

const AppStoreContext = createContext(null);

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function normalizeMoviePayload(payload) {
  const showtimeSource = Array.isArray(payload.showtimes) ? payload.showtimes : [];

  return {
    title: (payload.title || "").trim(),
    description: (payload.description || "").trim(),
    duration: Number(payload.duration) || 0,
    imageUrl: (payload.imageUrl || "").trim(),
    trailerUrl: (payload.trailerUrl || "").trim(),
    showtimes: showtimeSource.map((item) => item.trim()).filter(Boolean),
    isNowShowing: Boolean(payload.isNowShowing),
    isHot: Boolean(payload.isHot)
  };
}

function ensureUsersHaveAdmin(userList) {
  const hasAdmin = userList.some((user) => user.role === "admin");
  return hasAdmin ? userList : [...userList, defaultUsers[0]];
}

function normalizeMovieFromAPI(movie) {
  // Mapping Vietnamese API keys to your app's internal keys
  const normalized = normalizeMoviePayload({
    title: movie.tenPhim ?? "",           // API: tenPhim -> UI: title
    description: movie.moTa ?? "",         // API: moTa -> UI: description
    duration: 120,                        // Defaulting as API lacks duration
    imageUrl: movie.hinhAnh ?? "",         // API: hinhAnh -> UI: imageUrl
    trailerUrl: movie.trailer ?? "",
    showtimes: movie.lstLichChieuPhim 
      ? movie.lstLichChieuPhim.map(lc => lc.ngayChieuGioChieu) 
      : ["18:00", "20:30"],
    isNowShowing: movie.dangChieu ?? true,
    isHot: movie.hot ?? false
  });

  return {
    ...normalized,
    // CRITICAL: Ensure 'id' is 'maPhim' so BookingPage logic works
    id: String(movie.maPhim), 
    maPhim: movie.maPhim,
    danhGia: movie.danhGia ?? 10,          // Added for the rating display
    createdAt: movie.createdAt ?? new Date().toISOString(),
    updatedAt: movie.updatedAt ?? new Date().toISOString()
  };
}

function normalizeUserFromAPI(user) {
  return {
    id: String(user.id ?? user.userId ?? makeId("u-api")),
    fullName: user.fullName ?? user.name ?? "Người dùng",
    email: String(user.email ?? "").toLowerCase(),
    password: user.password ?? "123456",
    role: user.role === "admin" ? "admin" : "user",
    createdAt: user.createdAt ?? new Date().toISOString()
  };
}

export function AppStoreProvider({ children }) {
  const [movies, setMovies] = useState(() => {
    const loadedMovies = loadJSON(STORAGE_KEYS.movies, seedMovies);
    return Array.isArray(loadedMovies) ? loadedMovies : seedMovies;
  });
  const [users, setUsers] = useState(() => {
    const loadedUsers = loadJSON(STORAGE_KEYS.users, defaultUsers);
    if (!Array.isArray(loadedUsers)) {
      return defaultUsers;
    }
    return ensureUsersHaveAdmin(loadedUsers);
  });
  const [bookings, setBookings] = useState(() => {
    const loadedBookings = loadJSON(STORAGE_KEYS.bookings, []);
    return Array.isArray(loadedBookings) ? loadedBookings : [];
  });
  const [sessionUserId, setSessionUserId] = useState(() => loadJSON(STORAGE_KEYS.sessionUserId, null));

  const currentUser = useMemo(() => users.find((user) => user.id === sessionUserId) || null, [users, sessionUserId]);

  useEffect(() => saveJSON(STORAGE_KEYS.movies, movies), [movies]);
  useEffect(() => saveJSON(STORAGE_KEYS.users, users), [users]);
  useEffect(() => saveJSON(STORAGE_KEYS.bookings, bookings), [bookings]);
  useEffect(() => saveJSON(STORAGE_KEYS.sessionUserId, sessionUserId), [sessionUserId]);

  useEffect(() => {
    let isMounted = true;

    async function syncFromAPI() {
  if (!isAPIConfigured()) {
    return;
  }

  const [movieResult, userResult] = await Promise.all([
    fetchMoviesFromAPI(),
    fetchUsersFromAPI()
  ]);

  if (!isMounted) return;

  // 1. Sync Movies
  if (movieResult.ok && movieResult.data.length > 0) {
    setMovies(movieResult.data.map(normalizeMovieFromAPI));
  }

  // 2. Sync Users (The "Merge" Strategy)
  if (userResult.ok && userResult.data.length > 0) {
    const apiUsers = userResult.data
      .map(normalizeUserFromAPI)
      .filter((user) => user.email);

    setUsers((prevLocalUsers) => {
      // Find users from the API that aren't already in our local storage
      const newApiUsers = apiUsers.filter(
        (apiUser) => !prevLocalUsers.some(
          (local) => local.email.toLowerCase() === apiUser.email.toLowerCase()
        )
      );
      
      // Combine local users (your registration) with new API users
      return [...prevLocalUsers, ...newApiUsers];
    });
  }
}

    syncFromAPI();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginUser = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
    );

    if (!found) {
      return { ok: false, message: "Email hoặc mật khẩu không đúng." };
    }

    setSessionUserId(found.id);
    return { ok: true, user: found };
  };

  const registerUser = ({ fullName, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!fullName.trim()) {
      return { ok: false, message: "Vui lòng nhập họ và tên." };
    }
    if (!normalizedEmail) {
      return { ok: false, message: "Vui lòng nhập email." };
    }
    if ((password || "").length < 6) {
      return { ok: false, message: "Mật khẩu phải từ 6 ký tự trở lên." };
    }
    const exists = users.some((user) => user.email.toLowerCase() === normalizedEmail);
    if (exists) {
      return { ok: false, message: "Email đã tồn tại." };
    }

    const newUser = {
      id: makeId("u"),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: "user",
      createdAt: new Date().toISOString()
    };

    setUsers((prev) => [...prev, newUser]);
    setSessionUserId(newUser.id);
    return { ok: true, user: newUser };
  };

  const logoutUser = () => {
    setSessionUserId(null);
  };

  const addMovie = (moviePayload) => {
    const normalized = normalizeMoviePayload(moviePayload);
    if (!normalized.title || !normalized.description || !normalized.imageUrl || !normalized.trailerUrl) {
      return { ok: false, message: "Vui lòng nhập đầy đủ thông tin phim." };
    }
    if (normalized.duration < 1) {
      return { ok: false, message: "Thời lượng phim phải lớn hơn 0." };
    }
    if (normalized.showtimes.length === 0) {
      return { ok: false, message: "Cần có ít nhất 1 suất chiếu." };
    }

    const newMovie = {
      ...normalized,
      id: makeId("mv"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMovies((prev) => [newMovie, ...prev]);
    return { ok: true, movie: newMovie };
  };

  const updateMovie = (movieId, moviePayload) => {
    const normalized = normalizeMoviePayload(moviePayload);
    if (!normalized.title || !normalized.description || !normalized.imageUrl || !normalized.trailerUrl) {
      return { ok: false, message: "Vui lòng nhập đầy đủ thông tin phim." };
    }
    if (normalized.duration < 1) {
      return { ok: false, message: "Thời lượng phim phải lớn hơn 0." };
    }
    if (normalized.showtimes.length === 0) {
      return { ok: false, message: "Cần có ít nhất 1 suất chiếu." };
    }

    let updatedMovie = null;
    setMovies((prev) =>
      prev.map((movie) => {
        if (movie.id !== movieId) {
          return movie;
        }
        updatedMovie = {
          ...movie,
          ...normalized,
          updatedAt: new Date().toISOString()
        };
        return updatedMovie;
      })
    );

    return updatedMovie ? { ok: true, movie: updatedMovie } : { ok: false, message: "Không tìm thấy phim." };
  };

  const deleteMovie = (movieId) => {
    setMovies((prev) => prev.filter((movie) => movie.id !== movieId));
    setBookings((prev) => prev.filter((booking) => booking.movieId !== movieId));
    return { ok: true };
  };

  const getBookedSeats = (movieId, showtime) => {
    return bookings
      .filter((booking) => booking.movieId === movieId && booking.showtime === showtime)
      .flatMap((booking) => booking.seats);
  };

  const createBooking = ({ movieId, showtime, seats }) => {
    if (!currentUser) {
      return { ok: false, message: "Vui lòng đăng nhập trước khi đặt vé." };
    }
    if (currentUser.role !== "user") {
      return { ok: false, message: "Chỉ tài khoản người dùng mới đặt vé được." };
    }

    const movie = movies.find((item) => item.id === movieId);
    if (!movie) {
      return { ok: false, message: "Không tìm thấy phim." };
    }
    if (!movie.isNowShowing) {
      return { ok: false, message: "Phim này hiện không mở đặt vé." };
    }
    if (!showtime) {
      return { ok: false, message: "Vui lòng chọn suất chiếu." };
    }
    if (!Array.isArray(seats) || seats.length === 0) {
      return { ok: false, message: "Vui lòng chọn ít nhất 1 ghế." };
    }

    const bookedSeatSet = new Set(getBookedSeats(movieId, showtime));
    const hasTakenSeat = seats.some((seatCode) => bookedSeatSet.has(seatCode));
    if (hasTakenSeat) {
      return { ok: false, message: "Một số ghế đã được đặt. Vui lòng chọn lại." };
    }

    const newBooking = {
      id: makeId("bk"),
      userId: currentUser.id,
      userName: currentUser.fullName,
      movieId: movie.id,
      movieTitle: movie.title,
      movieImage: movie.imageUrl,
      showtime,
      seats: [...seats].sort(),
      createdAt: new Date().toISOString()
    };

    setBookings((prev) => [newBooking, ...prev]);
    return { ok: true, booking: newBooking };
  };

  const userTickets = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return bookings.filter((booking) => booking.userId === currentUser.id);
  }, [bookings, currentUser]);

  const value = {
    movies,
    users,
    bookings,
    currentUser,
    userTickets,
    loginUser,
    registerUser,
    logoutUser,
    addMovie,
    updateMovie,
    deleteMovie,
    createBooking,
    getBookedSeats
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore phải được sử dụng bên trong AppStoreProvider.");
  }
  return context;
}
