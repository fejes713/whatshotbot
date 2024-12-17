import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Content Idea Explorer",
  description: "Explore video content ideas for your social media channel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          .nextjs-static-indicator-toast-wrapper {
            display: none !important;
          }
        `}</style>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
