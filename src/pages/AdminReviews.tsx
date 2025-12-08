import { useState, useEffect } from 'react';
import { Check, X, Star, Trash2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

interface Review {
  id: string;
  customer_name: string;
  email: string;
  rating: number;
  comment: string;
  comment_en: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

function AdminReviewsContent() {
  const { signOut } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('recommendations')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('שגיאה בעדכון הסטטוס');
      console.error(error);
    } else {
      fetchReviews();
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק המלצה זו?')) {
      return;
    }

    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', id);

    if (error) {
      alert('שגיאה במחיקת ההמלצה');
      console.error(error);
    } else {
      fetchReviews();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">ניהול המלצות</h1>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              <LogOut className="w-5 h-5" />
              התנתק
            </button>
          </div>
          <p className="text-gray-600 mt-2">סה"כ {reviews.length} המלצות</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">טוען...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600">אין המלצות כרגע</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-lg shadow-lg p-6 ${
                  review.status === 'approved'
                    ? 'border-r-4 border-green-500'
                    : review.status === 'rejected'
                    ? 'border-r-4 border-red-500'
                    : 'border-r-4 border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{review.customer_name}</h3>
                    <p className="text-sm text-gray-600">{review.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_at).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold">{review.rating}/5</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">תוכן בעברית:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{review.comment || 'אין'}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">תוכן באנגלית:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{review.comment_en || 'אין'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">סטטוס:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      review.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : review.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {review.status === 'approved'
                      ? 'מאושר'
                      : review.status === 'rejected'
                      ? 'נדחה'
                      : 'ממתין'}
                  </span>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      אישור
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'rejected')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      דחייה
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    מחיקה
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminReviews() {
  return (
    <ProtectedRoute>
      <AdminReviewsContent />
    </ProtectedRoute>
  );
}
