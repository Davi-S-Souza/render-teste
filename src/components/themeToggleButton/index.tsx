"use client";
import { useEffect, useState } from "react";
import { SunMedium, Moon } from "lucide-react";

export function ThemeToggleButton() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    // botei para conferir se o tema salvo é "dark" ou "light" no localStorage
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      // se nao tiver nada salvo, verifica a classe do html (antes era so isso, então quando eu dava f5 ele voltava para o tema claro)
      const htmlHasDark = document.documentElement.classList.contains("dark");
      setIsDark(htmlHasDark);
    }
  }, []);

  function toggleTheme() {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
      localStorage.setItem("theme", "dark");
    }
  }

  return (
    <button
      className="rotate-45 rounded-2xl px-2 py-2 bg-primary text-primary-foreground transition-all"
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={toggleTheme}
      type="button"
    >
      {" "}
      <span className="block -rotate-45" id="ico_button">
        {isDark ? <SunMedium /> : <Moon />}
      </span>
    </button>
  );
}