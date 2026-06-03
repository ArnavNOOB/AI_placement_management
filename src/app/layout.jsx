import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata configuration for PlacementAI SaaS
 * 
 * @author Arnav Garg
 * @version 1.0.0
 */
export const metadata = {
  title: "PlacementAI | AI-Powered Placement Management Platform",
  description: "Accelerate recruitment, resume intelligence, ATS optimization, and mock preparation using serverless AI analytics.",
};

/**
 * Root Layout Component
 * Configures the HTML structure, dark-theme classes, fonts, and session context providers.
 * 
 * @param {Object} params Layout parameters containing children nodes
 * @returns {React.ReactElement} React element structure
 * @author Arnav Garg
 * @version 1.0.0
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-slate-950 text-slate-100 antialiased flex flex-col font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
