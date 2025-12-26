const CONFIG = {
  MAKE_WEBHOOK_URL: "https://hook.us2.make.com/629pwhd8m8g1atv1scf398y5f4k5h5m1",
  APP_NAME: "Lulu Kitchen",
  APP_DESCRIPTION: "Authentic Asian Flavors",
  PHONE: "050-724-4482",
  EMAIL: "info@lulukitchen.co.il",
  ADDRESS: "Tel Aviv, Israel",
  INSTAGRAM_URL: "https://instagram.com/lulu_kitchen_il",
  FACEBOOK_URL: "https://facebook.com/lulukitchenil",
  DELIVERY_FEE: Number(import.meta.env.VITE_DELIVERY_FEE) || 35,
  FREE_SHIPPING_THRESHOLD: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 800,
};
export default CONFIG;
export { CONFIG };
