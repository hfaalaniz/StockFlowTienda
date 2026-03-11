import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = {
  // Blanco + verde marca — modo claro, accesibilidad (por defecto)
  light: {
    name: "Claro",
    accent: "#27ae60",        // verde oscuro para contraste en fondo claro
    accentRgb: "39,174,96",
    bg: "#e9f1fa",
    surface: "#ffffff",
  },
  // Fondo blanco + verde neón ElectroNet — marca sobre fondo claro
  "electro-light": {
    name: "ElectroNet Claro",
    accent: "#2ecc40",        // verde neón marca ElectroNet
    accentRgb: "46,204,64",
    bg: "#f0fff2",
    surface: "#ffffff",
  },
  // Fondo oscuro + verde ElectroNet (color principal de la marca)
  default: {
    name: "ElectroNet",
    accent: "#2ecc40",        // verde marca ElectroNet
    accentRgb: "46,204,64",
    bg: "#0f0f0f",
    surface: "#1a1a1a",
  },
  // Azul eléctrico oscuro — tecnología, servicios eléctricos
  dark: {
    name: "Navy",
    accent: "#3498db",        // azul de los iconos de servicios
    accentRgb: "52,152,219",
    bg: "#01101e",
    surface: "#031825",
  },
  // Rojo energía + dorado — urgencia, llamada a la acción (botón Llamar)
  prestige: {
    name: "Prestige",
    accent: "#e74c3c",        // rojo del botón "Llamar"
    accentRgb: "231,76,60",
    bg: "#1a0505",
    surface: "#2a0a0a",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("sf_theme");
    // Migrar temas obsoletos al tema claro por defecto
    if (!saved || saved === "gold" || saved === "neon") return "light";
    return THEMES[saved] ? saved : "light";
  });

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "light") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", theme);
    }
    localStorage.setItem("sf_theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}