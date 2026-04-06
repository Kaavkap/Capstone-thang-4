export const API_CONFIG = {
  // Chuyển sang true khi bạn đã có backend API thật
  ENABLE_REMOTE_API: false,
  BASE_URL: "https://your-api-domain.com/api",
  DEFAULT_HEADERS: {
    "Content-Type": "application/json"
  }
};

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, token } = options;

  if (!API_CONFIG.ENABLE_REMOTE_API) {
    throw new Error("Remote API is disabled. App is using local cache mode.");
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
    method,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Bạn chỉ cần thay các hàm này để map vào API thật của bạn.
export const apiService = {
  auth: {
    login(payload) {
      return apiRequest("/auth/login", { method: "POST", body: payload });
    },
    register(payload) {
      return apiRequest("/auth/register", { method: "POST", body: payload });
    }
  },
  movies: {
    list() {
      return apiRequest("/movies");
    },
    create(payload) {
      return apiRequest("/movies", { method: "POST", body: payload });
    },
    update(id, payload) {
      return apiRequest(`/movies/${id}`, { method: "PUT", body: payload });
    },
    remove(id) {
      return apiRequest(`/movies/${id}`, { method: "DELETE" });
    }
  },
  tickets: {
    listByUser(userId) {
      return apiRequest(`/tickets?userId=${userId}`);
    },
    create(payload) {
      return apiRequest("/tickets", { method: "POST", body: payload });
    }
  }
};
