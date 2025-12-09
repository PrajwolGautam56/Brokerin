import { useFurnitureCart } from '../../context/FurnitureCartContext';
import { formatPrice, formatPriceWithSuffix } from '../../utils/priceFormatter';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function FurnitureCartDrawer({ open, onClose, onProceed }) {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useFurnitureCart();

  const subtotal = items.reduce((sum, item) => {
    const price =
      item.mode === 'rent'
        ? item.price?.rent_monthly || item.price?.rent || 0
        : item.price?.sell_price || item.price?.buy || 0;
    return sum + (price || 0) * (item.quantity || 1);
  }, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose}></div>
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Furniture Cart</h3>
            <p className="text-sm text-gray-500">{totalItems} item(s)</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            items.map((item) => {
              const img = item.image;
              const rentPrice = item.price?.rent_monthly || item.price?.rent;
              const buyPrice = item.price?.sell_price || item.price?.buy;
              return (
                <div key={`${item.id}-${item.mode}`} className="flex gap-3 border rounded-lg p-3">
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {img ? (
                      <img src={img} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.mode}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.mode)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
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
                        className="w-16 border rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t p-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearCart}
              disabled={items.length === 0}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Cart
            </button>
            <button
              disabled={items.length === 0}
              onClick={() => {
                if (items.length === 0) return;
                if (onProceed) {
                  onProceed();
                }
              }}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed
            </button>
          </div>
          <p className="text-xs text-gray-500">* Pricing is indicative. Team will confirm final quote.</p>
        </div>
      </div>
    </div>
  );
}


