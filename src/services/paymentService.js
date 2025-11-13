import api from '../axiosConfig';

export const paymentService = {
  // Create Razorpay order for furniture payment
  createOrder: async (transactionId, amount, currency = 'INR') => {
    try {
      const response = await api.post('/api/payments/create-order', {
        transaction_id: transactionId,
        amount: amount * 100, // Convert to paise
        currency
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error.response?.data || { message: 'Failed to create payment order' };
    }
  },

  // Verify payment
  verifyPayment: async (orderId, paymentId, signature) => {
    try {
      const response = await api.post('/api/payments/verify', {
        order_id: orderId,
        payment_id: paymentId,
        signature
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error.response?.data || { message: 'Payment verification failed' };
    }
  },

  // Get pending monthly payments
  getPendingMonthlyPayments: async () => {
    try {
      const response = await api.get('/api/payments/pending-monthly');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      throw error.response?.data || { message: 'Failed to fetch pending payments' };
    }
  },

  // Create order for monthly rental payment
  createMonthlyPaymentOrder: async (rentalId, paymentRecordId, amount, currency = 'INR') => {
    try {
      const response = await api.post('/api/payments/monthly-payment-order', {
        rental_id: rentalId,
        payment_record_id: paymentRecordId,
        amount: amount * 100, // Convert to paise
        currency
      });
      return response.data;
    } catch (error) {
      console.error('Error creating monthly payment order:', error);
      throw error.response?.data || { message: 'Failed to create payment order' };
    }
  }
};

