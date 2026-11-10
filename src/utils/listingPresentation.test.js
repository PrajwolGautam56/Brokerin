import { hasListingPrice, formatListingPrice, shortLocation } from './listingPresentation';
test('missing and invalid prices are never advertised as free', () => {
  for (const value of [undefined, null, '', 0, -10, 'bad']) {
    expect(hasListingPrice(value)).toBe(false);
    expect(formatListingPrice(value, '/month')).toBe('Price on request');
  }
  expect(formatListingPrice(25000, '/month')).toBe('₹25,000/month');
});
test('shortens the visible address without changing its underlying data', () => {
  const property = { location: 'Kanakapura Road, Bengaluru, Karnataka, India' };
  expect(shortLocation(property)).toBe('Kanakapura Road, Bengaluru');
  expect(property.location).toContain('Karnataka');
});
