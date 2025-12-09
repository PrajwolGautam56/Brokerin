import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { wishlistService } from '../../services/wishlistService';
import logger from '../../utils/logger';

function WishlistButton({ furnitureId, className = '' }) {
  const { isAuthenticated } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkWishlistStatus = useCallback(async () => {
    try {
      const response = await wishlistService.get();
      const items = response.data?.items || response.items || [];
      const exists = items.some(item => 
        (item.furniture_id?._id || item.furniture_id) === furnitureId
      );
      setInWishlist(exists);
    } catch (error) {
      logger.error('Failed to check wishlist status:', error);
    }
  }, [furnitureId]);

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [isAuthenticated, checkWishlistStatus]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      setLoading(true);
      if (inWishlist) {
        await wishlistService.remove(furnitureId);
        setInWishlist(false);
      } else {
        await wishlistService.add(furnitureId);
        setInWishlist(true);
      }
    } catch (error) {
      logger.error('Wishlist toggle error:', error);
      alert(error.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full shadow-md transition-all ${
        inWishlist 
          ? 'bg-red-50 hover:bg-red-100' 
          : 'bg-white hover:bg-gray-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
        fill={inWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

export default WishlistButton;

