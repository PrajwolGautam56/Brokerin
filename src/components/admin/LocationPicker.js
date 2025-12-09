import { useState, useEffect, useCallback, useMemo } from 'react';
import logger from '../../utils/logger';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon paths for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DEFAULT_CENTER = [12.9716, 77.5946]; // Bengaluru

function LocationMarker({ position, onChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onChange({ lat, lng, source: 'map' });
    },
  });

  if (!position) return null;

  return <Marker position={position} />;
}

function LocationPicker({
  coordinates,
  formType = 'add',
  onCoordinatesChange,
  onLocationSelect,
  onAddressUpdate,
  height = 300,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(DEFAULT_CENTER);

  const mapCenter = useMemo(() => {
    if (coordinates?.latitude && coordinates?.longitude) {
      const lat = parseFloat(coordinates.latitude);
      const lng = parseFloat(coordinates.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    return DEFAULT_CENTER;
  }, [coordinates]);

  useEffect(() => {
    setSelectedPosition(mapCenter);
  }, [mapCenter]);

  const handleSearch = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!searchQuery.trim()) return;

      setSearchLoading(true);
      setSearchError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
            searchQuery.trim()
          )}`,
          {
            headers: {
              'User-Agent': 'Brokerin-AdminLocationPicker/1.0',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data = await response.json();
        setSearchResults(data || []);
        if (data.length === 0) {
          setSearchError('No results found. Try another search.');
        }
      } catch (err) {
        logger.error('Location search error:', err);
        setSearchError('Failed to search locations. Please try again.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [searchQuery]
  );

  const handleResultSelect = (result) => {
    if (!result) return;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (isNaN(lat) || isNaN(lng)) return;

    setSelectedPosition([lat, lng]);
    setSearchResults([]);
    setSearchQuery(result.display_name || '');

    if (onCoordinatesChange) {
      onCoordinatesChange({
        latitude: lat,
        longitude: lng,
        source: 'search',
        formType,
      });
    }

    if (onLocationSelect) {
      onLocationSelect(result.display_name);
    }

    if (onAddressUpdate && result.address) {
      const address = result.address;
      onAddressUpdate({
        street: address.road || address.residential || '',
        city:
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          '',
        state: address.state || '',
        country: address.country || '',
        zipcode: address.postcode || '',
      });
    }
  };

  const handleManualCoordinateChange = (field, value) => {
    const lat = field === 'latitude' ? value : coordinates?.latitude;
    const lng = field === 'longitude' ? value : coordinates?.longitude;

    if (onCoordinatesChange) {
      onCoordinatesChange({
        latitude: lat,
        longitude: lng,
        source: 'manual',
        formType,
      });
    }
  };

  const handleMapPositionChange = ({ lat, lng }) => {
    setSelectedPosition([lat, lng]);
    if (onCoordinatesChange) {
      onCoordinatesChange({
        latitude: lat,
        longitude: lng,
        source: 'map',
        formType,
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Location
            </label>
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a place or address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 bg-violet-600 text-white rounded-r-md hover:bg-violet-700"
                disabled={searchLoading}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchError && (
              <p className="text-xs text-red-500 mt-1">{searchError}</p>
            )}
          </div>
        </div>
        {searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-48 overflow-auto">
            {searchResults.map((result) => (
              <button
                key={`${result.lat}-${result.lon}`}
                type="button"
                onClick={() => handleResultSelect(result)}
                className="w-full text-left px-3 py-2 hover:bg-violet-50 text-sm"
              >
                <p className="font-medium text-gray-900">
                  {result.display_name}
                </p>
                <p className="text-xs text-gray-500">
                  Lat: {parseFloat(result.lat).toFixed(5)}, Lng:{' '}
                  {parseFloat(result.lon).toFixed(5)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Map Preview
        </label>
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={selectedPosition}
            zoom={15}
            style={{ height, width: '100%' }}
            scrollWheelZoom={false}
            key={`${selectedPosition[0]}-${selectedPosition[1]}-${formType}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <LocationMarker
              position={selectedPosition}
              onChange={handleMapPositionChange}
            />
          </MapContainer>
          <div className="p-3 bg-gray-50 text-xs text-gray-600">
            Click on the map to move the pin. Current coordinates:{' '}
            <span className="font-medium text-gray-800">
              {selectedPosition[0].toFixed(5)}, {selectedPosition[1].toFixed(5)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={coordinates?.latitude || ''}
            onChange={(e) => handleManualCoordinateChange('latitude', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="0.000001"
            value={coordinates?.longitude || ''}
            onChange={(e) => handleManualCoordinateChange('longitude', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;

