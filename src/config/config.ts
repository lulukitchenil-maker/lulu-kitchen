export const CONFIG = {
  // Admin Contact
  ADMIN_EMAILS: ['lulu@lulu-k.com', 'lulu.kitchen.il@gmail.com'],
  BUSINESS_PHONE: import.meta.env.VITE_BUSINESS_PHONE || '052-520-1978',
  WHATSAPP_NUMBER: import.meta.env.VITE_WHATSAPP_NUMBER || '972525201978',

  // Database
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,

  // Google Apps Script (for email notifications)
  GOOGLE_SCRIPT_URL: import.meta.env.VITE_FORM_ENDPOINT || '',
  GOOGLE_SHEET_ID: import.meta.env.VITE_SHEET_ID || '1EoqYXiIDOgkYJ0-WMiz7mJRYFnyHYwPnA0IcvtwGzBA',

  // Payment
  BIT_URL: import.meta.env.VITE_BIT_URL || 'https://www.bitpay.co.il/app/me/C822FDFE-1C69-4F92-B57B-09635D465B9D',
  BIT_PHONE: import.meta.env.VITE_BIT_PHONE || '0525201978',
  PAYBOX_URL: import.meta.env.VITE_PAYBOX_URL || 'https://3ydbh.app.link/AQ5ENWbzzVb',

  // Delivery
  DELIVERY_FEE: Number(import.meta.env.VITE_DELIVERY_FEE) || 40,
  FREE_SHIPPING_THRESHOLD: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 800,

  // Images
  IMAGES_BASE: import.meta.env.VITE_IMAGES_BASE || 'https://lulu-k.com/images',

  // Currency
  CURRENCY: import.meta.env.VITE_CURRENCY || '₪',
} as const;

// 👇 השורה הזו צריכה להיות כאן, מחוץ לאובייקט
export const MAKE_WEBHOOK_URL =
  'https://hook.eu2.make.com/v5whuwdy5v2xymn3n70cl9429piybpoa';

export default CONFIG;
