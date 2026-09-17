import Header from '../../components/Header';
import Services from '../../components/Services';
import Footer from '../../components/Footer';
import WhatsApp from '../../components/WhatsApp';

export const metadata = {
  title: "Vastu, Tarot & Numerology Services",
  description:
    "Explore Vaastushree services including Residential Vastu, Office Vastu, Commercial Property Vastu, Tarot Reading and Numerology consultation.",
  alternates: { canonical: "/services" },
};

export default function Page(){return <><Header/><Services/><Footer/><WhatsApp/></>}
