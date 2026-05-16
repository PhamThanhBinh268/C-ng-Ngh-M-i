import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toy Store - Cửa hàng đồ chơi và mô hình",
  description: "Ứng dụng mua sắm đồ chơi và mô hình hiện đại.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background antialiased`}>
        <Header />
        <main className="flex-grow flex flex-col pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
