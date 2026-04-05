export const STORAGE_KEYS = {
  movies: "cinema_movies_v1",
  users: "cinema_users_v1",
  bookings: "cinema_bookings_v1",
  sessionUserId: "cinema_session_user_id_v1"
};

export function loadJSON(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallbackValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    return fallbackValue;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore write errors to avoid breaking the UI.
  }
}

