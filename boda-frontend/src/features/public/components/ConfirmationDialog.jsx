// src/features/public/components/ConfirmationDialog.jsx
import React from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";

/**
 * Modal de confirmación genérico para acciones importantes
 * Se usa para confirmar cambios críticos como "No asistirá"
 */
export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;

  const dangerColor = isDangerous ? "from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800" : "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700";
  const dangerBg = isDangerous ? "bg-rose-50" : "bg-blue-50";
  const dangerBorder = isDangerous ? "border-rose-200" : "border-blue-200";
  const dangerText = isDangerous ? "text-rose-800" : "text-blue-800";
  const dangerIcon = isDangerous ? "text-rose-600" : "text-blue-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con ícono */}
        <div className={`${dangerBg} border-b ${dangerBorder} p-4 flex items-start gap-3`}>
          <div className="flex-shrink-0">
            <FiAlertCircle className={`w-6 h-6 ${dangerIcon}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${dangerText}`}>{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={isLoading}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Mensaje */}
        <div className="p-6">
          <p className="text-slate-700 mb-6">{message}</p>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg bg-gradient-to-r ${dangerColor} text-white font-medium transition-all shadow hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
