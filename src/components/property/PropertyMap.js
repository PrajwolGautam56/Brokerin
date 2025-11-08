import { useState, useEffect } from 'react';
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

// Default coordinates (12°48'47.3"N 77°30'22.2"E) - Bangalore
const DEFAULT_POSITION = [12.813139, 77.506167];

function PropertyMap({ property, height = '400px' }) {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [loading, setLoading] = useState(true);
  const [geocodingError, setGeocodingError] = useState(null);

  // Build address string from property
  const buildAddressString = () => {
    const parts = [];
    if (property.address?.street) parts.push(property.address.street);
    if (property.address?.city) parts.push(property.address.city);
    if (property.address?.state) parts.push(property.address.state);
    if (property.address?.zipcode) parts.push(property.address.zipcode);
    if (property.address?.country) parts.push(property.address.country);
    
    return property.location || parts.join(', ') || '';
  };

  useEffect(() => {
    const geocodeAddress = async () => {
      setLoading(true);
      setGeocodingError(null);

      // If coordinates already exist, use them directly
      if (property.location_coordinates?.latitude && property.location_coordinates?.longitude) {
        const lat = parseFloat(property.location_coordinates.latitude);
        const lng = parseFloat(property.location_coordinates.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setPosition([lat, lng]);
          setLoading(false);
          return;
        }
      }

      // Otherwise, geocode the address using Nominatim (OpenStreetMap)
      const addressString = buildAddressString();
      
      if (!addressString) {
        setGeocodingError('No address information available');
        setLoading(false);
        return;
      }

      try {
        // Use Nominatim API (free, no API key needed)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`,
          {
            headers: {
              'User-Agent': 'Brokerin-PropertyMap/1.0' // Required by Nominatim
            }
          }
        );
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            setPosition([lat, lng]);
            
            // Optionally update backend with coordinates (if user is authenticated)
            // This is commented out to avoid unnecessary API calls
            // You can uncomment and implement if needed
            // updatePropertyCoordinates(lat, lng);
          } else {
            setGeocodingError('Invalid coordinates received from geocoding service');
          }
        } else {
          setGeocodingError('Address not found. Please check the address details.');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setGeocodingError('Failed to geocode address. Showing default location.');
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);

  // Build full address for popup
  const getFullAddress = () => {
    if (property.address) {
      const parts = [
        property.address.street,
        property.address.city,
        property.address.state,
        property.address.zipcode,
        property.address.country
      ].filter(Boolean);
      
      return parts.length > 0 ? parts.join(', ') : property.location || 'Address not available';
    }
    return property.location || 'Address not available';
  };

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {!loading && (
        <>
          <MapContainer 
            center={position} 
            zoom={15} 
            style={{ height, width: '100%' }}
            className="rounded-lg shadow-lg"
            key={`${position[0]}-${position[1]}`} // Force re-render when position changes
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {property.name || 'Property Location'}
                  </h3>
                  <p className="text-sm text-gray-600">{getFullAddress()}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          
          {geocodingError && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Note:</span> {geocodingError}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PropertyMap; 