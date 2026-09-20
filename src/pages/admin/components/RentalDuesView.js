import { useCallback, useEffect, useState } from 'react';
import { rentalService } from '../../../services/rentalService';

export const getDueRows = (rentals, status, search = '') => {
  const query = search.trim().toLowerCase();
  return rentals.filter(rental => rental.order_source !== 'cart').flatMap(rental => {
    const matches = [rental.customer_name, rental.customer_email, rental.customer_phone, rental.rental_id]
      .some(value => String(value || '').toLowerCase().includes(query));
    if (!matches) return [];
    return (rental.payment_records || [])
      .filter(payment => payment.status === status)
      .map(payment => ({ rental, payment }));
  }).sort((a, b) => new Date(a.payment.dueDate || 0) - new Date(b.payment.dueDate || 0));
};

function RentalDuesView({ status, onPaymentUpdated }) {
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [selected, setSelected] = useState(null);
  const [paidDate, setPaidDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const loadRentals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const all = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await rentalService.getAllRentals({
          page, limit: 100, exclude_order_source: 'cart', sortBy: '_id', sortOrder: 'asc'
        });
        all.push(...(response.data || []));
        totalPages = Math.ceil((response.pagination?.total || 0) / 100);
        page += 1;
      } while (page <= totalPages);
      setRentals(all);
    } catch (err) {
      setRentals([]);
      setError(err.message || 'Unable to load dues. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRentals(); }, [loadRentals]);

  const rows = getDueRows(rentals, status, search);
  const total = rows.reduce((sum, { payment }) => sum + Number(payment.amount || 0), 0);
  const customerCount = new Set(rows.map(({ rental }) => rental._id)).size;

  const sendReminder = async ({ rental, payment }) => {
    if (!window.confirm(`Send a reminder for ${rental.customer_name}, rental ${rental.rental_id}, ${payment.month}, to ${rental.customer_email}?`)) return;
    setBusy(payment._id);
    setError('');
    setMessage('');
    try {
      await rentalService.sendReminderForMonth(rental._id, payment._id);
      setMessage(`Reminder sent to ${rental.customer_email} for ${rental.customer_name}.`);
    } catch (err) {
      setError(err.message || 'Unable to send reminder.');
    } finally {
      setBusy('');
    }
  };

  const markPaid = async event => {
    event.preventDefault();
    const { rental, payment } = selected;
    setBusy(payment._id);
    setError('');
    setMessage('');
    try {
      await rentalService.updatePaymentRecord(rental._id, payment._id, {
        status: 'Paid', paidDate, paymentMethod
      });
      setRentals(previous => previous.map(item => item._id === rental._id ? {
        ...item,
        payment_records: item.payment_records.map(record => record._id === payment._id
          ? { ...record, status: 'Paid', paidDate, paymentMethod } : record)
      } : item));
      setSelected(null);
      setMessage(`Payment recorded for ${rental.customer_name}, ${payment.month}.`);
      onPaymentUpdated();
    } catch (err) {
      setError(err.message || 'Unable to update payment.');
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="mt-6" aria-label={`${status} dues`}>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">{status} Dues</h2>
          {!loading && !error && <p className="text-sm text-gray-600">{customerCount} rental accounts · {rows.length} payments · ₹{total.toLocaleString()}</p>}
        </div>
        <button onClick={loadRentals} disabled={loading || !!busy} className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50">Refresh</button>
      </div>
      <input aria-label="Search customers with dues" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search customer, phone, email or rental ID" className="w-full rounded-lg border border-gray-300 px-4 py-3 mb-4" />
      {error && <p role="alert" className="p-3 mb-4 bg-red-50 text-red-800">{error}</p>}
      {message && <p role="status" className="p-3 mb-4 bg-green-50 text-green-800">{message}</p>}
      {loading ? <p role="status" className="py-8">Loading all rental dues...</p> : (
        <div className="overflow-x-auto bg-white border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100"><tr>{['Customer / Rental', 'Contact', 'Month / Due Date', 'Amount', 'Actions'].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead>
            <tbody>
              {rows.map(row => {
                const { rental, payment } = row;
                return <tr key={`${rental._id}-${payment._id}`} className="border-t">
                  <td className="p-4"><div className="font-semibold">{rental.customer_name}</div><div className="text-gray-600">{rental.rental_id || rental._id}</div></td>
                  <td className="p-4"><div>{rental.customer_phone || '-'}</div><div className="break-all">{rental.customer_email || '-'}</div></td>
                  <td className="p-4"><div>{payment.month}</div><div>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}</div></td>
                  <td className="p-4 font-bold whitespace-nowrap">₹{Number(payment.amount || 0).toLocaleString()}</td>
                  <td className="p-4"><div className="flex flex-wrap gap-2">
                    <button disabled={!!busy || !rental.customer_email} onClick={() => sendReminder(row)} className="px-3 py-2 border rounded-lg text-blue-700 disabled:opacity-50">Email Reminder</button>
                    <button disabled={!!busy} onClick={() => {
                      setSelected(row);
                      const now = new Date();
                      setPaidDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
                      setPaymentMethod('Cash');
                    }} className="px-3 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50">Mark Paid</button>
                  </div></td>
                </tr>;
              })}
              {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-gray-600">No {status.toLowerCase()} payments found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {selected && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <form onSubmit={markPaid} role="dialog" aria-modal="true" aria-labelledby="mark-paid-title" className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 id="mark-paid-title" className="text-xl font-bold mb-3">Record Payment</h3>
          <p className="mb-4">{selected.rental.customer_name} · {selected.rental.rental_id} · {selected.payment.month}<br />₹{Number(selected.payment.amount).toLocaleString()}</p>
          {error && <p role="alert" className="text-red-700 mb-3">{error}</p>}
          <label className="block mb-4">Paid Date<input required type="date" value={paidDate} onChange={event => setPaidDate(event.target.value)} className="block w-full border rounded-lg p-2 mt-1" /></label>
          <label className="block mb-4">Payment Method<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="block w-full border rounded-lg p-2 mt-1">{['Cash', 'Bank Transfer', 'UPI', 'Card', 'Other'].map(method => <option key={method}>{method}</option>)}</select></label>
          <div className="flex justify-end gap-3"><button type="button" disabled={!!busy} onClick={() => setSelected(null)} className="border rounded-lg px-4 py-2">Cancel</button><button disabled={!!busy} className="bg-green-700 text-white rounded-lg px-4 py-2 disabled:opacity-50">{busy ? 'Saving...' : 'Confirm Paid'}</button></div>
        </form>
      </div>}
    </section>
  );
}

export default RentalDuesView;
