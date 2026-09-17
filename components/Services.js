import { Home, Building2, Store, Star, Hash } from "lucide-react";

const vastuServices = [
  ["Residential Vastu", Home, "Vastu guidance for homes, apartments and villas, covering entrances, rooms and practical layout considerations."],
  ["Office Vastu", Building2, "Vastu guidance for offices, workspaces, cabins, reception areas and workplace layouts."],
  ["Commercial Property Vastu", Store, "Vastu consultation for shops, showrooms, clinics, restaurants and other commercial spaces."],
];

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="eyebrow">Our Services</div>
        <h2 className="title">Vastu Guidance for <span className="gold">Your Space.</span></h2>
        <p className="copy">
          Our primary consultations focus on Vastu and property guidance for residential,
          office and commercial spaces. Tarot Reading is also available as a private,
          secondary service.
        </p>

        <div className="services-grid">
          {vastuServices.map(([title, Icon, text]) => (
            <article className="service card" key={title}>
              <div className="service-icon"><Icon /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <a className="service-link" href="/property-consultation">View Consultation <span>→</span></a>
            </article>
          ))}
        </div>

        <div className="secondary-services-grid">
          <div className="secondary-service card">
            <div className="secondary-service-icon"><Star size={19} /></div>
            <div>
              <div className="eyebrow">Also Available</div>
              <h3>Tarot Reading</h3>
              <p>A private tarot session for reflection and guidance around a question or situation.</p>
            </div>
            <a className="service-link" href="/book-reading">Book Reading <span>→</span></a>
          </div>
          <div className="secondary-service card">
            <div className="secondary-service-icon"><Hash size={19} /></div>
            <div>
              <div className="eyebrow">Also Available</div>
              <h3>Numerology</h3>
              <p>Personalised numerology guidance exploring the meaning and patterns behind your numbers.</p>
            </div>
            <a className="service-link" href="/numerology">Explore Numerology <span>→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
