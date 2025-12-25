
import CONFIG from '../config/config';

export interface PaymentConfig {
  bitPhone: string;
  bitUrl: string;
  payboxUrl: string;
}

export function getPaymentConfig(): PaymentConfig {
  return {
    bitPhone: CONFIG.BIT_PHONE,
    bitUrl: CONFIG.BIT_URL,
    payboxUrl: CONFIG.PAYBOX_URL,
  };
}

export function getBitPaymentLink(): string {
  const config = getPaymentConfig();
  return config.bitUrl;
}

export function createBitPaymentLink(amount: number, phone?: string): string {
  const config = getPaymentConfig();
  const bitPhone = phone || config.bitPhone;
  const amountInAgorot = Math.round(amount * 100);

  return `bit://pay?phone=${bitPhone}&amount=${amountInAgorot}`;
}

export function createBitWebFallbackLink(amount: number, phone?: string): string {
  const config = getPaymentConfig();
  const bitPhone = phone || config.bitPhone;
  const amountInShekels = Math.round(amount);

  return `https://web.bit.co.il/pay?phone=${bitPhone}&amount=${amountInShekels}`;
}

export function getPayBoxLink(amount?: number): string {
  const config = getPaymentConfig();
  if (amount) {
    return `${config.payboxUrl}?amount=${amount}`;
  }
  return config.payboxUrl;
}

export function openPaymentLink(url: string): void {
  window.location.href = url;


export function createGrowPaymentLink(orderId: string, amount: number): string {
  const GROW_STATIC_LINK = "https://pay.grow.link/ca1e9aa48a6c038af81a0b4e7d025628-Mjg2MjI1OA";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const notificationUrl = `${supabaseUrl}/functions/v1/grow-webhook`;

  return `${GROW_STATIC_LINK}?amount=${amount.toFixed(2)}&order_id=${orderId}&notification_url=${encodeURIComponent(notificationUrl)}`;
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

}
