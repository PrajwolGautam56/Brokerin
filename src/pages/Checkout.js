import { useEffect, useState } from 'react';
import { useFurnitureCart } from '../context/FurnitureCartContext';
import { formatPrice, formatPriceWithSuffix } from '../utils/priceFormatter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/cartService';
import { promoCodeService } from '../services/promoCodeService';
import logger from '../utils/logger';

function Checkout() {
  const { items, totalItems, updateQuantity, removeItem, clearCart, syncWithBackend } = useFurnitureCart();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState(null);
  const [promoApplying, setPromoApplying] = useState(false);
  const [deliveryCharge] = useState(0);
  const [contact, setContact] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || user?.phone || '',
    address: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated && syncWithBackend) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  const subtotal = items.reduce((sum, item) => {
    const price =
      item.mode === 'rent'
        ? item.price?.rent_monthly || item.price?.rent || 0
        : item.price?.sell_price || item.price?.buy || 0;
    return sum + (price || 0) * (item.quantity || 1);
  }, 0);

  const totalDeposit = items.reduce((sum, item) => {
    const deposit = item.price?.deposit || 0;
    return sum + deposit * (item.quantity || 1);
  }, 0);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setFormError('Please enter a promo code');
      return;
    }

    try {
      setPromoApplying(true);
      setFormError('');
      
      const categories = items.map(item => item.category).filter(Boolean);
      const listingTypes = [...new Set(items.map(item => item.mode === 'buy' ? 'Sell' : 'Rent'))];
      
      const result = await promoCodeService.validate(
        promoCode,
        subtotal,
        listingTypes[0], // Use first listing type
        categories
      );
      
      setPromoData(result.data);
      setFormSuccess(`Promo code applied! You save ${formatPrice(result.data.discount_amount)}`);
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (error) {
      logger.error('Promo code error:', error);
      setFormError(error.message || 'Invalid promo code');
      setPromoData(null);
    } finally {
      setPromoApplying(false);
    }
  };

  const finalAmount = promoData 
    ? (subtotal - promoData.discount_amount + deliveryCharge + totalDeposit)
    : (subtotal + deliveryCharge + totalDeposit);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-4">Add items to proceed to checkout.</p>
            <button
              onClick={() => navigate('/furniture')}
              className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
            >
              Browse Furniture
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setFormError('');
    setFormSuccess('');

    if (!isAuthenticated) {
      setFormError('Please login to place the order.');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    if (!contact.name || !contact.email || !contact.phone) {
      setFormError('Name, email, and phone are required.');
      return;
    }

    if (!contact.address) {
      setFormError('Delivery address is required.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare checkout data
      const checkoutData = {
        customer_name: contact.name,
        customer_email: contact.email,
        customer_phone: contact.phone,
        delivery_address: contact.address,
        promo_code: promoData ? promoCode : undefined,
        payment_method: 'COD' // Cash on Delivery
      };

      logger.log('Submitting checkout:', checkoutData);
      
      const response = await cartService.checkout(checkoutData);
      
      logger.log('Checkout response:', response);
      
      setFormSuccess('Order placed successfully! We will contact you shortly.');
      await clearCart();

      setTimeout(() => {
        navigate('/furniture');
      }, 2000);
    } catch (err) {
      logger.error('Checkout error:', err);
      setFormError(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600">{totalItems} item(s)</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:text-red-700 underline"
          >
            Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const img = item.image;
              const rentPrice = item.price?.rent_monthly || item.price?.rent;
              const buyPrice = item.price?.sell_price || item.price?.buy;
              return (
                <div
                  key={`${item.id}-${item.mode}`}
                  className="bg-white p-4 rounded-2xl shadow flex gap-4"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {img ? (
                      <img src={img} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.mode}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.mode)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-1 text-sm font-bold text-violet-700">
                      {item.mode === 'rent'
                        ? rentPrice
                          ? formatPriceWithSuffix(rentPrice, '/mo')
                          : '—'
                        : buyPrice
                        ? formatPrice(buyPrice)
                        : '—'}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          updateQuantity(item.id, item.mode, parseInt(e.target.value, 10) || 1)
                        }
                        className="w-20 border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-white p-5 rounded-2xl shadow h-fit space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Pricing is indicative. Our team will confirm final quote, delivery, and any deposits.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => setContact((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Delivery Address</label>
                <textarea
                  value={contact.address}
                  onChange={(e) => setContact((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows="3"
                  required
                  placeholder="Enter your complete delivery address"
                />
              </div>
              
              {/* Promo Code */}
              <div className="pt-3 border-t">
                <label className="block text-sm text-gray-700 mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplying || !promoCode.trim()}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {promoApplying ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {promoData && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {promoData.description} • Save {formatPrice(promoData.discount_amount)}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {totalDeposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Total Deposit:</span>
                    <span>{formatPrice(totalDeposit)}</span>
                  </div>
                )}
                {deliveryCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Charge:</span>
                    <span>{formatPrice(deliveryCharge)}</span>
                  </div>
                )}
                {promoData && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>- {formatPrice(promoData.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatPrice(finalAmount)}</span>
                </div>
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {formSuccess}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Order'}
              </button>
              <p className="text-xs text-gray-400">
                This notifies our team to finalize your rental/purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

