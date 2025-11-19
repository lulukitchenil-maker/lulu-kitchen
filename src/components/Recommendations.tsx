import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import QuickAddModal from './QuickAddModal';
import type { MenuItem } from '../types';

interface RecommendationsProps {
  allMenuItems: MenuItem[];
}

export default function Recommendations({ allMenuItems }: RecommendationsProps) {
  const { language, t } = useLanguage();
  const { cartItems } = useCart();
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (allMenuItems.length === 0) return;

    const cartItemIds = new Set(cartItems.map(item => item.menuItem.id));
    const cartCategories = new Set(cartItems.map(item => item.menuItem.category));

    let recommended: MenuItem[] = [];

    if (cartCategories.size > 0) {
      recommended = allMenuItems.filter(item =>
        !cartItemIds.has(item.id) &&
        cartCategories.has(item.category)
      );
    }

    if (recommended.length < 3) {
      const additional = allMenuItems.filter(item => !cartItemIds.has(item.id));
      recommended = [...recommended, ...additional];
    }

    const shuffled = recommended.sort(() => Math.random() - 0.5);
    setRecommendations(shuffled.slice(0, 2));
  }, [cartItems, allMenuItems]);

  if (recommendations.length === 0) return null;

  return (
    <>
      <div className="bg-gradient-to-br from-chinese-lightGold to-white p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-chinese-gold fill-chinese-gold" />
          <h3 className="text-lg font-bold">
            {t('מומלץ במיוחד', 'Highly Recommended')}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {recommendations.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
            >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={language === 'he' ? item.name_he : item.name_en}
                className="w-full h-20 object-cover rounded-md mb-2"
              />
            )}
            <h4 className="font-semibold text-sm mb-1 line-clamp-1">
              {language === 'he' ? item.name_he : item.name_en}
            </h4>
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-chinese-red">₪{item.price}</span>
              <button className="text-xs text-white bg-chinese-red px-2 py-1 rounded hover:bg-chinese-darkRed transition">
                {t('הוסף', 'Add')}
              </button>
            </div>
          </div>
          ))}
        </div>
      </div>

      <QuickAddModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
