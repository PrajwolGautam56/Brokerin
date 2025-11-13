function PaymentStatusBadge({ status, totalAmount, totalPaid, remainingAmount }) {
  const statusConfig = {
    'Pending': { color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Partial': { color: 'orange', bg: 'bg-orange-100', text: 'text-orange-800' },
    'Paid': { color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
    'Refunded': { color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
    'Failed': { color: 'red', bg: 'bg-red-100', text: 'text-red-800' }
  };

  const config = statusConfig[status] || statusConfig['Pending'];

  return (
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {status || 'Pending'}
      </span>
      {status === 'Partial' && (
        <span className="text-xs text-gray-600">
          ₹{totalPaid?.toLocaleString() || 0} / ₹{totalAmount?.toLocaleString() || 0}
        </span>
      )}
      {remainingAmount > 0 && (
        <span className="text-xs text-red-600 font-medium">
          ₹{remainingAmount.toLocaleString()} remaining
        </span>
      )}
    </div>
  );
}

export default PaymentStatusBadge;

