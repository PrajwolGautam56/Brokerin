import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  PlusIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import logger from '../../utils/logger';

const COMPANY = {
  name: 'Brokerin',
  address: [
    'Udyapalya, Kanakapura main road',
    'South Bengaluru',
    'Karnataka | Zip Code: 560082'
  ],
  phone: '8884704449',
  gst: 'AA2911250647813'
};

const emptyItem = () => ({
  description: '',
  rate: '',
  quantity: 1
});

const getToday = () => new Date().toISOString().slice(0, 10);

const getYearCode = (year) => String(year).slice(-3).padStart(3, '0');

const getLocalNextInvoice = () => {
  const year = new Date().getFullYear();
  const key = `brokerin_invoice_sequence_${year}`;
  const sequence = Number(localStorage.getItem(key) || '101');

  return {
    invoice_number: `${getYearCode(year)}${sequence}`,
    invoice_year: year,
    sequence
  };
};

const saveLocalInvoice = (invoice) => {
  const year = invoice.invoice_year || new Date(invoice.invoice_date).getFullYear();
  const sequence = invoice.sequence || Number(String(invoice.invoice_number).slice(3));
  const key = `brokerin_invoice_sequence_${year}`;
  localStorage.setItem(key, String(sequence + 1));

  const recent = JSON.parse(localStorage.getItem('brokerin_recent_invoices') || '[]');
  localStorage.setItem(
    'brokerin_recent_invoices',
    JSON.stringify([invoice, ...recent].slice(0, 100))
  );
};

const getLocalInvoices = () => JSON.parse(localStorage.getItem('brokerin_recent_invoices') || '[]');

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatRs = (value) => `Rs. ${Math.round(toNumber(value)).toLocaleString('en-IN')}`;

const formatDateForPdf = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB');
};

const loadImageAsDataUrl = async (src) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    logger.warn('Unable to load invoice logo:', error);
    return null;
  }
};

