import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: "#F3F4F6",      // Original light gray
          card: "#FFFFFF",      // White cards
          nav: "#FFFFFF",       // White nav
          panel: "#FFFFFF",     // White panel
          input: "#F9FAFB",     // Light input
          hover: "#F3F4F6",     // Hover state
        },
        text: {
          primary: "#111827",   // Dark text
          secondary: "#374151", // Gray text
          tertiary: "#6B7280",  // Muted gray
          muted: "#9CA3AF",     // Muted
        },
        accent: {
          primary: "#185FA5",   // Original blue
        },
        semantic: {
          positive: "#1D9E75",
          negative: "#E24B4A",
          neutral: "#9CA3AF",
          target: "#9CA3AF",
          band: "#F0FDF4",
        },
        tag: {
          inflation: {
            bg: "#FAECE7",
            text: "#712B13",
          },
          gdp: {
            bg: "#E1F5EE",
            text: "#085041",
          },
          unemployment: {
            bg: "#FAEEDA",
            text: "#633806",
          },
          yields: {
            bg: "#E6F1FB",
            text: "#0C447C",
          },
          payrolls: {
            bg: "#EEEDFE",
            text: "#3C3489",
          },
          general: {
            bg: "#F1EFE8",
            text: "#444441",
          },
        },
      },
      fontSize: {
        'brand': ['15px', { fontWeight: '500' }],
        'section': ['13px', { fontWeight: '500' }],
        'chart-sub': ['11px', { fontWeight: '400' }],
        'kpi-value': ['22px', { fontWeight: '500' }],
        'kpi-label': ['11px', { fontWeight: '400' }],
        'note-body': ['12px', { fontWeight: '400' }],
        'timestamp': ['11px', { fontWeight: '400' }],
      },
      borderRadius: {
        'card': '10px',
        'tab': '5px',
        'tag': '20px',
      },
      borderWidth: {
        'card': '0.5px',
      },
    },
  },
  plugins: [],
};
export default config;
