import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createMovieToAPI,
  createUserToAPI,
  deleteMovieFromAPI,
  fetchMoviesFromAPI,
  fetchUsersFromAPI,
  isAPIConfigured,
  updateUserToAPI,
  updateMovieToAPI
} from "../../API";
import { seedMovies } from "../../features/movies/data/seedMovies";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../utils/storage";

const defaultUsers = [
  {
    id: "u-admin-001",
    fullName: "Quan tri Cinema",
    email: "admin@cinema.local",
    password: "admin123",
    role: "admin",
    bookings: [],
    createdAt: new Date().toISOString()
  }
];

const AppStoreContext = createContext(null);

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function isNotFoundErrorMessage(message) {
  const text = String(message || "").toLowerCase();
  return text.includes("404") || text.includes("not found");
}

function parseNumericId(value) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function getNextMovieId(movieList) {
  const maxId = movieList.reduce((maxValue, movie) => {
    const parsedId = parseNumericId(movie?.id);
    if (parsedId === null) {
      return maxValue;
    }
    return parsedId > maxValue ? parsedId : maxValue;
  }, 0);

  return String(maxId + 1);
}

function normalizeMoviePayload(payload) {
  const showtimeSource = Array.isArray(payload.showtimes)
    ? payload.showtimes
    : typeof payload.showtimes === "string"
      ? payload.showtimes.split(",")
      : [];

  return {
    title: (payload.title || "").trim(),
    description: (payload.description || "").trim(),
    duration: Number(payload.duration) || 0,
    imageUrl: (payload.imageUrl || "").trim(),
    trailerUrl: (payload.trailerUrl || "").trim(),
    showtimes: showtimeSource.map((item) => String(item).trim()).filter(Boolean),
    isNowShowing: Boolean(payload.isNowShowing),
    isHot: Boolean(payload.isHot)
  };
}

function ensureUsersHaveAdmin(userList) {
  const hasAdmin = userList.some((user) => user.role === "admin");
  return hasAdmin ? userList : [...userList, defaultUsers[0]];
}

function normalizeMovieFromAPI(movie) {
  const fallbackId = makeId("mv-api");
  const rawShowtimes =
    (Array.isArray(movie.showtimes) && movie.showtimes) ||
    (Array.isArray(movie.lichChieu) && movie.lichChieu) ||
    (typeof movie.showtimes === "string" ? movie.showtimes.split(",") : null) ||
    (typeof movie.lichChieu === "string" ? movie.lichChieu.split(",") : null) ||
    [];

  const normalized = normalizeMoviePayload({
    title: movie.title ?? movie.tenPhim ?? movie.name ?? "",
    description: movie.description ?? movie.moTa ?? movie.desc ?? "",
    duration: movie.duration ?? movie.thoiLuong ?? movie.runningTime ?? 0,
    imageUrl: movie.imageUrl ?? movie.hinhAnh ?? movie.image ?? movie.poster ?? "",
    trailerUrl: movie.trailerUrl ?? movie.trailer ?? movie.videoTrailer ?? "",
    showtimes: rawShowtimes,
    isNowShowing: movie.isNowShowing ?? movie.nowShowing ?? movie.dangChieu ?? true,
    isHot: movie.isHot ?? movie.hot ?? false
  });

  return {
    ...normalized,
    id: String(movie.id ?? movie.movieId ?? movie.maPhim ?? fallbackId),
    createdAt: movie.createdAt ?? new Date().toISOString(),
    updatedAt: movie.updatedAt ?? new Date().toISOString()
  };
}

function normalizeUserFromAPI(user) {
  const rawBookings = Array.isArray(user.bookings)
    ? user.bookings
    : Array.isArray(user.veDaDat)
      ? user.veDaDat
      : [];

  return {
    id: String(user.id ?? user.userId ?? makeId("u-api")),
    fullName: user.fullName ?? user.hoTen ?? user.name ?? "Nguoi dung",
    email: String(user.email ?? user.taiKhoan ?? "").toLowerCase(),
    password: user.password ?? user.matKhau ?? "123456",
    role: user.role === "admin" || user.maLoaiNguoiDung === "QuanTri" ? "admin" : "user",
    bookings: rawBookings,
    createdAt: user.createdAt ?? new Date().toISOString()
  };
}

