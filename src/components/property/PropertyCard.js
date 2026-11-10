import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { propertyService } from '../../services/propertyService';
import { formatListingPrice, shortLocation } from '../../utils/listingPresentation';
import { businessContact, whatsappLink } from '../../utils/businessContact';
import { trackLead } from '../../utils/leadTracking';

export default function PropertyCard({ property }) {
  const [failed, setFailed] = useState(false);
  const id = property._id || property.property_id;
  const rent = String(property.listing_type).toLowerCase() === 'rent';
  return <article className="brand-property-card">
    <Link to={'/property/' + id} className="brand-property-photo">
      {property.photos?.length && !failed ? <img src={propertyService.getImageUrl(property.photos[0])} alt={property.name || 'Property'} loading="lazy" width="640" height="440" onError={() => setFailed(true)} /> : <span>Photos available on enquiry</span>}
      <span className="brand-listing-label">{rent ? 'For rent' : 'For sale'}</span>
    </Link>
    <div className="brand-property-body">
      <p className="brand-property-price">{formatListingPrice(rent ? property.price?.rent_monthly : property.price?.sell_price, rent ? '/month' : '')}</p>
      <h3><Link to={'/property/' + id}>{property.name || 'Property listing'}</Link></h3>
      <p className="brand-locality" title={property.location}><MapPinIcon />{shortLocation(property)}</p>
      <div className="brand-property-specs">{[property.bhk ? property.bhk + ' BHK' : property.building_type, property.size ? property.size + ' sq.ft' : '', property.furnishing && property.furnishing !== 'None' ? property.furnishing + ' furnished' : ''].filter(Boolean).map(text => <span key={text}>{text}</span>)}</div>
      <div className="brand-card-bottom"><span>{property.availability || property.status || 'Confirm availability'} · Ref {property.property_id || String(id).slice(-6)}</span><Link to={'/property/' + id} aria-label={'View ' + property.name}><ArrowUpRightIcon /></Link></div>
      <a className="brand-card-enquiry" href={whatsappLink('I would like to enquire about ' + (property.name || 'property') + ' (' + id + ').')} target="_blank" rel="noopener noreferrer" onClick={() => trackLead('whatsapp', { item_id: id, section: 'property' })}>Enquire with BrokerIn <span className="sr-only">{businessContact.phone}</span></a>
    </div>
  </article>;
}
