import { supabase } from './supabase';

export type PaymentMethod = 'cash' | 'grow';

export interface PaymentDetails {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}

export function createBitPaymentLink(amount: number): string {
  return `https://bitpay.co.il/app/pay-me?p=0507244482&a=${amount}`;
}

export function getPayBoxLink(): string {
  return "https://payboxapp.page.link/example";
}

export function createGrowPaymentLink(orderId: string, amount: number): string {
  const GROW_STATIC_LINK = "https://pay.grow.link/ca1e9aa48a6c038af81a0b4e7d025628-Mjg2MjI1OA";
  const callbackUrl = `${window.location.origin}/payment-status?orderId=${orderId}`;
  return `${GROW_STATIC_LINK}?amount=${amount}&external_id=${orderId}&redirect_url=${encodeURIComponent(callbackUrl)}`;
}

export async function updatePaymentStatus(orderId: string, status: PaymentDetails['status'], transactionId?: string) {
  const { error } = await supabase
    .from('orders')
    .update({ 
      payment_status: status,
      transaction_id: transactionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (error) throw error;
}
