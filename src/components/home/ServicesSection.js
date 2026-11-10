import { Link } from 'react-router-dom';
const services = [
  { slug: 'home-maintenance', title: 'Home maintenance', image: '/images/services/home_maintenance.jpg', text: 'Cleaning, plumbing and electrical work.' },
  { slug: 'carpentry', title: 'Carpentry', image: '/images/services/carpentry.jpg', text: 'Repairs, fittings and furniture work.' },
  { slug: 'moving-packing', title: 'Moving & packing', image: '/images/services/packers.webp', text: 'Plan your move with our team.' },
  { slug: 'appliance-services', title: 'Appliance services', image: '/images/services/appliance.png', text: 'Support for everyday appliances.' }
];
export default function ServicesSection() {
  return <section className="brand-container brand-section"><div className="brand-section-heading"><div><p className="brand-eyebrow">BEYOND THE FRONT DOOR</p><h2>A little help with the rest.</h2><p>Tell us what needs doing. Confirm the scope and quote before booking.</p></div><Link className="brand-text-link" to="/services">All services →</Link></div>
    <div className="brand-furniture-grid">{services.map(service => <Link className="brand-service" key={service.title} to={'/services/' + service.slug}><img src={service.image} alt={service.title} loading="lazy" width="500" height="350" /><h3>{service.title}</h3><p>{service.text}</p></Link>)}</div>
  </section>;
}

