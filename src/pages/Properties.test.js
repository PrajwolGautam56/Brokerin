import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Properties from './Properties';
import { propertyService } from '../services/propertyService';
jest.mock('../services/propertyService', () => ({ propertyService: { getAllProperties: jest.fn(), getImageUrl: path => path } }));
jest.mock('../components/property/PropertiesMap', () => () => <div>Map</div>);
const home = { _id: 'home1', name: 'Sample Home', listing_type: 'Rent', location: 'HSR Layout', price: { rent_monthly: 20000 } };
test('searches the server catalogue and moves through pages', async () => {
  propertyService.getAllProperties.mockResolvedValueOnce({ properties: [home], pagination: { total: 25, page: 1, pages: 3 } })
    .mockResolvedValueOnce({ properties: [{ ...home, _id: 'home2', name: 'Another Home' }], pagination: { total: 25, page: 2, pages: 3 } });
  render(<MemoryRouter initialEntries={['/properties?type=rent&location=HSR&buildingType=Apartment']}><Properties /></MemoryRouter>);
  await screen.findByText('Sample Home');
  expect(propertyService.getAllProperties).toHaveBeenCalledWith(expect.objectContaining({ listingType: 'Rent', location: 'HSR', building_type: 'Apartment', limit: 12 }));
  fireEvent.click(screen.getByText('Next'));
  await screen.findByText('Another Home');
  expect(propertyService.getAllProperties).toHaveBeenLastCalledWith(expect.objectContaining({ page: '2', location: 'HSR' }));
});
test('buy search uses sale mode and retains the entered locality', async () => {
  propertyService.getAllProperties.mockResolvedValue({ properties: [], pagination: { total: 0, page: 1, pages: 0 } });
  render(<MemoryRouter initialEntries={['/properties?type=buy&location=Whitefield']}><Properties /></MemoryRouter>);
  await waitFor(() => expect(propertyService.getAllProperties).toHaveBeenLastCalledWith(expect.objectContaining({ listingType: 'Sell', location: 'Whitefield' })));
  expect(screen.getByDisplayValue('Whitefield')).toBeTruthy();
});
