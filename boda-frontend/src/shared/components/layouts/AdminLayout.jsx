// src/shared/components/layouts/AdminLayout.jsx
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Outlet,
  useNavigate,
  NavLink,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext";
import axiosClient from "../../config/axiosClient";

/** Íconos simples en monocromo (usan currentColor) */
function IconDashboard({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      <rect
        x="3"
        y="3"
        width="8"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="13"
        y="3"
        width="8"
        height="5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="13"
        y="10"
        width="8"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="3"
        y="13"
        width="8"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconCalendar({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 3v4M16 3v4M3 10h18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLayers({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M4 9.5 12 5l8 4.5-8 4.5-8-4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m4 14.5 8 4.5 8-4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSettings({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4.75 12a7.25 7.25 0 0 1 .1-1.2l-1.7-1.3 1.8-3.1 2 .5A7.2 7.2 0 0 1 8.8 5l.3-2h3.8l.3 2a7.2 7.2 0 0 1 1.9.9l2-.5 1.8 3.1-1.7 1.3c.06.39.1.78.1 1.2 0 .42-.04.82-.1 1.21l1.7 1.29-1.8 3.1-2-.5a7.2 7.2 0 0 1-1.9.9l-.3 2h-3.8l-.3-2a7.2 7.2 0 0 1-1.9-.9l-2 .5-1.8-3.1 1.7-1.29A7.3 7.3 0 0 1 4.75 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bodaId = searchParams.get("boda");

  const isSuperadmin =
    usuario?.rol?.nombre === "superadmin" || usuario?.rol === "superadmin";
  const dashboardPath = isSuperadmin ? "/admin" : "/panel";

  const [bodaInfo, setBodaInfo] = useState(null);
  const [bodaLoading, setBodaLoading] = useState(false);

  // Cargar datos de la boda actual para mostrar en el sidebar
  useEffect(() => {
    if (!bodaId) {
      setBodaInfo(null);
      return;
    }

    let cancelled = false;
    const fetchBoda = async () => {
      try {
        setBodaLoading(true);
        const res = await axiosClient.get(`/mis-bodas/${bodaId}`);
        if (!cancelled) {
          setBodaInfo(res.data);
        }
      } catch (e) {
        if (!cancelled) {
          setBodaInfo(null);
        }
      } finally {
        if (!cancelled) setBodaLoading(false);
      }
    };

    fetchBoda();
    return () => {
      cancelled = true;
    };
  }, [bodaId]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  // Iniciales para avatar
  const initials = useMemo(() => {
    if (!usuario?.name && !usuario?.nombre) return "U";
    const fullName = usuario.name || usuario.nombre || "";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (
      (parts[0][0]?.toUpperCase() || "") +
      (parts[parts.length - 1][0]?.toUpperCase() || "")
    );
  }, [usuario]);

  const rol = usuario?.rol?.nombre || usuario?.rol || "Usuario";

  const dominioMostrar = useMemo(() => {
    if (!bodaInfo) return null;
    if (bodaInfo.usa_dominio_personalizado && bodaInfo.dominio_personalizado) {
      return {
        etiqueta: "Dominio",
        valor: bodaInfo.dominio_personalizado,
      };
    }
    if (bodaInfo.subdominio) {
      return {
        etiqueta: "Subdominio",
        valor: bodaInfo.subdominio,
      };
    }
    return null;
  }, [bodaInfo]);

  const fechaBodaCorta = useMemo(() => {
    if (!bodaInfo?.fecha_boda) return null;
    const d = new Date(bodaInfo.fecha_boda);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [bodaInfo]);

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-slate-900 flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200">
        {/* Logo / marca */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <button
            type="button"
            onClick={() => navigate(dashboardPath)}
            className="flex items-center gap-2 group"
          >
            <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-semibold group-hover:scale-[1.02] transition-transform">
              WB
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-900">
                Wedding Board
              </span>
              <span className="text-[11px] text-slate-400">
                Panel de administración
              </span>
            </div>
          </button>
        </div>

        {/* Menú lateral */}
        <nav className="flex-1 px-3 py-4 text-sm space-y-1">
          <NavLink
            to={dashboardPath}
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <IconDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          {/* Superadmin: solo opciones que sí existen */}
          {isSuperadmin && (
            <>
              <NavLink
                to="/admin/dashboard-analitico"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <IconDashboard className="w-4 h-4" />
                <span>Dashboard Analítico</span>
              </NavLink>
              
              <NavLink
                to="/admin/logs-auditoria"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <IconLayers className="w-4 h-4" />
                <span>Logs de Auditoría</span>
              </NavLink>
              
              <NavLink
                to="/admin/usuarios"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <IconLayers className="w-4 h-4" />
                <span>Gestión de Usuarios</span>
              </NavLink>
              
              <NavLink
                to="/admin/bodas"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <IconLayers className="w-4 h-4" />
                <span>Gestión de Bodas</span>
              </NavLink>
              
              <NavLink
                to="/admin/ips-bloqueadas"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <IconLayers className="w-4 h-4" />
                <span>IPs Bloqueadas</span>
              </NavLink>
              
              <NavLink
                to="/admin/sesiones-activas"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <IconLayers className="w-4 h-4" />
                <span>Sesiones Activas</span>
              </NavLink>
              
              <NavLink
                to="/admin/backups"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <IconSettings className="w-4 h-4" />
                <span>Gestión de Backups</span>
              </NavLink>
            </>
          )}

          {!isSuperadmin && (
            <NavLink
              to="/panel/ajustes"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <IconSettings className="w-4 h-4" />
              <span>Ajustes</span>
            </NavLink>
          )}
        </nav>

        {/* Info de la boda actual en el footer del sidebar */}
        <div className="border-t border-slate-200 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 mb-1">
            Boda actual
          </p>

          {!bodaId && (
            <p className="text-xs text-slate-500">
              Selecciona una boda desde el dashboard.
            </p>
          )}

          {bodaId && bodaLoading && (
            <p className="text-xs text-slate-500">
              Cargando datos de la boda…
            </p>
          )}

          {bodaId && !bodaLoading && bodaInfo && (
            <>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {bodaInfo.nombre_pareja || `Boda #${bodaInfo.id}`}
              </p>
              {fechaBodaCorta && (
                <p className="text-[11px] text-slate-500">
                  {fechaBodaCorta}
                </p>
              )}
              {dominioMostrar && (
                <p className="mt-1 text-[11px] text-slate-500 truncate">
                  {dominioMostrar.etiqueta}:{" "}
                  <span className="font-medium text-slate-700">
                    {dominioMostrar.valor}
                  </span>
                </p>
              )}
            </>
          )}

          {bodaId && !bodaLoading && !bodaInfo && (
            <p className="text-xs text-slate-500">
              No se pudo cargar la información de la boda.
            </p>
          )}
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          {/* Bloque izquierdo: título + descripción */}
          <div className="flex items-center gap-3">
            {/* Mini logo en mobile */}
            <button
              type="button"
              onClick={() => navigate(dashboardPath)}
              className="md:hidden h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-semibold"
            >
              WB
            </button>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Panel de administración
              </p>
              <p className="text-xs text-slate-500">
                Gestiona bodas, invitados y configuración.
              </p>
            </div>
          </div>

          {/* Bloque derecho: datos del usuario + impersonación + logout */}
          <div className="flex items-center gap-3">
            {sessionStorage.getItem('impersonating_user') && (
              <div className="flex items-center gap-2 bg-purple-100 border border-purple-200 text-purple-700 px-3 py-1 rounded-lg">
                <span className="text-xs font-semibold">
                  Viendo como: {sessionStorage.getItem('impersonating_user')}
                </span>
                <button
                  onClick={() => {
                    const backupToken = sessionStorage.getItem('superadmin_token_backup');
                    if (backupToken) {
                      localStorage.setItem('token', backupToken);
                      sessionStorage.removeItem('superadmin_token_backup');
                      sessionStorage.removeItem('impersonating_user');
                      sessionStorage.removeItem('impersonating_user_id');
                      window.location.href = '/admin/bodas';
                    } else {
                      alert('No se encontró token de respaldo. Por favor, cierra sesión y vuelve a iniciar como superadmin.');
                    }
                  }}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900"
                >
                  Volver a Superadmin
                </button>
              </div>
            )}

            {usuario && (
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs font-semibold text-slate-900">
                  {usuario.name || usuario.nombre || "Usuario"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {usuario.email || "sin correo"}
                </span>
                <span className="text-[11px] text-slate-400 capitalize">
                  {rol}
                </span>
              </div>
            )}

            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold">
              {initials}
            </div>

            <button
              onClick={handleLogout}
              className="text-[11px] px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* CONTENIDO (ahora ocupa casi todo el ancho) */}
        <main className="flex-1 bg-[#F4F5FB]">
          <div className="w-full px-4 md:px-8 py-4 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
