import { Check } from "lucide-react";

const points = [
  "Personalised Vastu, Tarot and Numerology consultations",
  "One-to-one sessions in a private and comfortable setting",
  "Clear guidance explained in a simple, practical way",
  "A thoughtful approach focused on clarity, reflection and next steps",
];

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="container about-grid">
        <div className="moon-art">
          <div className="moon"></div>
          {Array.from({ length: 14 }, (_, i) => (
            <span
              className="star"
              key={i}
              style={{ left: `${8 + (i * 23) % 86}%`, top: `${10 + (i * 37) % 78}%` }}
            />
          ))}
        </div>

        <div className="about-copy">
          <div className="eyebrow">Meet Dr. Jayashree Bashani</div>
          <h2 className="title">Guidance with a <span className="gold">Personal Touch.</span></h2>
          <p className="copy">
            Dr. Jayashree Bashani is the founder of Vaastushree, offering personalised consultations in Vastu, Tarot and Numerology. Her sessions are designed around the individual, with time to understand the questions and circumstances that matter most to each client.
          </p>
          <p className="copy">
            At Vaastushree, traditional systems are presented with a clear and approachable perspective. The aim is to create a calm space for meaningful conversation, thoughtful interpretation and practical reflection, so clients can leave their session with greater clarity about the matters they came to discuss.
          </p>

          <div className="about-points">
            {points.map((point) => (
              <div className="about-point" key={point}>
                <Check className="tick" size={18} />
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
