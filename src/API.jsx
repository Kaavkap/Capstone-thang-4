import axios from "axios";

/*
  Cài đặt API tại đây:
  - BASE_URL: domain của backend
  - TOKEN: Bearer token
  - MOVIES_PATH / USERS_PATH: endpoint lấy danh sách phim, người dùng
*/
export const API_CONFIG = {
  // Chèn API URL bên dưới
  BASE_URL: "",
  // Chèn API TOKEN bên dưới
  TOKEN: "",
  MOVIES_PATH: "/movies",
  USERS_PATH: "/users"
};

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

if (API_CONFIG.TOKEN) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${API_CONFIG.TOKEN}`;
}

export function isAPIConfigured() {
  return Boolean(API_CONFIG.BASE_URL);
}

export async function fetchMoviesFromAPI() {
  if (!isAPIConfigured()) {
    return { ok: false, data: [], message: "API chưa được cấu hình." };
  }

  try {
    const response = await apiClient.get(API_CONFIG.MOVIES_PATH);
    const list = Array.isArray(response.data) ? response.data : response.data?.data;
    return { ok: true, data: Array.isArray(list) ? list : [], message: "" };
  } catch (error) {
    return {
      ok: false,
      data: [],
      message: error?.response?.data?.message || error.message || "Không thể tải danh sách phim từ API."
    };
  }
}

export async function fetchUsersFromAPI() {
  if (!isAPIConfigured()) {
    return { ok: false, data: [], message: "API chưa được cấu hình." };
  }

  try {
    const response = await apiClient.get(API_CONFIG.USERS_PATH);
    const list = Array.isArray(response.data) ? response.data : response.data?.data;
    return { ok: true, data: Array.isArray(list) ? list : [], message: "" };
  } catch (error) {
    return {
      ok: false,
      data: [],
      message: error?.response?.data?.message || error.message || "Không thể tải danh sách người dùng từ API."
    };
  }
}

export default apiClient;
