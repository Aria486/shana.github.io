import React from "react";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { Theme } from "@/components";
import "@/assets/styles/globals.css";
import "@/assets/styles/globals.scss";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "shana blog",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Theme>{children}</Theme>
      </body>
    </html>
  );
}
