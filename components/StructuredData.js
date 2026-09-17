export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Vaastushree",
    description:
      "Vastu consultation for homes, offices and commercial properties, with Tarot Reading and Numerology guidance.",
    url: "https://www.vaastushree.com",
    founder: {
      "@type": "Person",
      name: "Dr. Jayashree Bashani",
      jobTitle: "Vastu Consultant",
    },
    areaServed: { "@type": "Country", name: "India" },
    serviceType: [
      "Vastu Consultation",
      "Residential Vastu",
      "Office Vastu",
      "Commercial Property Vastu",
      "Tarot Reading",
      "Numerology Consultation",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
