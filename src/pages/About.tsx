import { Heart, Users, Award, CheckCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function About() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      titleHe: 'אהבה לבישול',
      titleEn: 'Love for Cooking',
      descHe: 'כל מנה מוכנת באהבה ובהקפדה על כל פרט',
      descEn: 'Every dish is prepared with love and attention to detail',
    },
    {
      icon: Users,
      titleHe: 'מסורת משפחתית',
      titleEn: 'Family Tradition',
      descHe: 'מתכונים שהועברו במשפחה מדור לדור',
      descEn: 'Recipes passed down through generations',
    },
    {
      icon: Award,
      titleHe: 'איכות מעולה',
      titleEn: 'Excellent Quality',
      descHe: 'רק החומרים הטריים והאיכותיים ביותר',
      descEn: 'Only the freshest and highest quality ingredients',
    },
    {
      icon: CheckCircle,
      titleHe: 'טריות מובטחת',
      titleEn: 'Guaranteed Freshness',
      descHe: 'הכל מוכן טרי בזמן ההזמנה',
      descEn: 'Everything prepared fresh when ordered',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-chinese-red via-chinese-darkRed to-chinese-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('אודות לולו', 'About Lulu')}
          </h1>
          <p className="text-xl text-chinese-lightGold">
            {t('הסיפור שלנו והמסע שהביא אותנו עד הלום', 'Our story and the journey that brought us here')}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                {t('הסיפור של לולו', "Lulu's Story")}
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>{t('לולו ישראלית ילידת סין', 'Lulu is Israeli, born in China')}</p>
                <p>{t('את האהבה לבישול קיבלה מסבתה ואביה', 'She received her love for cooking from her grandmother and father')}</p>
                <p>{t('מתכונים שהועברו במשפחה מדור לדור', 'Recipes passed down through the family from generation to generation')}</p>
                <p>
                  {t(
                    'אנחנו מאמינים שהסוד למנה סינית מושלמת טמון בחומרי גלם טריים ובשיטות בישול מסורתיות. כל מנה מוכנת אצלנו במטבח הביתי, באהבה ובהקפדה על היגיינה, ממש כמו שהיו מכינים בבית בסין',
                    'We believe that the secret to a perfect Chinese dish lies in fresh ingredients and traditional cooking methods. Every dish is prepared in our home kitchen, with love and attention to hygiene, just like they would prepare at home in China'
                  )}
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
                alt="Lulu cooking"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-chinese-gold text-chinese-black p-6 rounded-xl shadow-lg">
                <div className="text-4xl font-bold mb-2">15+</div>
                <p className="text-sm font-semibold">{t('שנות ניסיון', 'Years Experience')}</p>
                <p className="text-xs">{t('מסורת אמיתית', 'True Tradition')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              {t('הערכים שלנו', 'Our Values')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-lg text-center card-hover"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-chinese-red text-white rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-chinese-black mb-3">
                    {t(value.titleHe, value.titleEn)}
                  </h3>
                  <p className="text-gray-600">
                    {t(value.descHe, value.descEn)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-chinese-red to-chinese-darkRed text-white">
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
