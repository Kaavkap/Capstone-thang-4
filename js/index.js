import { API_CONFIG } from "./api.placeholder.js";
import {
  clearCurrentUser,
  generateId,
  getCurrentUser,
  getMovies,
  getOccupiedSeats,
  getTickets,
  getUsers,
  initializeData,
  saveMovies,
  saveTickets,
  saveUsers,
  setCurrentUser
} from "./storage.js";

const state = {
  currentUser: null,
  movies: [],
  tickets: [],
  selectedMovieId: "",
  selectedShowtime: "",
  selectedSeats: new Set()
};

const seatRows = ["A", "B", "C", "D", "E", "F"];
const seatsPerRow = 8;

const el = {};

function byId(id) {
  return document.getElementById(id);
}

function cacheElements() {
  el.openAuthBtn = byId("openAuthBtn");
  el.userInfo = byId("userInfo");
  el.currentUserLabel = byId("currentUserLabel");
  el.logoutBtn = byId("logoutBtn");
  el.authSection = byId("authSection");
  el.modeBadge = byId("modeBadge");
  el.tabButtons = [...document.querySelectorAll(".tab-btn")];
  el.loginForm = byId("loginForm");
  el.registerForm = byId("registerForm");
  el.loginEmail = byId("loginEmail");
  el.loginPassword = byId("loginPassword");
  el.registerName = byId("registerName");
  el.registerEmail = byId("registerEmail");
  el.registerPassword = byId("registerPassword");
  el.searchInput = byId("searchInput");
  el.filterStatus = byId("filterStatus");
  el.movieGrid = byId("movieGrid");
  el.myTicketsSection = byId("myTicketsSection");
  el.ticketList = byId("ticketList");
  el.adminSection = byId("adminSection");
  el.adminMovieForm = byId("adminMovieForm");
  el.movieId = byId("movieId");
  el.movieTitle = byId("movieTitle");
  el.movieGenre = byId("movieGenre");
  el.movieDuration = byId("movieDuration");
  el.moviePrice = byId("moviePrice");
  el.moviePoster = byId("moviePoster");
  el.movieDescription = byId("movieDescription");
  el.movieShowtimes = byId("movieShowtimes");
  el.movieNowShowing = byId("movieNowShowing");
  el.cancelEditBtn = byId("cancelEditBtn");
  el.adminMovieTableBody = byId("adminMovieTableBody");
  el.bookingModal = byId("bookingModal");
  el.bookingTitle = byId("bookingTitle");
  el.bookingMeta = byId("bookingMeta");
  el.seatMap = byId("seatMap");
  el.closeBookingModal = byId("closeBookingModal");
  el.confirmBookingBtn = byId("confirmBookingBtn");
  el.toast = byId("toast");
}

function bindEvents() {
  el.openAuthBtn.addEventListener("click", () => {
    el.authSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  el.logoutBtn.addEventListener("click", onLogout);
  el.loginForm.addEventListener("submit", onLogin);
  el.registerForm.addEventListener("submit", onRegister);
  el.searchInput.addEventListener("input", renderMovies);
  el.filterStatus.addEventListener("change", renderMovies);
  el.closeBookingModal.addEventListener("click", closeBookingModal);
  el.confirmBookingBtn.addEventListener("click", onConfirmBooking);
  el.bookingModal.addEventListener("click", (event) => {
    if (event.target === el.bookingModal) {
      closeBookingModal();
    }
  });

  el.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchAuthTab(btn.dataset.tab || "login"));
  });

  el.movieGrid.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.classList.contains("book-btn")) {
      const { movieId, showtime } = target.dataset;
      if (movieId && showtime) {
        openBookingModal(movieId, showtime);
      }
    }
  });

  el.seatMap.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (!target.classList.contains("seat") || target.classList.contains("occupied")) {
      return;
    }
    const seatCode = target.dataset.seat;
    if (!seatCode) {
      return;
    }
    toggleSeatSelection(seatCode);
  });

  el.adminMovieForm.addEventListener("submit", onSaveMovie);
  el.cancelEditBtn.addEventListener("click", resetAdminForm);
  el.adminMovieTableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const { action, id } = target.dataset;
    if (!action || !id) {
      return;
    }
    if (action === "edit") {
      fillAdminFormForEdit(id);
    }
    if (action === "toggle") {
      toggleNowShowing(id);
    }
    if (action === "delete") {
      deleteMovie(id);
    }
  });
}

