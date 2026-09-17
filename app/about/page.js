import Header from '../../components/Header';
import About from '../../components/About';
import HowItWorks from '../../components/HowItWorks';
import Testimonials from '../../components/Testimonials';
import Footer from '../../components/Footer';
import WhatsApp from '../../components/WhatsApp';

export const metadata = {
  title: "About Dr. Jayashree Bashani",
  description:
    "Learn about Dr. Jayashree Bashani, Vastu Consultant and the personalised approach behind Vaastushree's Vastu, Tarot and Numerology consultations.",
  alternates: { canonical: "/about" },
};

export default function Page(){return <><Header/><About/><HowItWorks/><Testimonials/><Footer/><WhatsApp/></>}
