import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import GoogleSignInButton from './GoogleSignInButton';

function Navbar() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupFormData, setSignupFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpForm, setOtpForm] = useState({ email: '', otp: '' });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleLogoutClick = () => {
    handleLogout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    // Don't navigate to login, just stay on current page
  };

  const handleLoginClick = (e) => {
    e?.preventDefault();
    setShowLoginModal(true);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignupClick = (e) => {
    e?.preventDefault();
    setShowSignupModal(true);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const trimmedEmail = loginFormData.email?.trim();
    const trimmedPassword = loginFormData.password?.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      setLoginError('Please fill in all fields');
      setLoginLoading(false);
      return;
    }
    
    const loginData = {
      email: trimmedEmail,
      password: trimmedPassword
    };

    try {
      const response = await authService.login(loginData);
      
      if (response.user) {
        login(response.user);
        setShowLoginModal(false);
        setLoginFormData({ email: '', password: '' });
        
        // Check if user is admin
        const isAdmin = await authService.checkAdmin();
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          // Redirect to intended page, or home if on login/signup pages
          const from = location.state?.from?.pathname || location.pathname;
          if (from === '/login' || from === '/signup' || from === '/verify-otp') {
            navigate('/', { replace: true }); // Go to home page
          } else if (from !== '/') {
            // Stay on current page if it's a valid page
            navigate(from, { replace: true });
          }
          // If already on home, stay there
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Failed to login. Please check your credentials and try again.');
      setLoginFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (loginError) setLoginError('');
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupFormData(prev => ({ ...prev, [name]: name === 'acceptTerms' ? !prev.acceptTerms : value }));
    if (signupError) setSignupError('');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);

    const username = signupFormData.username?.trim();
    const email = signupFormData.email?.trim();
    const phone = signupFormData.phone?.trim();
    const password = signupFormData.password?.trim();
    const confirmPassword = signupFormData.confirmPassword?.trim();

    if (!username || !email || !password) {
      setSignupError('Please fill in username, email and password');
      setSignupLoading(false);
      return;
    }

    if (password.length < 6) {
      setSignupError('Password must be at least 6 characters');
      setSignupLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setSignupError('Passwords do not match');
      setSignupLoading(false);
      return;
    }

    if (!signupFormData.acceptTerms) {
      setSignupError('Please accept the terms and privacy policy');
      setSignupLoading(false);
      return;
    }

    try {
      const prePayload = {
        fullName: username,
        username,
        email,
        phoneNumber: phone,
        nationality: 'IN',
        password
      };
      const response = await authService.requestSignupOtp(prePayload);
      // Expecting success with message; open OTP modal
      setShowSignupModal(false);
      setSignupFormData({ username: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false });
      setOtpForm({ email, otp: '' });
      setOtpError('');
      setOtpSuccess(response?.message || 'OTP sent. Please verify to complete registration.');
      setShowOtpModal(true);
    } catch (err) {
      console.error('Signup error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to sign up. Please try again.';
      setSignupError(msg);
    } finally {
      setSignupLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Auto-open login modal if redirected from protected route
  useEffect(() => {
    if (location.state?.showLogin && !user) {
      setShowLoginModal(true);
      // Pre-fill email if provided
      if (location.state.email) {
        setLoginFormData(prev => ({ ...prev, email: location.state.email }));
      }
      // Clear the state to prevent reopening on navigation
      navigate(location.pathname, { replace: true, state: { from: location.state.from } });
    }
  }, [location.state, location.pathname, user, navigate]);

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/images/logo.png" 
                alt="Brokerin" 
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/10 rounded-lg blur-sm transition-all duration-300"></div>
            </div>
          </Link>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            {/* User Menu for Mobile */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg"
              >
                <UserCircleIcon className="h-8 w-8" />
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </button>
              
              {/* User Dropdown for Mobile */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 z-[101] animate-fade-in-up">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        My Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link
                        to="/my-bookings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Bookings
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleLoginClick}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login
                      </button>
                      <button
                        onClick={handleSignupClick}
                        className="block mx-3 my-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-center w-[calc(100%-1.5rem)]"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className={`p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-300 ${
                isMobileMenuOpen ? 'text-violet-600 bg-violet-50' : 'text-gray-600'
              }`}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/properties" 
              className="px-4 py-2.5 text-gray-700 hover:text-violet-600 font-semibold rounded-xl hover:bg-violet-50/80 transition-all duration-300 relative group"
            >
              <span className="relative z-10">Properties</span>
              <span className="absolute inset-0 bg-violet-100 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></span>
            </Link>
            <Link 
              to="/services" 
              className="px-4 py-2.5 text-gray-700 hover:text-violet-600 font-semibold rounded-xl hover:bg-violet-50/80 transition-all duration-300 relative group"
            >
              <span className="relative z-10">Services</span>
              <span className="absolute inset-0 bg-violet-100 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></span>
            </Link>
            <Link 
              to="/furniture" 
              className="px-4 py-2.5 text-gray-700 hover:text-violet-600 font-semibold rounded-xl hover:bg-violet-50/80 transition-all duration-300 relative group"
            >
              <span className="relative z-10">Furniture</span>
              <span className="absolute inset-0 bg-violet-100 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></span>
            </Link>
            <Link 
              to="/about" 
              className="px-4 py-2.5 text-gray-700 hover:text-violet-600 font-semibold rounded-xl hover:bg-violet-50/80 transition-all duration-300 relative group"
            >
              <span className="relative z-10">About</span>
              <span className="absolute inset-0 bg-violet-100 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></span>
            </Link>
            <Link 
              to="/contact" 
              className="px-4 py-2.5 text-gray-700 hover:text-violet-600 font-semibold rounded-xl hover:bg-violet-50/80 transition-all duration-300 relative group"
            >
              <span className="relative z-10">Contact</span>
              <span className="absolute inset-0 bg-violet-100 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></span>
            </Link>
            <Link 
              to="/pg-hostels" 
              className="px-4 py-2.5 text-gray-700 hover:text-violet-600 font-semibold rounded-xl hover:bg-violet-50/80 transition-all duration-300 relative group"
            >
              <span className="relative z-10">PG Hostels</span>
              <span className="absolute inset-0 bg-violet-100 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100"></span>
            </Link>

            {/* User Menu for Desktop */}
            <div className="relative ml-6">
              {user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-50/80 transition-all duration-300 border border-gray-200/50 hover:border-violet-200 hover:shadow-md"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden lg:block font-medium text-sm">{user.name || user.email}</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLoginClick}
                    className="px-5 py-2.5 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignupClick}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              
              {/* User Dropdown for Desktop */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 z-[101] animate-fade-in-up">
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      My Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Bookings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 z-[101] animate-fade-in-up">
            <div className="flex flex-col space-y-1 pt-4">
              <Link 
                to="/properties" 
                className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Properties
              </Link>
              <Link 
                to="/services" 
                className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Services
              </Link>
              <Link 
                to="/furniture" 
                className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Furniture
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </Link>

              {/* Auth Buttons for Mobile */}
              {user ? (
                <>
                  <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  {user.isAdmin && (
                    <Link 
                      to="/admin"
                      className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <Link 
                    to="/dashboard"
                    className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    My Dashboard
                  </Link>
                  <Link 
                    to="/profile"
                    className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  <Link 
                    to="/my-bookings"
                    className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Bookings
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button 
                    onClick={() => {
                      handleLogoutClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={(e) => {
                      handleLoginClick(e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-700 hover:text-violet-600 hover:bg-violet-50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login
                  </button>
                  <button
                    onClick={(e) => { handleSignupClick(e); setIsMobileMenuOpen(false); }}
                    className="mx-4 my-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-center"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 min-h-screen overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Visual Pane */}
              <div className="relative hidden md:block bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-2xl font-bold">Welcome back</h3>
                    <p className="text-violet-100 mt-2">Access premium properties, services and more.</p>
                  </div>
                  <ul className="space-y-3 text-violet-100 text-sm mt-8">
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span> One account for properties, services and furniture</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span> Secure authentication and OTP verification</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span> Personalized dashboard and history</li>
                  </ul>
                </div>
              </div>

              {/* Form Pane */}
              <div className="p-6 relative">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginError('');
                    setLoginFormData({ email: '', password: '' });
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="mb-6">
                  <img className="h-10 w-auto mb-2" src="/images/logo.png" alt="Brokerin" />
                  <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                  <p className="text-sm text-gray-500">Continue to your account</p>
                </div>
            
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      name="email"
                      value={loginFormData.email}
                      onChange={handleLoginInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      placeholder="Enter your email or username"
                      required
                      disabled={loginLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        name="password"
                        value={loginFormData.password}
                        onChange={handleLoginInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 pr-10"
                        placeholder="Enter your password"
                        required
                        disabled={loginLoading}
                      />
                      <button type="button" onClick={() => setShowLoginPassword(v => !v)} className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-600">
                        {showLoginPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember_me"
                        type="checkbox"
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                        disabled={loginLoading}
                      />
                      <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <button
                        type="button"
                        className="font-medium text-violet-600 hover:text-violet-500"
                        onClick={() => {
                          setShowLoginModal(false);
                          setForgotEmail(loginFormData.email || '');
                          setForgotMessage('');
                          setForgotError('');
                          setShowForgotModal(true);
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white ${
                      loginLoading 
                        ? 'bg-violet-400 cursor-not-allowed' 
                        : 'bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
                    }`}
                  >
                    {loginLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <span className="text-gray-600">Don't have an account?</span>
                    <button 
                      type="button"
                      className="ml-1 font-medium text-violet-600 hover:text-violet-500"
                      onClick={() => { setShowLoginModal(false); setShowSignupModal(true); }}
                    >
                      Sign up
                    </button>
                  </div>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-sm text-gray-500">or continue with</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <GoogleSignInButton 
                        onSuccess={async (data) => {
                          setShowLoginModal(false);
                          setLoginError('');
                          
                          // Get user from response or localStorage
                          const userData = data.user || authService.getCurrentUser();
                          
                          if (userData) {
                            // Update auth context
                            login(userData);
                            
                            // Check if user is admin
                            try {
                              const isAdmin = await authService.checkAdmin();
                              if (isAdmin) {
                                navigate('/admin', { replace: true });
                              } else {
                                // Redirect to intended page or home
                                const from = location.state?.from?.pathname || '/';
                                navigate(from, { replace: true });
                              }
                            } catch (err) {
                              // If admin check fails, go to home
                              navigate('/', { replace: true });
                            }
                          } else {
                            // If still no user, reload to trigger AuthContext refresh
                            window.location.href = '/';
                          }
                        }}
                        onError={(e) => {
                          const errorMsg = e?.responseData?.message || e?.responseData?.error || e?.message || 'Google login failed';
                          console.error('Google sign-in error:', e);
                          setLoginError(errorMsg);
                        }}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout happens immediately on click; confirmation removed */}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 min-h-screen overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Visual Pane */}
              <div className="relative hidden md:block bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-8">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-white text-2xl font-bold">Join Brokerin</h3>
                    <p className="text-violet-100 mt-2">Create your account to get started</p>
                  </div>
                  <ul className="space-y-3 text-violet-100 text-sm mt-8">
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span> Discover properties and services faster</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span> Track requests, bookings, and rentals</li>
                    <li className="flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span> Secure OTP verification</li>
                  </ul>
                </div>
              </div>

              {/* Form Pane */}
              <div className="p-6 relative">
                <button
                  onClick={() => {
                    setShowSignupModal(false);
                    setSignupError('');
                    setSignupFormData({ username: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false });
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="mb-6">
                  <img className="h-10 w-auto mb-2" src="/images/logo.png" alt="Brokerin" />
                  <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                  <p className="text-sm text-gray-500">It only takes a minute</p>
                </div>

                {signupError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {signupError}
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={signupFormData.username}
                        onChange={handleSignupInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        placeholder="Enter your name"
                        required
                        disabled={signupLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                      <input
                        type="tel"
                        name="phone"
                        value={signupFormData.phone}
                        onChange={handleSignupInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        placeholder="e.g. +91 98765 43210"
                        disabled={signupLoading}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={signupFormData.email}
                        onChange={handleSignupInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        placeholder="Enter your email"
                        required
                        disabled={signupLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          name="password"
                          value={signupFormData.password}
                          onChange={handleSignupInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 pr-10"
                          placeholder="Create a password"
                          required
                          disabled={signupLoading}
                        />
                        <button type="button" onClick={() => setShowSignupPassword(v => !v)} className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-600">
                          {showSignupPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showSignupConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={signupFormData.confirmPassword}
                          onChange={handleSignupInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 pr-10"
                          placeholder="Re-enter password"
                          required
                          disabled={signupLoading}
                        />
                        <button type="button" onClick={() => setShowSignupConfirmPassword(v => !v)} className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-600">
                          {showSignupConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                    
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={signupFormData.acceptTerms}
                      onChange={handleSignupInputChange}
                      className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                      disabled={signupLoading}
                    />
                    I agree to the <span className="text-violet-600">Terms</span> and <span className="text-violet-600">Privacy Policy</span>
                  </label>

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white ${
                      signupLoading 
                        ? 'bg-violet-400 cursor-not-allowed' 
                        : 'bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
                    }`}
                  >
                    {signupLoading ? 'Creating account...' : 'Create account'}
                  </button>

                  <div className="text-center mt-2">
                    <span className="text-gray-600">Already have an account?</span>
                    <button
                      type="button"
                      className="ml-1 font-medium text-violet-600 hover:text-violet-500"
                      onClick={() => { setShowSignupModal(false); setShowLoginModal(true); }}
                    >
                      Log in
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 min-h-screen overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotError('');
                setForgotMessage('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="mb-4">
              <img className="h-10 w-auto mb-2" src="/images/logo.png" alt="Brokerin" />
              <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
              <p className="text-sm text-gray-500">Enter your email to receive a reset link.</p>
            </div>

            {(forgotMessage || forgotError) && (
              <div className={`${forgotError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} px-4 py-3 rounded-lg mb-4`}>
                {forgotError || forgotMessage}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setForgotError('');
                setForgotMessage('');
                const emailVal = (forgotEmail || '').trim();
                if (!emailVal) { setForgotError('Please enter your email'); return; }
                setForgotLoading(true);
                try {
                  const res = await authService.requestPasswordReset(emailVal);
                  setForgotMessage(res?.message || 'If an account exists, a reset email has been sent.');
                } catch (err) {
                  // Show generic success to avoid enumeration
                  setForgotMessage('If an account exists, a reset email has been sent.');
                } finally {
                  setForgotLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="you@example.com"
                  disabled={forgotLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className={`w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white ${forgotLoading ? 'bg-violet-400' : 'bg-violet-600 hover:bg-violet-700'}`}
              >
                {forgotLoading ? 'Sending...' : 'Send reset link'}
              </button>
              <div className="text-center text-sm text-gray-600">
                Remembered your password?{' '}
                <button type="button" className="text-violet-600 font-medium hover:text-violet-500" onClick={() => { setShowForgotModal(false); setShowLoginModal(true); }}>
                  Back to login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 min-h-screen overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtpError('');
                setOtpSuccess('');
                setOtpForm({ email: '', otp: '' });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="mb-4">
              <img className="h-10 w-auto mb-2" src="/images/logo.png" alt="Brokerin" />
              <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
              <p className="text-sm text-gray-500">Enter the 6-digit OTP sent to {otpForm.email || 'your email'}.</p>
            </div>

            {(otpError || otpSuccess) && (
              <div className={`${otpError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} px-4 py-3 rounded-lg mb-4`}>
                {otpError || otpSuccess}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setOtpError('');
                setOtpSuccess('');
                const emailVal = (otpForm.email || '').trim();
                const otpVal = (otpForm.otp || '').trim();
                if (!emailVal || otpVal.length !== 6) {
                  setOtpError('Please enter your email and a 6-digit OTP.');
                  return;
                }
                setOtpLoading(true);
                try {
                  const res = await authService.verifyPreSignupOtp({ email: emailVal, otp: otpVal });
                  setOtpSuccess(res?.message || 'Registration completed successfully. You can now sign in.');
                  setTimeout(() => {
                    setShowOtpModal(false);
                    setShowLoginModal(true);
                    setLoginFormData((prev) => ({ ...prev, email: emailVal }));
                  }, 1200);
                } catch (err) {
                  setOtpError(err?.message || 'Invalid or expired OTP');
                  setOtpForm((prev) => ({ ...prev, otp: '' }));
                } finally {
                  setOtpLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={otpForm.email}
                  onChange={(e) => setOtpForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="your@email.com"
                  disabled={otpLoading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                <input
                  type="text"
                  value={otpForm.otp}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                    setOtpForm((p) => ({ ...p, otp: sanitized }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 tracking-[0.4em] text-center"
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  disabled={otpLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={otpLoading}
                className={`w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white ${otpLoading ? 'bg-violet-400' : 'bg-violet-600 hover:bg-violet-700'}`}
              >
                {otpLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div className="text-center mt-3 text-sm text-gray-600">
              Didn't get it? <button type="button" className="text-violet-600 font-medium hover:text-violet-500" onClick={async () => {
                try {
                  const emailVal = otpForm.email?.trim();
                  if (!emailVal) { setOtpError('Enter your email to resend OTP'); return; }
                  setOtpError(''); setOtpSuccess('');
                  // Resend using minimal payload; requires original form ideally.
                  await authService.requestSignupOtp({
                    fullName: signupFormData.username || 'User',
                    username: signupFormData.username || 'user',
                    email: emailVal,
                    phoneNumber: signupFormData.phone || '',
                    nationality: 'IN',
                    password: signupFormData.password || 'Secret123!'
                  });
                  setOtpSuccess('OTP resent. Please check your inbox.');
                } catch (err) {
                  setOtpError(err?.message || 'Failed to resend OTP');
                }
              }}>Resend OTP</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 