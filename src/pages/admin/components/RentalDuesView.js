import { useCallback, useEffect, useState } from 'react';
import { rentalService } from '../../../services/rentalService';
import { Dialog } from '@headlessui/react';

const formatMonth = month => {
  if (!/^\d{4}-\d{2}$/.test(month || '')) return month || '-';
  const [year, number] = month.split('-').map(Number);
  return new Date(year, number - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

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
  const [profileId, setProfileId] = useState(null);
  const [paidDate, setPaidDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [notes, setNotes] = useState('');

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
  const accounts = Array.from(rows.reduce((groups, row) => {
    const key = row.rental._id;
    if (!groups.has(key)) groups.set(key, { rental: row.rental, payments: [], total: 0 });
    const account = groups.get(key);
    account.payments.push(row.payment);
    account.total += Number(row.payment.amount || 0);
    return groups;
  }, new Map()).values());
  const profile = rentals.find(rental => rental._id === profileId);
  const profilePayments = [...(profile?.payment_records || [])].sort((a, b) => String(a.month).localeCompare(String(b.month)));
  const profileTotal = state => profilePayments.filter(payment => payment.status === state).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const openPayment = (rental, payment, editing = false) => {
    setError('');
    setSelected({ rental, payment, editing });
    const now = new Date();
    setPaidDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    setPaymentMethod(payment.paymentMethod || 'Cash');
    setPaymentAmount(String(payment.amount));
    setDueDate(payment.dueDate ? payment.dueDate.slice(0, 10) : '');
    setPaymentStatus(editing ? payment.status : 'Paid');
    setNotes(payment.notes || '');
  };

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
      const changes = {
        status: paymentStatus,
        paidDate: paymentStatus === 'Paid' ? paidDate : null,
        paymentMethod,
        ...(selected.editing ? { amount: Number(paymentAmount), dueDate, notes } : {})
      };
      await rentalService.updatePaymentRecord(rental._id, payment._id, changes);
      setRentals(previous => previous.map(item => item._id === rental._id ? {
        ...item,
        payment_records: item.payment_records.map(record => record._id === payment._id
          ? { ...record, ...changes } : record)
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
            <thead className="bg-gray-100"><tr>{['Customer / Rental', 'Contact', `${status} Months`, 'Total Amount', 'Details'].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead>
            <tbody>
              {accounts.map(({ rental, payments, total: accountTotal }) => {
                return <tr key={rental._id} className="border-t">
                  <td className="p-4"><button onClick={() => setProfileId(rental._id)} className="font-semibold text-blue-700 underline">{rental.customer_name}</button><div className="text-gray-600">{rental.rental_id || rental._id}</div></td>
                  <td className="p-4"><div>{rental.customer_phone || '-'}</div><div className="break-all">{rental.customer_email || '-'}</div></td>
                  <td className="p-4">{payments.map(payment => <div key={payment._id}>{formatMonth(payment.month)}: ₹{Number(payment.amount || 0).toLocaleString()}</div>)}</td>
                  <td className="p-4 font-bold whitespace-nowrap">₹{accountTotal.toLocaleString()}</td>
                  <td className="p-4"><button onClick={() => setProfileId(rental._id)} className="px-3 py-2 border rounded-lg text-blue-700">View Account</button></td>
                </tr>;
              })}
              {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-gray-600">No {status.toLowerCase()} payments found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!profile && !selected} onClose={() => { if (!busy) setProfileId(null); }} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto p-4 flex items-start justify-center">
          <Dialog.Panel className="my-6 w-full max-w-5xl rounded-lg bg-white p-5 sm:p-8">
            <div className="flex justify-between items-start gap-4">
              <div><Dialog.Title className="text-2xl font-bold">{profile?.customer_name}</Dialog.Title><p className="text-gray-600">{profile?.rental_id} · {profile?.customer_phone}</p><p className="break-all text-gray-600">{profile?.customer_email}</p></div>
              <button disabled={!!busy} onClick={() => setProfileId(null)} className="border rounded-lg px-3 py-2">Close</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b mb-5">
              {['Overdue', 'Pending', 'Paid'].map(state => <div key={state}><p className="text-sm text-gray-600">{state}</p><p className={`text-2xl font-bold ${state === 'Overdue' ? 'text-red-700' : 'text-gray-900'}`}>₹{profileTotal(state).toLocaleString()}</p></div>)}
            </div>
            {!!profile?.items?.length && <p className="mb-5 text-gray-600">{profile.items.map(item => `${item.product_name} (${item.quantity || 1})`).join(', ')}</p>}
            {error && <p role="alert" className="mb-3 text-red-700">{error}</p>}
            {message && <p role="status" className="mb-3 text-green-700">{message}</p>}
            <h3 className="font-bold text-lg mb-3">Monthly Payment History</h3>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm">
              <thead className="bg-gray-100"><tr>{['Month', 'Amount', 'Due Date', 'Status', 'Payment / Actions'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
              <tbody>{profilePayments.map(payment => <tr key={payment._id} className="border-b">
                <td className="p-3 whitespace-nowrap">{formatMonth(payment.month)}</td>
                <td className="p-3 font-semibold">₹{Number(payment.amount || 0).toLocaleString()}</td>
                <td className="p-3 whitespace-nowrap">{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}</td>
                <td className={`p-3 font-semibold ${payment.status === 'Overdue' ? 'text-red-700' : payment.status === 'Paid' ? 'text-green-700' : 'text-gray-700'}`}>{payment.status}</td>
                <td className="p-3">{payment.status === 'Paid' ? <span>{payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : ''} {payment.paymentMethod}</span> : <div className="flex flex-wrap gap-2">
                  <button disabled={!!busy || !profile?.customer_email} onClick={() => sendReminder({ rental: profile, payment })} className="border rounded-lg px-3 py-2 text-blue-700 disabled:opacity-50">Email Reminder</button>
                  <button disabled={!!busy} onClick={() => openPayment(profile, payment)} className="bg-green-700 text-white rounded-lg px-3 py-2 disabled:opacity-50">Mark Paid</button>
                  <button disabled={!!busy} onClick={() => openPayment(profile, payment, true)} className="border rounded-lg px-3 py-2 disabled:opacity-50">Edit Payment</button>
                </div>}</td>
              </tr>)}</tbody>
            </table></div>
          </Dialog.Panel>
        </div>
      </Dialog>
      {selected && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <form onSubmit={markPaid} role="dialog" aria-modal="true" aria-labelledby="mark-paid-title" className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 id="mark-paid-title" className="text-xl font-bold mb-3">{selected.editing ? 'Edit Payment' : 'Record Payment'}</h3>
          <p className="mb-4">{selected.rental.customer_name} · {selected.rental.rental_id} · {formatMonth(selected.payment.month)}<br />₹{Number(selected.payment.amount).toLocaleString()}</p>
          {error && <p role="alert" className="text-red-700 mb-3">{error}</p>}
          {selected.editing && <>
            <label className="block mb-4">Amount<input required type="number" min="0" step="0.01" value={paymentAmount} onChange={event => setPaymentAmount(event.target.value)} className="block w-full border rounded-lg p-2 mt-1" /></label>
            <label className="block mb-4">Due Date<input required type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} className="block w-full border rounded-lg p-2 mt-1" /></label>
            <label className="block mb-4">Status<select value={paymentStatus} onChange={event => setPaymentStatus(event.target.value)} className="block w-full border rounded-lg p-2 mt-1">{['Pending', 'Overdue', 'Paid', 'Partial'].map(state => <option key={state}>{state}</option>)}</select></label>
            <label className="block mb-4">Notes<textarea value={notes} onChange={event => setNotes(event.target.value)} className="block w-full border rounded-lg p-2 mt-1" /></label>
          </>}
          {paymentStatus === 'Paid' && <label className="block mb-4">Paid Date<input required type="date" value={paidDate} onChange={event => setPaidDate(event.target.value)} className="block w-full border rounded-lg p-2 mt-1" /></label>}
          <label className="block mb-4">Payment Method<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="block w-full border rounded-lg p-2 mt-1">{['Cash', 'Bank Transfer', 'UPI', 'Card', 'Other'].map(method => <option key={method}>{method}</option>)}</select></label>
          <div className="flex justify-end gap-3"><button type="button" disabled={!!busy} onClick={() => setSelected(null)} className="border rounded-lg px-4 py-2">Cancel</button><button disabled={!!busy} className="bg-green-700 text-white rounded-lg px-4 py-2 disabled:opacity-50">{busy ? 'Saving...' : selected.editing ? 'Save Payment' : 'Confirm Paid'}</button></div>
        </form>
      </div>}
    </section>
  );
}

export default RentalDuesView;
