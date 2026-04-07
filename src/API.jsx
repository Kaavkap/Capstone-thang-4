import axios from "axios";

/*
  HUONG DAN NHANH:
  1) Dien truc tiep vao API_CONFIG ben duoi (BASE_URL, TOKEN)
  2) Hoac dung bien moi truong Vite trong file .env.local:
     VITE_API_BASE_URL=...
     VITE_API_TOKEN=...
     VITE_API_MOVIES_PATH=/movies
     VITE_API_USERS_PATH=/users

  MockAPI free: chi can 2 resource la movies va users.
*/
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "https://69d5153ad396bd74235e5653.mockapi.io",
  TOKEN: import.meta.env.VITE_API_TOKEN || "",
  MOVIES_PATH: import.meta.env.VITE_API_MOVIES_PATH || "/movies",
  USERS_PATH: import.meta.env.VITE_API_USERS_PATH || "/users",
  AUTH_PREFIX: import.meta.env.VITE_API_AUTH_PREFIX || "Bearer"
};

function normalizeBaseURL(baseURL) {
  return String(baseURL || "").trim().replace(/\/+$/, "");
}

function normalizePath(path) {
  const raw = String(path || "").trim();
  if (!raw) {
    return "";
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function getAuthHeader(token, prefix) {
  const tokenText = String(token || "").trim();
  if (!tokenText) {
    return {};
  }
  const authPrefix = String(prefix || "Bearer").trim();
  return {
    Authorization: authPrefix ? `${authPrefix} ${tokenText}` : tokenText
  };
}

function resolveConfig() {
  return {
    baseURL: normalizeBaseURL(API_CONFIG.BASE_URL),
    moviesPath: normalizePath(API_CONFIG.MOVIES_PATH),
    usersPath: normalizePath(API_CONFIG.USERS_PATH),
    token: String(API_CONFIG.TOKEN || "").trim(),
    authPrefix: String(API_CONFIG.AUTH_PREFIX || "Bearer").trim()
  };
}

function unwrapListPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.content)) {
    return payload.content;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  return [];
}

async function requestAPI(method, path, body, errorFallback) {
  const { baseURL, token, authPrefix } = resolveConfig();
  const endpointPath = normalizePath(path);

  if (!baseURL) {
    return { ok: false, data: null, message: "API chua duoc cau hinh BASE_URL." };
  }

  if (!endpointPath) {
    return { ok: false, data: null, message: "Endpoint dang rong." };
  }

  try {
    const response = await axios({
      method,
      url: `${baseURL}${endpointPath}`,
      data: body,
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(token, authPrefix)
      }
    });

    return { ok: true, data: response.data, message: "" };
  } catch (error) {
    return {
      ok: false,
      data: null,
      message: error?.response?.data?.message || error.message || errorFallback
    };
  }
}

async function getListFromAPI(path, emptyPathMessage, errorFallback) {
  const { baseURL, token, authPrefix } = resolveConfig();
  const endpointPath = normalizePath(path);

  if (!baseURL) {
    return { ok: false, data: [], message: "API chua duoc cau hinh BASE_URL." };
  }

  if (!endpointPath) {
    return { ok: false, data: [], message: emptyPathMessage };
  }

  try {
    const response = await axios.get(`${baseURL}${endpointPath}`, {
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(token, authPrefix)
      }
    });

    return {
      ok: true,
      data: unwrapListPayload(response.data),
      message: ""
    };
  } catch (error) {
    return {
      ok: false,
      data: [],
      message: error?.response?.data?.message || error.message || errorFallback
    };
  }
}

export function isAPIConfigured() {
  return Boolean(resolveConfig().baseURL);
}

export async function fetchMoviesFromAPI() {
  const { moviesPath } = resolveConfig();
  return getListFromAPI(
    moviesPath,
    "MOVIES_PATH dang rong, chua the tai danh sach phim.",
    "Khong the tai danh sach phim tu API."
  );
}

export async function fetchUsersFromAPI() {
  const { usersPath } = resolveConfig();
  return getListFromAPI(
    usersPath,
    "USERS_PATH dang rong, bo qua tai danh sach nguoi dung.",
    "Khong the tai danh sach nguoi dung tu API."
  );
}

export async function createMovieToAPI(payload) {
  const { moviesPath } = resolveConfig();
  return requestAPI("post", moviesPath, payload, "Khong the tao phim tren API.");
}

export async function updateMovieToAPI(movieId, payload) {
  const { moviesPath } = resolveConfig();
  const idText = String(movieId || "").trim();
  if (!idText) {
    return { ok: false, data: null, message: "Thieu ID phim de cap nhat." };
  }
  return requestAPI("put", `${moviesPath}/${idText}`, payload, "Khong the cap nhat phim tren API.");
}

export async function deleteMovieFromAPI(movieId) {
  const { moviesPath } = resolveConfig();
  const idText = String(movieId || "").trim();
  if (!idText) {
    return { ok: false, data: null, message: "Thieu ID phim de xoa." };
  }
  return requestAPI("delete", `${moviesPath}/${idText}`, null, "Khong the xoa phim tren API.");
}

export async function createUserToAPI(payload) {
  const { usersPath } = resolveConfig();
  return requestAPI("post", usersPath, payload, "Khong the tao nguoi dung tren API.");
}

export async function updateUserToAPI(userId, payload) {
  const { usersPath } = resolveConfig();
  const idText = String(userId || "").trim();
  if (!idText) {
    return { ok: false, data: null, message: "Thieu ID nguoi dung de cap nhat." };
  }
  return requestAPI("put", `${usersPath}/${idText}`, payload, "Khong the cap nhat nguoi dung tren API.");
}
