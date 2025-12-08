import { X, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import type { MenuItem, AddOn } from '../types';

interface QuickAddModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export default function QuickAddModal({ item, onClose }: QuickAddModalProps) {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);

  useEffect(() => {
    setQuantity(1);
    setSelectedAddOns([]);
  }, [item]);

  if (!item) return null;

  const handleAddOnToggle = (addOn: AddOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.id === addOn.id);
      if (exists) {
        return prev.filter(a => a.id !== addOn.id);
      }
      return [...prev, addOn];
    });
  };

  const handleAddToCart = () => {
    addToCart(item, selectedAddOns, quantity);
    onClose();
  };

  const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = (item.price + addOnsTotal) * quantity;

  const imagesBase = import.meta.env.VITE_IMAGES_BASE || 'https://lulu-k.com/images';
  const imageUrl = item.image_url
    ? (item.image_url.startsWith('http')
        ? item.image_url
        : `${imagesBase}/${item.image_url}`)
    : null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-[61] w-[90%] max-w-md max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">
            {language === 'he' ? item.name_he : item.name_en}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={language === 'he' ? item.name_he : item.name_en}
              className="w-full h-40 object-cover rounded-lg"
            />
          )}

          <div>
            <p className="text-sm text-gray-600">
              {language === 'he' ? item.description_he : item.description_en}
            </p>
            <p className="text-xl font-bold text-chinese-red mt-2">₪{item.price}</p>
          </div>

          {item.addOns && item.addOns.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">
                {t('תוספות', 'Add-ons')}
              </h4>
              <div className="space-y-2">
                {item.addOns.map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAddOns.some(a => a.id === addOn.id)}
                        onChange={() => handleAddOnToggle(addOn)}
                        className="w-4 h-4 text-chinese-red"
                      />
                      <span className="text-sm">
                        {language === 'he' ? addOn.name_he : addOn.name_en}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-chinese-red">
                      +₪{addOn.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <span className="font-semibold">{t('כמות', 'Quantity')}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-chinese-red text-white rounded-lg font-semibold hover:bg-chinese-darkRed transition-colors"
          >
            {t('הוסף לעגלה', 'Add to Cart')} - ₪{totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </>
  );
}
