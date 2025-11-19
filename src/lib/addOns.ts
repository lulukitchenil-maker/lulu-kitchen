import { supabase } from './supabase';

export interface AddOn {
  id: string;
  name_he: string;
  name_en: string;
  price: number;
  available: boolean;
  sort_order: number;
}

export async function fetchAddOns(): Promise<AddOn[]> {
  try {
    const { data, error } = await supabase
      .from('addons')
      .select('id, name_he, name_en, price');

    if (error) {
      console.warn('Add-ons table query failed, using defaults:', error);
      return getDefaultAddOns();
    }

    if (!data || data.length === 0) {
      return getDefaultAddOns();
    }

    return data.map((item: any) => ({
      id: String(item.id),
      name_he: item.name_he || '',
      name_en: item.name_en || '',
      price: Number(item.price) || 0,
      available: true,
      sort_order: 0
    }));
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    return getDefaultAddOns();
  }
}

function getDefaultAddOns(): AddOn[] {
  return [
    {
      id: '1',
      name_he: 'אורז לבן',
      name_en: 'White Rice',
      price: 5,
      available: true,
      sort_order: 1,
    },
    {
      id: '2',
      name_he: 'אורז מטוגן',
      name_en: 'Fried Rice',
      price: 8,
      available: true,
      sort_order: 2,
    },
    {
      id: '3',
      name_he: 'נודלס',
      name_en: 'Noodles',
      price: 7,
      available: true,
      sort_order: 3,
    },
    {
      id: '4',
      name_he: 'רוטב חריף',
      name_en: 'Spicy Sauce',
      price: 3,
      available: true,
      sort_order: 4,
    },
    {
      id: '5',
      name_he: 'רוטב סויה',
      name_en: 'Soy Sauce',
      price: 2,
      available: true,
      sort_order: 5,
    },
  ];
}
