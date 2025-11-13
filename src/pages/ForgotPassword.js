import { useState } from 'react';
import { authService } from '../services/authService';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(trimmed);
      setMessage(res?.message || 'If an account exists, a reset email has been sent.');
    } catch (err) {
      // Still show generic success to prevent enumeration
      setMessage('If an account exists, a reset email has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-16 w-auto" src="/images/logo.png" alt="Brokerin" />
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-4">
          <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
          <p className="text-sm text-gray-600 text-center mb-6">Enter your email to receive a reset link.</p>

          {(message || error) && (
            <div className={`${error ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} px-4 py-3 rounded-lg mb-4`}>
              {error || message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white ${loading ? 'bg-violet-400' : 'bg-violet-600 hover:bg-violet-700'}`}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
