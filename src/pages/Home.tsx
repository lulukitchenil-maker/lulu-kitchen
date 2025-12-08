import { Star, ChefHat, Truck } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  comment_en: string;
  created_at: string;
}

export default function Home() {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  async function fetchFeaturedReviews() {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('approved', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  const features = [
    {
      icon: ChefHat,
      titleHe: 'אוכל טרי',
      titleEn: 'Fresh Food',
      descHe: 'כל מנה מוכנת טרי בזמן ההזמנה',
      descEn: 'Every dish prepared fresh when ordered',
    },
    {
      icon: Star,
      titleHe: 'אותנטי',
      titleEn: 'Authentic',
      descHe: 'מתכונים מסורתיים שהועברו מדור לדור',
      descEn: 'Traditional recipes passed down through generations',
    },
    {
      icon: Truck,
      titleHe: 'משלוחים',
      titleEn: 'Delivery',
      descHe: 'משלוחים לירושלים והסביבה',
      descEn: 'Delivery to Jerusalem and surrounding areas',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-chinese-red via-chinese-darkRed to-chinese-black text-white overflow-hidden">
        <div className="absolute inset-0 chinese-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-right">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {t('ברוכים הבאים למטבח הסיני של לולו', "Welcome to Lulu's Chinese Kitchen")}
              </h1>
              <p className="text-xl md:text-2xl text-chinese-lightGold">
                {t('אוכל סיני אותנטי מוכן טרי בירושלים והסביבה', 'Authentic Chinese Food Made Fresh in Jerusalem Area')}
              </p>
              <p className="text-lg leading-relaxed opacity-90">
                {t(
                  'כאן תמצאו מנות סיניות מסורתיות ואהובות, מוכנות מדי יום עם החומרים הטריים והאיכותיים ביותר. אנחנו מביאים את ניחוחות המטבח הביתי של סין ישירות לשולחן שלכם, עם הקפדה על כל פרט וטעם',
                  'Here you will find traditional and beloved Chinese dishes, prepared daily with the freshest and highest quality ingredients. We bring the aromas of China\'s home kitchen directly to your table, with attention to every detail and taste'
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/menu" className="btn-secondary text-center">
                  {t('הזמן עכשיו', 'Order Now')}
                </a>
                <a href="/menu" className="btn-primary text-center">
                  {t('צפה בתפריט', 'View Menu')}
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                  alt="Chinese Food"
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-chinese-gold text-chinese-black p-4 rounded-xl shadow-lg">
                  <div className="flex items-center rtl-space-x-2">
                    <Star className="w-6 h-6 fill-current" />
                    <span className="font-bold text-lg">5.0</span>
                  </div>
                  <p className="text-sm font-medium">{t('דירוג מעולה', 'Excellent Rating')}</p>
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-chinese-red text-white px-4 py-2 rounded-full font-semibold animate-bounce-gentle">
                {t('טרי יומי!', 'Fresh Daily!')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              {t('למה לבחור בנו?', 'Why Choose Us?')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                'אוכל סיני אותנטי מוכן טרי בזמן ההזמנה. עדיף להזמין יום מראש',
                'Authentic Chinese food made fresh when ordered. Better to order a day in advance'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-8 bg-gradient-to-br from-white to-chinese-lightGold rounded-2xl shadow-lg card-hover"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-chinese-red text-white rounded-full mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-chinese-black mb-4">
                    {t(feature.titleHe, feature.titleEn)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(feature.descHe, feature.descEn)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              {t('המלצות לקוחות', 'Customer Reviews')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('מה הלקוחות שלנו אומרים עלינו', 'What our customers say about us')}
            </p>
            <div className="flex items-center justify-center mt-4 rtl-space-x-2">
              <div className="flex rtl-space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-8 h-8 text-chinese-gold fill-current" />
                ))}
              </div>
              <span className="text-2xl font-bold text-chinese-black">5.0</span>
              <span className="text-gray-600">{t(`מתוך ${reviews.length} ביקורות`, `from ${reviews.length} reviews`)}</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('טוען המלצות...', 'Loading reviews...')}</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('עדיין אין המלצות מוצגות', 'No featured reviews yet')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-lg card-hover">
                  <div className="flex items-center mb-4 rtl-space-x-2">
                    <div className="flex rtl-space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-chinese-gold fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-chinese-black">{review.rating}/5</span>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed text-right">
                    {language === 'he' ? (review.comment || review.comment_en) : (review.comment_en || review.comment)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-chinese-red">{review.customer_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-chinese-red to-chinese-darkRed text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t('מוכנים לטעום את הטוב ביותר?', 'Ready to Taste the Best?')}
            </h2>
            <p className="text-xl max-w-3xl mx-auto">
              {t(
                'הזמינו עכשיו ותיהנו מאוכל סיני אותנטי מוכן טרי במיוחד עבורכם',
                'Order now and enjoy authentic Chinese food made fresh especially for you'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/menu" className="btn-secondary">
                {t('צפו בתפריט המלא', 'View Full Menu')}
              </a>
              <a href="/contact" className="btn-primary">
                {t('צרו קשר', 'Contact Us')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-chinese-red to-chinese-darkRed text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t('המשימה שלנו', 'Our Mission')}
            </h2>
            <p className="text-xl max-w-4xl mx-auto leading-relaxed">
              {t(
                'להביא את הטעמים האותנטיים של המטבח הסיני המסורתי לכל בית בירושלים והסביבה, עם הקפדה על איכות, טריות ושירות מעולה. אנחנו מאמינים שאוכל טוב מחבר בין אנשים ויוצר זיכרונות בלתי נשכחים.',
                'To bring the authentic flavors of traditional Chinese cuisine to every home in Jerusalem and surrounding areas, with emphasis on quality, freshness and excellent service. We believe that good food connects people and creates unforgettable memories.'
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
