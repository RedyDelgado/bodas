// src/shared/config/axiosClient.js
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api"; // ej. "http://localhost:8000/api"

// Fuerza credenciales en todas las peticiones
axios.defaults.withCredentials = true;

const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-CSRF-TOKEN",
  headers: {
    Accept: "application/json",
  },
});

// Interceptor para agregar CSRF token de la cookie y credenciales
axiosClient.interceptors.request.use((config) => {
  config.withCredentials = true;
  
  // Extrae el token XSRF de la cookie y lo agrega al header
  const xsrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
  
  if (xsrfToken) {
    config.headers["X-CSRF-TOKEN"] = decodeURIComponent(xsrfToken);
  }
  
  return config;
});

// Interceptor de request: añade Bearer token si hay authToken
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response: si viene 401, limpia sesión y redirige al login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token inválido o vencido
      localStorage.removeItem("authToken");
      // Sólo redirigimos si no estamos ya en /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
