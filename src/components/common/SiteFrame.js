import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { businessContact, whatsappLink } from '../../utils/businessContact';
import { trackLead } from '../../utils/leadTracking';
import { setPageMetadata } from '../../utils/pageMetadata';
import '../../styles/publicBrand.css';

export default function SiteFrame({ children }) {
  const { pathname } = useLocation();
  const admin = pathname.startsWith('/admin');
  useEffect(() => {
    const names = { '/': 'Homes, Furniture & Home Services in Bengaluru', '/properties': 'Properties for Rent & Sale in Bengaluru', '/furniture': 'Furniture Rentals & Sales', '/services': 'Home Services in Bengaluru', '/about': 'Our Team & Company', '/contact': 'Contact Our Bengaluru Team' };
    const service = { painting: 'Painting', cleaning: 'Home Cleaning', plumbing: 'Plumbing', 'home-maintenance': 'Home Maintenance', carpentry: 'Carpentry', 'moving-packing': 'Moving & Packing', 'appliance-services': 'Appliance Services' }[pathname.split('/')[2]];
    setPageMetadata({ title: `BrokerIn | ${names[pathname] || (pathname.startsWith('/services/') && service ? `${service} in Bengaluru` : 'Property & Home Solutions')}`, description: 'Explore homes to rent or buy in Bengaluru, furniture rentals and home services. Contact BrokerIn to confirm availability, prices and terms.', path: pathname, noindex: admin || /checkout|dashboard|profile|reset-password|verify-otp|login|signup|forgot-password/.test(pathname) });
  }, [pathname, admin]);
  return <div className={admin ? 'App' : 'App public-site'}>{children}
    {!admin && !/checkout/.test(pathname) && <aside className="brand-contact-dock" aria-label="Contact BrokerIn"><a href={`tel:${businessContact.telephone}`} onClick={() => trackLead('call', { section: pathname })}>Call us</a><a target="_blank" rel="noopener noreferrer" href={whatsappLink()} onClick={() => trackLead('whatsapp', { section: pathname })}>WhatsApp</a></aside>}
  </div>;
}
