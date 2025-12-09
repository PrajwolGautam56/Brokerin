import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream property with BrokerIn. 
            Start your journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/properties"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 rounded-xl font-bold hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 gap-2"
            >
              Browse Properties
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 gap-2"
            >
              Contact Us
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTABanner;

