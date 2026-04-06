import axios from "axios";

export const API_CONFIG = {
  BASE_URL: "https://movienew.cybersoft.edu.vn/api/QuanLyPhim", 
  // IMPORTANT: Ensure this is a token from an ADMIN (QuanTri) account
  TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCA4OCIsIkhldEhhblN0cmluZyI6IjEwLzA5LzIwMjYiLCJIZXRIYW5UaW1lIjoiMTc4ODk5ODQwMDAwMCIsIm5iZiI6MTc2MDAyOTIwMCwiZXhwIjoxNzg5MTQ2MDAwfQ.l0zPoFdAw1Eg4yqbHAPSHOZJeapIOhcC-It_UzWyRMg", 
  PROJECT_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCA4OCIsIkhldEhhblN0cmluZyI6IjEwLzA5LzIwMjYiLCJIZXRIYW5UaW1lIjoiMTc4ODk5ODQwMDAwMCIsIm5iZiI6MTc2MDAyOTIwMCwiZXhwIjoxNzg5MTQ2MDAwfQ.l0zPoFdAw1Eg4yqbHAPSHOZJeapIOhcC-It_UzWyRMg",
  MOVIES_PATH: "/LayDanhSachPhim?maNhom=GP01",
  USERS_PATH: "../QuanLyNguoiDung/LayDanhSachNguoiDung?maNhom=GP01",
  LOGIN_PATH: "../QuanLyNguoiDung/DangNhap",
};

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    // This is the static project identification token
    "TokenCybersoft": API_CONFIG.PROJECT_TOKEN 
  }
});

// INTERCEPTOR: Dynamically adds the Bearer token to every request
apiClient.interceptors.request.use((config) => {
  const userToken = API_CONFIG.TOKEN; 
  if (userToken) {
    // Ensure there is a space after 'Bearer'
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export function isAPIConfigured() {
  return Boolean(API_CONFIG.BASE_URL);
}

// --- EXISTING FUNCTIONS ---

export async function fetchMoviesFromAPI() {
  try {
    const response = await apiClient.get(API_CONFIG.MOVIES_PATH);
    return { ok: true, data: response.data.content, message: "" };
  } catch (error) {
    return { ok: false, data: [], message: "Lỗi tải phim" };
  }
}

export async function fetchUsersFromAPI() {
  try {
    const response = await apiClient.get(API_CONFIG.USERS_PATH);
    const list = response.data.content || []; 
    return { ok: true, data: list, message: "" };
  } catch (error) {
    return { ok: false, data: [], message: "Lỗi tải người dùng" };
  }
}

export async function loginAPI(credentials) {
  try {
    const response = await apiClient.post(API_CONFIG.LOGIN_PATH, credentials);
    return { ok: true, data: response.data.content };
  } catch (error) {
    return { 
      ok: false, 
      message: error.response?.data?.content || "Tài khoản hoặc mật khẩu không đúng." 
    };
  }
}

// --- UPDATED FUNCTIONS ---

export async function addMovieAPI(formData) {
  try {
    const response = await apiClient.post("/ThemPhimUploadHinh", formData, {
      headers: { "Content-Type": "multipart/form-data" } // Required
    });
    return { ok: true, data: response.data.content };
  } catch (error) {
    return { 
      ok: false, 
      message: error.response?.data?.content || "Lỗi khi thêm phim" 
    };
  }
}

/**
 * Path: /CapNhatPhimUpload
 * This endpoint strictly requires a Bearer token from a 'QuanTri' account
 */
export async function updateMovieAPI(formData) {
  try {
    const response = await apiClient.post("/CapNhatPhimUpload", formData, {
      headers: { "Content-Type": "multipart/form-data" } // Required
    });
    return { ok: true, data: response.data.content };
  } catch (error) {
    return { 
      ok: false, 
      message: error.response?.data?.content || "Lỗi khi cập nhật phim" 
    };
  }
}

export async function deleteMovieAPI(movieId) {
  try {
    await apiClient.delete(`/XoaPhim?MaPhim=${movieId}`); //
    return { ok: true, message: "Xóa phim thành công" };
  } catch (error) {
    return { 
      ok: false, 
      message: error.response?.data?.content || "Không thể xóa phim này" 
    };
  }
}

export default apiClient;