import { formatPrice } from './priceFormatter';

export const hasListingPrice = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) > 0;
export const formatListingPrice = (value, suffix = '') => hasListingPrice(value) ? `${formatPrice(Number(value))}${suffix}` : 'Price on request';
export const shortLocation = property => {
  if (property.address?.city && property.location) return property.location.split(',').slice(0, 2).join(',').trim();
  return property.location?.split(',').slice(0, 2).join(',').trim() || property.address?.city || 'Ask for location';
};