function syncState() {
  state.currentUser = getCurrentUser();
  state.movies = getMovies();
  state.tickets = getTickets();
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.setTimeout(() => {
    el.toast.classList.remove("show");
  }, 2200);
}

function switchAuthTab(tab) {
  const isLogin = tab === "login";
  el.loginForm.classList.toggle("hidden", !isLogin);
  el.registerForm.classList.toggle("hidden", isLogin);
  el.tabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(value);
}

function formatDateTime(isoDate) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(isoDate));
}

function onLogin(event) {
  event.preventDefault();
  const email = el.loginEmail.value.trim().toLowerCase();
  const password = el.loginPassword.value.trim();
  const users = getUsers();
  const found = users.find((user) => user.email.toLowerCase() === email && user.password === password);
  if (!found) {
    showToast("Thông tin đăng nhập không đúng.");
    return;
  }
  setCurrentUser(found);
  state.currentUser = found;
  el.loginForm.reset();
  renderAll();
  showToast(`Xin chào ${found.name}`);
}

function onRegister(event) {
  event.preventDefault();
  const name = el.registerName.value.trim();
  const email = el.registerEmail.value.trim().toLowerCase();
  const password = el.registerPassword.value.trim();
  const users = getUsers();
  if (users.some((user) => user.email.toLowerCase() === email)) {
    showToast("Email đã tồn tại.");
    return;
  }
  const newUser = {
    id: generateId("u"),
    name,
    email,
    password,
    role: "user",
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  state.currentUser = newUser;
  el.registerForm.reset();
  switchAuthTab("login");
  renderAll();
  showToast("Đăng ký thành công.");
}

function onLogout() {
  clearCurrentUser();
  state.currentUser = null;
  closeBookingModal();
  renderAll();
  showToast("Bạn đã đăng xuất.");
}

function renderAuthState() {
  const user = state.currentUser;
  const loggedIn = Boolean(user);
  el.openAuthBtn.classList.toggle("hidden", loggedIn);
  el.userInfo.classList.toggle("hidden", !loggedIn);
  el.authSection.classList.toggle("hidden", loggedIn);
  if (loggedIn) {
    el.currentUserLabel.textContent = `${user.name} (${user.role})`;
  } else {
    switchAuthTab("login");
  }
}

function getFilteredMovies() {
  const query = el.searchInput.value.trim().toLowerCase();
  const status = el.filterStatus.value;
  return state.movies.filter((movie) => {
    const matchedTitle = movie.title.toLowerCase().includes(query);
    const matchedStatus =
      status === "all" ||
      (status === "showing" && movie.nowShowing) ||
      (status === "coming" && !movie.nowShowing);
    return matchedTitle && matchedStatus;
  });
}

function renderMovies() {
  const movies = getFilteredMovies();
  if (!movies.length) {
    el.movieGrid.innerHTML = `<p class="muted">Không có phim phù hợp bộ lọc.</p>`;
    return;
  }

  el.movieGrid.innerHTML = movies
    .map((movie) => {
      const statusLabel = movie.nowShowing ? "Đang chiếu" : "Sắp chiếu";
      const statusClass = movie.nowShowing ? "showing" : "coming";
      const showtimeButtons = movie.showtimes
        .map((time) => {
          const disabled = !state.currentUser || !movie.nowShowing;
          return `
            <button
              class="btn-secondary book-btn"
              data-movie-id="${movie.id}"
              data-showtime="${time}"
              ${disabled ? "disabled" : ""}
              title="${!state.currentUser ? "Đăng nhập để đặt vé" : ""}">
              ${time}
            </button>
          `;
        })
        .join("");

      return `
        <article class="movie-card">
          <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'" />
          <div class="movie-body">
            <h4 class="movie-title">${movie.title}</h4>
            <span class="movie-status ${statusClass}">${statusLabel}</span>
            <p class="movie-meta">${movie.genre} • ${movie.duration} phút</p>
            <p class="movie-meta">Giá: ${formatCurrency(movie.price)}</p>
            <p class="movie-meta">${movie.description}</p>
            <div class="showtimes">${showtimeButtons}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMyTickets() {
  if (!state.currentUser) {
    el.myTicketsSection.classList.add("hidden");
    return;
  }
  el.myTicketsSection.classList.remove("hidden");
  const userTickets = state.tickets
    .filter((ticket) => ticket.userId === state.currentUser.id)
    .sort((a, b) => +new Date(b.bookedAt) - +new Date(a.bookedAt));

  if (!userTickets.length) {
    el.ticketList.innerHTML = `<p class="muted">Bạn chưa có vé nào.</p>`;
    return;
  }

  el.ticketList.innerHTML = userTickets
    .map(
      (ticket) => `
      <article class="ticket-item">
        <h4>${ticket.movieTitle}</h4>
        <p>Suất chiếu: <strong>${ticket.showtime}</strong></p>
        <p>Ghế: ${ticket.seats.join(", ")}</p>
        <p>Tổng tiền: <strong>${formatCurrency(ticket.totalPrice)}</strong></p>
        <p>Đặt lúc: ${formatDateTime(ticket.bookedAt)}</p>
      </article>
    `
    )
    .join("");
}

function renderAdminSection() {
  const isAdmin = state.currentUser?.role === "admin";
  el.adminSection.classList.toggle("hidden", !isAdmin);
  if (!isAdmin) {
    return;
  }

  el.adminMovieTableBody.innerHTML = state.movies
    .map(
      (movie) => `
      <tr>
        <td>${movie.title}</td>
        <td>${movie.genre}</td>
        <td>${movie.nowShowing ? "Đang chiếu" : "Sắp chiếu"}</td>
        <td>
          <div class="table-actions">
            <button class="btn-secondary" data-action="edit" data-id="${movie.id}" type="button">Sửa</button>
            <button class="btn-outline" data-action="toggle" data-id="${movie.id}" type="button">
              ${movie.nowShowing ? "Ẩn" : "Cho chiếu"}
            </button>
            <button class="btn-danger" data-action="delete" data-id="${movie.id}" type="button">Xoá</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

function openBookingModal(movieId, showtime) {
  if (!state.currentUser) {
    showToast("Bạn cần đăng nhập trước khi đặt vé.");
    return;
  }

  const movie = state.movies.find((item) => item.id === movieId);
  if (!movie || !movie.nowShowing) {
    showToast("Phim chưa mở bán.");
    return;
  }

  state.selectedMovieId = movieId;
  state.selectedShowtime = showtime;
  state.selectedSeats.clear();

  el.bookingTitle.textContent = `Đặt vé: ${movie.title}`;
  el.bookingMeta.textContent = `Suất ${showtime} • ${formatCurrency(movie.price)} / ghế`;
  renderSeatMap();
  el.bookingModal.classList.remove("hidden");
}

function closeBookingModal() {
  el.bookingModal.classList.add("hidden");
  state.selectedMovieId = "";
  state.selectedShowtime = "";
  state.selectedSeats.clear();
}

function renderSeatMap() {
  if (!state.selectedMovieId || !state.selectedShowtime) {
    el.seatMap.innerHTML = "";
    return;
  }

  const occupied = new Set(getOccupiedSeats(state.selectedMovieId, state.selectedShowtime));
  const seatCodes = seatRows.flatMap((row) =>
    Array.from({ length: seatsPerRow }, (_, index) => `${row}${index + 1}`)
  );

  el.seatMap.innerHTML = seatCodes
    .map((seatCode) => {
      const isOccupied = occupied.has(seatCode);
      const isSelected = state.selectedSeats.has(seatCode);
      return `
        <button
          type="button"
          class="seat ${isOccupied ? "occupied" : ""} ${isSelected ? "selected" : ""}"
          data-seat="${seatCode}">
          ${seatCode}
        </button>
      `;
    })
    .join("");
}

function toggleSeatSelection(seatCode) {
  if (state.selectedSeats.has(seatCode)) {
    state.selectedSeats.delete(seatCode);
  } else {
    if (state.selectedSeats.size >= 8) {
      showToast("Mỗi lần chỉ được chọn tối đa 8 ghế.");
      return;
    }
    state.selectedSeats.add(seatCode);
  }
  renderSeatMap();
}

function onConfirmBooking() {
  if (!state.currentUser || !state.selectedMovieId || !state.selectedShowtime) {
    return;
  }
  if (state.selectedSeats.size === 0) {
    showToast("Vui lòng chọn ít nhất 1 ghế.");
    return;
  }

  const movie = state.movies.find((item) => item.id === state.selectedMovieId);
  if (!movie) {
    showToast("Không tìm thấy phim.");
    return;
  }

  const ticket = {
    id: generateId("t"),
    userId: state.currentUser.id,
    movieId: movie.id,
    movieTitle: movie.title,
    showtime: state.selectedShowtime,
    seats: [...state.selectedSeats].sort(),
    totalPrice: movie.price * state.selectedSeats.size,
    bookedAt: new Date().toISOString()
  };

  state.tickets.push(ticket);
  saveTickets(state.tickets);
  closeBookingModal();
  renderMyTickets();
  showToast("Đặt vé thành công.");
}

function onSaveMovie(event) {
  event.preventDefault();
  if (state.currentUser?.role !== "admin") {
    showToast("Bạn không có quyền thực hiện thao tác này.");
    return;
  }

  const showtimes = el.movieShowtimes.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!showtimes.length) {
    showToast("Vui lòng nhập ít nhất 1 suất chiếu.");
    return;
  }

  const payload = {
    title: el.movieTitle.value.trim(),
    genre: el.movieGenre.value.trim(),
    duration: Number(el.movieDuration.value),
    price: Number(el.moviePrice.value),
    poster: el.moviePoster.value.trim(),
    description: el.movieDescription.value.trim(),
    showtimes,
    nowShowing: el.movieNowShowing.checked
  };

  const existingId = el.movieId.value.trim();
  if (existingId) {
    state.movies = state.movies.map((movie) => (movie.id === existingId ? { ...movie, ...payload } : movie));
    showToast("Đã cập nhật phim.");
  } else {
    state.movies.push({
      id: generateId("m"),
      ...payload
    });
    showToast("Đã thêm phim mới.");
  }

  saveMovies(state.movies);
  resetAdminForm();
  renderMovies();
  renderAdminSection();
}

function resetAdminForm() {
  el.adminMovieForm.reset();
  el.movieId.value = "";
  el.movieNowShowing.checked = true;
}

function fillAdminFormForEdit(movieId) {
  const movie = state.movies.find((item) => item.id === movieId);
  if (!movie) {
    return;
  }

  el.movieId.value = movie.id;
  el.movieTitle.value = movie.title;
  el.movieGenre.value = movie.genre;
  el.movieDuration.value = String(movie.duration);
  el.moviePrice.value = String(movie.price);
  el.moviePoster.value = movie.poster;
  el.movieDescription.value = movie.description;
  el.movieShowtimes.value = movie.showtimes.join(", ");
  el.movieNowShowing.checked = movie.nowShowing;
  el.adminSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleNowShowing(movieId) {
  state.movies = state.movies.map((movie) =>
    movie.id === movieId ? { ...movie, nowShowing: !movie.nowShowing } : movie
  );
  saveMovies(state.movies);
  renderMovies();
  renderAdminSection();
}

function deleteMovie(movieId) {
  const movie = state.movies.find((item) => item.id === movieId);
  if (!movie) {
    return;
  }
  const ok = window.confirm(`Xoá phim "${movie.title}"?`);
  if (!ok) {
    return;
  }
  state.movies = state.movies.filter((item) => item.id !== movieId);
  saveMovies(state.movies);
  renderMovies();
  renderAdminSection();
  showToast("Đã xoá phim.");
}

function renderAll() {
  syncState();
  renderAuthState();
  renderMovies();
  renderMyTickets();
  renderAdminSection();
  el.modeBadge.textContent = API_CONFIG.ENABLE_REMOTE_API ? "API Mode" : "Local Cache Mode";
}

function bootstrap() {
  initializeData();
  cacheElements();
  bindEvents();
  renderAll();
}

window.addEventListener("DOMContentLoaded", bootstrap);
