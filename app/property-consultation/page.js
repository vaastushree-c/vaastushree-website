import Header from "../../components/Header";
import PropertyConsultation from "../../components/PropertyConsultation";
import Footer from "../../components/Footer";
import WhatsApp from "../../components/WhatsApp";

export const metadata = {
  title: "Property Vastu Consultation",
  description:
    "Get personalised Property Vastu guidance for residential homes, offices and commercial properties from Dr. Jayashree Bashani at Vaastushree.",
  keywords: [
    "property Vastu consultation",
    "residential Vastu",
    "office Vastu",
    "commercial property Vastu",
    "Vastu consultant",
  ],
  alternates: { canonical: "/property-consultation" },
};

export default function PropertyConsultationPage() {
  return <><Header /><PropertyConsultation /><Footer /><WhatsApp /></>;
}
