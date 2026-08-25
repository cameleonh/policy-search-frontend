import type { Metadata, Viewport } from "next";
import { DisplayControls } from "@/components/DisplayControls";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "정책핏 | PolicyFit — 청년·소상공인 통합 정책 검색",
  description: "청년 개인 지원과 소상공인 사업체 지원을 한 번에 맞춤 검색하는 정책 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="scroll-smooth" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <DisplayControls />
        {children}
      </body>
    </html>
  );
}

