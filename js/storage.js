const KEYS = {
  USERS: "movie_booking_users",
  MOVIES: "movie_booking_movies",
  TICKETS: "movie_booking_tickets",
  CURRENT_USER: "movie_booking_current_user"
};

const posterFallback =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80";

function readJson(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

export function initializeData() {
  const existingUsers = readJson(KEYS.USERS, []);
  if (!existingUsers.length) {
    const seedUsers = [
      {
        id: "u_admin",
        name: "Cinema Admin",
        email: "admin@cinema.local",
        password: "admin123",
        role: "admin",
        createdAt: new Date().toISOString()
      }
    ];
    writeJson(KEYS.USERS, seedUsers);
  }

  const existingMovies = readJson(KEYS.MOVIES, []);
  if (!existingMovies.length) {
    const seedMovies = [
      {
        id: "m_1",
        title: "Interstellar",
        genre: "Sci-fi",
        duration: 169,
        price: 90000,
        poster:
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
        description: "Hành trình xuyên không gian để tìm cơ hội sinh tồn cho nhân loại.",
        showtimes: ["09:30", "13:45", "20:15"],
        nowShowing: true
      },
      {
        id: "m_2",
        title: "Inception",
        genre: "Action, Mystery",
        duration: 148,
        price: 95000,
        poster:
          "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
        description: "Đội đặc nhiệm xâm nhập giấc mơ để thực hiện phi vụ bất khả thi.",
        showtimes: ["10:15", "15:30", "21:00"],
        nowShowing: true
      },
      {
        id: "m_3",
        title: "Spirited Away",
        genre: "Animation, Fantasy",
        duration: 125,
        price: 80000,
        poster:
          "https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=800&q=80",
        description: "Cô bé Chihiro lạc vào thế giới linh hồn kỳ bí.",
        showtimes: ["08:45", "14:00", "19:10"],
        nowShowing: true
      },
      {
        id: "m_4",
        title: "Dune: Part Two",
        genre: "Sci-fi, Adventure",
        duration: 166,
        price: 100000,
        poster: posterFallback,
        description: "Hành trình báo thù và định mệnh của Paul Atreides.",
        showtimes: ["11:30", "17:20"],
        nowShowing: false
      }
    ];
    writeJson(KEYS.MOVIES, seedMovies);
  }

  const existingTickets = readJson(KEYS.TICKETS, []);
  if (!Array.isArray(existingTickets)) {
    writeJson(KEYS.TICKETS, []);
  }
}

export function getUsers() {
  return readJson(KEYS.USERS, []);
}

export function saveUsers(users) {
  writeJson(KEYS.USERS, users);
}

export function getMovies() {
  return readJson(KEYS.MOVIES, []);
}

export function saveMovies(movies) {
  writeJson(KEYS.MOVIES, movies);
}

export function getTickets() {
  return readJson(KEYS.TICKETS, []);
}

export function saveTickets(tickets) {
  writeJson(KEYS.TICKETS, tickets);
}

export function getCurrentUser() {
  return readJson(KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user) {
  writeJson(KEYS.CURRENT_USER, user);
}

export function clearCurrentUser() {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

export function getOccupiedSeats(movieId, showtime) {
  const tickets = getTickets();
  return tickets
    .filter((ticket) => ticket.movieId === movieId && ticket.showtime === showtime)
    .flatMap((ticket) => ticket.seats);
}
