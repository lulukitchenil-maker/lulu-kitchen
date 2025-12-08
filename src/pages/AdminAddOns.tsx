import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

interface AddOn {
  id: string;
  name_he: string;
  name_en: string;
  price: number;
}

function AdminAddOnsContent() {
  const { signOut } = useAuth();
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name_he: '', name_en: '', price: 0 });

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching add-ons:', error);
    } else {
      setAddOns(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!formData.name_he || !formData.name_en || formData.price <= 0) {
      alert('נא למלא את כל השדות');
      return;
    }

    const { error } = await supabase
      .from('addons')
      .insert([formData]);

    if (error) {
      alert('שגיאה בהוספת התוספת');
      console.error(error);
    } else {
      setIsAdding(false);
      setFormData({ name_he: '', name_en: '', price: 0 });
      fetchAddOns();
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name_he || !formData.name_en || formData.price <= 0) {
      alert('נא למלא את כל השדות');
      return;
    }

    const { error } = await supabase
      .from('addons')
      .update(formData)
      .eq('id', id);

    if (error) {
      alert('שגיאה בעדכון התוספת');
      console.error(error);
    } else {
      setEditingId(null);
      setFormData({ name_he: '', name_en: '', price: 0 });
      fetchAddOns();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תוספת זו?')) {
      return;
    }

    const { error } = await supabase
      .from('addons')
      .delete()
      .eq('id', id);

    if (error) {
      alert('שגיאה במחיקת התוספת');
      console.error(error);
    } else {
      fetchAddOns();
    }
  };

  const startEdit = (addOn: AddOn) => {
    setEditingId(addOn.id);
    setFormData({ name_he: addOn.name_he, name_en: addOn.name_en, price: addOn.price });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name_he: '', name_en: '', price: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">ניהול תוספות</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                הוסף תוספת
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                <LogOut className="w-5 h-5" />
                התנתק
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">סה"כ {addOns.length} תוספות</p>
        </div>

        {isAdding && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4 border-2 border-green-500">
            <h3 className="text-xl font-bold mb-4">תוספת חדשה</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="שם בעברית"
                value={formData.name_he}
                onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="English Name"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="מחיר"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                שמור
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
                ביטול
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">טוען...</p>
          </div>
        ) : addOns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600">אין תוספות כרגע</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addOns.map((addOn) => (
              <div key={addOn.id} className="bg-white rounded-lg shadow-lg p-6">
                {editingId === addOn.id ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <input
                        type="text"
                        value={formData.name_he}
                        onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(addOn.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4" />
                        שמור
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        <X className="w-4 h-4" />
                        ביטול
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">{addOn.name_he}</h3>
                        <p className="text-gray-600">{addOn.name_en}</p>
                      </div>
                      <div className="text-2xl font-bold text-chinese-red">₪{addOn.price}</div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <button
                        onClick={() => startEdit(addOn)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                        עריכה
                      </button>
                      <button
                        onClick={() => handleDelete(addOn.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        מחיקה
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminAddOns() {
  return (
    <ProtectedRoute>
      <AdminAddOnsContent />
    </ProtectedRoute>
  );
}
