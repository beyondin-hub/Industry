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

        // ─── Marca Novak — paleta neutral cálida (estilo Apple) ───
        // Superficies claras: blanco → perla. Que destaque el producto, no el fondo.
        paper: {
          DEFAULT: "#FAF9F6",
          50: "#FFFFFF",
          100: "#FCFBF9",
          200: "#F7F5F1",
          300: "#F1EEE8",
          400: "#E8E4DC", // pearl
        },
        // Escala "ink": void → carbon → graphite → steel → pearl (neutros cálidos).
        ink: {
          50: "#F5F2EC",
          100: "#E8E4DC", // pearl
          200: "#D2CCC1",
          300: "#B0A99D",
          400: "#837D73",
          500: "#5A5650", // steel
          600: "#423E39",
          700: "#2E2B27",
          800: "#1E1C1A", // graphite
          900: "#151210", // carbon
          950: "#0A0908", // void
        },
        // Alias: el código usa `steel-*`; misma escala neutra.
        steel: {
          50: "#F5F2EC",
          100: "#E8E4DC",
          200: "#D2CCC1",
          300: "#B0A99D",
          400: "#837D73",
          500: "#5A5650",
          600: "#423E39",
          700: "#2E2B27",
          800: "#1E1C1A",
          900: "#151210",
          950: "#0A0908",
        },
        // Acción/CTA: gris plomo / grafito (suave, premium — no negro sólido).
        safety: {
          DEFAULT: "#3D3833", // lead graphite
          50: "#F3F1ED",
          100: "#E5E1DA",
          400: "#5A5650", // steel
          500: "#3D3833",
          600: "#2E2B27", // hover
        },
        // Bronce: acento cálido SUTIL, solo para lo más relevante. No abusar.
        purplecow: {
          DEFAULT: "#6B5D4F", // bronze
          50: "#F2EFEA",
          100: "#E6E0D8",
          500: "#6B5D4F",
          600: "#564A3E",
        },
        // Ámbar reservado: SOLO para 1-2 acentos clave (promesa de marca).
        gold: { DEFAULT: "#D4843E", 400: "#E0A064", 500: "#D4843E" },
        magenta: { DEFAULT: "#8A7A66", 400: "#9C8B74", 500: "#8A7A66" },
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
