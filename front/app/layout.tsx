import type { Metadata } from "next";
import { JetBrains_Mono, MuseoModerno } from "next/font/google";
import { Toaster } from "@/components/feedback/toast";
import { Providers } from "@/components/providers";
import "./globals.css";

// Fontes da identidade da LAWD (mesmas do SimMAP), ligadas às variáveis usadas em styles/lawd-theme.css
const museo = MuseoModerno({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-museo",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Lawd Center",
  description: "Lawd Center",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o next-themes define a classe do tema no <html> antes da hidratação
    <html lang="pt-BR" className={`${museo.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
