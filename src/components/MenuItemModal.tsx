import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import type { MenuItem } from '../types';

interface MenuItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleAddOn = (addOnId: string) => {
    const newSelected = new Set(selectedAddOns);
    if (newSelected.has(addOnId)) {
      newSelected.delete(addOnId);
    } else {
      newSelected.add(addOnId);
    }
    setSelectedAddOns(newSelected);
  };

  const handleAddToCart = () => {
    const addOns = item.addOns?.filter(addon => selectedAddOns.has(addon.id)) || [];
    addToCart(item, addOns, quantity);
    onClose();
    setQuantity(1);
    setSelectedAddOns(new Set());
  };

  const addOnsPrice = item.addOns
    ?.filter(addon => selectedAddOns.has(addon.id))
    .reduce((sum, addon) => sum + addon.price, 0) || 0;

  const totalPrice = (item.price + addOnsPrice) * quantity;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              {item.image_url && (
                <div className="h-48 sm:h-64 w-full overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                  <img
                    src={item.image_url}
                    alt={language === 'he' ? item.name_he : item.name_en}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {language === 'he' ? item.name_he : item.name_en}
              </h2>

              <p className="text-gray-600 mb-4">
                {language === 'he' ? item.description_he : item.description_en}
              </p>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-3xl font-bold text-chinese-red">₪{item.price}</span>
                {item.portion_size && (
                  <span className="text-gray-500">({item.portion_size})</span>
                )}
              </div>

              {item.addOns && item.addOns.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">
                    {t('תוספות זמינות', 'Available Add-ons')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {item.addOns.map(addon => (
                      <label
                        key={addon.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedAddOns.has(addon.id)}
                            onChange={() => toggleAddOn(addon.id)}
                            className="w-5 h-5"
                          />
                          <span className="text-sm">{language === 'he' ? addon.name_he : addon.name_en}</span>
                        </div>
                        <span className="font-semibold text-sm">+₪{addon.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold">{t('כמות', 'Quantity')}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-chinese-red text-white rounded-lg font-semibold hover:bg-chinese-darkRed transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {t('הוסף לסל', 'Add to Cart')} - ₪{totalPrice.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
