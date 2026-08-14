import type { Metadata } from "next";
// @ts-ignore: CSS import handled by Next.js app directory
import "./globals.css";
import AppThemeProvider from "@/components/AppThemeProvider";


export const metadata: Metadata = {
  title: "Gerenciamento de Bases Samu",
  description: "Gerenciamento de Bases Samu",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>
        <link rel="icon" href="/logo.svg" />

        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
