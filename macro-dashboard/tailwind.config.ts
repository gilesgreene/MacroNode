import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          page: "var(--surface-page)",
          card: "var(--surface-card)",
          nav: "var(--surface-nav)",
          panel: "var(--surface-panel)",
          input: "var(--surface-input)",
          hover: "var(--surface-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-muted)",
        },
        accent: {
          primary: "var(--accent-primary)",
        },
        semantic: {
          positive: "var(--semantic-positive)",
          negative: "var(--semantic-negative)",
          neutral: "var(--semantic-neutral)",
          target: "var(--semantic-target)",
          band: "var(--semantic-band)",
        },
        tag: {
          inflation: { bg: "var(--tag-inflation-bg)", text: "var(--tag-inflation-text)" },
          gdp: { bg: "var(--tag-gdp-bg)", text: "var(--tag-gdp-text)" },
          unemployment: { bg: "var(--tag-unemployment-bg)", text: "var(--tag-unemployment-text)" },
          yields: { bg: "var(--tag-yields-bg)", text: "var(--tag-yields-text)" },
          payrolls: { bg: "var(--tag-payrolls-bg)", text: "var(--tag-payrolls-text)" },
          general: { bg: "var(--tag-general-bg)", text: "var(--tag-general-text)" },
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
