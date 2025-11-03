import { HomeIcon, ClockIcon, BellIcon } from '@heroicons/react/24/outline';

function PGHostels() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-indigo-50/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Icon */}
        <div className="flex justify-center mb-8 animate-bounce-slow">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-violet-500 to-purple-600 p-8 rounded-full">
              <HomeIcon className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Coming Soon Text */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in">
          <span className="gradient-text">Coming Soon</span>
        </h1>
        
        <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 animate-slide-up">
          PG & Hostels Section
        </p>
        
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-slide-up">
          We're working hard to bring you the best PG and hostel listings. 
          Get notified when we launch!
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HomeIcon className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Verified Listings</h3>
            <p className="text-sm text-gray-600">All PGs personally verified</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-sm text-gray-600">Round the clock assistance</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Early Access</h3>
            <p className="text-sm text-gray-600">Be the first to know</p>
          </div>
        </div>

        {/* Notify Me Form */}
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-modern-lg border border-white/50 max-w-md mx-auto animate-scale-in">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Get Notified</h3>
          <p className="text-gray-600 mb-6 text-sm">We'll let you know when this section is ready!</p>
          <form className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-300"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-violet transform hover:scale-[1.02]"
            >
              Notify Me
            </button>
          </form>
        </div>

        {/* Back to Home */}
        <div className="mt-12">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default PGHostels; 