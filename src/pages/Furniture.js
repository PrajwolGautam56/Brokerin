import { useState } from 'react';
import { Tab } from '@headlessui/react';

const furnitureData = [
  {
    id: 1,
    name: "Modern Sofa Set",
    price: "₹25,000",
    rentPrice: "₹2,500/month",
    image: "/images/furniture/sofa.jpg",
    category: "Living Room",
    description: "Comfortable 3-seater sofa with premium fabric upholstery"
  },
  // Add more furniture items...
];

function Furniture() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Furniture Store
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Coming Soon!
              </h2>
              <p className="text-gray-600 text-center mb-6">
                We're working hard to bring you a great selection of furniture for your home.
                This feature will be available soon.
              </p>
              <p className="text-sm text-gray-500">
                Stay tuned for updates on our furniture collection!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FurnitureCard({ furniture, mode }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <img 
          src={furniture.image} 
          alt={furniture.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{furniture.name}</h3>
          <p className="text-gray-600 mb-2">{furniture.category}</p>
          <p className="text-violet-600 font-semibold mb-4">
            {mode === 'buy' ? furniture.price : furniture.rentPrice}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-violet-500 text-white py-2 rounded-lg hover:bg-violet-600"
          >
            {mode === 'buy' ? 'Buy Now' : 'Rent Now'}
          </button>
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <RequestModal 
          furniture={furniture} 
          mode={mode}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function RequestModal({ furniture, mode, onClose }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          {mode === 'buy' ? 'Purchase Request' : 'Rental Request'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Contact Number</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2 rounded-lg border"
              required
            />
          </div>
          {mode === 'rent' && (
            <div>
              <label className="block text-gray-700 mb-2">Rental Duration</label>
              <select className="w-full px-4 py-2 rounded-lg border">
                <option>1 Month</option>
                <option>3 Months</option>
                <option>6 Months</option>
                <option>12 Months</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Furniture; 