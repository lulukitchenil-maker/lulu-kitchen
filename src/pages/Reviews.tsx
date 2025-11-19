import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { submitReview } from '../lib/api';
import { supabase } from '../lib/supabase';
import ColorfulText from '../components/ColorfulText';

interface Review {
  customer_name: string;
  rating: number;
  comment: string;
  comment_en: string;
  created_at: string;
}

export default function Reviews() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rating: 5,
    reviewHe: '',
    reviewEn: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  async function fetchApprovedReviews() {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('customer_name, rating, comment, comment_en, created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await submitReview(
        formData.name,
        formData.email,
        formData.phone,
        formData.rating,
        formData.reviewHe,
        formData.reviewEn
      );

      if (result.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', rating: 5, reviewHe: '', reviewEn: '' });
      } else {
        alert(result.error || t('שגיאה בשליחה', 'Error submitting review'));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(t('שגיאה בשליחה', 'Error submitting review'));
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-chinese-red via-chinese-darkRed to-chinese-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('המלצות', 'Reviews')}
          </h1>
          <p className="text-xl text-chinese-lightGold">
            {t('קראו מה הלקוחות שלנו אומרים ושתפו גם אתם את החוויה שלכם', 'Read what our customers say and share your experience too')}
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <ColorfulText text={t('הוסיפו המלצה', 'Add a Review')} />
              </h2>

              {submitted ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
                  <div className="text-green-600 text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    {t('תודה רבה!', 'Thank you!')}
                  </h3>
                  <p className="text-gray-700">
                    {t('ההמלצה שלכם התקבלה ותפורסם לאחר אישור', 'Your review has been received and will be published after approval')}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2 bg-chinese-red text-white rounded-lg hover:bg-chinese-darkRed transition-colors"
                  >
                    {t('הוסף המלצה נוספת', 'Add Another Review')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('שם מלא', 'Full Name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder={t('הכניסו את שמכם', 'Enter your name')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('אימייל (לא יפורסם)', 'Email (not published)')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('טלפון נייד (לקבלת הודעת תודה)', 'Mobile Phone (to receive thank you message)')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder={t('05X-XXXXXXX', '05X-XXXXXXX')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('דירוג', 'Rating')} *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              rating <= formData.rating ? 'text-chinese-gold fill-current' : 'text-gray-300'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('ההמלצה שלכם (עברית)', 'Your Review (Hebrew)')} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.reviewHe}
                      onChange={(e) => setFormData({ ...formData, reviewHe: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder={t('ספרו לנו על החוויה שלכם...', 'Tell us about your experience...')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('ההמלצה באנגלית (אופציונלי)', 'Your Review (English) (Optional)')}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.reviewEn}
                      onChange={(e) => setFormData({ ...formData, reviewEn: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chinese-red"
                      placeholder="Tell us about your experience..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-chinese-red text-white py-4 rounded-lg font-semibold hover:bg-chinese-darkRed transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? t('שולח...', 'Submitting...') : t('שלח המלצה', 'Submit Review')}
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    * {t('ההמלצה תפורסם לאחר אישור המנהל', 'Review will be published after admin approval')}
                  </p>
                </form>
              )}
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center gradient-text">
                {t('המלצות לקוחות', 'Customer Reviews')}
              </h2>

              <div className="text-center mb-12">
            <div className="flex items-center justify-center rtl-space-x-2 mb-4">
              <div className="flex rtl-space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-10 h-10 ${
                      i < Math.round(averageRating) ? 'text-chinese-gold fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-5xl font-bold text-chinese-black mb-2">{averageRating.toFixed(1)}</div>
            <p className="text-xl text-gray-600">
              {t(`מתוך ${reviews.length} ביקורות`, `from ${reviews.length} reviews`)}
            </p>
          </div>

              <div className="space-y-6 max-h-[800px] overflow-y-auto pr-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t('טוען המלצות...', 'Loading reviews...')}</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t('אין המלצות עדיין', 'No reviews yet')}</p>
              </div>
            ) : (
              reviews.map((review, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg card-hover">
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
              ))
            )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
