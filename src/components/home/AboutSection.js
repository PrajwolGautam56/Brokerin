import { PaintBrushIcon, WrenchScrewdriverIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

function AboutSection() {
  return (
    <div className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 right-20 w-72 h-72 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Image */}
          <div className="rounded-2xl overflow-hidden shadow-modern-lg group animate-slide-up">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3"
              alt="Modern Building"
              className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          {/* Right side - Services */}
          <div className="animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Additional <span className="gradient-text">Services</span>
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Complete solutions for your property needs
            </p>
            
            {/* Services List */}
            <div className="space-y-8 mb-12">
              {/* Painting Service */}
              <div className="flex gap-6 group cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300">
                    <PaintBrushIcon className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-violet-600 transition-colors">Painting</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our homes are more than structures – they're painted with unparalleled attention to detail.
                  </p>
                </div>
              </div>

              {/* Maintenance Service */}
              <div className="flex gap-6 group cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                    <WrenchScrewdriverIcon className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-violet-600 transition-colors">Maintenance</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our properties not only offer a dream living space but also promise a sound investment for your future with proper maintenance.
                  </p>
                </div>
              </div>

              {/* Furniture Service */}
              <div className="flex gap-6 group cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
                    <HomeIcon className="h-7 w-7 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-violet-600 transition-colors">Furniture</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Enjoy a hassle-free home buying journey with our dedicated furniture services on every step of the way.
                  </p>
                </div>
              </div>
            </div>

            {/* Learn More Button */}
            <div>
              <Link to="/services">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-violet transform hover:scale-105">
                  Learn More About Our Services
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutSection; 