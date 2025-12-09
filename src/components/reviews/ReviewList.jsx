import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import RatingStars from './RatingStars';
import logger from '../../utils/logger';

function ReviewList({ furnitureId }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [furnitureId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getFurnitureReviews(furnitureId, page);
      
      const reviewData = response.data?.reviews || response.reviews || [];
      const pagination = response.data?.pagination || response.pagination || {};
      
      if (page === 1) {
        setReviews(reviewData);
      } else {
        setReviews(prev => [...prev, ...reviewData]);
      }
      
      setHasMore(pagination.hasMore || pagination.has_more || false);
    } catch (err) {
      logger.error('Failed to load reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      alert('Please login to mark reviews as helpful');
      return;
    }

    try {
      await reviewService.markHelpful(reviewId);
      // Update local state
      setReviews(prev => prev.map(review =>
        review._id === reviewId
          ? { ...review, helpful_count: (review.helpful_count || 0) + 1 }
          : review
      ));
    } catch (err) {
      logger.error('Failed to mark review as helpful:', err);
      alert(err.message || 'Failed to mark review as helpful');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review._id !== reviewId));
    } catch (err) {
      logger.error('Failed to delete review:', err);
      alert(err.message || 'Failed to delete review');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p className="text-lg mb-2">No reviews yet</p>
        <p className="text-sm">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <span className="text-violet-600 font-semibold">
                    {review.user_name?.[0]?.toUpperCase() || review.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.user_name || review.user?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(review.createdAt || review.created_at)}</p>
                </div>
              </div>
              <RatingStars rating={review.rating} size="sm" />
            </div>
            {user && (user._id === review.user_id || user._id === review.user?._id) && (
              <button
                onClick={() => handleDelete(review._id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            )}
          </div>

          {/* Review Content */}
          {review.title && (
            <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
          )}
          <p className="text-gray-700 mb-4 whitespace-pre-line">{review.comment}</p>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {review.images.map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`Review ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Verified Purchase Badge */}
          {review.verified_purchase && (
            <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified Purchase
            </div>
          )}

          {/* Helpful Button */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              onClick={() => handleMarkHelpful(review._id)}
              disabled={!isAuthenticated}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              Helpful ({review.helpful_count || 0})
            </button>
          </div>
        </div>
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewList;

