import type { Metadata } from "next";
import { inter, orbitron, spaceGrotesk, caveat, satisfy, rajdhani, oxanium } from "@/lib/fonts";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Artvince Academy | Creative Game & 3D Design Education",
  description: "Level up your creative skills in Game Development, 3D Animation, Character Design, and more with Artvince Academy.",
  keywords: ["Game Development", "3D Animation", "Character Design", "Weapon Design", "App Development", "Artvince Academy"],
};

import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import HydrationFix from "@/components/HydrationFix";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Aggressively suppress hydration mismatch warnings from browser extensions
              const suppressWarnings = ['Hydration', 'did not match', 'bis_skin_checked'];
              const originalError = console.error;
              console.error = (...args) => {
                const message = typeof args[0] === 'string' ? args[0] : '';
                if (suppressWarnings.some(warning => message.includes(warning))) return;
                originalError.apply(console, args);
              };
              
              // Also catch early window errors
              window.addEventListener('error', (e) => {
                if (e.message && suppressWarnings.some(warning => e.message.includes(warning))) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              }, true);
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} ${spaceGrotesk.variable} ${caveat.variable} ${satisfy.variable} ${rajdhani.variable} ${oxanium.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <HydrationFix>
            <CustomCursor />
            <SmoothScroll>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
            </SmoothScroll>
          </HydrationFix>
        </AuthProvider>
      </body>
    </html>
  );
}
