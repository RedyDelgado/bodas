// src/features/auth/services/authService.js
import axiosClient from "../../../shared/config/axiosClient";

async function ensureCsrfCookie() {
  // Necesario para Sanctum cuando usamos cookies + withCredentials
  const apiBase = axiosClient.defaults.baseURL || "/api";
  // Si baseURL es absoluta, tomamos el origin; si es relativa, usamos mismo host
  let origin = "";
  try {
    const url = new URL(apiBase, window.location.origin);
    origin = url.origin;
  } catch (_) {
    origin = window.location.origin;
  }
  await axiosClient.get(`${origin}/sanctum/csrf-cookie`, { withCredentials: true });
}

/**
 * Login real contra backend Laravel.
 * Usa form-urlencoded que es lo que Sanctum espera con cookies.
 */
export async function loginApi({ email, password }) {
  // Crea el body en formato form-urlencoded (así funciona con Sanctum + cookies)
  const body = new URLSearchParams();
  body.append("email", email);
  body.append("password", password);
  
  const { data } = await axiosClient.post(
    "/auth/login",
    body,
    { 
      withCredentials: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }
  );

  // Se espera algo como:
  // {
  //   "token": "xxxx",
  //   "usuario": { id, name, email, rol: { id, nombre, ... } }
  // }

  return data;
}

/**
 * Devuelve el usuario autenticado usando el token guardado (me).
 */
export async function fetchMeApi() {
  const { data } = await axiosClient.get("/auth/me");
  // data = usuario
  return data;
}

/**
 * Hace logout en el backend (opcional pero recomendado).
 */
export async function logoutApi() {
  const { data } = await axiosClient.post("/auth/logout");
  return data;
}

/** Registro de usuario + boda inicial */
export async function registerApi(payload) {
  // payload: { name, email, password, nombre_pareja, subdominio, fecha_boda?, ciudad? }
  const { data } = await axiosClient.post("/auth/register", payload);
  return data; // { token, usuario, boda }
}
