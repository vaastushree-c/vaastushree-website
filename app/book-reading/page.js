import Header from '../../components/Header';
import TarotReading from '../../components/TarotReading';
import Footer from '../../components/Footer';
import WhatsApp from '../../components/WhatsApp';

export const metadata = {
  title: "Tarot Reading",
  description:
    "Explore personalised Tarot Reading for clarity, perspective and guidance around relationships, career and important life decisions.",
  keywords: ["Tarot reading", "Tarot consultation", "intuitive Tarot reading"],
  alternates: { canonical: "/book-reading" },
};

export default function Page(){return <><Header/><TarotReading/><Footer/><WhatsApp/></>}
