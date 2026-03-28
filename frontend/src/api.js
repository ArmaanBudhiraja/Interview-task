const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080/api";

const STORAGE_KEY = "faculty-ledger-token";

function buildError(payload, fallbackMessage) {
  const error = new Error(payload?.message || fallbackMessage);
  error.details = payload?.errors || null;
  return error;
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw buildError(payload, "Something went wrong while contacting the API.");
  }

  return payload;
}

export function getStoredToken() {
  return window.localStorage.getItem(STORAGE_KEY) || "";
}

export function persistToken(token) {
  if (!token) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, token);
}

export const api = {
  register(payload) {
    return request("/register", { method: "POST", body: payload });
  },
  login(payload) {
    return request("/login", { method: "POST", body: payload });
  },
  me(token) {
    return request("/me", { token });
  },
  logout(token) {
    return request("/logout", { method: "POST", token });
  },
  authUsers(token) {
    return request("/auth-users", { token });
  },
  teachers(token) {
    return request("/teachers", { token });
  },
  createTeacherRecord(payload, token) {
    return request("/teacher-records", {
      method: "POST",
      body: payload,
      token,
    });
  },
};
