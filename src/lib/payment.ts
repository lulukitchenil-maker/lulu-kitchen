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
}
