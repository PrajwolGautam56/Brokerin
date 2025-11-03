import { useState, useEffect } from 'react';
import { furnitureService } from '../../services/furnitureService';
import { PencilIcon, TrashIcon, EyeIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

function AdminFurniture() {
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Furniture',
    item_type: '',
    brand: '',
    condition: 'Like New',
    listing_type: 'Rent',
    location: '',
    zipcode: '',
    delivery_available: false,
    delivery_charge: '',
    age_years: '',
    warranty: false,
    warranty_months: '',
    price_rent_monthly: '',
    price_sell_price: '',
    price_deposit: '',
    dimensions_length: '',
    dimensions_width: '',
    dimensions_height: '',
    dimensions_unit: 'cm',
    address_street: '',
    address_city: '',
    address_state: '',
    address_country: 'India',
    features: ''
  });

  useEffect(() => {
    fetchFurniture();
  }, []);

  const fetchFurniture = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await furnitureService.getAllFurniture();
      setFurniture(response.furniture || []);
    } catch (error) {
      console.error('Error fetching furniture:', error);
      setError('Failed to load furniture');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files.slice(0, 10)); // Max 10 photos
  };

  const handleAddFurniture = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to add furniture.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Required fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('item_type', formData.item_type);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('listing_type', formData.listing_type);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('zipcode', formData.zipcode);

      // Optional fields
      if (formData.brand) formDataToSend.append('brand', formData.brand);
      if (formData.price_rent_monthly) formDataToSend.append('price[rent_monthly]', formData.price_rent_monthly);
      if (formData.price_sell_price) formDataToSend.append('price[sell_price]', formData.price_sell_price);
      if (formData.price_deposit) formDataToSend.append('price[deposit]', formData.price_deposit);
      
      formDataToSend.append('delivery_available', formData.delivery_available);
      if (formData.delivery_charge) formDataToSend.append('delivery_charge', formData.delivery_charge);
      if (formData.age_years) formDataToSend.append('age_years', formData.age_years);
      formDataToSend.append('warranty', formData.warranty);
      if (formData.warranty_months) formDataToSend.append('warranty_months', formData.warranty_months);

      // Dimensions
      if (formData.dimensions_length) formDataToSend.append('dimensions[length]', formData.dimensions_length);
      if (formData.dimensions_width) formDataToSend.append('dimensions[width]', formData.dimensions_width);
      if (formData.dimensions_height) formDataToSend.append('dimensions[height]', formData.dimensions_height);
      formDataToSend.append('dimensions[unit]', formData.dimensions_unit);

      // Address
      if (formData.address_street) formDataToSend.append('address[street]', formData.address_street);
      if (formData.address_city) formDataToSend.append('address[city]', formData.address_city);
      if (formData.address_state) formDataToSend.append('address[state]', formData.address_state);
      formDataToSend.append('address[country]', formData.address_country);

      // Features
      if (formData.features) {
        const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
        formDataToSend.append('features', JSON.stringify(featuresArray));
      }

      // Photos
      selectedFiles.forEach(file => {
        formDataToSend.append('photos', file);
      });

      await furnitureService.addFurniture(formDataToSend);
      setSuccess('Furniture added successfully!');
      setIsAddModalOpen(false);
      resetForm();
      fetchFurniture();
    } catch (error) {
      console.error('Error adding furniture:', error);
      setError(error.message || 'Failed to add furniture');
    }
  };

  const handleEdit = async (item) => {
    setEditingFurniture(item);
    // Populate form with furniture data
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'Furniture',
      item_type: item.item_type || '',
      brand: item.brand || '',
      condition: item.condition || 'Like New',
      listing_type: item.listing_type || 'Rent',
      location: item.location || '',
      zipcode: item.zipcode || '',
      delivery_available: item.delivery_available || false,
      delivery_charge: item.delivery_charge || '',
      age_years: item.age_years || '',
      warranty: item.warranty || false,
      warranty_months: item.warranty_months || '',
      price_rent_monthly: item.price?.rent_monthly || '',
      price_sell_price: item.price?.sell_price || '',
      price_deposit: item.price?.deposit || '',
      dimensions_length: item.dimensions?.length || '',
      dimensions_width: item.dimensions?.width || '',
      dimensions_height: item.dimensions?.height || '',
      dimensions_unit: item.dimensions?.unit || 'cm',
      address_street: item.address?.street || '',
      address_city: item.address?.city || '',
      address_state: item.address?.state || '',
      address_country: item.address?.country || 'India',
      features: item.features ? (Array.isArray(item.features) ? item.features.join(', ') : item.features) : ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateFurniture = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Required fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('item_type', formData.item_type);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('listing_type', formData.listing_type);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('zipcode', formData.zipcode);

      // Optional fields
      if (formData.brand) formDataToSend.append('brand', formData.brand);
      if (formData.price_rent_monthly) formDataToSend.append('price[rent_monthly]', formData.price_rent_monthly);
      if (formData.price_sell_price) formDataToSend.append('price[sell_price]', formData.price_sell_price);
      if (formData.price_deposit) formDataToSend.append('price[deposit]', formData.price_deposit);
      
      formDataToSend.append('delivery_available', formData.delivery_available);
      if (formData.delivery_charge) formDataToSend.append('delivery_charge', formData.delivery_charge);
      if (formData.age_years) formDataToSend.append('age_years', formData.age_years);
      formDataToSend.append('warranty', formData.warranty);
      if (formData.warranty_months) formDataToSend.append('warranty_months', formData.warranty_months);

      // Dimensions
      if (formData.dimensions_length) formDataToSend.append('dimensions[length]', formData.dimensions_length);
      if (formData.dimensions_width) formDataToSend.append('dimensions[width]', formData.dimensions_width);
      if (formData.dimensions_height) formDataToSend.append('dimensions[height]', formData.dimensions_height);
      formDataToSend.append('dimensions[unit]', formData.dimensions_unit);

      // Address
      if (formData.address_street) formDataToSend.append('address[street]', formData.address_street);
      if (formData.address_city) formDataToSend.append('address[city]', formData.address_city);
      if (formData.address_state) formDataToSend.append('address[state]', formData.address_state);
      formDataToSend.append('address[country]', formData.address_country);

      // Features
      if (formData.features) {
        const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
        formDataToSend.append('features', JSON.stringify(featuresArray));
      }

      // Photos (only add new ones if selected)
      selectedFiles.forEach(file => {
        formDataToSend.append('photos', file);
      });

      await furnitureService.updateFurniture(editingFurniture._id, formDataToSend);
      setSuccess('Furniture updated successfully!');
      setIsEditModalOpen(false);
      setEditingFurniture(null);
      resetForm();
      fetchFurniture();
    } catch (error) {
      console.error('Error updating furniture:', error);
      setError(error.message || 'Failed to update furniture');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this furniture item?')) {
      try {
        await furnitureService.deleteFurniture(id);
        setFurniture(prev => prev.filter(item => item._id !== id));
        setSuccess('Furniture deleted successfully!');
      } catch (error) {
        console.error('Error deleting furniture:', error);
        setError(error.message || 'Failed to delete furniture');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Furniture',
      item_type: '',
      brand: '',
      condition: 'Like New',
      listing_type: 'Rent',
      location: '',
      zipcode: '',
      delivery_available: false,
      delivery_charge: '',
      age_years: '',
      warranty: false,
      warranty_months: '',
      price_rent_monthly: '',
      price_sell_price: '',
      price_deposit: '',
      dimensions_length: '',
      dimensions_width: '',
      dimensions_height: '',
      dimensions_unit: 'cm',
      address_street: '',
      address_city: '',
      address_state: '',
      address_country: 'India',
      features: ''
    });
    setSelectedFiles([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Furniture Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
        >
          Add New Furniture
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Furniture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {furniture.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-48">
              {item.photos && item.photos.length > 0 ? (
                <img src={item.photos[0]} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
              )}
              <div className="absolute top-2 right-2">
                <span className="bg-violet-500 text-white px-2 py-1 rounded text-xs">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{item.item_type}</span>
                <span className="text-sm text-gray-600">{item.condition}</span>
              </div>
              {item.listing_type === 'Rent' && (
                <p className="text-violet-600 font-bold">₹{item.price?.rent_monthly}/month</p>
              )}
              {item.listing_type === 'Sell' && (
                <p className="text-violet-600 font-bold">₹{item.price?.sell_price}</p>
              )}
              {item.listing_type === 'Rent & Sell' && (
                <div>
                  <p className="text-violet-600 font-bold">Rent: ₹{item.price?.rent_monthly}/month</p>
                  <p className="text-violet-600 font-bold">Buy: ₹{item.price?.sell_price}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-violet-100 text-violet-700 px-3 py-2 rounded hover:bg-violet-200 text-sm flex items-center justify-center gap-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 text-sm flex items-center justify-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {furniture.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No furniture items found</p>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[90%] max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Furniture</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddFurniture} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Furniture">Furniture</option>
                    <option value="Appliance">Appliance</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Kitchenware">Kitchenware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Type *</label>
                  <input type="text" name="item_type" value={formData.item_type} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Sofa, TV, Refrigerator" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                  <select name="condition" value={formData.condition} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
                  <select name="listing_type" value={formData.listing_type} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Rent">Rent</option>
                    <option value="Sell">Sell</option>
                    <option value="Rent & Sell">Rent & Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zipcode *</label>
                  <input type="text" name="zipcode" value={formData.zipcode} onChange={handleInputChange} required pattern="[0-9]{6}" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹)</label>
                  <input type="number" name="price_rent_monthly" value={formData.price_rent_monthly} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price (₹)</label>
                  <input type="number" name="price_sell_price" value={formData.price_sell_price} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deposit (₹)</label>
                  <input type="number" name="price_deposit" value={formData.price_deposit} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                  <input type="number" name="dimensions_length" value={formData.dimensions_length} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                  <input type="number" name="dimensions_width" value={formData.dimensions_width} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input type="number" name="dimensions_height" value={formData.dimensions_height} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
                <input type="text" name="features" value={formData.features} onChange={handleInputChange} placeholder="e.g., 3-seater, Leather, Reclining" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (max 10)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div className="flex items-center">
                <input type="checkbox" name="delivery_available" checked={formData.delivery_available} onChange={handleInputChange} className="h-4 w-4 text-violet-600" />
                <label className="ml-2 block text-sm text-gray-900">Delivery Available</label>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" name="warranty" checked={formData.warranty} onChange={handleInputChange} className="h-4 w-4 text-violet-600" />
                <label className="ml-2 block text-sm text-gray-900">Warranty Available</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
                  Add Furniture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingFurniture && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[90%] max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Furniture</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingFurniture(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateFurniture} className="space-y-4">
              {/* Same form fields as Add Modal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Furniture">Furniture</option>
                    <option value="Appliance">Appliance</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Kitchenware">Kitchenware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Type *</label>
                  <input type="text" name="item_type" value={formData.item_type} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                  <select name="condition" value={formData.condition} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
                  <select name="listing_type" value={formData.listing_type} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Rent">Rent</option>
                    <option value="Sell">Sell</option>
                    <option value="Rent & Sell">Rent & Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zipcode *</label>
                  <input type="text" name="zipcode" value={formData.zipcode} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹)</label>
                  <input type="number" name="price_rent_monthly" value={formData.price_rent_monthly} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price (₹)</label>
                  <input type="number" name="price_sell_price" value={formData.price_sell_price} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deposit (₹)</label>
                  <input type="number" name="price_deposit" value={formData.price_deposit} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
                <input type="text" name="features" value={formData.features} onChange={handleInputChange} placeholder="e.g., 3-seater, Leather, Reclining" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Photos (optional)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div className="flex items-center">
                <input type="checkbox" name="delivery_available" checked={formData.delivery_available} onChange={handleInputChange} className="h-4 w-4 text-violet-600" />
                <label className="ml-2 block text-sm text-gray-900">Delivery Available</label>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" name="warranty" checked={formData.warranty} onChange={handleInputChange} className="h-4 w-4 text-violet-600" />
                <label className="ml-2 block text-sm text-gray-900">Warranty Available</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingFurniture(null);
                  resetForm();
                }} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700">
                  Update Furniture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFurniture;

