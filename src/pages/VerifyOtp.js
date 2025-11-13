import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = formData.email?.trim();
    const trimmedOtp = formData.otp?.trim();

    if (!trimmedEmail || !trimmedOtp) {
      setError('Please enter both email and OTP.');
      return;
    }

    if (trimmedOtp.length !== 6) {
      setError('OTP must be a 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyPreSignupOtp({ email: trimmedEmail, otp: trimmedOtp });
      const message = response?.message || 'Registration completed successfully. You can now sign in.';
      setSuccess(message);
      setTimeout(() => {
        navigate('/', { replace: true, state: { showLogin: true, email: trimmedEmail } });
      }, 1500);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid or expired OTP');
      setFormData((prev) => ({ ...prev, otp: '' }));
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-center mb-2">Verify Your Email</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter the 6-digit OTP sent to your email address to activate your account.
          </p>

          {(error || success) && (
            <div className={`${error ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'} p-4 rounded-lg mb-6`}>
              {error || success}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
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
                placeholder="Enter the email you signed up with"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setFormData((prev) => ({ ...prev, otp: sanitized }));
                  if (error) setError('');
                  if (success) setSuccess('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 tracking-[0.4em] text-center text-lg"
                placeholder="Enter 6-digit code"
                inputMode="numeric"
                maxLength={6}
                required
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">The OTP expires in 20 minutes.</p>
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
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            Didn’t receive an email?{' '}
            <Link to="/signup" className="text-violet-600 font-medium hover:text-violet-500">
              Go back to signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;

