import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/layout/nav";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "개인 허브",
  description: "일정 관리와 용돈 기입을 한 곳에서 처리하는 개인용 웹 대시보드",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Nav />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