function normalizeBookingFromUserBooking(booking, user) {
  const rawSeats =
    (Array.isArray(booking.seats) && booking.seats) ||
    (typeof booking.seats === "string" ? booking.seats.split(",") : null) ||
    [];

  return {
    id: String(booking.id ?? booking.bookingId ?? makeId("bk-api")),
    userId: String(user.id),
    userName: user.fullName,
    movieId: String(booking.movieId ?? booking.maPhim ?? ""),
    movieTitle: booking.movieTitle ?? booking.tenPhim ?? "",
    movieImage: booking.movieImage ?? booking.hinhAnh ?? "",
    showtime: String(booking.showtime ?? booking.suatChieu ?? ""),
    seats: rawSeats.map((seat) => String(seat).trim()).filter(Boolean).sort(),
    createdAt: booking.createdAt ?? booking.ngayDat ?? new Date().toISOString()
  };
}

function extractBookingsFromUsers(userList) {
  return userList.flatMap((user) => {
    const userBookings = Array.isArray(user.bookings) ? user.bookings : [];
    return userBookings
      .map((booking) => normalizeBookingFromUserBooking(booking, user))
      .filter((booking) => booking.movieId && booking.showtime);
  });
}

function normalizeBookingFromAPI(booking) {
  const rawSeats =
    (Array.isArray(booking.seats) && booking.seats) ||
    (typeof booking.seats === "string" ? booking.seats.split(",") : null) ||
    [];

  return {
    id: String(booking.id ?? booking.bookingId ?? makeId("bk-api")),
    userId: String(booking.userId ?? booking.maNguoiDung ?? ""),
    userName: booking.userName ?? booking.tenNguoiDung ?? "Nguoi dung",
    movieId: String(booking.movieId ?? booking.maPhim ?? ""),
    movieTitle: booking.movieTitle ?? booking.tenPhim ?? "",
    movieImage: booking.movieImage ?? booking.hinhAnh ?? "",
    showtime: String(booking.showtime ?? booking.suatChieu ?? ""),
    seats: rawSeats.map((seat) => String(seat).trim()).filter(Boolean).sort(),
    createdAt: booking.createdAt ?? new Date().toISOString()
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
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const currentUser = useMemo(() => users.find((user) => user.id === sessionUserId) || null, [users, sessionUserId]);

  useEffect(() => saveJSON(STORAGE_KEYS.movies, movies), [movies]);
  useEffect(() => saveJSON(STORAGE_KEYS.users, users), [users]);
  useEffect(() => saveJSON(STORAGE_KEYS.bookings, bookings), [bookings]);
  useEffect(() => saveJSON(STORAGE_KEYS.sessionUserId, sessionUserId), [sessionUserId]);

  const syncMoviesFromRemote = async () => {
    if (!isAPIConfigured()) {
      return { ok: false, message: "Chua cau hinh API URL." };
    }

    const movieResult = await fetchMoviesFromAPI();
    if (!movieResult.ok) {
      return { ok: false, message: movieResult.message || "Khong tai duoc danh sach phim tu API." };
    }

    const normalizedMovies = movieResult.data.map(normalizeMovieFromAPI).filter((movie) => movie.title);
    if (normalizedMovies.length === 0) {
      return { ok: false, message: "API khong tra ve danh sach phim hop le." };
    }

    setMovies(normalizedMovies);
    setLastSyncAt(new Date().toISOString());
    return { ok: true, message: "Dong bo danh sach phim thanh cong." };
  };

  const syncUsersFromRemote = async () => {
    if (!isAPIConfigured()) {
      return { ok: false, message: "Chua cau hinh API URL." };
    }

    const userResult = await fetchUsersFromAPI();
    if (!userResult.ok) {
      return { ok: false, message: userResult.message || "Khong tai duoc danh sach nguoi dung tu API." };
    }

    const normalizedUsers = userResult.data.map(normalizeUserFromAPI).filter((user) => user.email);
    if (normalizedUsers.length > 0) {
      const nextUsers = ensureUsersHaveAdmin(normalizedUsers);
      setUsers(nextUsers);
      setBookings(extractBookingsFromUsers(nextUsers));
    }
    return { ok: true, message: "Dong bo danh sach nguoi dung thanh cong." };
  };

  useEffect(() => {
    let isMounted = true;

    async function syncFromAPI() {
      if (!isAPIConfigured()) {
        return;
      }

      if (!isMounted) {
        return;
      }

      await Promise.all([syncMoviesFromRemote(), syncUsersFromRemote()]);
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

  const registerUser = async ({ fullName, email, password }) => {
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

    const baseUser = {
      id: makeId("u"),
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: "user",
      bookings: [],
      createdAt: new Date().toISOString()
    };

    if (isAPIConfigured()) {
      const { id: _localId, ...payloadNoId } = baseUser;
      const apiResult = await createUserToAPI(payloadNoId);
      if (!apiResult.ok) {
        return { ok: false, message: apiResult.message || "Không tạo được người dùng trên API." };
      }

      const savedUser = normalizeUserFromAPI(apiResult.data || payloadNoId);
      setUsers((prev) => {
        const nextUsers = [...prev, savedUser];
        setBookings(extractBookingsFromUsers(nextUsers));
        return nextUsers;
      });
      setSessionUserId(savedUser.id);
      return { ok: true, user: savedUser };
    }

    setUsers((prev) => {
      const nextUsers = [...prev, baseUser];
      setBookings(extractBookingsFromUsers(nextUsers));
      return nextUsers;
    });
    setSessionUserId(baseUser.id);
    return { ok: true, user: baseUser };
  };

  const logoutUser = () => {
    setSessionUserId(null);
  };

  const addMovie = async (moviePayload) => {
    const normalized = normalizeMoviePayload(moviePayload);
    if (!normalized.title || !normalized.description || !normalized.imageUrl || !normalized.trailerUrl) {
      return { ok: false, message: "Vui long nhap day du thong tin phim." };
    }
    if (normalized.duration < 1) {
      return { ok: false, message: "Thoi luong phim phai lon hon 0." };
    }
    if (normalized.showtimes.length === 0) {
      return { ok: false, message: "Can co it nhat 1 suat chieu." };
    }

    const baseMovie = {
      ...normalized,
      id: getNextMovieId(movies),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isAPIConfigured()) {
      const apiResult = await createMovieToAPI(baseMovie);
      if (!apiResult.ok) {
        return { ok: false, message: apiResult.message || "Khong the tao phim tren API." };
      }

      const savedMovie = normalizeMovieFromAPI(apiResult.data || baseMovie);
      setMovies((prev) => [savedMovie, ...prev]);
      return { ok: true, movie: savedMovie };
    }

    setMovies((prev) => [baseMovie, ...prev]);
    return { ok: true, movie: baseMovie };
  };

  const updateMovie = async (movieId, moviePayload) => {
    const movieIdText = String(movieId);
    const normalized = normalizeMoviePayload(moviePayload);
    if (!normalized.title || !normalized.description || !normalized.imageUrl || !normalized.trailerUrl) {
      return { ok: false, message: "Vui long nhap day du thong tin phim." };
    }
    if (normalized.duration < 1) {
      return { ok: false, message: "Thoi luong phim phai lon hon 0." };
    }
    if (normalized.showtimes.length === 0) {
      return { ok: false, message: "Can co it nhat 1 suat chieu." };
    }

    const currentMovie = movies.find((movie) => String(movie.id) === movieIdText);
    if (!currentMovie) {
      return { ok: false, message: "Khong tim thay phim." };
    }

    const baseMovie = {
      ...currentMovie,
      ...normalized,
      updatedAt: new Date().toISOString()
    };

    if (isAPIConfigured()) {
      const apiResult = await updateMovieToAPI(movieIdText, baseMovie);
      if (!apiResult.ok) {
        if (isNotFoundErrorMessage(apiResult.message)) {
          const { id: _id, ...payloadNoId } = baseMovie;
          const createResult = await createMovieToAPI(payloadNoId);
          if (!createResult.ok) {
            return { ok: false, message: createResult.message || "Khong the tao moi phim tren API." };
          }

          const createdMovie = normalizeMovieFromAPI(createResult.data || payloadNoId);
          setMovies((prev) =>
            prev.map((movie) => (String(movie.id) === movieIdText ? createdMovie : movie))
          );
          return {
            ok: true,
            movie: createdMovie,
            message: "Phim chua ton tai tren API, da tao moi va cap nhat thanh cong."
          };
        }

        return { ok: false, message: apiResult.message || "Khong the cap nhat phim tren API." };
      }

      const updatedMovie = normalizeMovieFromAPI(apiResult.data || baseMovie);
      setMovies((prev) =>
        prev.map((movie) => (String(movie.id) === movieIdText ? updatedMovie : movie))
      );
      return { ok: true, movie: updatedMovie };
    }

    setMovies((prev) => prev.map((movie) => (String(movie.id) === movieIdText ? baseMovie : movie)));
    return { ok: true, movie: baseMovie };
  };

  const deleteMovie = async (movieId) => {
    const movieIdText = String(movieId);
    if (isAPIConfigured()) {
      const apiResult = await deleteMovieFromAPI(movieIdText);
      if (!apiResult.ok && !isNotFoundErrorMessage(apiResult.message)) {
        return { ok: false, message: apiResult.message || "Khong the xoa phim tren API." };
      }

      const apiUsersWithBookings = users.filter((user) =>
        (Array.isArray(user.bookings) ? user.bookings : []).some(
          (booking) => String(booking.movieId ?? booking.maPhim ?? "") === movieIdText
        )
      );

      for (const user of apiUsersWithBookings) {
        const userBookings = Array.isArray(user.bookings) ? user.bookings : [];
        const nextUserBookings = userBookings.filter(
          (booking) => String(booking.movieId ?? booking.maPhim ?? "") !== movieIdText
        );
        const payload = { ...user, bookings: nextUserBookings };
        const { id: _id, ...payloadNoId } = payload;
        await updateUserToAPI(user.id, payloadNoId);
      }
    }

    setMovies((prev) => prev.filter((movie) => String(movie.id) !== movieIdText));
    setUsers((prev) => {
      const nextUsers = prev.map((user) => {
        const userBookings = Array.isArray(user.bookings) ? user.bookings : [];
        return {
          ...user,
          bookings: userBookings.filter((booking) => String(booking.movieId ?? booking.maPhim ?? "") !== movieIdText)
        };
      });
      setBookings(extractBookingsFromUsers(nextUsers));
      return nextUsers;
    });
    return { ok: true, message: "Da xoa phim." };
  };

  const getBookedSeats = (movieId, showtime) => {
    const movieIdText = String(movieId);
    const showtimeText = String(showtime);
    return bookings
      .filter(
        (booking) => String(booking.movieId) === movieIdText && String(booking.showtime) === showtimeText
      )
      .flatMap((booking) => booking.seats);
  };

  const createBooking = async ({ movieId, showtime, seats }) => {
    const movieIdText = String(movieId);
    if (!currentUser) {
      return { ok: false, message: "Vui long dang nhap truoc khi dat ve." };
    }
    if (currentUser.role !== "user") {
      return { ok: false, message: "Chi tai khoan nguoi dung moi dat ve duoc." };
    }

    const movie = movies.find((item) => String(item.id) === movieIdText);
    if (!movie) {
      return { ok: false, message: "Khong tim thay phim." };
    }
    if (!movie.isNowShowing) {
      return { ok: false, message: "Phim nay hien khong mo dat ve." };
    }
    if (!showtime) {
      return { ok: false, message: "Vui long chon suat chieu." };
    }
    if (!Array.isArray(seats) || seats.length === 0) {
      return { ok: false, message: "Vui long chon it nhat 1 ghe." };
    }

    const bookedSeatSet = new Set(getBookedSeats(movieId, showtime));
    const hasTakenSeat = seats.some((seatCode) => bookedSeatSet.has(seatCode));
    if (hasTakenSeat) {
      return { ok: false, message: "Mot so ghe da duoc dat. Vui long chon lai." };
    }

    const baseBooking = {
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

    if (isAPIConfigured()) {
      const targetUser = users.find((user) => String(user.id) === String(currentUser.id));
      if (!targetUser) {
        return { ok: false, message: "Khong tim thay nguoi dung de cap nhat ve." };
      }

      const currentUserBookings = Array.isArray(targetUser.bookings) ? targetUser.bookings : [];
      const bookingForUser = {
        id: baseBooking.id,
        movieId: baseBooking.movieId,
        movieTitle: baseBooking.movieTitle,
        movieImage: baseBooking.movieImage,
        showtime: baseBooking.showtime,
        seats: baseBooking.seats,
        createdAt: baseBooking.createdAt
      };

      const updatedUserPayload = {
        ...targetUser,
        bookings: [bookingForUser, ...currentUserBookings]
      };
      const { id: _id, ...payloadNoId } = updatedUserPayload;
      const apiResult = await updateUserToAPI(targetUser.id, payloadNoId);
      if (!apiResult.ok) {
        return { ok: false, message: apiResult.message || "Khong tao duoc ve tren API." };
      }

      const savedUser = normalizeUserFromAPI(apiResult.data || updatedUserPayload);
      const savedBooking = normalizeBookingFromUserBooking(bookingForUser, savedUser);
      setUsers((prev) => {
        const nextUsers = prev.map((user) => (String(user.id) === String(savedUser.id) ? savedUser : user));
        setBookings(extractBookingsFromUsers(nextUsers));
        return nextUsers;
      });
      return { ok: true, booking: savedBooking };
    }

    setBookings((prev) => [baseBooking, ...prev]);
    return { ok: true, booking: baseBooking };
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
    lastSyncAt,
    currentUser,
    userTickets,
    loginUser,
    registerUser,
    logoutUser,
    addMovie,
    updateMovie,
    deleteMovie,
    createBooking,
    getBookedSeats,
    syncMoviesFromRemote,
    syncUsersFromRemote
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore phai duoc su dung ben trong AppStoreProvider.");
  }
  return context;
}
