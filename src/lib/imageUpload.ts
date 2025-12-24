import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadMenuImage(file: File, itemId: string): Promise<UploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}-${Date.now()}.${fileExt}`;
    const filePath = `menu/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: data.publicUrl
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deleteMenuImage(imageUrl: string): Promise<boolean> {
  try {
    const urlParts = imageUrl.split('/menu-images/');
    if (urlParts.length < 2) {
      console.error('Invalid image URL format');
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('menu-images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const { data } = supabase.storage
    .from('menu-images')
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'סוג הקובץ לא נתמך. השתמש ב-JPG, PNG או WEBP'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'הקובץ גדול מדי. מקסימום 5MB'
    };
  }

  return { valid: true };
}
