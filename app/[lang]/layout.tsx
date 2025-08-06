import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "@/globals.css"; // 修改这里，使用别名 @/

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Interview Assistant",
  description: "Chat with AI interviewer to improve your interview skills",
};

export async function generateStaticParams() {
  return [{ lang: 'zh' }, { lang: 'en' }];
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  return (
    <html lang={params.lang}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
