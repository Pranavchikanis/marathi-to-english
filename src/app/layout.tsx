import type { Metadata } from "next";
import { Inter, Mukta } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mukta = Mukta({
  variable: "--font-mukta",
  weight: ["400", "500", "600", "700"],
  subsets: ["devanagari", "latin"],
});

export const metadata: Metadata = {
  title: "Tejaswini AI English Tutor",
  description: "A patient, beginner-friendly AI English tutor designed for Marathi speakers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mukta.variable}`}>
      <body
        className="font-sans antialiased bg-background-app text-text-primary"
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
