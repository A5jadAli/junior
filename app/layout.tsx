import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner"; // ← Change this line

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Coding Assistant",
  description: "Your autonomous development partner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster /> {/* ← Much simpler! */}
        </Providers>
      </body>
    </html>
  );
}
