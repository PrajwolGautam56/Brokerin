import { useCallback, useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import api from '../../axiosConfig';

const emptyEmployee = () => ({ fullName: '', email: '', phoneNumber: '', password: '', employeeActive: true, permissions: ['properties.view', 'rentals.view'] });
const labels = { view: 'View', create: 'Add', update: 'Edit / Update', delete: 'Delete', send: 'Send' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [staff, permissions] = await Promise.all([api.get('/api/admin/employees'), api.get('/api/admin/employee-permissions')]);
      setEmployees(staff.data.data);
      setGroups(permissions.data.data);
    } catch (err) { setError(err.response?.data?.message || 'Unable to load employees.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = (key, checked) => setForm(previous => {
    const selected = new Set(previous.permissions);
    if (checked) {
      selected.add(key);
      const section = key.split('.')[0];
      if (groups.find(group => group.key === section)?.actions.includes('view')) selected.add(`${section}.view`);
      if (['payments.update', 'reminders.send'].includes(key)) selected.add('rentals.view');
    } else {
      selected.delete(key);
      if (key.endsWith('.view')) for (const permission of selected) if (permission.startsWith(key.split('.')[0] + '.')) selected.delete(permission);
      if (key === 'rentals.view') { selected.delete('payments.update'); selected.delete('reminders.send'); }
    }
    return { ...previous, permissions: [...selected] };
  });
  const save = async event => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const payload = { fullName: form.fullName, email: form.email, phoneNumber: form.phoneNumber, password: form.password, permissions: form.permissions, employeeActive: form.employeeActive };
      if (form._id) await api.put(`/api/admin/employees/${form._id}`, payload);
      else await api.post('/api/admin/employees', payload);
      setForm(null); setMessage('Employee access saved.'); await load();
    } catch (err) { setError(err.response?.data?.message || 'Unable to save employee.'); }
    finally { setSaving(false); }
  };
  return <div className="max-w-6xl mx-auto py-6">
    <div className="flex flex-wrap justify-between gap-4 mb-6"><h1 className="text-2xl font-bold">Employees & Permissions</h1><button disabled={loading} onClick={() => { setError(''); setForm(emptyEmployee()); }} className="rounded-lg bg-gray-900 text-white px-4 py-2 disabled:opacity-50">Add Employee</button></div>
    {error && !form && <p role="alert" className="text-red-700 mb-4">{error} <button onClick={load} className="underline">Retry</button></p>}
    {message && <p role="status" className="text-green-700 mb-4">{message}</p>}
    {loading ? <p>Loading employees...</p> : <div className="overflow-x-auto border rounded-lg bg-white"><table className="w-full text-sm text-left"><thead className="bg-gray-100"><tr>{['Employee', 'Contact', 'Access', 'Status', 'Actions'].map(label => <th className="p-4" key={label}>{label}</th>)}</tr></thead><tbody>{employees.map(employee => <tr key={employee._id} className="border-t">
      <td className="p-4 font-semibold">{employee.fullName}</td><td className="p-4"><div>{employee.email}</div><div>{employee.phoneNumber}</div></td><td className="p-4">{employee.permissions.length} permissions</td><td className="p-4">{employee.employeeActive === false ? 'Inactive' : 'Active'}</td><td className="p-4"><button className="text-blue-700 underline" onClick={() => { setError(''); setForm({ ...employee, password: '' }); }}>Edit Access</button></td>
    </tr>)}{!employees.length && <tr><td className="p-6 text-center" colSpan={5}>No employees added.</td></tr>}</tbody></table></div>}
    <Dialog open={!!form} onClose={() => { if (!saving) setForm(null); }} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" /><div className="fixed inset-0 overflow-y-auto p-4"><Dialog.Panel className="my-6 mx-auto max-w-3xl bg-white p-6 rounded-lg">
        <Dialog.Title className="text-xl font-bold mb-5">{form?._id ? 'Edit Employee Access' : 'Add Employee'}</Dialog.Title>
        {form && <form onSubmit={save}>
          {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
          <fieldset disabled={saving}>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">{[['fullName', 'Name', 'text'], ['email', 'Login Email', 'email'], ['phoneNumber', 'Phone', 'tel'], ['password', form._id ? 'New Password (optional)' : 'Password', 'password']].map(([key, label, type]) => <label className="text-sm font-semibold" key={key}>{label}<input type={type} required={key !== 'password' || !form._id} minLength={key === 'password' ? 12 : undefined} autoComplete={key === 'password' ? 'new-password' : 'off'} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} className="block mt-1 w-full border rounded-lg p-2" /></label>)}</div>
          <label className="flex gap-2 items-center mb-6"><input type="checkbox" checked={form.employeeActive} onChange={event => setForm({ ...form, employeeActive: event.target.checked })} />Employee Active</label>
          <h3 className="font-bold mb-3">Permissions</h3>
          <div className="flex flex-wrap gap-3 mb-4"><button type="button" onClick={() => setForm({ ...form, permissions: ['properties.view', 'rentals.view'] })} className="border rounded-lg px-3 py-2 text-sm">Property & Rental View Only</button><button type="button" onClick={() => setForm({ ...form, permissions: ['properties.view', 'properties.create', 'properties.update', 'properties.delete', 'rentals.view', 'rentals.create', 'rentals.update'] })} className="border rounded-lg px-3 py-2 text-sm">Property & Rental Management</button><button type="button" onClick={() => setForm({ ...form, permissions: [] })} className="border rounded-lg px-3 py-2 text-sm">Clear All</button></div>
          <div className="divide-y">{groups.map(group => <div key={group.key} className="py-4"><h4 className="font-semibold mb-2">{group.name}</h4><div className="flex flex-wrap gap-x-6 gap-y-3">{group.actions.map(action => { const key = `${group.key}.${action}`; return <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.permissions.includes(key)} onChange={event => toggle(key, event.target.checked)} />{labels[action]}</label>; })}</div></div>)}</div>
          </fieldset><div className="flex justify-end gap-3 border-t pt-4 mt-4"><button type="button" disabled={saving} onClick={() => setForm(null)} className="px-4 py-2 border rounded-lg">Cancel</button><button disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg">{saving ? 'Saving...' : 'Save Employee'}</button></div>
        </form>}
      </Dialog.Panel></div>
    </Dialog>
  </div>;
}
