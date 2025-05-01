import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3000 Benk",
  description: "3000 Benk Konkurranse",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body className={inter.className}>
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-gray-900">Hjem</a>
                <a href="/leaderboard" className="text-gray-700 hover:text-gray-900">Resultatliste</a>
                <a href="/starting-times" className="text-gray-700 hover:text-gray-900">Starttider</a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
