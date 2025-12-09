import { 
  ShieldCheckIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  MapPinIcon,
  HomeModernIcon
} from '@heroicons/react/24/outline';

function FeaturesSection() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Verified Properties',
      description: 'All properties are personally verified by our team for authenticity and quality.'
    },
    {
      icon: ClockIcon,
      title: 'Quick Response',
      description: 'Get instant responses and support whenever you need assistance with your property search.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Best Prices',
      description: 'Find the best deals and competitive prices for properties that fit your budget.'
    },
    {
      icon: UserGroupIcon,
      title: 'Expert Team',
      description: 'Work with experienced professionals dedicated to helping you find your perfect home.'
    },
    {
      icon: MapPinIcon,
      title: 'Prime Locations',
      description: 'Explore properties in the most desirable locations with great connectivity.'
    },
    {
      icon: HomeModernIcon,
      title: 'Wide Selection',
      description: 'Browse through thousands of properties across different types and price ranges.'
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 right-20 w-72 h-72 bg-violet-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Why Choose <span className="gradient-text">BrokerIn</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted partner in finding the perfect property
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-modern group p-8 animate-slide-up hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:from-violet-200 group-hover:to-purple-200 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-violet-600" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;

