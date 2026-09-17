import Header from '../../components/Header';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';
import WhatsApp from '../../components/WhatsApp';

export const metadata = {
  title: "Vastu, Tarot & Numerology FAQs",
  description:
    "Find answers to common questions about Vaastushree Vastu consultations, Tarot Reading, Numerology and booking a consultation.",
  alternates: { canonical: "/faq" },
};

export default function Page(){return <><Header/><FAQ/><Footer/><WhatsApp/></>}
