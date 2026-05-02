import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MacroNode | Economic Insights",
  description: "Aggregating FRED and BLS data for institutional-grade macroeconomic analysis.",
  icons: {
    icon: "/macronode_favicon.svg",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          [data-theme='dark'] body, .dark body,
          [data-theme='dark'] main, .dark main,
          [data-theme='dark'] .bg-surface-page, .dark .bg-surface-page { 
            background-color: #020617 !important; 
            color: #f8fafc !important; 
          }
          [data-theme='dark'] .bg-surface-card, .dark .bg-surface-card,
          [data-theme='dark'] .bg-surface-nav, .dark .bg-surface-nav,
          [data-theme='dark'] .bg-surface-panel, .dark .bg-surface-panel,
          [data-theme='dark'] .card, .dark .card { 
            background-color: #0f172a !important; 
            border-color: rgba(255,255,255,0.1) !important; 
          }
          [data-theme='dark'] .bg-surface-card.border-[#E5E7EB], .dark .bg-surface-card.border-[#E5E7EB] {
            background-color: #020617 !important;
          }
          [data-theme='dark'] .bg-surface-panel, .dark .bg-surface-panel,
          [data-theme='dark'] .bg-[#F8FAFC], .dark .bg-[#F8FAFC] { 
            background-color: #0f172a !important; 
          }
          [data-theme='dark'] .text-text-primary, .dark .text-text-primary { 
            color: #ffffff !important; 
          }
          [data-theme='dark'] .text-text-secondary, .dark .text-text-secondary { 
            color: #f1f5f9 !important; 
          }
          [data-theme='dark'] .text-text-tertiary, .dark .text-text-tertiary { 
            color: #cbd5e1 !important; 
          }
          [data-theme='dark'] .calendar-logo-icon, .dark .calendar-logo-icon,
          [data-theme='dark'] .news-logo-icon, .dark .news-logo-icon {
            color: #ffffff !important;
          }
        ` }} />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
