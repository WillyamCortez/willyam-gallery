import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Willyam Cortez - Galerias Fotográficas Profissionais",
  description: "Entrega de alta fidelidade e seleção de fotos profissionais.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-background text-foreground antialiased min-h-screen font-sans selection:bg-accent-gold/30">
        {children}
      </body>
    </html>
  );
}
