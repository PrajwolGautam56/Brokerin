import api from '../axiosConfig';

export const contactService = {
  // Submit contact form
  submitContact: async (formData) => {
    try {
      // The API will automatically use logged-in user's details if token is present
      const response = await api.post('/api/contacts', {
        fullname: formData.fullname,
        email: formData.email, // Will be ignored if user is logged in
        phonenumber: formData.phonenumber,
        subject: formData.subject,
        message: formData.message
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw error.response?.data || { message: 'Failed to submit contact form' };
    }
  },

  // Admin: Get all contact inquiries
  getAllContactInquiries: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/contacts${queryParams ? '?' + queryParams : ''}`);
      // Handle response structure
      if (response.data.data && Array.isArray(response.data.data)) {
        return { inquiries: response.data.data, pagination: response.data.pagination };
      } else if (response.data.inquiries && Array.isArray(response.data.inquiries)) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        return { inquiries: response.data };
      }
      return { inquiries: [] };
    } catch (error) {
      console.error('Error fetching contact inquiries:', error);
      throw error.response?.data || { message: 'Failed to fetch contact inquiries' };
    }
  },

  // Admin: Update contact inquiry status
  updateContactInquiry: async (id, updateData) => {
    try {
      // If updating status, use the specific status endpoint
      if (updateData.status) {
        const response = await api.patch(`/api/contacts/${id}/status`, { status: updateData.status });
        return response.data;
      }
      // For other updates, use the general endpoint
      const response = await api.put(`/api/contacts/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating contact inquiry:', error);
      throw error.response?.data || { message: 'Failed to update contact inquiry' };
    }
  },

  // Admin: Delete contact inquiry
  deleteContactInquiry: async (id) => {
    try {
      const response = await api.delete(`/api/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact inquiry:', error);
      throw error.response?.data || { message: 'Failed to delete contact inquiry' };
    }
  }
};

export default contactService;

