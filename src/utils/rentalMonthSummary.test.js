import { currentRentalMonth, rentalMonthSummary } from './rentalMonthSummary';

test('separates rent month from collection date without merging shared emails', () => {
  const data = [{ customer_email: 'same@test.com', payment_records: [
    { month: '2026-10', status: 'Paid', amount: 100, paidDate: '2026-10-05' },
    { month: '2026-10', status: 'Pending', amount: 200 },
    { month: '2026-09', status: 'Paid', amount: 75, paidDate: '2026-10-01' },
    { month: '2026-11', status: 'Pending', amount: 800 }
  ] }, { customer_email: 'same@test.com', payment_records: [
    { month: '2026-10', status: 'Overdue', amount: 300 }
  ] }, { order_source: 'cart', payment_records: [{ month: '2026-10', status: 'Paid', amount: 999 }] }];
  expect(rentalMonthSummary(data, '2026-10')).toMatchObject({ total: 600, Paid: 100, Pending: 200, Overdue: 300, remaining: 500, received: 175, records: 3 });
});

test('flags partial payments rather than inventing the amount received', () => {
  expect(rentalMonthSummary([{ payment_records: [{ month: '2026-10', status: 'Partial', amount: 500 }] }], '2026-10'))
    .toMatchObject({ total: 500, Partial: 500, Paid: 0, remaining: 0 });
});

test('uses Nepal month boundaries and returns zero for an empty month', () => {
  expect(currentRentalMonth(new Date('2026-09-30T18:30:00Z'))).toBe('2026-10');
  expect(rentalMonthSummary([], '2026-10').total).toBe(0);
});
