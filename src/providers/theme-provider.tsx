"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = false,
  disableTransitionOnChange = false,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const disableTransitionRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{
        __html: `!function(){try{var e=localStorage.getItem("${storageKey}");if(!e&&window.matchMedia("(prefers-color-scheme: dark)").matches)e="dark";if(e)document.documentElement.classList.add(e)}catch(t){}}();`,
      }}
    />
  ));

  const disableTransition = useCallback(() => {
    if (!disableTransitionOnChange) return;
    const css = document.createElement("style");
    css.appendChild(
      document.createTextNode(
        `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
      )
    );
    document.head.appendChild(css);
    const clear = () => {
      if (disableTransitionRef.current) clearTimeout(disableTransitionRef.current);
      disableTransitionRef.current = setTimeout(() => {
        document.head.removeChild(css);
        disableTransitionRef.current = undefined;
      }, 1);
    };
    requestAnimationFrame(() => requestAnimationFrame(clear));
  }, [disableTransitionOnChange]);

  const applyTheme = useCallback(
    (newTheme: Theme) => {
      disableTransition();
      const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolved);
      return resolved;
    },
    [disableTransition]
  );

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try { localStorage.setItem(storageKey, newTheme); } catch {}
      const resolved = applyTheme(newTheme);
      setResolvedTheme(resolved);
    },
    [applyTheme, storageKey]
  );

  useEffect(() => {
    const stored = (() => {
      try { return localStorage.getItem(storageKey) as Theme | null; } catch { return null; }
    })();
    const initial = stored || defaultTheme;
    setThemeState(initial);
    setResolvedTheme(applyTheme(initial));
  }, [defaultTheme, storageKey, applyTheme]);

  useEffect(() => {
    if (!enableSystem) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setThemeState((prev) => {
        if (prev === "system") {
          setResolvedTheme(applyTheme("system"));
        }
        return prev;
      });
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [enableSystem, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
