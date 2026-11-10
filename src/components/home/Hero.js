import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { propertyService } from '../../services/propertyService';

export default function Hero() {
  const navigate = useNavigate();
  const [type, setType] = useState('rent');
  const [location, setLocation] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [property, setProperty] = useState(null);
  useEffect(() => {
    let active = true;
    propertyService.getAllProperties({ status: 'Available', limit: 6 }).then(response => {
      if (active) setProperty(response.properties?.find(item => item.photos?.length));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const search = event => {
    event.preventDefault();
    const params = new URLSearchParams({ type });
    if (location.trim()) params.set('location', location.trim());
    if (buildingType) params.set('buildingType', buildingType);
    navigate('/properties?' + params);
  };
  return <section className="brand-hero">
    <img className="brand-hero-photo" src={property ? propertyService.getImageUrl(property.photos[0]) : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85'} alt={property?.name || 'A contemporary home'} fetchPriority="high" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />
    <div className="brand-hero-shade" />
    <div className="brand-container brand-hero-content">
      <p className="brand-eyebrow">BENGALURU · HOMES & HOME SOLUTIONS</p>
      <h1>BrokerIn<span>Find a place that feels like yours.</span></h1>
      <p className="brand-hero-copy">Homes to rent or buy, furniture to settle in, and services to keep life moving.</p>
      <div className="brand-hero-links"><Link to="/properties?type=buy">Buy property <ArrowUpRightIcon /></Link><Link to="/furniture">Rent furniture <ArrowUpRightIcon /></Link><Link to="/services">Home services <ArrowUpRightIcon /></Link></div>
      <form onSubmit={search} className="brand-search" aria-label="Find a property">
        <div className="brand-tabs">{['rent', 'buy'].map(value => <button type="button" key={value} aria-pressed={type === value} onClick={() => setType(value)}>{value === 'rent' ? 'Rent a home' : 'Buy a home'}</button>)}</div>
        <div className="brand-search-fields">
          <label>Locality<input value={location} onChange={event => setLocation(event.target.value)} placeholder="Kanakapura Road, Whitefield..." /></label>
          <label>Property type<select value={buildingType} onChange={event => setBuildingType(event.target.value)}><option value="">Any type</option><option>Apartment</option><option>Independent House</option><option>Villa</option><option>Plot</option></select></label>
          <button className="brand-button" type="submit"><MagnifyingGlassIcon />Search homes</button>
        </div>
      </form>
      {property && <Link className="brand-photo-caption" to={'/property/' + property._id}>Explore {property.name} <ArrowUpRightIcon /></Link>}
    </div>
  </section>;
}
