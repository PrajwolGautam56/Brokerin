import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import RentalDuesView, { getDueRows } from './RentalDuesView';
import { rentalService } from '../../../services/rentalService';

jest.mock('../../../services/rentalService', () => ({ rentalService: {
  getAllRentals: jest.fn(), sendReminderForMonth: jest.fn(), updatePaymentRecord: jest.fn()
} }));

const rental = (id, name, status = 'Overdue') => ({
  _id: id, rental_id: `RENT-${id}`, customer_name: name,
  customer_email: 'shared@example.com', customer_phone: '12345',
  payment_records: [{ _id: `payment-${id}`, status, amount: 500, month: '2026-01', dueDate: '2026-01-10' }]
});

beforeEach(() => { jest.clearAllMocks(); });

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

test('keeps shared-email accounts separate and excludes paid and cart payments', () => {
  const records = [rental('1', 'Alice'), rental('2', 'Bob'), rental('3', 'Paid', 'Paid'),
    { ...rental('4', 'Cart'), order_source: 'cart' }, rental('5', 'Pending', 'Pending')];
  expect(getDueRows(records, 'Overdue').map(row => row.rental._id)).toEqual(['1', '2']);
  expect(getDueRows(records, 'Pending')).toHaveLength(1);
  expect(getDueRows(records, 'Overdue', 'Bob')[0].rental._id).toBe('2');
});

test('loads subsequent pages and marks only the selected rental payment paid', async () => {
  rentalService.getAllRentals.mockResolvedValueOnce({ data: [rental('1', 'Alice')], pagination: { total: 101 } })
    .mockResolvedValueOnce({ data: [rental('2', 'Bob')], pagination: { total: 101 } });
  rentalService.updatePaymentRecord.mockResolvedValue({ success: true });
  const updated = jest.fn();
  render(<RentalDuesView status="Overdue" onPaymentUpdated={updated} />);
  await screen.findByText('Bob');
  expect(rentalService.getAllRentals.mock.calls[1][0].page).toBe(2);
  fireEvent.click(screen.getByRole('button', { name: 'Alice' }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getAllByText('Mark Paid')[0]);
  fireEvent.click(screen.getByText('Confirm Paid'));
  await waitFor(() => expect(updated).toHaveBeenCalledTimes(1));
  expect(rentalService.updatePaymentRecord).toHaveBeenCalledWith('1', 'payment-1', expect.objectContaining({ status: 'Paid' }));
  await screen.findByText('Paid', { selector: 'td' });
  fireEvent.click(screen.getByText('Close'));
  expect(screen.queryByRole('button', { name: 'Alice' })).toBeNull();
  expect(screen.getByText('Bob')).toBeTruthy();
});

test('reminders use rental and payment IDs even when the email is shared', async () => {
  rentalService.getAllRentals.mockResolvedValue({ data: [rental('1', 'Alice'), rental('2', 'Bob')], pagination: { total: 2 } });
  rentalService.sendReminderForMonth.mockResolvedValue({ success: true });
  const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
  render(<RentalDuesView status="Overdue" onPaymentUpdated={jest.fn()} />);
  await screen.findByText('Bob');
  fireEvent.click(screen.getByRole('button', { name: 'Bob' }));
  const dialog = await screen.findByRole('dialog');
  fireEvent.click(within(dialog).getByText('Email Reminder'));
  await within(dialog).findByText('Reminder sent to shared@example.com for Bob.');
  await waitFor(() => expect(rentalService.sendReminderForMonth).toHaveBeenCalledWith('2', 'payment-2'));
  expect(confirm).toHaveBeenCalledWith(expect.stringContaining('shared@example.com'));
  confirm.mockRestore();
});

test('shows failed saves and keeps the unpaid record available', async () => {
  rentalService.getAllRentals.mockResolvedValue({ data: [rental('1', 'Alice')], pagination: { total: 1 } });
  rentalService.updatePaymentRecord.mockRejectedValue(new Error('Payment could not be saved'));
  const updated = jest.fn();
  render(<RentalDuesView status="Overdue" onPaymentUpdated={updated} />);
  await screen.findByText('Alice');
  fireEvent.click(screen.getByRole('button', { name: 'Alice' }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByText('Mark Paid'));
  fireEvent.click(screen.getByText('Confirm Paid'));
  await screen.findAllByText('Payment could not be saved');
  expect(updated).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Alice' })).toBeTruthy();
});

test('customer popup shows each month, amounts and history without merging shared emails', async () => {
  const alice = rental('1', 'Alice');
  alice.payment_records.push(
    { _id: 'feb', status: 'Overdue', amount: 700, month: '2026-02', dueDate: '2026-02-10' },
    { _id: 'mar', status: 'Pending', amount: 800, month: '2026-03' },
    { _id: 'dec', status: 'Paid', amount: 400, month: '2025-12' }
  );
  rentalService.getAllRentals.mockResolvedValue({ data: [alice, rental('2', 'Bob')], pagination: { total: 2 } });
  render(<RentalDuesView status="Overdue" onPaymentUpdated={jest.fn()} />);
  await screen.findByRole('button', { name: 'Alice' });
  expect(screen.getAllByText('View Account')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Alice' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('January 2026')).toBeTruthy();
  expect(within(dialog).getByText('February 2026')).toBeTruthy();
  expect(within(dialog).getByText('December 2025')).toBeTruthy();
  expect(within(dialog).getByText('₹1,200')).toBeTruthy();
  expect(within(dialog).queryByText('Bob')).toBeNull();
});

test('edits one monthly amount and updates the account total', async () => {
  rentalService.getAllRentals.mockResolvedValue({ data: [rental('1', 'Alice')], pagination: { total: 1 } });
  rentalService.updatePaymentRecord.mockResolvedValue({ success: true });
  render(<RentalDuesView status="Overdue" onPaymentUpdated={jest.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Alice' }));
  fireEvent.click(within(await screen.findByRole('dialog')).getByText('Edit Payment'));
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '650' } });
  fireEvent.click(screen.getByText('Save Payment'));
  await screen.findAllByText('Payment recorded for Alice, 2026-01.', { selector: 'p' });
  expect(rentalService.updatePaymentRecord).toHaveBeenCalledWith('1', 'payment-1', expect.objectContaining({ amount: 650, status: 'Overdue' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('₹650', { selector: 'p' })).toBeTruthy();
});
