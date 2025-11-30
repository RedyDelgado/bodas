// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./app/providers.jsx";
import { AppRouter } from "./app/router.jsx";
import "./index.css";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { LoadingOverlayProvider } from "./shared/context/LoadingOverlayContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <AuthProvider>
        <LoadingOverlayProvider>
          <AppRouter />
        </LoadingOverlayProvider>
      </AuthProvider>
    </AppProviders>
  </React.StrictMode>
);
