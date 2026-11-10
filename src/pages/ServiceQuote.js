import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { contactService } from '../services/contactService';
import { setPageMetadata } from '../utils/pageMetadata';
import { trackLead } from '../utils/leadTracking';

const services = {
  painting: ['Painting', 'Tell us the rooms, approximate area, surface condition and preferred finish.'],
  cleaning: ['Home Cleaning', 'Tell us your home size, locality and the areas that need cleaning.'],
  plumbing: ['Plumbing', 'Describe the leak, fitting or plumbing work and your locality.'],
  'home-maintenance': ['Home Maintenance', 'Share your repairs, maintenance needs and preferred appointment.'],
  carpentry: ['Carpentry', 'Describe the furniture, doors, fittings or woodwork you need help with.'],
  'moving-packing': ['Moving & Packing', 'Share pickup and destination localities, your move date and items to move.'],
  'appliance-services': ['Appliance Services', 'Share the appliance type, model and the issue you are experiencing.']
};

export default function ServiceQuote() {
  const { service } = useParams();
  const details = services[service];
  const [form, setForm] = useState({ fullname: '', email: '', phonenumber: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (details) setPageMetadata({ title: `${details[0]} in Bengaluru | Request a Quote | BrokerIn`, description: `${details[0]} enquiries in Bengaluru. Share your requirements with BrokerIn to confirm the scope, appointment and quote.` });
  }, [details]);
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await contactService.submitContact({ ...form, subject: `Service quote: ${details[0]}` });
      setSuccess(true); trackLead('service_quote', { service });
    } catch (err) { setError(err.message || 'Your enquiry could not be sent. Please try again.'); }
    finally { setBusy(false); }
  };
  if (!details) return <div className="brand-container pt-28 pb-16"><h1>Service not found</h1><Link to="/services">Browse home services</Link></div>;
  return <div className="brand-container pt-28 pb-16">
    <Link className="brand-text-link" to="/services">← All home services</Link>
    <div className="grid lg:grid-cols-2 gap-10 mt-5">
      <div><p className="brand-eyebrow">BROKERIN · BENGALURU</p><h1 className="text-4xl font-semibold mb-5">{details[0]}</h1><p className="text-gray-600 leading-relaxed mb-6">{details[1]}</p><h2 className="mb-4">Request a considered quote.</h2><p className="text-gray-600 leading-relaxed">Our team will review your requirements with you. Confirm the work, materials, availability, charges and cancellation terms before booking.</p><div className="border-t mt-6 pt-5"><p className="text-sm text-gray-600">Submitting a quote request does not confirm an appointment or take a payment.</p></div></div>
      <form onSubmit={submit} className="border rounded-lg p-6 bg-white">
        <h2 className="mb-6">Your requirements</h2>
        {success ? <p role="status">Your enquiry has been sent. Our team will contact you using the details provided.</p> : <>
          {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
          <fieldset disabled={busy} className="space-y-4">{[['fullname', 'Name', 'text'], ['email', 'Email', 'email'], ['phonenumber', 'Phone', 'tel']].map(([key,label,type]) => <label className="block text-sm" key={key}>{label}<input required type={type} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} className="block w-full border rounded p-3 mt-1" /></label>)}
          <label className="block text-sm">Locality and requirements<textarea required rows={5} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className="block w-full border rounded p-3 mt-1" /></label><button className="brand-button" disabled={busy}>{busy ? 'Sending...' : 'Request a quote'}</button></fieldset>
        </>}
      </form>
    </div>
  </div>;
}
