import api from '../axiosConfig';

export const transactionService = {
  // Get all transactions (user sees own, admin sees all)
  getAllTransactions: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      const url = `/api/furniture-transactions${params.toString() ? `?${params}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error.response?.data || { message: 'Failed to fetch transactions' };
    }
  },

  // Get single transaction details
  getTransactionById: async (transactionId) => {
    try {
      const response = await api.get(`/api/furniture-transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error.response?.data || { message: 'Failed to fetch transaction' };
    }
  },

  // Create transaction (for furniture purchase/rental)
  createTransaction: async (transactionData) => {
    try {
      const response = await api.post('/api/furniture-transactions', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error.response?.data || { message: 'Failed to create transaction' };
    }
  },

  // Admin: Record payment
  recordPayment: async (transactionId, paymentData) => {
    try {
      const response = await api.post(`/api/furniture-transactions/${transactionId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error.response?.data || { message: 'Failed to record payment' };
    }
  },

  // Admin: Update delivery status
  updateDeliveryStatus: async (transactionId, statusData) => {
    try {
      const response = await api.put(`/api/furniture-transactions/${transactionId}/delivery-status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error.response?.data || { message: 'Failed to update delivery status' };
    }
  },

  // Admin: Cancel transaction
  cancelTransaction: async (transactionId, reason) => {
    try {
      const response = await api.post(`/api/furniture-transactions/${transactionId}/cancel`, {
        cancellation_reason: reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw error.response?.data || { message: 'Failed to cancel transaction' };
    }
  },

  // Get invoice
  getInvoice: async (transactionId, paymentId = null) => {
    try {
      const url = `/api/furniture-transactions/${transactionId}/invoice${paymentId ? `?payment_id=${paymentId}` : ''}`;
      const response = await api.get(url, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error.response?.data || { message: 'Failed to fetch invoice' };
    }
  },

  // Update transaction notes
  updateTransaction: async (transactionId, updateData) => {
    try {
      const response = await api.put(`/api/furniture-transactions/${transactionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error.response?.data || { message: 'Failed to update transaction' };
    }
  }
};

