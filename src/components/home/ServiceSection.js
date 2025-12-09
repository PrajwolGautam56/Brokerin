import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const services = [
  {
    id: 1,
    title: "Furniture",
    description: "Quality furniture rentals and sales for your home",
    icon: "🪑"
  },
  {
    id: 2,
    title: "Interior Design",
    description: "Professional interior design and wardrobe solutions",
    icon: "🎨"
  },
  {
    id: 3,
    title: "Painting",
    description: "Expert painting services for your property",
    icon: "🖌️"
  },
  {
    id: 4,
    title: "Deep Cleaning",
    description: "Thorough cleaning services for your space",
    icon: "🧹"
  },
  {
    id: 5,
    title: "Plumbing",
    description: "Professional plumbing services and repairs",
    icon: "🔧"
  },
  {
    id: 6,
    title: "Electrical Work",
    description: "Skilled electricians for all electrical needs",
    icon: "⚡"
  },
  {
    id: 7,
    title: "Packers & Movers",
    description: "Reliable moving services for your belongings",
    icon: "📦"
  },
  {
    id: 8,
    title: "AC Servicing",
    description: "Professional AC maintenance and repairs",
    icon: "❄️"
  }
];

const rentalItems = [
  { id: 1, name: "Television" },
  { id: 2, name: "Fridge" },
  { id: 3, name: "Washing machine" },
  { id: 4, name: "Cupboards and wardrobes" },
  { id: 5, name: "Normal Table with 4 chairs" },
  { id: 6, name: "Sofa" },
  { id: 7, name: "Queen size bed with mattress" },
  { id: 8, name: "Curtains" },
  { id: 9, name: "Geysers 10L & 15L" },
  { id: 10, name: "Dining with chairs" },
  { id: 11, name: "Water Purifier (Bolt Copper, Zinger Copper)" }
];

function ServiceSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600">
            Comprehensive home services to make your living experience better
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Rental Furniture Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Monthly Rental Furnishing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rentalItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-2 text-gray-700"
              >
                <span className="text-violet-500">•</span>
                {item.name}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            View All Services
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}

export default ServiceSection; 