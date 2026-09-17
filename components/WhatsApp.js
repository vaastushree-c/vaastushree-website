import {MessageCircle} from "lucide-react";
const N="9199937656959";
export default function WhatsApp(){const m=encodeURIComponent("Hi, I would like to book an astrology or tarot reading.");return <a className="whatsapp" href={`https://wa.me/${N}?text=${m}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={29}/></a>}