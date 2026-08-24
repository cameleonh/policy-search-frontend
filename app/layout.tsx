import type { Metadata } from "next";
import { DisplayControls } from "@/components/DisplayControls";
import "./globals.css";

export const metadata: Metadata = {
  title: "정책검색 | Policy Search",
  description: "청년과 소상공인을 위한 통합 정책 검색 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className="font-sans">
        <DisplayControls />
        {children}
      </body>
    </html>
  );
}
