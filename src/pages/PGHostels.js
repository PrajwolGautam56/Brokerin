import { motion } from 'framer-motion';
import { MapPinIcon, UserGroupIcon, WifiIcon, TvIcon, HomeIcon } from '@heroicons/react/24/outline';

function PGHostels() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            PG & Hostels
          </h1>
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <svg
                className="w-24 h-24 text-violet-500 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Coming Soon!
              </h2>
              <p className="text-gray-600 text-center mb-6">
                We're currently working on bringing you the best PG and Hostel accommodations.
                This feature will be available soon.
              </p>
              <p className="text-sm text-gray-500">
                Stay tuned for affordable and comfortable living spaces!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PGHostels; 