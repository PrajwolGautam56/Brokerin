import { useState, useEffect } from 'react';
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contactService';

function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullname: user?.fullName || '',
    email: user?.email || '',
    phonenumber: user?.phoneNumber || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form data when user logs in/out
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      fullname: user?.fullName || '',
      email: user?.email || '',
      phonenumber: user?.phoneNumber || ''
    }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await contactService.submitContact(formData);
      setSuccess('Thank you for contacting us! We will get back to you soon.');
      
      // Reset form (keep user data if logged in)
      setFormData({
        fullname: user?.fullName || '',
        email: user?.email || '',
        phonenumber: user?.phoneNumber || '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to submit contact form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">Get in touch with our team for any queries or support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPinIcon className="w-6 h-6 text-violet-500 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Our Office</h3>
                  <p className="text-gray-600 mt-1">
                   Udayapalya<br />
                    Kanakapura Road
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <PhoneIcon className="w-6 h-6 text-violet-500 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Phone</h3>
                  <p className="text-gray-600 mt-1">+91 83106 52049</p>
                  <p className="text-gray-600">Mon-Fri 9am to 6pm</p>
                </div>
              </div>

              <div className="flex items-start">
                <EnvelopeIcon className="w-6 h-6 text-violet-500 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Email</h3>
                  <p className="text-gray-600 mt-1">support@brokerin.in</p>
                  <p className="text-gray-600">We reply within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {/* Add social media icons/links */}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {user && (
              <div className="bg-violet-50 border border-violet-200 text-violet-700 px-4 py-3 rounded-lg mb-6 text-sm">
                ✓ You're logged in. Your contact information will be used automatically.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  required
                  disabled={!!user?.fullName}
                />
                {user?.fullName && (
                  <p className="text-xs text-gray-500 mt-1">Using your account name</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    required
                    disabled={!!user?.email}
                  />
                  {user?.email && (
                    <p className="text-xs text-gray-500 mt-1">Using your account email</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phonenumber}
                    onChange={(e) => setFormData({...formData, phonenumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                    disabled={!!user?.phoneNumber}
                  />
                  {user?.phoneNumber && (
                    <p className="text-xs text-gray-500 mt-1">Using your account phone</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-violet transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 