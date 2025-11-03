import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white mt-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1">
            <div className="flex flex-col items-start">
              <img 
                src="/images/logo.png" 
                alt="Brokerin" 
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-200 text-sm mt-4">
                Your trusted partner in finding the perfect home and services.
              </p>
            </div>
          </div>

          <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                PROPERTIES
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/properties" className="text-gray-200 hover:text-white">
                    All Properties
                  </Link>
                </li>
                <li>
                  <Link to="/pg-hostels" className="text-gray-200 hover:text-white">
                    PG Hostels
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-gray-200 hover:text-white">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/furniture" className="text-gray-200 hover:text-white">
                    Furniture
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                COMPANY
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/about" className="text-gray-200 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-200 hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-gray-200 hover:text-white">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                CONTACT US
              </h3>
              <ul className="space-y-4">
                <li className="text-gray-200">
                  <p>Email: info@brokerin.in</p>
                </li>
                <li className="text-gray-200">
                  <p>Phone: +91 83106 52049</p>
                </li>
                <li className="text-gray-200">
                  <p>Address: Bangalore, Karnataka</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 text-sm">
              © 2025 <span className="font-bold text-white">BrokerIn</span>. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors duration-200 hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-white text-sm transition-colors duration-200 hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 