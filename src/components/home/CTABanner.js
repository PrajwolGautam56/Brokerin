import { Link } from 'react-router-dom';
import { businessContact, whatsappLink } from '../../utils/businessContact';
import { trackLead } from '../../utils/leadTracking';
export default function CTABanner() {
  return <section className="brand-final"><div className="brand-container"><p className="brand-eyebrow">LET'S FIND YOUR NEXT CHAPTER</p><h2>A home search starts<br />with a conversation.</h2><p>Share your locality, budget and move-in plans. We'll help you explore the next step.</p><div className="brand-final-actions"><Link className="brand-button brand-button-light" to="/contact">Talk to our team</Link><a href={whatsappLink()} onClick={() => trackLead('whatsapp', { section: 'home' })} target="_blank" rel="noopener noreferrer">WhatsApp {businessContact.phone} →</a></div></div></section>;
}

