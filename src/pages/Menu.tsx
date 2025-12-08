import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { fetchMenuFromCSV } from '../lib/menuData';
import { fetchAddOns } from '../lib/addOns';
import MenuItemModal from '../components/MenuItemModal';
import type { MenuItem, MenuItemTag } from '../types';

interface MenuProps {
  onMenuItemsLoad?: (items: MenuItem[]) => void;
}

export default function Menu({ onMenuItemsLoad }: MenuProps = {}) {
  const { language, t } = useLanguage();

  const getTagColorClasses = (color: MenuItemTag['color']) => {
    const colors = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  const getTagPositionClasses = (position?: MenuItemTag['position']) => {
    const positions = {
      'top-left': 'top-3 left-3',
      'top-right': 'top-3 right-3',
      'bottom-left': 'bottom-3 left-3',
      'bottom-right': 'bottom-3 right-3',
    };
    return positions[position || 'top-right'];
  };
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        const [items, addOns] = await Promise.all([
          fetchMenuFromCSV(),
          fetchAddOns(),
        ]);

        const itemsWithAddOns = items.map(item => ({
          ...item,
          addOns: addOns,
        }));

        setMenuItems(itemsWithAddOns);
        if (onMenuItemsLoad) {
          onMenuItemsLoad(itemsWithAddOns);
        }
      } catch (error) {
        console.error('Failed to load menu:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, { he: string; en: string }> = {
      all: { he: 'הכל', en: 'All' },
      dumplings: { he: 'דמפלינגס', en: 'Dumplings' },
      'stir-fry': { he: 'מוקפצים', en: 'Stir-Fry' },
      sides: { he: 'תוספות', en: 'Sides' },
      salads: { he: 'סלטים', en: 'Salads' },
      soups: { he: 'מרקים', en: 'Soups' },
      pastries: { he: 'מאפים', en: 'Pastries' },
      appetizers: { he: 'מנות ראשונות', en: 'Appetizers' },
      main: { he: 'מנות עיקריות', en: 'Main Dishes' },
      desserts: { he: 'קינוחים', en: 'Desserts' },
      drinks: { he: 'משקאות', en: 'Drinks' },
      other: { he: 'אחרים', en: 'Other' },
    };
    return language === 'he'
      ? categoryMap[category]?.he || category
      : categoryMap[category]?.en || category;
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-chinese-red via-chinese-darkRed to-chinese-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('תפריט', 'Menu')}
          </h1>
          <p className="text-xl text-chinese-lightGold">
            {t(
              'כל המנות שלנו מוכנות טרי בזמן ההזמנה עם החומרים הטובים ביותר',
              'All our dishes are made fresh when ordered with the best ingredients'
            )}
          </p>
          <p className="text-lg mt-4 opacity-90">
            {t(
              'לחצו על מנה לבחירת תוספות והוספה לסל',
              'Click on a dish to select add-ons and add to cart'
            )}
          </p>
        </div>
      </section>

      <section className="py-12 bg-white sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-chinese-red text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="mt-4 h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover cursor-pointer"
                >
                  {item.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={language === 'he' ? item.name_he : item.name_en}
                        className="w-full h-full object-cover"
                      />
                      {(item.is_vegetarian || item.is_vegan) && (
                        <div className="absolute top-3 left-3 flex gap-2">
                          {item.is_vegetarian && (
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Leaf className="w-3 h-3" />
                              {t('צמחוני', 'Vegetarian')}
                            </span>
                          )}
                          {item.is_vegan && (
                            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Leaf className="w-3 h-3" />
                              {t('טבעוני', 'Vegan')}
                            </span>
                          )}
                        </div>
                      )}
                      {item.tags && item.tags.length > 0 && (() => {
                        const tagsByPosition: { [key: string]: typeof item.tags } = {};
                        item.tags.forEach(tag => {
                          const pos = tag.position || 'top-right';
                          if (!tagsByPosition[pos]) tagsByPosition[pos] = [];
                          tagsByPosition[pos].push(tag);
                        });

                        return Object.entries(tagsByPosition).map(([position, tags]) => (
                          <div key={position} className={`absolute ${getTagPositionClasses(position as MenuItemTag['position'])} flex flex-col gap-2`}>
                            {tags.map((tag, index) => (
                              <span
                                key={index}
                                className={`${getTagColorClasses(tag.color)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}
                              >
                                {language === 'he' ? tag.text_he : tag.text_en}
                              </span>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-chinese-black flex-1">
                        {language === 'he' ? item.name_he : item.name_en}
                      </h3>
                      <span className="text-2xl font-bold text-chinese-red whitespace-nowrap mr-3">
                        ₪{item.price}
                      </span>
                    </div>

                    {!item.image_url && (item.is_vegetarian || item.is_vegan) && (
                      <div className="flex gap-2 mb-3">
                        {item.is_vegetarian && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Leaf className="w-3 h-3" />
                            {t('צמחוני', 'Vegetarian')}
                          </span>
                        )}
                        {item.is_vegan && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Leaf className="w-3 h-3" />
                            {t('טבעוני', 'Vegan')}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {language === 'he' ? item.description_he : item.description_en}
                    </p>

                    <button className="w-full bg-chinese-red text-white py-3 rounded-lg font-semibold hover:bg-chinese-darkRed transition-all duration-300 transform hover:scale-105">
                      {t('בחר תוספות והוסף לסל', 'Select Add-ons & Add to Cart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
