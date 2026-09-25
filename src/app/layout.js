import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://na-me-dey-sell.pages.dev"),
  title: "Nà Mè Dèy Sell | Your Event Life, Simplified!",
  description: "Discover, promote, and monetize events easily with Nà Mè Dèy Sell. Dynamic anti-counterfeit QR passes, instant bank payouts, and gate admission control.",
  icons: {
    icon: "/logo-gold.png",
  },
  openGraph: {
    title: "Nà Mè Dèy Sell | Your Event Life, Simplified!",
    description: "Discover, promote, and monetize events easily with Nà Mè Dèy Sell.",
    url: "https://na-me-dey-sell.pages.dev",
    siteName: "Nà Mè Dèy Sell",
    images: [
      {
        url: "/logo-gold.png",
        width: 800,
        height: 400,
      }
    ],
    locale: "en_NG",
    type: "website",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" href="/logo-gold.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
