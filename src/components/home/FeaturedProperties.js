import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import PropertyCard from '../property/PropertyCard';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [state, setState] = useState('loading');
  useEffect(() => {
    let active = true;
    propertyService.getAllProperties({ status: 'Available', limit: 6 }).then(response => {
      if (active) { setProperties(response.properties || []); setState('ready'); }
    }).catch(() => { if (active) setState('error'); });
    return () => { active = false; };
  }, []);
  return <section className="brand-section brand-container">
    <div className="brand-section-heading"><div><p className="brand-eyebrow">YOUR NEXT CHAPTER</p><h2>Find your next home.</h2><p>Explore current listings, then speak to our team about the details.</p></div><Link className="brand-text-link" to="/properties">All properties →</Link></div>
    {state === 'loading' ? <p role="status">Loading homes...</p> : state === 'error' ? <p role="alert">Homes could not be loaded. <Link to="/properties">Try the property search.</Link></p> : properties.length ? <div className="brand-property-grid">{properties.map(property => <PropertyCard key={property._id} property={property} />)}</div> : <p>No homes are currently listed. <Link to="/contact">Tell us what you are looking for.</Link></p>}
  </section>;
}
