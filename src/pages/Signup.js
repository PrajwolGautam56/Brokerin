import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    nationality: 'IN',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (phone) => {
    // Basic phone number validation for Indian numbers
    const phoneRegex = /^\+91[1-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedFullName = formData.fullName?.trim();
    const trimmedUsername = formData.username?.trim();
    const trimmedEmail = formData.email?.trim();
    const trimmedPhone = formData.phoneNumber?.trim();
    const trimmedNationality = formData.nationality?.trim() || 'IN';

    // Validate form data
    if (!trimmedFullName || !trimmedEmail || !trimmedPhone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate phone number format
    let formattedPhone = trimmedPhone.replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+91')) {
      formattedPhone = `+91${formattedPhone.replace(/^\+?91/, '')}`;
    }

    if (!validatePhoneNumber(formattedPhone)) {
      setError('Please enter a valid Indian phone number (+91XXXXXXXXXX)');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.signup({
        fullName: trimmedFullName,
        username: trimmedUsername || trimmedFullName.toLowerCase().replace(/\s+/g, ''),
        email: trimmedEmail,
        phoneNumber: formattedPhone,
        nationality: trimmedNationality,
        password: formData.password
      });

      const message = response?.message || 'Account created. Please verify the OTP sent to your email.';
      setSuccess(message);
      navigate('/verify-otp', { state: { email: trimmedEmail, message } });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear feedback when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-16 w-auto"
          src="/images/logo.png"
          alt="Brokerin"
        />
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Create Your Account</h2>
          
          {(error || success) && (
            <div className={`${error ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'} p-4 rounded-lg mb-6`}>
              {error || success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                placeholder="Choose a unique username"
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">We’ll auto-generate one if left blank.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91XXXXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Format: +91XXXXXXXXXX (Indian number)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                disabled={loading}
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="AE">United Arab Emirates</option>
                <option value="SG">Singapore</option>
                <option value="AU">Australia</option>
                <option value="UK">United Kingdom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading 
                  ? 'bg-violet-400 cursor-not-allowed' 
                  : 'bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>

            <div className="text-center mt-4">
              <span className="text-gray-600">Already have an account?</span>
              <Link to="/login" className="ml-1 font-medium text-violet-600 hover:text-violet-500">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup; 