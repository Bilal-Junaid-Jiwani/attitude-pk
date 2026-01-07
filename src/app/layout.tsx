import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartDrawer from "@/components/cart/CartDrawer";
import MobileNav from "@/components/layout/MobileNav";
import VisitorTracker from "@/components/analytics/VisitorTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://attitudepk.com'),
  title: {
    default: "Attitude PK | Premium Baby & Kids Care",
    template: "%s | Attitude PK"
  },
  description: "Natural, hypoallergenic, and refined care products for your little ones. Dermatologically tested and EWG verified.",
  keywords: ["baby care", "natural baby products", "hypoallergenic", "Attitude PK", "baby shampoo", "baby lotion"],
  authors: [{ name: "Attitude PK" }],
  creator: "Attitude PK",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Attitude PK",
    title: "Attitude PK | Premium Baby & Kids Care",
    description: "Natural, hypoallergenic, and refined care products for your little ones.",
    images: [
      {
        url: "/og-image.jpg", // We should probably add an OG image later
        width: 1200,
        height: 630,
        alt: "Attitude PK - Premium Care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Attitude PK | Premium Baby & Kids Care",
    description: "Natural, hypoallergenic, and refined care products for your little ones.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-gray-50 text-gray-900 overflow-x-hidden w-full max-w-[100vw] pb-16 md:pb-0`}>
        <VisitorTracker />
        <ToastProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <MobileNav />
            </CartProvider>
          </WishlistProvider>
        </ToastProvider>
      </body>
    </html>
  );
}