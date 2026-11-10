import Hero from '../components/home/Hero';
import FeaturedProperties from '../components/home/FeaturedProperties';
import StatsBanner from '../components/home/StatsBanner';
import FurnitureSection from '../components/home/FurnitureSection';
import ServicesSection from '../components/home/ServicesSection';
import CTABanner from '../components/home/CTABanner';
import { Link } from 'react-router-dom';
export default function Home() {
  return <div><Hero /><StatsBanner /><FeaturedProperties /><FurnitureSection /><ServicesSection />
    <section className="brand-story brand-container brand-section"><div><p className="brand-eyebrow">THE PEOPLE BEHIND BROKERIN</p><h2>Local conversations.<br />Considered decisions.</h2><p>Based around Kanakapura Road, Bengaluru, our team helps connect your property search with the furniture and services that come next.</p><Link className="brand-text-link" to="/about">Meet the team →</Link></div><div><h3>Clarity before commitment.</h3><p>Ask us to confirm the current availability, brokerage, deposit, maintenance charges and service terms before making a decision.</p><Link className="brand-text-link" to="/contact">Ask a question →</Link></div></section>
    <CTABanner />
  </div>;
}
