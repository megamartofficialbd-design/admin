import type { Metadata } from "next";
import Providers from "@/lib/providers";
import { AuthProvider } from "@/provider/AuthProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { RedirectComponent } from "./redirect";

const geistSans = "";
const geistMono = "";

export const metadata: Metadata = {
  title: "Bekolpo",
  description: "Vendor management website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Providers>
            <RedirectComponent>{children}</RedirectComponent>
          </Providers>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
