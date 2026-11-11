import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
     <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
        <App />
        </ErrorBoundary>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);