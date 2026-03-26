"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "monitoramento_theme";

export function getThemeFromDocument(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  window.addEventListener("monitoramento-theme", onChange);
  return () => window.removeEventListener("monitoramento-theme", onChange);
}

export function setThemeGlobal(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("monitoramento-theme"));
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeFromDocument, () => "dark" as Theme);

  const setTheme = useCallback((t: Theme) => {
    setThemeGlobal(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeGlobal(theme === "dark" ? "light" : "dark");
  }, [theme]);

  return { theme, setTheme, toggle };
}
