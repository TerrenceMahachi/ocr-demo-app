import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

export const metadata = {
  title: "OCR Demo APP",
  description: "OCR Demo APP — Next.js + Express",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
          <Nav />
        </header>

        <main className="flex-1 mx-auto w-full max-w-5xl p-6">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}