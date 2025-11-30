
// src/shared/context/LoadingOverlayContext.jsx
import React, { createContext, useContext, useState } from "react";
import { FullScreenLoader } from "../components/ui/FullScreenLoader";

const LoadingOverlayContext = createContext(null);

export function LoadingOverlayProvider({ children }) {
  const [state, setState] = useState({
    visible: false,
    message: "Cargando...",
  });

  const showLoader = (message = "Cargando...") => {
    setState({
      visible: true,
      message,
    });
  };

  const hideLoader = () => {
    setState((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <LoadingOverlayContext.Provider
      value={{
        visible: state.visible,
        message: state.message,
        showLoader,
        hideLoader,
      }}
    >
      {children}

      {/* ✅ SOLO se muestra cuando visible === true */}
      {state.visible && <FullScreenLoader message={state.message} />}
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  const ctx = useContext(LoadingOverlayContext);
  if (!ctx) {
    throw new Error(
      "useLoadingOverlay debe usarse dentro de <LoadingOverlayProvider>"
    );
  }
  return ctx;
}
