import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in production
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Default coordinates (12°48'47.3"N 77°30'22.2"E)
const DEFAULT_CENTER = [12.813139, 77.506167];

function PropertiesMap({ properties }) {
  // Always use the default center
  const center = DEFAULT_CENTER;

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg shadow-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {properties.map((property) => (
        <Marker
          key={property._id}
          position={DEFAULT_CENTER}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-lg mb-2">{property.name}</h3>
              <p className="text-gray-600 mb-2">{property.location}</p>
              <p className="text-violet-600 font-medium mb-2">
                {property.listing_type === 'Rent'
                  ? `₹${property.price?.rent_monthly?.toLocaleString()}/month`
                  : `₹${property.price?.sell_price?.toLocaleString()}`}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span>{property.bhk} BHK</span>
                <span>{property.building_type}</span>
              </div>
              <Link
                to={`/property/${property._id}`}
                className="block mt-3 text-center bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default PropertiesMap; 