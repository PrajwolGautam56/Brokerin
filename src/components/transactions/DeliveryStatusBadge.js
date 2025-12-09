function DeliveryStatusBadge({ status }) {
  const statusConfig = {
    'Pending': { color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800' },
    'Confirmed': { color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
    'Preparing': { color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Out for Delivery': { color: 'orange', bg: 'bg-orange-100', text: 'text-orange-800' },
    'Delivered': { color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
    'Cancelled': { color: 'red', bg: 'bg-red-100', text: 'text-red-800' }
  };

  const config = statusConfig[status] || statusConfig['Pending'];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {status || 'Pending'}
    </span>
  );
}

export default DeliveryStatusBadge;

