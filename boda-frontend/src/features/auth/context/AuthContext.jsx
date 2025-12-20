// src/features/auth/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMeApi, loginApi, logoutApi, registerApi } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar token inicial y validar sesión
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");

    if (!storedToken) {
      setCargando(false);
      return;
    }

    setToken(storedToken);

    fetchMeApi()
      .then((userData) => {
        setUsuario(userData);
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        setToken(null);
        setUsuario(null);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  async function login({ email, password }) {
    setError(null);

    try {
      const data = await loginApi({ email, password });

      const accessToken = data.token;
      const userData = data.usuario ?? null;

      if (!accessToken) {
        throw new Error("El backend no devolvió un token");
      }

      localStorage.setItem("authToken", accessToken);
      setToken(accessToken);
      setUsuario(userData);

      return { ok: true, user: userData };
    } catch (err) {
      console.error("Error en login:", err);
      setError("Credenciales inválidas o usuario inactivo.");
      return { ok: false, error: err };
    }
  }

  async function logout() {
    try {
      await logoutApi();
    } catch (err) {
      console.warn("Error al hacer logout en backend, se limpia igual.");
    } finally {
      localStorage.removeItem("authToken");
      setToken(null);
      setUsuario(null);
    }
  }

  async function register(form) {
    setError(null);
    try {
      const data = await registerApi(form);
      const accessToken = data.token;
      const userData = data.usuario ?? null;

      if (!accessToken) {
        throw new Error("El backend no devolvió un token");
      }

      localStorage.setItem("authToken", accessToken);
      setToken(accessToken);
      setUsuario(userData);

      return { ok: true, user: userData, boda: data.boda };
    } catch (err) {
      console.error("Error en registro:", err);
      
      // Extraer mensaje de error específico del backend
      let errorMsg = "No se pudo completar el registro.";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Laravel validation errors
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      
      setError(errorMsg);
      return { ok: false, error: errorMsg };
    }
  }

  const value = {
    usuario,
    token,
    cargando,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!usuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
}
