import Header from "../../components/Header";
import Footer from "../../components/Footer";
import WhatsApp from "../../components/WhatsApp";
import Numerology from "../../components/Numerology";

export const metadata = {
  title: "Numerology Consultation",
  description:
    "Discover personalised Numerology guidance for life, career, relationships and important decisions with Vaastushree.",
  keywords: ["numerology consultation", "numerologist", "numerology reading", "life path numerology"],
  alternates: { canonical: "/numerology" },
};

export default function Page(){return <><Header/><Numerology/><Footer/><WhatsApp/></>}
