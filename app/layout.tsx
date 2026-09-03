import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Revise AI | Study Smarter",
  description:
    "AI-powered learning platform for revision, quizzes and interview preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
