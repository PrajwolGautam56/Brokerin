import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
const DEFAULT_POSITION = [12.813139, 77.506167];

function PropertyMap({ property }) {
  // Always use default position
  const position = DEFAULT_POSITION;

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      style={{ height: '400px', width: '100%' }}
      className="rounded-lg shadow-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold">{property.name}</h3>
            <p className="text-sm text-gray-600">{property.location}</p>
            {property.address && (
              <p className="text-sm text-gray-600 mt-1">
                {[
                  property.address.street,
                  property.address.city,
                  property.address.state,
                  property.address.country
                ].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default PropertyMap; 