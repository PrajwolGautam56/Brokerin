import { useState } from 'react';
import { paymentService } from '../../services/paymentService';

function RazorpayButton({ 
  orderData, 
  onSuccess, 
  onError, 
  buttonText = 'Pay Now',
  className = '',
  disabled = false
}) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!window.Razorpay) {
      onError?.({ message: 'Razorpay SDK not loaded. Please refresh the page.' });
      return;
    }

    setLoading(true);
    try {
      const options = {
        key: orderData.key_id, // Razorpay key ID from backend
        amount: orderData.amount, // Amount in paise
        currency: orderData.currency || 'INR',
        name: orderData.name || 'BrokerIn',
        description: orderData.description || 'Payment',
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // Verify payment with backend
            const verifyResponse = await paymentService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            
            setLoading(false);
            onSuccess?.(verifyResponse);
          } catch (error) {
            setLoading(false);
            onError?.(error);
          }
        },
        prefill: {
          name: orderData.customer_name || '',
          email: orderData.customer_email || '',
          contact: orderData.customer_contact || ''
        },
        theme: {
          color: '#7c3aed' // Violet color matching the app
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            onError?.({ message: 'Payment cancelled by user' });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setLoading(false);
      onError?.(error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading || !orderData}
      className={`${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Processing...' : buttonText}
    </button>
  );
}

export default RazorpayButton;

