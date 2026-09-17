import Header from "../components/Header";
import Hero from "../components/Hero";
import Zodiac from "../components/Zodiac";
import Services from "../components/Services";
import NumerologySection from "../components/NumerologySection";
import About from "../components/About";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import Booking from "../components/Booking";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import WhatsApp from "../components/WhatsApp";

export const metadata = {
  title: "Vastu Consultant for Homes, Offices & Properties",
  description:
    "Vaastushree offers personalised Vastu consultation for homes, offices and commercial properties, plus Tarot Reading and Numerology guidance by Dr. Jayashree Bashani.",
  alternates: { canonical: "/" },
};
export default function Home(){return <main><Header/><Hero/><Zodiac/><Services/><NumerologySection/><About/><HowItWorks/><Testimonials/><Booking/><FAQ/><Footer/><WhatsApp/></main>}