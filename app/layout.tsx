import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YoMeCepillo.cl",
  description: "Aprende jugando a cuidar tus dientes y mejorar tu higiene dental.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
