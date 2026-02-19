// app/layout.tsx
import ClientProvider from "@/clientProvder";
import "./globals.css";

export const metadata = {
  title: "My NextAuthApp.com",
  description: "Example app with login, signup, and dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}