import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "3000 Benk Konkurranse",
  description: "3000 Benk Competition",
  icons: {
    icon: '/favicon.png',
  }
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
            <div className="flex justify-between h-16">
              <div className="flex space-x-8 items-center">
                <Link href="/" className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Hjem
                </Link>
                <Link href="/leaderboard" className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Resultatliste
                </Link>
                <Link href="/starting-times" className="text-gray-900 hover:text-gray-600 px-3 py-2 rounded-md text-sm font-medium">
                  Starttider
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
