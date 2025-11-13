import { useState } from 'react';
import { paymentService } from '../../services/paymentService';
import RazorpayButton from './RazorpayButton';
import { CalendarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

function MonthlyPaymentCard({ payment, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  const handlePayNow = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.createMonthlyPaymentOrder(
        payment.rental_id,
        payment._id || payment.id,
        payment.amount
      );
      setOrderData(response);
    } catch (err) {
      setError(err.message || 'Failed to create payment order');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (verifyResponse) => {
    setLoading(false);
    setOrderData(null);
    onPaymentSuccess?.(verifyResponse);
  };

  const handlePaymentError = (error) => {
    setLoading(false);
    setError(error.message || 'Payment failed');
    setOrderData(null);
  };

  const isOverdue = new Date(payment.due_date) < new Date();
  const daysOverdue = payment.due_date 
    ? Math.floor((new Date() - new Date(payment.due_date)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
      isOverdue ? 'border-red-500' : payment.status === 'paid' ? 'border-green-500' : 'border-yellow-500'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Payment for {payment.month || 'Monthly Payment'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Rental ID: {payment.rental_id}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          payment.status === 'paid' 
            ? 'bg-green-100 text-green-800'
            : isOverdue
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {payment.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-700">
          <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
          <span className="font-semibold text-xl">₹{payment.amount?.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>Due Date: {new Date(payment.due_date).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</span>
        </div>

        {payment.paid_date && (
          <div className="flex items-center text-green-600 text-sm">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span>Paid on: {new Date(payment.paid_date).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</span>
          </div>
        )}

        {isOverdue && payment.status !== 'paid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ Overdue by {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {payment.status !== 'paid' && (
        <div>
          {!orderData ? (
            <button
              onClick={handlePayNow}
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-colors ${
                isOverdue
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-violet-600 hover:bg-violet-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating Payment...' : isOverdue ? 'Pay Overdue Amount' : 'Pay Now'}
            </button>
          ) : (
            <RazorpayButton
              orderData={orderData}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              buttonText={isOverdue ? 'Pay Overdue Amount' : 'Pay Now'}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default MonthlyPaymentCard;

