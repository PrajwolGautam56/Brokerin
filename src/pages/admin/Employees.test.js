import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import Employees from './Employees';
import api from '../../axiosConfig';

jest.mock('../../axiosConfig', () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn() }));
const groups = [
  { key: 'properties', name: 'Properties', actions: ['view', 'create', 'update'] },
  { key: 'rentals', name: 'Rentals', actions: ['view', 'update'] },
  { key: 'payments', name: 'Payment Records', actions: ['update'] }
];
beforeAll(() => { global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }; });
beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockImplementation(path => Promise.resolve({ data: { data: path.includes('employee-permissions') ? groups : [] } }));
});

test('creates a viewing employee without payment permission', async () => {
  api.post.mockResolvedValue({ data: { success: true } });
  render(<Employees />);
  await waitFor(() => expect(screen.getByText('Add Employee').disabled).toBe(false));
  fireEvent.click(screen.getByText('Add Employee'));
  const dialog = await screen.findByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('Name'), { target: { value: 'Office Staff' } });
  fireEvent.change(within(dialog).getByLabelText('Login Email'), { target: { value: 'staff@example.com' } });
  fireEvent.change(within(dialog).getByLabelText('Phone'), { target: { value: '9876543210' } });
  fireEvent.change(within(dialog).getByLabelText('Password'), { target: { value: 'employee-test-password' } });
  fireEvent.click(within(dialog).getByText('Save Employee'));
  await screen.findByText('Employee access saved.');
  expect(api.post).toHaveBeenCalledWith('/api/admin/employees', expect.objectContaining({ permissions: ['properties.view', 'rentals.view'], employeeActive: true }));
});

test('edits permissions and deactivates employee without resetting password', async () => {
  api.get.mockImplementation(path => Promise.resolve({ data: { data: path.includes('employee-permissions') ? groups : [{ _id: 'staff1', fullName: 'Staff', email: 'staff@example.com', phoneNumber: '9876543210', employeeActive: true, permissions: ['rentals.view'] }] } }));
  api.put.mockResolvedValue({ data: { success: true } });
  render(<Employees />);
  fireEvent.click(await screen.findByText('Edit Access'));
  const dialog = await screen.findByRole('dialog');
  const paymentSection = within(dialog).getByText('Payment Records').parentElement;
  fireEvent.click(within(paymentSection).getByLabelText('Edit / Update'));
  fireEvent.click(within(dialog).getByLabelText('Employee Active'));
  fireEvent.click(within(dialog).getByText('Save Employee'));
  await screen.findByText('Employee access saved.');
  expect(api.put).toHaveBeenCalledWith('/api/admin/employees/staff1', expect.objectContaining({ permissions: ['rentals.view', 'payments.update'], employeeActive: false, password: '' }));
});
