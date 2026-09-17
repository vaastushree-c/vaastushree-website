import Header from '../../components/Header';
import Booking from '../../components/Booking';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';
import WhatsApp from '../../components/WhatsApp';

export const metadata = {
  title: "Book a Consultation",
  description:
    "Book a Vastu, Tarot Reading or Numerology consultation with Vaastushree and Dr. Jayashree Bashani.",
  alternates: { canonical: "/contact" },
};

export default function Page(){return <><Header/><Booking/><FAQ/><Footer/><WhatsApp/></>}
