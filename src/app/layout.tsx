import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Header } from "@/app/components/Header";
import { NavBar } from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Nuecommerce",
  description: "Eccomerce site built with Next.js and tRPC",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <TRPCReactProvider>
          <ThemeProvider>
            <NavBar />
            <Header />
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
