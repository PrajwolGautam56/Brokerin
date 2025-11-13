import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ResetPassword() {
  const navigate = useNavigate();
  const query = useQuery();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(query.get('email') || '');
    setToken(query.get('token') || '');
  }, [query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const trimmedEmail = email.trim();
    const trimmedToken = token.trim();
    const pwd = password.trim();
    const pwd2 = confirmPassword.trim();
    if (!trimmedEmail || !trimmedToken) {
      setError('Missing email or token. Please use the link from your email.');
      return;
    }
    if (pwd.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (pwd !== pwd2) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.resetPassword(trimmedEmail, trimmedToken, pwd);
      setMessage(res?.message || 'Password has been reset successfully');
      setTimeout(() => navigate('/', { replace: true, state: { showLogin: true } }), 1500);
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-16 w-auto" src="/images/logo.png" alt="Brokerin" />
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-4">
          <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
          <p className="text-sm text-gray-600 text-center mb-6">Set a new password for your account.</p>

          {(message || error) && (
            <div className={`${error ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} px-4 py-3 rounded-lg mb-4`}>
              {error || message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="New password"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Re-enter password"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white ${loading ? 'bg-violet-400' : 'bg-violet-600 hover:bg-violet-700'}`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
