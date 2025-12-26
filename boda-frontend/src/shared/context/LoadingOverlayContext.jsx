import React, { createContext, useContext, useRef, useState } from "react";
import { FullScreenLoader } from "../components/ui/FullScreenLoader";

const LoadingOverlayContext = createContext(null);

export function LoadingOverlayProvider({ children }) {
  const keyRef = useRef(0);

  const [state, setState] = useState({
    mounted: false,   // si está montado en DOM
    done: false,      // si ya puede cerrarse
    message: "Cargando...",
    key: 0,           // fuerza remount para reiniciar animación
  });

  const showLoader = (message = "Cargando...") => {
    keyRef.current += 1;
    setState({
      mounted: true,
      done: false,
      message,
      key: keyRef.current,
    });
  };

  // Ya NO desmontamos de golpe. Solo marcamos done=true.
  const hideLoader = () => {
    setState((prev) => {
      if (!prev.mounted) return prev;
      return { ...prev, done: true };
    });
  };

  const handleHidden = () => {
    // Cuando el loader terminó su fade-out y ya se ocultó,
    // recién lo desmontamos para limpiar el DOM.
    setState((prev) => ({ ...prev, mounted: false }));
  };

  return (
    <LoadingOverlayContext.Provider
      value={{
        showLoader,
        hideLoader,
        visible: state.mounted && !state.done,
        message: state.message,
      }}
    >
      {children}

      {state.mounted && (
        <FullScreenLoader
          key={state.key}
          done={state.done}
          message={state.message}
          minDurationMs={2800} // <-- aquí controlas el mínimo real
          onHidden={handleHidden}
        />
      )}
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
