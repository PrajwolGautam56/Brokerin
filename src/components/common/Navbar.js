import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Export navbar height class
export const navbarHeight = 'h-24'; // 96px (h-24) to accommodate logo height (h-16) + padding

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className={`bg-white fixed w-full top-0 z-50 shadow ${navbarHeight}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="/images/logo.png" 
                alt="Brokerin" 
                className="h-16 w-auto"
              />
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-[101]">
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                          {user.name}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          className="block mx-3 my-2 px-4 py-2 text-sm bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                className={`p-2 rounded-md hover:bg-gray-100 ${
                  isMobileMenuOpen ? 'text-brand-violet' : 'text-gray-600'
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
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/properties" className="px-4 py-2 text-gray-700 hover:text-brand-violet hover:bg-gray-50 rounded-lg">
                Properties
              </Link>
              <Link to="/services" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                Services
              </Link>
              <Link to="/furniture" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                Furniture
              </Link>
              <Link to="/about" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                About
              </Link>
              <Link to="/contact" className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                Contact
              </Link>
              <Link to="/pg-hostels" className="px-4 py-2 text-gray-700 hover:text-brand-violet hover:bg-gray-50 rounded-lg">
                PG Hostels
              </Link>

              {/* User Menu for Desktop */}
              <div className="relative ml-4">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <UserCircleIcon className="h-8 w-8" />
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
                
                {/* User Dropdown for Desktop */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-[101]">
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                          {user.name}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          className="block mx-3 my-2 px-4 py-2 text-sm bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 z-[101]">
              <div className="flex flex-col space-y-2 pt-4">
                <Link 
                  to="/properties" 
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Properties
                </Link>
                <Link 
                  to="/services" 
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link 
                  to="/furniture" 
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Furniture
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                {/* Auth Buttons for Mobile */}
                {user ? (
                  <>
                    <span className="text-gray-700 px-4 py-2">
                      Welcome, {user.name}
                    </span>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-gray-700 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="text-gray-700 hover:text-gray-900 px-4 py-2 hover:bg-gray-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="mx-4 my-2 px-4 py-2 bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Add a spacer div to push content down */}
      <div className={navbarHeight}></div>
    </>
  );
}

export default Navbar; 