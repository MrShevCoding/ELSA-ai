import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import StarField from "@/components/StarField";

export const metadata: Metadata = {
  title: "ELSA AI - ExoLife Score AI",
  description: "Evaluate exoplanet habitability scores and parameters utilizing advanced AI-powered astrobiology metrics.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ position: "relative", minHeight: "100vh" }}>
        <div className="space-container">
          <StarField />
          <Navbar />
          {children}
          <footer className="footer">
            <div className="main-wrapper" style={{ padding: "1rem 2rem" }}>
              <p>&copy; {new Date().getFullYear()} ELSA AI — ExoLife Score AI. Developed for school/extracurricular science projects.</p>
              <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-dark)" }}>
                Data processing utilizes Anthropic Claude API for reasoning and Papa Parse for CSV parser engines.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
