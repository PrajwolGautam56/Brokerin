import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { furnitureService } from '../../services/furnitureService';
import { stockService } from '../../services/stockService';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function AdminFurniture() {
  const [furniture, setFurniture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [success, setSuccess] = useState('');
  const [stockValues, setStockValues] = useState({}); // Local state for stock inputs

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Furniture',
    item_type: '',
    brand: '',
    condition: 'Like New',
    listing_type: 'Rent',
    availability: 'Available',
    status: 'Available',
    stock: 1,
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
      logger.error('Error fetching furniture:', error);
      setError('Failed to load furniture');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
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

    // Validate stock value
    const stockValue = parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      setError('Stock must be a valid number greater than or equal to 0.');
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
      formDataToSend.append('availability', formData.availability);
      formDataToSend.append('status', formData.status);
      // Ensure stock is sent as a number
      const stockValue = parseInt(formData.stock) || 1;
      formDataToSend.append('stock', stockValue);
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

      // Features - ensure we don't double-stringify
      if (formData.features) {
        // Split by comma and clean up - remove any nested JSON strings
        const featuresArray = formData.features
          .split(',')
          .map(f => f.trim())
          .filter(f => f)
          .map(f => {
            // If it's already a JSON string, parse it first to get the actual value
            try {
              const parsed = JSON.parse(f);
              // If parsed is an array, get the first element (which might be another string)
              if (Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                // If first element is also a stringified JSON, parse again
                if (typeof first === 'string') {
                  try {
                    const nested = JSON.parse(first);
                    return Array.isArray(nested) ? nested[0] : nested;
                  } catch {
                    return first;
                  }
                }
                return first;
              }
              return parsed;
            } catch {
              // Not JSON, use as-is
              return f;
            }
          });
        // Stringify only once
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
      logger.error('Error adding furniture:', error);
      setError(error.message || 'Failed to add furniture');
    }
  };

  const handleEdit = async (item) => {
    setEditingFurniture(item);
    
    // Parse features - handle array, stringified JSON (including nested), or plain string
    let featuresString = '';
    if (item.features) {
      if (Array.isArray(item.features)) {
        // Handle array - might contain stringified JSON strings
        const extractedFeatures = [];
        item.features.forEach(feature => {
          if (typeof feature === 'string') {
            // Try to parse if it's a JSON string
            try {
              const parsed = JSON.parse(feature);
              if (Array.isArray(parsed)) {
                // Nested array - extract all items
                extractedFeatures.push(...parsed);
              } else {
                extractedFeatures.push(parsed);
              }
            } catch (e) {
              // Not JSON, use as-is
              extractedFeatures.push(feature);
            }
          } else {
            extractedFeatures.push(feature);
          }
        });
        featuresString = extractedFeatures.join(', ');
      } else if (typeof item.features === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(item.features);
          if (Array.isArray(parsed)) {
            // Recursively parse nested arrays
            const extractedFeatures = [];
            parsed.forEach(f => {
              if (typeof f === 'string') {
                try {
                  const nested = JSON.parse(f);
                  if (Array.isArray(nested)) {
                    extractedFeatures.push(...nested);
                  } else {
                    extractedFeatures.push(nested);
                  }
                } catch {
                  extractedFeatures.push(f);
                }
              } else {
                extractedFeatures.push(f);
              }
            });
            featuresString = extractedFeatures.join(', ');
          } else {
            featuresString = String(parsed);
          }
        } catch (e) {
          // Not JSON, use as-is (comma-separated string)
          featuresString = item.features;
        }
      } else {
        featuresString = String(item.features);
      }
    }
    
    // Populate form with furniture data
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'Furniture',
      item_type: item.item_type || '',
      brand: item.brand || '',
      condition: item.condition || 'Like New',
      listing_type: item.listing_type || 'Rent',
      availability: item.availability || 'Available',
      status: item.status || 'Available',
      stock: item.stock || 1,
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
      features: featuresString
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateFurniture = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    // Validate stock value
    const stockValue = parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      setError('Stock must be a valid number greater than or equal to 0.');
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
      formDataToSend.append('availability', formData.availability);
      formDataToSend.append('status', formData.status);
      // Ensure stock is sent as a number
      const stockValue = parseInt(formData.stock) || 1;
      formDataToSend.append('stock', stockValue);
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

      // Features - ensure we don't double-stringify
      if (formData.features) {
        // Split by comma and clean up - remove any nested JSON strings
        const featuresArray = formData.features
          .split(',')
          .map(f => f.trim())
          .filter(f => f)
          .map(f => {
            // If it's already a JSON string, parse it first to get the actual value
            try {
              const parsed = JSON.parse(f);
              // If parsed is an array, get the first element (which might be another string)
              if (Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                // If first element is also a stringified JSON, parse again
                if (typeof first === 'string') {
                  try {
                    const nested = JSON.parse(first);
                    return Array.isArray(nested) ? nested[0] : nested;
                  } catch {
                    return first;
                  }
                }
                return first;
              }
              return parsed;
            } catch {
              // Not JSON, use as-is
              return f;
            }
          });
        // Stringify only once
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
      logger.error('Error updating furniture:', error);
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
        logger.error('Error deleting furniture:', error);
        setError(error.message || 'Failed to delete furniture');
      }
    }
  };

  const handleStatusUpdate = async (furnitureId, field, value) => {
    try {
      const furnitureItem = furniture.find(item => item._id === furnitureId);
      if (!furnitureItem) return;

      // If updating stock, use dedicated stock endpoint
      if (field === 'stock') {
        const stockValue = parseInt(value) || 0;
        
        try {
          const response = await stockService.updateStock(furnitureId, stockValue, 'set');
          
          // Handle different response structures
          const updatedFurniture = response.furniture || response.data?.furniture || response;
          const newStock = updatedFurniture?.stock ?? response.new_stock ?? stockValue;
          const previousStock = response.previous_stock ?? furnitureItem.stock ?? 0;
          
          // Update local state
          setFurniture(prev => prev.map(item => 
            item._id === furnitureId 
              ? { 
                  ...item, 
                  stock: newStock,
                  availability: updatedFurniture?.availability || item.availability,
                  status: updatedFurniture?.status || item.status
                }
              : item
          ));
          
          toast.success(`Stock updated from ${previousStock} to ${newStock}!`);
        } catch (stockError) {
          // Fallback: If stock endpoint doesn't exist, use full update
          if (stockError.response?.status === 404 || stockError.message?.includes('404')) {
            logger.warn('Stock endpoint not found, using full update endpoint');
            const formData = new FormData();
            formData.append('stock', stockValue);
            formData.append('availability', furnitureItem.availability || 'Available');
            formData.append('status', furnitureItem.status || 'Available');
            
            const updated = await furnitureService.updateFurniture(furnitureId, formData);
            
            setFurniture(prev => prev.map(item => 
              item._id === furnitureId 
                ? { ...item, stock: stockValue, ...updated }
                : item
            ));
            
            toast.success(`Stock updated to ${stockValue}!`);
          } else {
            throw stockError;
          }
        }
      } else {
        // For status/availability, use quick status update endpoint
        const statusData = {
          status: field === 'status' ? value : (furnitureItem.status || 'Available'),
          availability: field === 'availability' ? value : (furnitureItem.availability || 'Available')
        };

        await furnitureService.updateFurnitureStatus(furnitureId, statusData);
        
        // Update local state
        setFurniture(prev => prev.map(item => 
          item._id === furnitureId 
            ? { ...item, [field]: value }
            : item
        ));
        
        const fieldName = field === 'status' ? 'Status' : 'Availability';
        toast.success(`${fieldName} updated successfully!`);
      }
    } catch (error) {
      logger.error('Error updating furniture:', error);
      const errorMessage = error.details?.message || error.response?.data?.message || error.message || `Failed to update ${field}`;
      toast.error(errorMessage);
    }
  };

  const handleStockOperation = async (furnitureId, operation, amount = 1) => {
    try {
      const furnitureItem = furniture.find(item => item._id === furnitureId);
      if (!furnitureItem) return;

      const currentStock = furnitureItem.stock || 0;
      let newStock;

      try {
        const response = await stockService.updateStock(furnitureId, amount, operation);
        
        // Handle different response structures
        const updatedFurniture = response.furniture || response.data?.furniture || response;
        newStock = updatedFurniture?.stock ?? response.new_stock ?? (operation === 'add' ? currentStock + amount : Math.max(0, currentStock - amount));
        const previousStock = response.previous_stock ?? currentStock;
        
        // Update local state
        setFurniture(prev => prev.map(item => 
          item._id === furnitureId 
            ? { 
                ...item, 
                stock: newStock,
                availability: updatedFurniture?.availability || item.availability,
                status: updatedFurniture?.status || item.status
              }
            : item
        ));
        
        const operationText = operation === 'add' ? 'increased' : 'decreased';
        toast.success(`Stock ${operationText} by ${amount}! (${previousStock} → ${newStock})`);
      } catch (stockError) {
        // Fallback: If stock endpoint doesn't exist, use full update
        if (stockError.response?.status === 404 || stockError.message?.includes('404')) {
          logger.warn('Stock endpoint not found, using full update endpoint');
          
          if (operation === 'add') {
            newStock = currentStock + amount;
          } else if (operation === 'subtract') {
            newStock = Math.max(0, currentStock - amount);
          } else {
            newStock = amount;
          }
          
          const formData = new FormData();
          formData.append('stock', newStock);
          formData.append('availability', furnitureItem.availability || 'Available');
          formData.append('status', furnitureItem.status || 'Available');
          
          const updated = await furnitureService.updateFurniture(furnitureId, formData);
          
          setFurniture(prev => prev.map(item => 
            item._id === furnitureId 
              ? { ...item, stock: newStock, ...updated }
              : item
          ));
          
          const operationText = operation === 'add' ? 'increased' : 'decreased';
          toast.success(`Stock ${operationText} by ${amount}! (${currentStock} → ${newStock})`);
        } else {
          throw stockError;
        }
      }
    } catch (error) {
      logger.error('Error updating stock:', error);
      const errorMessage = error.details?.message || error.response?.data?.message || error.message || 'Failed to update stock';
      toast.error(errorMessage);
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
      availability: 'Available',
      status: 'Available',
      stock: 1,
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Furniture Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your furniture inventory and stock levels</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            + Add New Furniture
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">✓</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">✗</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Furniture Grid - Improved Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {furniture.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
            {/* Image Section */}
            <div className="relative h-56 bg-gray-100">
              {item.photos && item.photos.length > 0 ? (
                <img src={item.photos[0]} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5 space-y-4">
              {/* Title and Basic Info */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span className="font-medium">{item.item_type}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded">{item.condition}</span>
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-gray-200 pt-3">
                {item.listing_type === 'Rent' && (
                  <p className="text-violet-600 font-bold text-lg">₹{item.price?.rent_monthly || 0}/month</p>
                )}
                {item.listing_type === 'Sell' && (
                  <p className="text-violet-600 font-bold text-lg">₹{item.price?.sell_price || 0}</p>
                )}
                {item.listing_type === 'Rent & Sell' && (
                  <div className="space-y-1">
                    <p className="text-violet-600 font-bold text-base">Rent: ₹{item.price?.rent_monthly || 0}/mo</p>
                    <p className="text-violet-600 font-bold text-base">Buy: ₹{item.price?.sell_price || 0}</p>
                  </div>
                )}
              </div>

              {/* Stock Section - Prominent */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Stock</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStockOperation(item._id, 'subtract', 1)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-bold text-sm shadow-sm"
                    title="Decrease by 1"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={stockValues[item._id] !== undefined ? stockValues[item._id] : (item.stock || 0)}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setStockValues(prev => ({ ...prev, [item._id]: newValue }));
                    }}
                    onBlur={(e) => {
                      const newValue = parseInt(e.target.value) || 0;
                      if (newValue !== (item.stock || 0)) {
                        handleStatusUpdate(item._id, 'stock', newValue);
                      }
                      setStockValues(prev => {
                        const updated = { ...prev };
                        delete updated[item._id];
                        return updated;
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newValue = parseInt(e.target.value) || 0;
                        if (newValue !== (item.stock || 0)) {
                          handleStatusUpdate(item._id, 'stock', newValue);
                        }
                        e.target.blur();
                      }
                    }}
                    className={`flex-1 px-3 py-2 text-center font-bold text-base border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      (item.stock || 0) > 0 
                        ? 'bg-blue-50 text-blue-700 border-blue-400' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-400'
                    }`}
                  />
                  <button
                    onClick={() => handleStockOperation(item._id, 'add', 1)}
                    className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-bold text-sm shadow-sm"
                    title="Increase by 1"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Status and Availability - Stacked */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Availability</label>
                  <select
                    value={item.availability || 'Available'}
                    onChange={(e) => handleStatusUpdate(item._id, 'availability', e.target.value)}
                    className={`w-full px-3 py-2 text-sm font-medium border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      item.availability === 'Available' 
                        ? 'bg-green-50 text-green-800 border-green-400' 
                        : 'bg-red-50 text-red-800 border-red-400'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={item.status || 'Available'}
                    onChange={(e) => handleStatusUpdate(item._id, 'status', e.target.value)}
                    className={`w-full px-3 py-2 text-sm font-medium border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                      item.status === 'Available' 
                        ? 'bg-green-50 text-green-800 border-green-400' 
                        : 'bg-red-50 text-red-800 border-red-400'
                    }`}
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 bg-violet-600 text-white px-4 py-2.5 rounded-md hover:bg-violet-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {furniture.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No furniture items found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first furniture item</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              Add Your First Item
            </button>
          </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability *</label>
                  <select name="availability" value={formData.availability} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} min="0" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
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

              <div className="grid grid-cols-4 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select name="dimensions_unit" value={formData.dimensions_unit} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="cm">cm</option>
                    <option value="inches">inches</option>
                    <option value="meters">meters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
                <input type="text" name="features" value={formData.features} onChange={handleInputChange} placeholder="e.g., 3-seater, Leather, Reclining" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age (Years)</label>
                  <input type="number" name="age_years" value={formData.age_years} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="delivery_available" checked={formData.delivery_available} onChange={handleInputChange} className="h-4 w-4 text-violet-600" />
                  <label className="ml-2 block text-sm text-gray-900">Delivery Available</label>
                </div>
                {formData.delivery_available && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Charge (₹)</label>
                    <input type="number" name="delivery_charge" value={formData.delivery_charge} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input type="checkbox" name="warranty" checked={formData.warranty} onChange={handleInputChange} className="h-4 w-4 text-violet-600" />
                  <label className="ml-2 block text-sm text-gray-900">Warranty Available</label>
                </div>
                {formData.warranty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warranty (Months)</label>
                    <input type="number" name="warranty_months" value={formData.warranty_months} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Address Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                    <input type="text" name="address_street" value={formData.address_street} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input type="text" name="address_city" value={formData.address_city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input type="text" name="address_state" value={formData.address_state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input type="text" name="address_country" value={formData.address_country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos (max 10)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability *</label>
                  <select name="availability" value={formData.availability} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} min="0" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
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

              <div className="grid grid-cols-4 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select name="dimensions_unit" value={formData.dimensions_unit} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="cm">cm</option>
                    <option value="inches">inches</option>
                    <option value="meters">meters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
                <input type="text" name="features" value={formData.features} onChange={handleInputChange} placeholder="e.g., 3-seater, Leather, Reclining" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age (Years)</label>
                  <input type="number" name="age_years" value={formData.age_years} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="delivery_available" checked={formData.delivery_available} onChange={handleInputChange} className="h-4 w-4 text-violet-600" />
                  <label className="ml-2 block text-sm text-gray-900">Delivery Available</label>
                </div>
                {formData.delivery_available && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Charge (₹)</label>
                    <input type="number" name="delivery_charge" value={formData.delivery_charge} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input type="checkbox" name="warranty" checked={formData.warranty} onChange={handleInputChange} className="h-4 w-4 text-violet-600" />
                  <label className="ml-2 block text-sm text-gray-900">Warranty Available</label>
                </div>
                {formData.warranty && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Warranty (Months)</label>
                    <input type="number" name="warranty_months" value={formData.warranty_months} onChange={handleInputChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Address Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                    <input type="text" name="address_street" value={formData.address_street} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input type="text" name="address_city" value={formData.address_city} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input type="text" name="address_state" value={formData.address_state} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input type="text" name="address_country" value={formData.address_country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Photos (optional)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
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

