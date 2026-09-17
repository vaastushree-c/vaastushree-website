import { Hash, Compass, BriefcaseBusiness, Heart } from "lucide-react";

export default function NumerologySection(){
  return <section className="section numerology-section" id="numerology">
    <div className="container numerology-shell">
      <div className="numerology-art" aria-hidden="true">
        <div className="numerology-circle outer"><span>1</span><span>3</span><span>7</span><span>9</span></div>
        <div className="numerology-circle inner"><Hash size={42}/><strong>NUMEROLOGY</strong><small>Numbers • Patterns • Perspective</small></div>
      </div>
      <div className="numerology-copy">
        <div className="eyebrow">Also Available</div>
        <h2 className="title">Understand the <span className="gold">Power of Numbers.</span></h2>
        <p className="copy">Numerology offers a personalised way to explore the patterns and meanings associated with your numbers, bringing another perspective to questions around life, relationships and career.</p>
        <div className="numerology-points">
          <div><span><Compass size={18}/></span><strong>Personal Numbers</strong><small>Explore the numbers connected to you.</small></div>
          <div><span><BriefcaseBusiness size={18}/></span><strong>Career &amp; Direction</strong><small>Reflect on choices, goals and opportunities.</small></div>
          <div><span><Heart size={18}/></span><strong>Relationships</strong><small>Gain another perspective on personal dynamics.</small></div>
        </div>
        <a className="btn btn-gold" href="/numerology">Explore Numerology <span>→</span></a>
      </div>
    </div>
  </section>
}
