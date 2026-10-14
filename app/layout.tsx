import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CursorApplier from "./CursorApplier";
import Bubbles from "./Bubbles";
import Nav from "./Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joke Ocean | The Funny Business",
  description: "AI jokes and memes. Funny ones float up, flops sink. Pick a crew and vote.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
      <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col">
      <CursorApplier />
      <Bubbles />
      <Nav />
      {children}
      </body>
      </html>
  );
}