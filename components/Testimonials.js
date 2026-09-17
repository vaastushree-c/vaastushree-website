const data=[
  ["★★★★★","The Vastu consultation gave us practical clarity on our home's layout and entrance. Everything was explained simply and thoughtfully.","Priya M.","Residential Vastu"],
  ["★★★★★","The property consultation helped us understand our office layout and the areas we should pay attention to before making changes.","Ananya R.","Office Vastu"],
  ["★★★★★","The tarot session felt calm, private and personal. I left with a clearer way to reflect on the situation I was dealing with.","Rohan K.","Tarot Reading"]
];
export default function Testimonials(){return <section className="section" id="reviews"><div className="container"><div className="eyebrow">Client Experiences</div><h2 className="title">Words from <span className="gold">Our Clients.</span></h2><div className="testimonials-grid">{data.map(([stars,text,name,service])=><article className="testimonial card" key={name}><div className="stars">{stars}</div><p>“{text}”</p><strong>{name}</strong><small>{service}</small></article>)}</div></div></section>}
