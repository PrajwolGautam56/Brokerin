export const currentRentalMonth = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit' }).formatToParts(now);
  return `${parts.find(part => part.type === 'year').value}-${parts.find(part => part.type === 'month').value}`;
};

export const rentalMonthSummary = (rentals, month) => {
  const summary = { total: 0, Paid: 0, Pending: 0, Overdue: 0, Partial: 0, remaining: 0, received: 0, records: 0, unknown: 0 };
  for (const rental of rentals) {
    if (rental.order_source === 'cart') continue;
    for (const payment of rental.payment_records || []) {
      const amount = Number(payment.amount) || 0;
      if (payment.status === 'Paid' && payment.paidDate && currentRentalMonth(new Date(payment.paidDate)) === month) summary.received += amount;
      if (payment.month !== month) continue;
      summary.records += 1;
      summary.total += amount;
      if (['Paid', 'Pending', 'Overdue', 'Partial'].includes(payment.status)) summary[payment.status] += amount;
      else summary.unknown += amount;
    }
  }
  summary.remaining = summary.Pending + summary.Overdue;
  return summary;
};
