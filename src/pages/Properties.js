import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/property/PropertyCard';
import PropertiesMap from '../components/property/PropertiesMap';
import { propertyService } from '../services/propertyService';

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const queryString = params.toString();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [map, setMap] = useState(false);
  const [retry, setRetry] = useState(0);
  const [draftType, setDraftType] = useState(() => params.get('type') === 'buy' ? 'buy' : 'rent');
  const type = params.get('type') === 'buy' ? 'buy' : 'rent';
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(queryString);
    setDraftType(query.get('type') === 'buy' ? 'buy' : 'rent');
    const [minPrice, maxPrice] = (query.get('priceRange') || '').split('-');
    setLoading(true); setError('');
    propertyService.getAllProperties({
      page: query.get('page') || 1, limit: 12, status: 'Available',
      listingType: query.get('type') === 'buy' ? 'Sell' : 'Rent',
      location: query.get('location') || undefined,
      building_type: query.get('buildingType') || undefined,
      bhk: query.get('bhk') || undefined,
      furnishing: query.get('furnishing') || undefined,
      availability: query.get('availability') || undefined,
      minPrice: minPrice || undefined, maxPrice: maxPrice || undefined,
      sortBy: query.get('sortBy') || 'newest'
    }).then(response => {
      if (active) {
        setProperties(Array.from(new Map((response.properties || []).map(item => [item._id, item])).values()));
        setPagination(response.pagination || { total: 0, page: 1, pages: 0 });
      }
    }).catch(err => { if (active) { setError(err.message || 'Unable to load properties.'); setProperties([]); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [queryString, retry]);
  const update = changes => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    setParams(next);
  };
  const apply = event => {
    event.preventDefault();
    const next = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) if (String(value).trim()) next.set(key, String(value).trim());
    setParams(next);
  };
  return <div className="pt-20 pb-14">
    <section className="brand-page-hero"><div className="brand-container"><p className="brand-eyebrow">HOMES IN BENGALURU</p><h1>Find your next home.</h1><p>Compare locations, prices and space. Confirm availability with our team.</p></div></section>
    <main className="brand-container pt-8">
    <form onSubmit={apply} key={queryString} className="property-filter-panel mb-7">
      <div className="property-filter-heading"><div><p className="brand-eyebrow">REFINE YOUR SEARCH</p><h2>Search the property catalogue</h2></div><span>{type === 'rent' ? 'Rental homes' : 'Homes for sale'}</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label>Looking to<select name="type" value={draftType} onChange={event => { setDraftType(event.target.value); event.target.form.elements.priceRange.value = ""; }}><option value="rent">Rent</option><option value="buy">Buy</option></select></label>
        <label>Locality<input name="location" defaultValue={params.get('location') || ''} placeholder="Locality or society" /></label>
        <label>Property type<select name="buildingType" defaultValue={params.get('buildingType') || ''}><option value="">Any type</option>{['Apartment','Independent House','Villa','Pent House','Plot'].map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Bedrooms<select name="bhk" defaultValue={params.get('bhk') || ''}><option value="">Any BHK</option>{[1,2,3,4,5].map(value => <option key={value} value={value}>{value === 5 ? '5+' : value} BHK</option>)}</select></label>
        <label>Budget ({draftType === 'rent' ? 'monthly' : 'purchase'})<select name="priceRange" defaultValue={params.get('priceRange') || ''}><option value="">Any budget</option>{(draftType === 'rent' ? [['0-15000','Under ₹15,000'],['15000-30000','₹15,000–30,000'],['30000-60000','₹30,000–60,000'],['60000','₹60,000+']] : [['0-5000000','Under ₹50 lakh'],['5000000-10000000','₹50 lakh–1 crore'],['10000000','₹1 crore+']]).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Furnishing<select name="furnishing" defaultValue={params.get('furnishing') || ''}><option value="">Any furnishing</option><option value="Full">Fully furnished</option><option value="Semi">Semi furnished</option><option value="None">Unfurnished</option></select></label>
        <label>Availability<select name="availability" defaultValue={params.get('availability') || ''}><option value="">Any availability</option>{['Immediate', 'Within 15 Days', 'Within 30 Days', 'After 30 Days'].map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Sort<select name="sortBy" defaultValue={params.get('sortBy') || 'newest'}><option value="newest">Latest listings</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
        <div className="property-filter-actions"><button className="brand-button" type="submit">Search properties</button><button type="button" onClick={() => setParams({ type })}>Reset</button></div>
      </div>
    </form>
    <div className="flex flex-wrap justify-between gap-4 items-center mb-5"><p role="status">{loading ? 'Finding homes...' : error ? 'Search unavailable' : pagination.total + ' properties for ' + (type === 'rent' ? 'rent' : 'sale')}</p><button onClick={() => setMap(!map)} className="border px-4 py-2 rounded text-sm">{map ? 'Show list' : 'Show page on map'}</button></div>
    {error ? <p role="alert">{error} <button className="underline" onClick={() => setRetry(retry + 1)}>Retry</button></p> : loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Loading properties">{[1,2,3].map(value => <div className="h-80 bg-gray-100 rounded-lg animate-pulse" key={value} />)}</div> : !properties.length ? <p className="py-12 text-gray-600">No matching properties. Try a wider locality or budget.</p> : map ? <div className="h-[500px]"><PropertiesMap properties={properties} /></div> : <div className="brand-property-grid">{properties.map(property => <PropertyCard property={property} key={property._id} />)}</div>}
    {!loading && !error && pagination.pages > 1 && <nav aria-label="Property result pages" className="flex items-center justify-center gap-5 mt-8"><button disabled={pagination.page <= 1} onClick={() => update({ page: String(pagination.page - 1) })} className="border rounded px-4 py-2 disabled:opacity-40">Previous</button><span>Page {pagination.page} of {pagination.pages}</span><button disabled={pagination.page >= pagination.pages} onClick={() => update({ page: String(pagination.page + 1) })} className="border rounded px-4 py-2 disabled:opacity-40">Next</button></nav>}
    </main>
  </div>;
}
