import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true,
  toggleTheme: () => {
    set((state) => {
      const newIsDark = !state.isDark;
      const html = document.documentElement;
      if (newIsDark) {
        html.classList.remove("light");
        localStorage.setItem("theme", "dark");
      } else {
        html.classList.add("light");
        localStorage.setItem("theme", "light");
      }
      return { isDark: newIsDark };
    });
  },
  initTheme: () => {
    const saved = localStorage.getItem("theme");
    const html = document.documentElement;
    if (saved === "light") {
      html.classList.add("light");
      set({ isDark: false });
    } else {
      html.classList.remove("light");
      set({ isDark: true });
    }
  },
}));