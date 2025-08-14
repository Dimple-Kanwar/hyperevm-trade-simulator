import { config } from "@/config";
import { cookieToInitialState } from "@account-kit/core";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider, useTheme } from 'next-themes';
import { ThemeWatcher } from "./components/ThemeWatcher";

const inter = Inter({ subsets: ["latin"] });
// Utility to get theme from cookie
async function getTheme() {
  const cookie = (await headers()).get("cookie") ?? "";
  const themeMatch = cookie.match(/theme=([^;]+)/);
  const theme = themeMatch ? themeMatch[1] : null;
  return theme === "dark" ? "dark" : "light"; // default to light
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Persist state across pages
  const cookie = (await headers()).get("cookie");
  const theme = await getTheme();
  // https://www.alchemy.com/docs/wallets/react/ssr#persisting-the-account-state
  const initialState = cookieToInitialState(
    config,
    cookie ?? undefined
  );

  return (
    <html lang="en" style={{ colorScheme: theme }} className={theme} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers initialState={initialState}>{children}</Providers>
          <ThemeWatcher />
        </ThemeProvider>

      </body>
    </html>
  );
}
