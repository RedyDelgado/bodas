// src/shared/components/common/ButtonWithSpinner.jsx
import React from "react";
import { ImSpinner2 } from "react-icons/im";

/**
 * Botón con spinner integrado
 * @param {Object} props
 * @param {boolean} props.loading - Estado de carga
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {React.ReactNode} props.icon - Icono opcional (React Icons)
 * @param {string} props.loadingText - Texto durante carga (opcional)
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.disabled - Deshabilitado
 * @param {string} props.variant - Variante de estilo: 'primary' | 'secondary' | 'danger' | 'success'
 * @param {Function} props.onClick - Función onClick
 * @param {string} props.type - Tipo del botón
 */
export function ButtonWithSpinner({
  loading = false,
  children,
  icon = null,
  loadingText = null,
  className = "",
  disabled = false,
  variant = "primary",
  onClick,
  type = "button",
  ...props
}) {
  const variantClasses = {
    primary: "bg-slate-800 text-white hover:bg-slate-900",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    premium: "bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:from-rose-600 hover:to-purple-700 shadow-lg hover:shadow-xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 
        px-4 py-2 rounded-lg
        font-medium text-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant] || variantClasses.primary}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <ImSpinner2 className="animate-spin" size={18} />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <span className="inline-flex">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
