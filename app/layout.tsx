import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADP — 교인 교육 플랫폼",
  description:
    "제칠일안식일예수재림교회 교인 교육 플랫폼. ADP 앱 · 바이블가이드 앱 · 관리자 페이지.",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f5f6f8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        {/* Pretendard Variable — 프로토타입이므로 CDN 사용 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
