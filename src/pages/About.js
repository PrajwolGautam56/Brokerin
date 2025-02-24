import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

function About() {
  const visionPoints = [
    {
      title: "Hassle-Free Transactions",
      description: "Making Real Estate Easy – We're here to take the stress out of buying, selling, and renting, ensuring a smooth and effortless experience for everyone."
    },
    {
      title: "Trust and Transparency",
      description: "Honest Deals, No Surprises – Our vision is a real estate market built on fairness, honesty, and complete transparency, so you can make decisions with confidence."
    },
    {
      title: "Affordable and Accessible",
      description: "Real Estate for Everyone – We believe that finding a home or investment should be within reach for all, no matter the budget."
    },
    {
      title: "Customer-First Approach",
      description: "People First, Always – Your needs come first. We provide personalized guidance and support at every step to help you achieve your real estate goals."
    },
    {
      title: "Innovation and Growth",
      description: "Smarter Solutions, Better Results – We use modern tools and smart strategies to make real estate faster, easier, and more efficient for buyers, sellers, and investors."
    }
  ];

  const benefits = [
    {
      title: "Wide Reach",
      description: "Get exposure to a large number of visitors actively searching for properties and PG hostels."
    },
    {
      title: "Easy-to-Use Platform",
      description: "A user-friendly interface for adding and managing listings, with no technical knowledge required."
    },
    {
      title: "Transparency and Control",
      description: "You control the details of your listings and communicate directly with interested parties."
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <img 
              src="/images/logo.png" 
              alt="Brokerin" 
              className="h-16 w-auto mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-6">About BROKERIN</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              BrokerIn Pvt. Ltd. is an innovative real estate platform in Bangalore, Karnataka, 
              with a vision to transform into simplest way for people to buy, sell and rent properties.
            </p>
          </div>
        </div>
      </div>

    {/* Why Choose US Points */}
    <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose US?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visionPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-600">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {/* Why Choose Us */}
      {/* <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose BROKERIN</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
             
              {
                title: "Verified Properties",
                description: "All properties are thoroughly verified for your peace of mind"
              },
              {
                title: "Integrated Services",
                description: "From finding a home to furnishing it - we've got you covered"
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock customer support for all your queries"
              },
              {
                title: "Secure Transactions",
                description: "Safe and secure payment processing for all services"
              },
              {
                title: "Regular Updates",
                description: "Stay informed with real-time updates on your requests"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <div className="flex items-start gap-4">
                  <CheckCircleIcon className="w-6 h-6 text-violet-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            {[
              {
                name: "Santhosh Srinivas",
                role: "Founder & CEO",
                image: "/images/blank-profile.png"
              }
              /* {
                name: "Roshan Vennavalli",
                role: "Managing Director",
                image: "/images/blank-profile.png"
              },
              {
                name: "Bhavani S",
                role: "Accounts",
                image: "/images/blank-profile.png"
              } */
            ].map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="bg-gray-100 h-64 flex items-center justify-center">
                  <svg 
                    className="w-24 h-24 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

     

         {/* Stats Section */}
         <div className="bg-violet-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6"
            >
              <h2 className="text-4xl font-bold mb-2">500+</h2>
              <p className="text-lg">Happy Customers</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6"
            >
              <h2 className="text-4xl font-bold mb-2">1000+</h2>
              <p className="text-lg">Properties Listed</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6"
            >
              <h2 className="text-4xl font-bold mb-2">100+</h2>
              <p className="text-lg">Cities Covered</p>
            </motion.div>
          </div>
        </div>
      </div>

     

      {/* Why List with Us */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why List with BrokerIn?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg text-center"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      
    </div>
  );
}

export default About; 