const generateInvoicePdf = async (invoice) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  const logo = await loadImageAsDataUrl('/images/logo.png');

  const drawRoundedRect = (x, y, w, h, radius, style = 'S') => {
    doc.roundedRect(x, y, w, h, radius, radius, style);
  };

  const writeLabelValue = (label, value, x, y, options = {}) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(options.labelSize || 8);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
    doc.setFontSize(options.valueSize || 10);
    doc.setTextColor(15, 23, 42);
    doc.text(value || '-', x, y + 16, options.textOptions || {});
  };

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(109, 40, 217);
  doc.rect(0, 0, pageWidth, 126, 'F');
  doc.setFillColor(255, 167, 38);
  doc.rect(0, 122, pageWidth, 4, 'F');

  doc.setFillColor(255, 255, 255);
  drawRoundedRect(margin, 52, contentWidth, 136, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageWidth - margin, 40, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(237, 233, 254);
  doc.text('Real Estate Brokerage Commission', pageWidth - margin, 56, { align: 'right' });

  if (logo) {
    doc.addImage(logo, 'PNG', margin + 8, 70, 92, 74);
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(27);
  doc.setTextColor(17, 24, 39);
  doc.text(COMPANY.name, logo ? margin + 116 : margin + 22, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  let companyY = 110;
  COMPANY.address.forEach((line) => {
    doc.text(line, logo ? margin + 116 : margin + 22, companyY);
    companyY += 13;
  });
  doc.text(`Phone: ${COMPANY.phone}`, logo ? margin + 116 : margin + 22, companyY);
  doc.setFont('helvetica', 'bold');
  doc.text(`GST IN: ${COMPANY.gst}`, logo ? margin + 116 : margin + 22, companyY + 13);

  doc.setFillColor(245, 243, 255);
  drawRoundedRect(pageWidth - margin - 160, 78, 128, 76, 8, 'F');
  writeLabelValue('Invoice No.', String(invoice.invoice_number), pageWidth - margin - 142, 100, {
    valueSize: 13,
    bold: true
  });
  writeLabelValue('Date', formatDateForPdf(invoice.invoice_date), pageWidth - margin - 142, 132, {
    valueSize: 10
  });

  const cardTop = 218;
  const cardGap = 18;
  const leftCardWidth = 305;
  const rightCardWidth = contentWidth - leftCardWidth - cardGap;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  drawRoundedRect(margin, cardTop, leftCardWidth, 116, 8, 'FD');
  drawRoundedRect(margin + leftCardWidth + cardGap, cardTop, rightCardWidth, 116, 8, 'FD');

  doc.setFillColor(109, 40, 217);
  doc.circle(margin + 18, cardTop + 20, 4, 'F');
  writeLabelValue('Bill To', invoice.client_name, margin + 32, cardTop + 22, {
    valueSize: 12,
    bold: true
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const addressLines = doc.splitTextToSize(invoice.client_address, leftCardWidth - 32);
  doc.text(addressLines.slice(0, 4), margin + 18, cardTop + 58);

  doc.setFillColor(255, 167, 38);
  doc.circle(margin + leftCardWidth + cardGap + 18, cardTop + 20, 4, 'F');
  writeLabelValue('Property', invoice.property_name, margin + leftCardWidth + cardGap + 32, cardTop + 22, {
    valueSize: 12,
    bold: true,
    textOptions: { maxWidth: rightCardWidth - 52 }
  });
  writeLabelValue('Invoice Type', 'Brokerage Commission', margin + leftCardWidth + cardGap + 18, cardTop + 76, {
    valueSize: 10
  });

  const tableTop = 372;
  const colX = {
    no: margin,
    details: margin + 44,
    qty: margin + 282,
    rate: margin + 340,
    amount: margin + 444,
    end: pageWidth - margin
  };

  doc.setFillColor(17, 24, 39);
  drawRoundedRect(margin, tableTop, contentWidth, 34, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('#', colX.no + 18, tableTop + 21);
  doc.text('DETAILS', colX.details, tableTop + 21);
  doc.text('QTY', colX.qty, tableTop + 21);
  doc.text('RATE', colX.rate, tableTop + 21);
  doc.text('AMOUNT', colX.end - 18, tableTop + 21, { align: 'right' });

  let rowY = tableTop + 34;
  invoice.items.forEach((item, index) => {
    const rowHeight = 42;
    doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    doc.rect(margin, rowY, contentWidth, rowHeight, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, rowY + rowHeight, pageWidth - margin, rowY + rowHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1).padStart(2, '0'), colX.no + 16, rowY + 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(item.description, 205), colX.details, rowY + 18);
    doc.text(String(item.quantity || 1), colX.qty + 8, rowY + 25);
    doc.text(formatRs(item.rate), colX.rate, rowY + 25);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRs(item.amount), colX.end - 18, rowY + 25, { align: 'right' });
    rowY += rowHeight;
  });

  doc.setDrawColor(226, 232, 240);
  drawRoundedRect(margin, tableTop, contentWidth, rowY - tableTop, 7, 'S');

  const bottomTop = Math.max(rowY + 28, 560);
  const noteWidth = 300;
  const totalsWidth = 205;
  const totalsX = pageWidth - margin - totalsWidth;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  drawRoundedRect(margin, bottomTop, noteWidth, 126, 8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment Notes', margin + 18, bottomTop + 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const notesText = invoice.notes || 'Please verify the client details and property information before sharing this invoice.';
  doc.text(doc.splitTextToSize(notesText, noteWidth - 36), margin + 18, bottomTop + 46);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('AUTHORIZED SIGNATURE', margin + 18, bottomTop + 104);
  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 148, bottomTop + 102, margin + noteWidth - 18, bottomTop + 102);

  doc.setFillColor(255, 255, 255);
  drawRoundedRect(totalsX, bottomTop, totalsWidth, 126, 8, 'FD');

  const totalRows = [
    ['Total', invoice.subtotal],
    [invoice.other_fees_label || 'Other Fees', invoice.other_fees_amount],
    [`SGST+CGST (${invoice.tax_percent}%)`, invoice.tax_amount]
  ];

  totalRows.forEach(([label, value], index) => {
    const yPos = bottomTop + 25 + index * 24;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(label, totalsX + 16, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatRs(value), totalsX + totalsWidth - 16, yPos, { align: 'right' });
  });

  doc.setFillColor(109, 40, 217);
  drawRoundedRect(totalsX + 10, bottomTop + 84, totalsWidth - 20, 32, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL', totalsX + 20, bottomTop + 105);
  doc.text(formatRs(invoice.grand_total), totalsX + totalsWidth - 20, bottomTop + 105, { align: 'right' });

  doc.setFillColor(17, 24, 39);
  doc.rect(0, pageHeight - 52, pageWidth, 52, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text('Thank you for choosing Brokerin.', margin, pageHeight - 25);
  doc.text('Generated by Brokerin Admin', pageWidth - margin, pageHeight - 25, { align: 'right' });

  doc.save(`Brokerin-Invoice-${invoice.invoice_number}.pdf`);
};

function InvoiceGenerator() {
  const [invoiceMeta, setInvoiceMeta] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usingLocalMode, setUsingLocalMode] = useState(false);
  const [form, setForm] = useState({
    invoice_date: getToday(),
    client_name: '',
    client_address: '',
    property_name: '',
    tax_percent: 18,
    other_fees_label: 'OTHER FEES',
    other_fees_amount: '',
    notes: '',
    items: [
      { description: 'Brokerage Commission', rate: '', quantity: 1 },
      { description: 'Painting and Deep Cleaning', rate: '', quantity: 1 }
    ]
  });

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => {
      return sum + toNumber(item.rate) * toNumber(item.quantity || 1);
    }, 0);
    const taxAmount = Math.round((subtotal * toNumber(form.tax_percent)) / 100);
    const otherFeesAmount = toNumber(form.other_fees_amount);

    return {
      subtotal,
      taxAmount,
      otherFeesAmount,
      grandTotal: subtotal + taxAmount + otherFeesAmount
    };
  }, [form]);

  const fetchInvoiceData = async () => {
    try {
      setLoadingMeta(true);
      setError('');
      const [nextNumberResponse, invoicesResponse] = await Promise.all([
        adminService.getNextInvoiceNumber(),
        adminService.getInvoices()
      ]);
      setInvoiceMeta(nextNumberResponse.data);
      setRecentInvoices(invoicesResponse.data || []);
      setUsingLocalMode(false);
    } catch (err) {
      logger.warn('Using local invoice mode:', err);
      setInvoiceMeta(getLocalNextInvoice());
      setRecentInvoices(getLocalInvoices());
      setUsingLocalMode(true);
      setError('Using local invoice numbering because the admin API is not available for this login.');
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }));
  };

  const addItem = () => {
    setForm((current) => ({ ...current, items: [...current.items, emptyItem()] }));
  };

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.length === 1
        ? current.items
        : current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const buildPayload = () => ({
    invoice_date: form.invoice_date,
    client_name: form.client_name.trim(),
    client_address: form.client_address.trim(),
    property_name: form.property_name.trim(),
    tax_percent: toNumber(form.tax_percent),
    other_fees_label: form.other_fees_label.trim(),
    other_fees_amount: toNumber(form.other_fees_amount),
    notes: form.notes.trim(),
    items: form.items.map((item) => ({
      description: item.description.trim(),
      rate: toNumber(item.rate),
      quantity: toNumber(item.quantity || 1)
    }))
  });

  const createLocalInvoice = (payload) => {
    const meta = invoiceMeta || getLocalNextInvoice();
    const items = payload.items
      .filter((item) => item.description && item.rate > 0)
      .map((item) => ({
        ...item,
        amount: item.rate * item.quantity
      }));

    return {
      ...payload,
      ...meta,
      items,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      other_fees_amount: totals.otherFeesAmount,
      grand_total: totals.grandTotal,
      createdAt: new Date().toISOString()
    };
  };

  const handleDownloadExisting = async (invoice) => {
    try {
      setError('');
      await generateInvoicePdf(invoice);
    } catch (err) {
      const message = err.message || 'Failed to download invoice';
      setError(message);
    }
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = buildPayload();
      let invoice;

      if (usingLocalMode) {
        invoice = createLocalInvoice(payload);
        saveLocalInvoice(invoice);
      } else {
        const response = await adminService.createInvoice(payload);
        invoice = response.data;
      }

      await generateInvoicePdf(invoice);
      setForm((current) => ({
        ...current,
        client_name: '',
        client_address: '',
        property_name: '',
        other_fees_amount: '',
        notes: '',
        items: [
          { description: 'Brokerage Commission', rate: '', quantity: 1 },
          { description: 'Painting and Deep Cleaning', rate: '', quantity: 1 }
        ]
      }));
      await fetchInvoiceData();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to generate invoice';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Generator</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create Brokerin commission invoices with automatic totals, GST, and sequential bill numbers.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchInvoiceData}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowPathIcon className="mr-2 h-4 w-4" />
          Refresh Number
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={handleGenerate} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Invoice No.</label>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                {loadingMeta ? 'Loading...' : invoiceMeta?.invoice_number}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Invoice Date</label>
              <input
                type="date"
                value={form.invoice_date}
                onChange={(event) => updateForm('invoice_date', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">GST %</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.tax_percent}
                onChange={(event) => updateForm('tax_percent', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Client Name</label>
              <input
                type="text"
                value={form.client_name}
                onChange={(event) => updateForm('client_name', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="Sriram Nayak"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Property</label>
              <input
                type="text"
                value={form.property_name}
                onChange={(event) => updateForm('property_name', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="Brigade Meadows B5612"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Client Address</label>
              <textarea
                value={form.client_address}
                onChange={(event) => updateForm('client_address', event.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="#B-5612, Brigade Meadows, Kanakapura main road..."
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Invoice Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center rounded-md bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
              >
                <PlusIcon className="mr-1 h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-[minmax(0,1fr)_120px_90px_44px]">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Details</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(event) => updateItem(index, 'description', event.target.value)}
                      className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                      placeholder="Brokerage Commission"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Rate</label>
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(event) => updateItem(index, 'rate', event.target.value)}
                      className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                      placeholder="31000"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                      className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                    aria-label="Remove item"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Other Fees Label</label>
              <input
                type="text"
                value={form.other_fees_label}
                onChange={(event) => updateForm('other_fees_label', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Other Fees Amount</label>
              <input
                type="number"
                min="0"
                value={form.other_fees_amount}
                onChange={(event) => updateForm('other_fees_amount', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || loadingMeta}
            className="inline-flex w-full items-center justify-center rounded-md bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-violet-300 md:w-auto"
          >
            <DocumentArrowDownIcon className="mr-2 h-5 w-5" />
            {saving ? 'Generating...' : 'Generate and Download PDF'}
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Live Total</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Total</dt>
                <dd className="font-medium text-gray-900">{formatRs(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">SGST+CGST ({toNumber(form.tax_percent)}%)</dt>
                <dd className="font-medium text-gray-900">{formatRs(totals.taxAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">{form.other_fees_label || 'Other Fees'}</dt>
                <dd className="font-medium text-gray-900">{formatRs(totals.otherFeesAmount)}</dd>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-base">
                  <dt className="font-semibold text-gray-900">Subtotal</dt>
                  <dd className="font-bold text-violet-700">{formatRs(totals.grandTotal)}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">Saved Invoices</h2>
              <p className="mt-1 text-xs text-gray-500">
                Previous invoices are kept here and can be downloaded again.
              </p>
            </div>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-500">No invoices generated yet.</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.slice(0, 12).map((invoice) => (
                  <div key={invoice._id || invoice.invoice_number} className="rounded-md border border-gray-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">#{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-600">{invoice.client_name}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatRs(invoice.grand_total)}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-500">{formatDateForPdf(invoice.invoice_date)}</p>
                      <button
                        type="button"
                        onClick={() => handleDownloadExisting(invoice)}
                        className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50"
                      >
                        <DocumentArrowDownIcon className="mr-1 h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceGenerator;
