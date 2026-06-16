import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Shorts Generator",
  description: "Create amazing AI shorts easily with premium styles and models.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5423943112165543"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
        <footer className="global-footer">
          <div className="global-footer-links">
            <a href="/">Home</a>
            <a href="/about-us">About Us</a>
            <a href="/contact-us">Contact Us</a>
          </div>
          <div className="global-footer-copy">
            &copy; {new Date().getFullYear()} AI Shorts Gen. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

