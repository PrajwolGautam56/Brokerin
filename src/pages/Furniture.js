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
  const [selectedTab, setSelectedTab] = useState('buy');

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Furniture Collection</h1>

        <Tab.Group>
          <Tab.List className="flex space-x-4 border-b border-gray-200 mb-8">
            <Tab
              className={({ selected }) =>
                `py-2 px-4 text-sm font-medium border-b-2 ${
                  selected
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              Buy
            </Tab>
            <Tab
              className={({ selected }) =>
                `py-2 px-4 text-sm font-medium border-b-2 ${
                  selected
                    ? 'border-violet-500 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`
              }
            >
              Rent
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {furnitureData.map(item => (
                  <FurnitureCard 
                    key={item.id} 
                    furniture={item} 
                    mode="buy" 
                  />
                ))}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {furnitureData.map(item => (
                  <FurnitureCard 
                    key={item.id} 
                    furniture={item} 
                    mode="rent" 
                  />
                ))}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
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