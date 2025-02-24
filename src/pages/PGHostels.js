import { motion } from 'framer-motion';
import { MapPinIcon, UserGroupIcon, WifiIcon, TvIcon, HomeIcon } from '@heroicons/react/24/outline';

function PGHostels() {
  const pgListings = [
    {
      id: 1,
      name: "Comfort PG for Ladies",
      location: "Koramangala, Bangalore",
      type: "Ladies",
      price: "₹8,000 - ₹12,000/month",
      occupancy: ["Single", "Double", "Triple"],
      amenities: [
        "WiFi",
        "AC Rooms",
        "Food Included",
        "Laundry",
        "Security",
        "Power Backup"
      ],
      images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"],
      rating: 4.5,
      reviews: 28
    },
    {
      id: 2,
      name: "Elite Men's PG",
      location: "HSR Layout, Bangalore",
      type: "Gents",
      price: "₹9,000 - ₹14,000/month",
      occupancy: ["Single", "Double"],
      amenities: [
        "WiFi",
        "AC Rooms",
        "Food Included",
        "Gym",
        "Security",
        "Power Backup"
      ],
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
      rating: 4.2,
      reviews: 35
    }
    // Add more PG listings as needed
  ];

  const features = [
    {
      title: "Verified PGs",
      description: "All PGs are personally verified for safety and comfort",
      icon: HomeIcon
    },
    {
      title: "Multiple Options",
      description: "Choose from single, double or triple sharing rooms",
      icon: UserGroupIcon
    },
    {
      title: "Prime Locations",
      description: "PGs in prime locations near IT parks and colleges",
      icon: MapPinIcon
    }
  ];

  return (
    <div className="pt-20 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect PG Accommodation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comfortable and affordable PG accommodations in prime locations
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <feature.icon className="w-12 h-12 text-brand-violet mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* PG Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {pgListings.map((pg, idx) => (
            <motion.div
              key={pg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* PG Image */}
              <div className="aspect-video relative">
                <img
                  src={pg.images[0]}
                  alt={pg.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-brand-violet">
                  {pg.type} PG
                </div>
              </div>

              {/* PG Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {pg.name}
                </h3>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  {pg.location}
                </div>

                {/* Price and Occupancy */}
                <div className="mb-4">
                  <div className="text-brand-violet font-semibold mb-2">
                    {pg.price}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pg.occupancy.map((type) => (
                      <span
                        key={type}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600"
                      >
                        {type} Sharing
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Amenities
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {pg.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-brand-violet/10 text-brand-violet px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating and Reviews */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 font-medium">{pg.rating}</span>
                    <span className="text-gray-500 ml-1">({pg.reviews} reviews)</span>
                  </div>
                  <button className="bg-brand-violet text-white px-4 py-2 rounded-lg hover:bg-brand-violet/90 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-brand-violet text-white rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-4">List Your PG with Us</h2>
          <p className="text-lg mb-6">
            Are you a PG owner? List your property and reach thousands of potential tenants
          </p>
          <button className="bg-white text-brand-violet px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            List Your PG
          </button>
        </div>
      </div>
    </div>
  );
}

export default PGHostels; 