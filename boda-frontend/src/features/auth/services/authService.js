// src/features/auth/services/authService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Login real contra backend Laravel.
 * Ajusta los nombres de campos según tu backend si fuera necesario.
 */
export async function loginApi({ email, password }) {
  const { data } = await axiosClient.post("/auth/login", {
    email,
    password,
  });

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
