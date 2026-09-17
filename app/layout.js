import "./globals.css";
import StructuredData from "../components/StructuredData";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.vaastushree.com"),
  title: {
    default: "Vaastushree | Vastu Consultant, Tarot & Numerology",
    template: "%s | Vaastushree",
  },
  description:
    "Vaastushree by Dr. Jayashree Bashani offers personalised Vastu consultation for homes, offices and commercial properties, along with Tarot Reading and Numerology guidance.",
  keywords: [
    "Vastu consultant",
    "Vastu consultation",
    "Vastu Shastra consultant",
    "residential Vastu",
    "office Vastu",
    "commercial Vastu",
    "property Vastu",
    "Tarot reading",
    "numerology consultation",
    "Dr. Jayashree Bashani",
    "Vaastushree",
  ],
  authors: [{ name: "Dr. Jayashree Bashani" }],
  creator: "Vaastushree",
  publisher: "Vaastushree",
  applicationName: "Vaastushree",
  category: "professional services",
  openGraph: {
    type: "website",
    siteName: "Vaastushree",
    title: "Vaastushree | Vastu Consultant, Tarot & Numerology",
    description:
      "Personalised Vastu consultation for homes, offices and commercial properties, with Tarot Reading and Numerology guidance.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaastushree | Vastu Consultant, Tarot & Numerology",
    description:
      "Personalised Vastu, Tarot and Numerology consultations by Dr. Jayashree Bashani.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body><StructuredData />{children}</body>
    </html>
  );
}
