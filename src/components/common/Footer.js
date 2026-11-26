import { Link } from 'react-router-dom';
import { businessContact, whatsappLink } from '../../utils/businessContact';
import { trackLead } from '../../utils/leadTracking';
export default function Footer() {
  return <footer className="brand-footer"><div className="brand-container"><div className="brand-footer-grid">
    <div><p className="brand-footer-kicker">BROKERIN</p><h2>Find your next<br />place with clarity.</h2><p>Homes, furniture and everyday home services in Bengaluru.</p><p>{businessContact.address}</p></div>
    <div><h3>Explore</h3>{[['/properties?type=rent','Rent a home'],['/properties?type=buy','Buy a property'],['/furniture','Furniture'],['/services','Home services'],['/about','Meet the team']].map(([to,label]) => <Link to={to} key={to}>{label}</Link>)}</div>
    <div><h3>Let's talk</h3><a href={'tel:' + businessContact.telephone} onClick={() => trackLead('call', { section: 'footer' })}>{businessContact.phone}</a><a href="tel:+918884704449">{businessContact.secondaryPhone}</a><a href={'mailto:' + businessContact.email}>{businessContact.email}</a><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" onClick={() => trackLead('whatsapp', { section: 'footer' })}>Chat on WhatsApp</a><Link to="/contact">Send an enquiry</Link></div>
    </div><div className="brand-footer-bottom"><span>© {new Date().getFullYear()} BrokerIn</span><div className="flex flex-wrap gap-5"><Link to="/privacy-policy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/refund-policy">Cancellation & refunds</Link></div></div></div></footer>;
}
