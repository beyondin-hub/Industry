import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // ─── Marca MROLink ─────────────────────────────────────
        // Papel cálido (no blanco puro) — estilo Apple.
        paper: {
          DEFAULT: "#F7F4EF",
          50: "#FDFCFA",
          100: "#FBFAF7",
          200: "#F7F4EF",
          300: "#EEEBE4",
          400: "#E4E0D7",
        },
        // Escala "ink": grises plomo cálidos, casi negro (warm Apple greys).
        ink: {
          50: "#F2EEE7",
          100: "#EAE5DC",
          200: "#D9D2C6",
          300: "#BBB2A4",
          400: "#938A7D",
          500: "#6B6056",
          600: "#524A42",
          700: "#3D3833",
          800: "#29251F",
          900: "#16130F",
          950: "#0D0C0A",
        },
        // Alias: el código existente usa `steel-*`; lo mapeamos a la escala ink.
        steel: {
          50: "#F2EEE7",
          100: "#EAE5DC",
          200: "#D9D2C6",
          300: "#BBB2A4",
          400: "#938A7D",
          500: "#6B6056",
          600: "#524A42",
          700: "#3D3833",
          800: "#29251F",
          900: "#16130F",
          950: "#0D0C0A",
        },
        // Acento principal: morado moderno y sutil.
        // El código usa `safety-*` como acento → ahora es morado.
        safety: {
          DEFAULT: "#6D4AFF",
          50: "#F2EEFF",
          100: "#E7E0FF",
          400: "#9B86FF",
          500: "#6D4AFF",
          600: "#5A35F0",
        },
        purplecow: {
          DEFAULT: "#7A5CFF",
          50: "#F3EFFF",
          100: "#E8E0FF",
          500: "#7A5CFF",
          600: "#6442E6",
        },
        // Decorativos para gradientes/texturas.
        gold: { DEFAULT: "#E8B04B", 400: "#F0C36B", 500: "#E8B04B" },
        magenta: { DEFAULT: "#E0529C", 400: "#EA6FAE", 500: "#E0529C" },
        // Estados.
        success: "#1A6B3C",
        danger: "#B91C1C",
        info: "#1B4F8A",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
