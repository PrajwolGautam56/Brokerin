import { PaintBrushIcon, WrenchScrewdriverIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

function AboutSection() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className="rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3"
              alt="Modern Building"
              className="w-full h-[500px] object-cover"
            />
          </div>

          {/* Right side - Services */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Additional Services</h2>
            
            {/* Services List */}
            <div className="space-y-8">
              {/* Painting Service */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <PaintBrushIcon className="h-6 w-6 text-violet-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Painting</h3>
                  <p className="text-gray-600">
                    Our homes are more than structures – they're painted with unparalleled attention to detail.
                  </p>
                </div>
              </div>

              {/* Maintenance Service */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-violet-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Maintenance</h3>
                  <p className="text-gray-600">
                    Our properties not only offer a dream living space but also promise a sound investment for your future with proper maintenance.
                  </p>
                </div>
              </div>

              {/* Furniture Service */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <HomeIcon className="h-6 w-6 text-violet-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Furnitures</h3>
                  <p className="text-gray-600">
                    Enjoy a hassle-free home buying journey with our dedicated furnitures on every step of the way.
                  </p>
                </div>
              </div>
            </div>

            {/* Learn More Button */}
            <div className="mt-8 text-center">
              <Link to="/services">
                <button className="px-6 py-3 bg-brand-violet text-white rounded-lg hover:bg-brand-violet/90 transition-colors">
                  Learn More About Our Services
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