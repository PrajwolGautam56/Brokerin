import { useState, useEffect } from 'react';
import { propertyService } from '../../services/propertyService';
import { PencilIcon, TrashIcon, EyeIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import api from '../../axiosConfig';

function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [editSelectedFiles, setEditSelectedFiles] = useState([]);
  const [editPreviewUrls, setEditPreviewUrls] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const initialFormData = {
    name: '',
    description: '',
    type: '',
    size: '',
    furnishing: 'None',
    availability: 'Immediate',
    building_type: 'Apartment',
    bhk: '',
    bathrooms: '',
    bedrooms: '',
    listing_type: '',
    parking: 'Reserved',
    property_type: 'Residential',
    location: '',
    amenities: '',
    status: 'Available',
    society: '',
    zipcode: '',
    pets_allowed: false,
    price: {
      rent_monthly: '',
      sell_price: '',
      deposit: ''
    },
    address: {
      street: '',
      city: '',
      state: 'Karnataka',
      country: 'India'
    },
    location_coordinates: {
      latitude: '12.813139',
      longitude: '77.506167'
    },
    added_by: ''
  };

  const [editFormData, setEditFormData] = useState({ ...initialFormData });
  const [addFormData, setAddFormData] = useState({ ...initialFormData });

  const resetForm = (formType) => {
    if (formType === 'add') {
      setAddFormData({ ...initialFormData });
      setSelectedFiles([]);
      setPreviewUrls([]);
    } else {
      setEditFormData({ ...initialFormData });
      setEditSelectedFiles([]);
      setEditPreviewUrls([]);
      setExistingPhotos([]);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertyService.getAllProperties();
      if (response && Array.isArray(response.properties)) {
        setProperties(response.properties);
        console.log(`Loaded ${response.properties.length} properties`);
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (property) => {
    try {
      // First check if the property exists
      console.log(`Checking if property with ID ${property._id} exists`);
      const exists = await propertyService.checkPropertyExists(property._id);
      
      if (!exists) {
        alert(`Property with ID ${property._id} could not be found. The list will be refreshed.`);
        await fetchProperties();
        return;
      }
      
      // If it exists, fetch the details
      console.log(`Fetching property details for ID: ${property._id}`);
      const propertyDetails = await propertyService.getPropertyById(property._id);
      
      if (!propertyDetails) {
        alert(`Property with ID ${property._id} could not be found. The list will be refreshed.`);
        await fetchProperties();
        return;
      }
      
      setSelectedProperty(propertyDetails);
      setEditFormData({
        name: propertyDetails.name || '',
        description: propertyDetails.description || '',
        type: propertyDetails.type || '',
        size: propertyDetails.size || '',
        furnishing: propertyDetails.furnishing || 'None',
        availability: propertyDetails.availability || 'Immediate',
        building_type: propertyDetails.building_type || 'Apartment',
        bhk: propertyDetails.bhk || '',
        bathrooms: propertyDetails.bathrooms || '',
        bedrooms: propertyDetails.bedrooms || '',
        listing_type: propertyDetails.listing_type || '',
        parking: propertyDetails.parking || 'Reserved',
        property_type: propertyDetails.property_type || 'Residential',
        location: propertyDetails.location || '',
        amenities: propertyService.formatAmenities(propertyDetails.amenities).join(', ') || '',
        status: propertyDetails.status || 'Available',
        society: propertyDetails.society || '',
        zipcode: propertyDetails.zipcode || '',
        pets_allowed: propertyDetails.pets_allowed || false,
        price: {
          rent_monthly: propertyDetails.price?.rent_monthly || '',
          sell_price: propertyDetails.price?.sell_price || '',
          deposit: propertyDetails.price?.deposit || ''
        },
        address: {
          street: propertyDetails.address?.street || '',
          city: propertyDetails.address?.city || '',
          state: propertyDetails.address?.state || 'Karnataka',
          country: propertyDetails.address?.country || 'India'
        },
        location_coordinates: {
          latitude: propertyDetails.location_coordinates?.latitude || '12.813139',
          longitude: propertyDetails.location_coordinates?.longitude || '77.506167'
        },
        added_by: propertyDetails.added_by || ''
      });
      // Load existing photos
      if (propertyDetails.photos && propertyDetails.photos.length > 0) {
        setExistingPhotos(propertyDetails.photos);
      } else {
        setExistingPhotos([]);
      }
      setEditSelectedFiles([]);
      setEditPreviewUrls([]);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching property details:', error);
      if (error.status === 404) {
        alert(`Property with ID ${property._id} not found. It may have been deleted. The list will be refreshed.`);
        await fetchProperties();
      } else {
        alert(error.message || 'Failed to load property details');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get current user
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (!token || !user) {
        alert('Please log in to update a property.');
        return;
      }
      const currentUser = JSON.parse(user);
      const userId = currentUser?.id || currentUser?._id;
      
      // Create a FormData object for the update
      const formData = new FormData();
      
      // Add basic fields
      if (editFormData.name) formData.append('name', editFormData.name);
      if (editFormData.description) formData.append('description', editFormData.description);
      if (editFormData.type) formData.append('type', editFormData.type);
      if (editFormData.size) formData.append('size', editFormData.size);
      if (editFormData.furnishing) formData.append('furnishing', editFormData.furnishing);
      if (editFormData.availability) formData.append('availability', editFormData.availability);
      if (editFormData.building_type) formData.append('building_type', editFormData.building_type);
      if (editFormData.bhk) formData.append('bhk', editFormData.bhk);
      if (editFormData.bathrooms) formData.append('bathrooms', editFormData.bathrooms);
      if (editFormData.bedrooms) formData.append('bedrooms', editFormData.bedrooms);
      if (editFormData.listing_type) formData.append('listing_type', editFormData.listing_type);
      if (editFormData.parking) formData.append('parking', editFormData.parking);
      if (editFormData.property_type) formData.append('property_type', editFormData.property_type);
      if (editFormData.location) formData.append('location', editFormData.location);
      if (editFormData.status) formData.append('status', editFormData.status);
      if (editFormData.society) formData.append('society', editFormData.society);
      if (editFormData.zipcode) formData.append('zipcode', editFormData.zipcode);
      formData.append('pets_allowed', editFormData.pets_allowed);
      
      // Add price fields
      if (editFormData.price.rent_monthly) {
        formData.append('price[rent_monthly]', Number(editFormData.price.rent_monthly));
      }
      if (editFormData.price.sell_price) {
        formData.append('price[sell_price]', Number(editFormData.price.sell_price));
      }
      if (editFormData.price.deposit) {
        formData.append('price[deposit]', Number(editFormData.price.deposit));
      }
      
      // Add address fields
      if (editFormData.address.street) {
        formData.append('address[street]', editFormData.address.street);
      }
      if (editFormData.address.city) {
        formData.append('address[city]', editFormData.address.city);
      }
      if (editFormData.address.state) {
        formData.append('address[state]', editFormData.address.state);
      }
      if (editFormData.address.country) {
        formData.append('address[country]', editFormData.address.country);
      }
      
      // Add amenities array - use amenities[] format
      if (editFormData.amenities) {
        const amenitiesArray = editFormData.amenities.split(',').map(item => item.trim()).filter(item => item);
        amenitiesArray.forEach(amenity => {
          formData.append('amenities[]', amenity);
        });
      }
      
      // Handle location coordinates
      if (editFormData.location_coordinates) {
        if (editFormData.location_coordinates.latitude) {
          formData.append('location_coordinates[latitude]', editFormData.location_coordinates.latitude);
        }
        if (editFormData.location_coordinates.longitude) {
          formData.append('location_coordinates[longitude]', editFormData.location_coordinates.longitude);
        }
      }

      // ⚠️ IMPORTANT: Add new photos using 'photos' field name for updates
      if (editSelectedFiles && editSelectedFiles.length > 0) {
        editSelectedFiles.forEach((file) => {
          if (file instanceof File) {
            formData.append('photos', file);
          }
        });
      }

      console.log('Updating property with ID:', selectedProperty._id);
      
      // Add user ID to the request if available
      if (userId) {
        formData.append('added_by', userId);
      }
      
      // Use the axios instance instead of fetch to ensure Authorization header is included
      // Axios will automatically set Content-Type to multipart/form-data for FormData
      await api.put(`/api/properties/${selectedProperty._id}`, formData);
      
      await fetchProperties(); // Refresh the list
      setIsEditModalOpen(false);
      resetForm('edit');
    } catch (error) {
      console.error('Error updating property:', error);
      let errorMessage = 'Failed to update property';
      
      if (error.response?.status === 404) {
        errorMessage = `Property with ID ${selectedProperty._id} not found. It may have been deleted.`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Go to home, use navbar login popup
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          errorMessage = `Validation errors: ${errorMessages}`;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.deleteProperty(propertyId);
        setProperties(prev => prev.filter(prop => prop._id !== propertyId));
        alert('Property deleted successfully');
      } catch (error) {
        console.error('Error deleting property:', error);
        alert(error.message || 'Failed to delete property');
      }
    }
  };

  const handleInputChange = (e, formType = 'edit') => {
    const { name, value, type, checked } = e.target;
    const setFormData = formType === 'edit' ? setEditFormData : setAddFormData;

    if (name.startsWith('price.')) {
      const priceField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        price: {
          ...prev.price,
          [priceField]: value
        }
      }));
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileSelect = (e, formType = 'add') => {
    const files = Array.from(e.target.files);
    console.log(`File select triggered for ${formType}, files:`, files.length);
    
    if (!files || files.length === 0) {
      console.warn('No files selected');
      return;
    }
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp'].includes(file.type.toLowerCase());
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      console.log(`File ${file.name}: type=${file.type}, size=${file.size}, validType=${isValidType}, validSize=${isValidSize}`);
      
      if (!isValidType) {
        setError(`File ${file.name}: Only JPG, PNG, GIF, and WebP files are allowed.`);
        return false;
      }
      if (!isValidSize) {
        setError(`File ${file.name}: File size should be less than 5MB.`);
        return false;
      }
      return true;
    });
    
    console.log(`Valid files: ${validFiles.length} out of ${files.length}`);
    
    if (validFiles.length > 0) {
      if (formType === 'add') {
        console.log('Setting selectedFiles for add form:', validFiles.map(f => f.name));
        setSelectedFiles(validFiles);
        // Create preview URLs
        const urls = validFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        setError(''); // Clear any previous errors
      } else {
        console.log('Adding files to edit form:', validFiles.map(f => f.name));
        setEditSelectedFiles(prev => [...prev, ...validFiles]);
        // Create preview URLs for new files
        const urls = validFiles.map(file => URL.createObjectURL(file));
        setEditPreviewUrls(prev => [...prev, ...urls]);
        setError(''); // Clear any previous errors
      }
    } else {
      console.error('No valid files after filtering');
      if (files.length > 0) {
        setError('No valid files selected. Please check file type and size.');
      }
    }
  };
  
  const handleRemoveEditPhoto = (index, isNew = false) => {
    if (isNew) {
      // Remove from new photos
      setEditSelectedFiles(prev => prev.filter((_, i) => i !== index));
      setEditPreviewUrls(prev => {
        const url = prev[index];
        if (url) URL.revokeObjectURL(url);
        return prev.filter((_, i) => i !== index);
      });
    } else {
      // Remove from existing photos
      setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      // Debug: Check token and user data
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('Auth Debug:', {
        token: token ? 'Token exists' : 'No token found',
        user: user ? JSON.parse(user) : 'No user found'
      });

      if (!token || !user) {
        console.error('Authentication Error:', {
          token: token ? 'Token exists' : 'No token found',
          user: user ? 'User exists' : 'No user found'
        });
        setError('Please log in to add a property.');
        return; // Return early instead of throwing error
      }

      const currentUser = JSON.parse(user);
      if (!currentUser) {
        console.error('User Data Error: No user found');
        setError('Please log in to add a property.');
        return; // Return early instead of throwing error
      }
      
      // Check for id or _id field
      const userId = currentUser.id || currentUser._id;
      if (!userId) {
        console.error('User Data Error:', {
          currentUser,
          hasId: 'No',
          has_Id: 'No'
        });
        setError('Invalid user data. Please log in again.');
        return;
      }

      const formData = new FormData();
      
      // Add optional fields only if they have values
      if (addFormData.name && addFormData.name.trim()) {
        formData.append('name', addFormData.name);
      }
      
      // Add optional fields only if they have values
      if (addFormData.description) formData.append('description', addFormData.description);
      if (addFormData.size) formData.append('size', addFormData.size);
      if (addFormData.furnishing) formData.append('furnishing', addFormData.furnishing);
      if (addFormData.availability) formData.append('availability', addFormData.availability);
      if (addFormData.building_type) formData.append('building_type', addFormData.building_type);
      if (addFormData.bhk) formData.append('bhk', addFormData.bhk);
      if (addFormData.bedrooms) formData.append('bedrooms', addFormData.bedrooms);
      if (addFormData.bathrooms) formData.append('bathrooms', addFormData.bathrooms);
      if (addFormData.listing_type) formData.append('listing_type', addFormData.listing_type);
      if (addFormData.parking) formData.append('parking', addFormData.parking);
      if (addFormData.property_type) formData.append('property_type', addFormData.property_type);
      if (addFormData.location) formData.append('location', addFormData.location);
      if (addFormData.zipcode) formData.append('zipcode', addFormData.zipcode);
      // Add amenities array - use amenities[] format
      if (addFormData.amenities) {
        const amenitiesArray = addFormData.amenities.split(',').map(item => item.trim()).filter(item => item);
        amenitiesArray.forEach(amenity => {
          formData.append('amenities[]', amenity);
        });
      }
      if (addFormData.status) formData.append('status', addFormData.status);
      if (addFormData.society) formData.append('society', addFormData.society);
      formData.append('pets_allowed', addFormData.pets_allowed ? 'true' : 'false');
      
      // Add price fields only if they have values
      if (addFormData.price.rent_monthly && !isNaN(addFormData.price.rent_monthly)) {
        formData.append('price[rent_monthly]', Number(addFormData.price.rent_monthly));
      }
      if (addFormData.price.deposit && !isNaN(addFormData.price.deposit)) {
        formData.append('price[deposit]', Number(addFormData.price.deposit));
      }
      
      // Add address fields
      formData.append('address[street]', addFormData.address.street || '');
      formData.append('address[city]', addFormData.address.city || '');
      formData.append('address[state]', addFormData.address.state || '');
      
      // Add location coordinates
      formData.append('location_coordinates[latitude]', addFormData.location_coordinates.latitude);
      formData.append('location_coordinates[longitude]', addFormData.location_coordinates.longitude);
      
      // Add images - handle multiple files
      console.log('Selected files count:', selectedFiles?.length || 0);
      if (selectedFiles && selectedFiles.length > 0) {
        console.log('Appending images to FormData...');
        selectedFiles.forEach((file, index) => {
          console.log(`Appending image ${index + 1}:`, file.name, file.type, file.size);
          formData.append('images', file);
        });
      } else {
        console.warn('No images selected to upload');
      }
      
      // Add user ID
      formData.append('added_by', userId);

      // Log form data for debugging
      console.log('=== Form data being sent ===');
      let imageCount = 0;
      for (let [key, value] of formData.entries()) {
        if (key === 'images') {
          imageCount++;
          console.log(`${key}[${imageCount}]: File object`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log(`Total images: ${imageCount}`);
      console.log('=== End of form data ===');

      // Use the axios instance for the API call with proper headers
      // Note: Don't set headers manually - let the interceptor add Authorization
      // Axios will automatically set Content-Type to multipart/form-data for FormData
      const response = await api.post('/api/properties', formData);

      if (response.data) {
        setProperties(prev => [...prev, response.data]);
        setIsAddModalOpen(false);
        resetForm('add');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      
      // Log the complete error object for debugging
      console.error('Complete error object:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        // Clear auth data and redirect to home
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Go to home, use navbar login popup
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        console.error('=== 400 Error Details ===');
        console.error('Error data:', JSON.stringify(errorData, null, 2));
        console.error('=== End of 400 Error Details ===');
        
        if (errorData.errors) {
          // Handle validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError('Invalid data provided. Please check all fields.');
        }
      } else if (error.response?.status === 403) {
        setError('You do not have permission to add properties.');
      } else if (error.response?.status === 413) {
        setError('The file size is too large. Please reduce the size of your images.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (!error.response) {
        setError('Network error. Please check your connection.');
      } else {
        setError(error.response?.data?.message || 'Failed to add property. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700"
        >
          Add New Property
        </button>
      </div>

      {/* Property List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {property.photos && property.photos.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={propertyService.getImageUrl(property.photos[0])}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {property.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.bhk} BHK
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.listing_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {property.listing_type === 'Rent'
                        ? `₹${property.price?.rent_monthly?.toLocaleString()}/month`
                        : `₹${property.price?.sell_price?.toLocaleString()}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      property.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(property)}
                        className="text-violet-600 hover:text-violet-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => window.open(`/property/${property._id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Property
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddProperty} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={addFormData.name}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={addFormData.location}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={addFormData.address.street}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zipcode
                  </label>
                  <input
                    type="text"
                    name="zipcode"
                    value={addFormData.zipcode}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Society Name
                  </label>
                  <input
                    type="text"
                    name="society"
                    value={addFormData.society}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    name="property_type"
                    value={addFormData.property_type}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Select...</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Building Type
                  </label>
                  <select
                    name="building_type"
                    value={addFormData.building_type}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Select...</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Pent House">Pent House</option>
                    <option value="Plot">Plot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BHK
                  </label>
                  <input
                    type="number"
                    name="bhk"
                    value={addFormData.bhk}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={addFormData.bathrooms}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={addFormData.bedrooms}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size (sq.ft)
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={addFormData.size}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent
                  </label>
                  <input
                    type="number"
                    name="price.rent_monthly"
                    value={addFormData.price.rent_monthly}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    name="price.sell_price"
                    value={addFormData.price.sell_price}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit
                  </label>
                  <input
                    type="number"
                    name="price.deposit"
                    value={addFormData.price.deposit}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  name="amenities"
                  value={addFormData.amenities}
                  onChange={(e) => handleInputChange(e, 'add')}
                  placeholder="e.g., Parking, Security, Gym"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={addFormData.description}
                  onChange={(e) => handleInputChange(e, 'add')}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Type
                  </label>
                  <select
                    name="listing_type"
                    value={addFormData.listing_type}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Rent">Rent</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing
                  </label>
                  <select
                    name="furnishing"
                    value={addFormData.furnishing}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="None">None</option>
                    <option value="Semi">Semi</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={addFormData.availability}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Within 15 Days">Within 15 Days</option>
                    <option value="Within 30 Days">Within 30 Days</option>
                    <option value="After 30 Days">After 30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={addFormData.status}
                    onChange={(e) => handleInputChange(e, 'add')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="pets_allowed"
                  checked={addFormData.pets_allowed}
                  onChange={(e) => handleInputChange(e, 'add')}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Pets Allowed
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Photos
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-violet-500">
                        <span>Upload files</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileSelect(e, 'add')}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {previewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm('add');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
                >
                  Create Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Property
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BHK
                  </label>
                  <input
                    type="number"
                    name="bhk"
                    value={editFormData.bhk}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={editFormData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carpet Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    name="carpet_area"
                    value={editFormData.carpet_area}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Type
                  </label>
                  <select
                    name="listing_type"
                    value={editFormData.listing_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Rent">Rent</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent
                  </label>
                  <input
                    type="number"
                    name="price.rent_monthly"
                    value={editFormData.price.rent_monthly}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    name="price.sell_price"
                    value={editFormData.price.sell_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit
                  </label>
                  <input
                    type="number"
                    name="price.deposit"
                    value={editFormData.price.deposit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="">Select Status</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                ></textarea>
              </div>

              {/* Existing Photos Display */}
              {existingPhotos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Photos
                  </label>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {existingPhotos.map((photoUrl, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={propertyService.getImageUrl(photoUrl)}
                          alt={`Existing ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditPhoto(index, false)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Photos Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Photos
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-violet-500">
                        <span>Upload files</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileSelect(e, 'edit')}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
                {editPreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {editPreviewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`New ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditPhoto(index, true)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProperties; 