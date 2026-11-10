import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { furnitureService } from '../../services/furnitureService';
import { formatListingPrice } from '../../utils/listingPresentation';

export default function FurnitureSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    furnitureService.getAllFurniture({ limit: 4 }).then(response => {
      if (active) setItems((response.furniture || response.data || []).slice(0, 4));
    }).catch(() => { if (active) setFailed(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <section className="brand-band"><div className="brand-container brand-section">
    <div className="brand-section-heading"><div><p className="brand-eyebrow">MAKE YOURSELF AT HOME</p><h2>Furniture for your everyday.</h2><p>Compare monthly rent, deposits and availability before you choose.</p></div><Link className="brand-text-link" to="/furniture">Explore furniture →</Link></div>
    {loading ? <p role="status">Loading furniture...</p> : failed ? <p>Furniture could not be loaded. <Link to="/furniture">Browse the catalogue.</Link></p> : !items.length ? <p>No furniture is listed at the moment. <Link to="/contact">Ask our team about availability.</Link></p> : <div className="brand-furniture-grid">{items.map(item => <article className="brand-property-card" key={item._id || item.id}>
      <Link className="brand-property-photo" to={'/furniture/' + (item._id || item.id)}>{item.photos?.length ? <img src={furnitureService.getImageUrl(item.photos[0])} alt={item.name} width="500" height="350" loading="lazy" /> : <span>Photo not provided</span>}</Link>
      <div className="brand-property-body"><h3><Link to={'/furniture/' + (item._id || item.id)}>{item.name}</Link></h3>
      <p className="brand-property-price">{formatListingPrice(item.listing_type === 'Sell' ? item.price?.sell_price : item.price?.rent_monthly, item.listing_type === 'Sell' ? '' : '/month')}</p>
      <p className="brand-muted">Deposit: {item.price?.deposit === undefined ? 'Confirm with our team' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price.deposit)}</p>
      <Link className="brand-text-link" to={'/furniture/' + (item._id || item.id)}>View terms & availability →</Link></div>
    </article>)}</div>}
  </div></section>;
}

