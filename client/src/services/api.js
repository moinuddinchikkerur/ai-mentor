



import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

const normalizeStoredUser = (user = {}) => {
  return {
    ...user,
    name: user.name || "",
    email: user.email || "",
    exam: user.exam || "",
    targetDate: user.targetDate ? String(user.targetDate).slice(0, 10) : ""
  };
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const saveAuthData = ({ token, user }) => {
  let tokenChanged = false;

  if (token) {
    const oldToken = localStorage.getItem("token");

    localStorage.setItem("token", token);

    if (oldToken !== token) {
      tokenChanged = true;
    }
  }

  if (user) {
    const normalizedUser = normalizeStoredUser(user);

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("name", normalizedUser.name);
    localStorage.setItem("email", normalizedUser.email);
    localStorage.setItem("exam", normalizedUser.exam);

    if (normalizedUser.targetDate) {
      localStorage.setItem("targetDate", normalizedUser.targetDate);
    } else {
      localStorage.removeItem("targetDate");
    }
  }

  if (tokenChanged) {
    window.dispatchEvent(new Event("authChanged"));
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("exam");
  localStorage.removeItem("targetDate");
  localStorage.removeItem("activePlan");
  localStorage.removeItem("manualSubject");
  localStorage.removeItem("monitorFloatingPosition");
  localStorage.setItem("monitor", "off");

  window.dispatchEvent(new Event("authChanged"));
};

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      clearAuthData();

      const currentPath = window.location.pathname;
      const authPaths = ["/", "/register", "/login"];

      if (!authPaths.includes(currentPath)) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout: () => api.post("/auth/logout")
};

export default api;