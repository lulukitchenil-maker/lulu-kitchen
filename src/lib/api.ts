import type { CartItem, ContactMessage, OrderDetails } from '../types';
import { supabase } from './supabase';
import CONFIG from '../config/config';

const FORM_ENDPOINT = CONFIG.GOOGLE_SCRIPT_URL;

export interface ApiResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  error?: string;
}

export interface OrderSubmission {
  type: 'order';
  orderDetails: OrderDetails;
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  timestamp: string;
}

export interface ContactSubmission {
  type: 'contact';
  name: string;
  phone: string;
  email?: string;
  preferredDate?: string;
  preferredTime?: string;
  message: string;
  timestamp: string;
}

export interface ReviewSubmission {
  type: 'review';
  name: string;
  email?: string;
  rating: number;
  reviewHe: string;
  reviewEn?: string;
  timestamp: string;
}

async function submitToAppsScript(
  data: OrderSubmission | ContactSubmission | ReviewSubmission,
  retries = 2
): Promise<ApiResponse> {
  if (!FORM_ENDPOINT) {
    console.warn('FORM_ENDPOINT is not configured - skipping email notification');
    return {
      success: true,
      message: 'נשלח בהצלחה (ללא התראת אימייל)',
    };
  }

  console.log('Submitting to Apps Script:', {
    type: data.type,
    endpoint: FORM_ENDPOINT,
    dataKeys: Object.keys(data)
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      console.log(`Attempt ${attempt} of ${retries}...`);

      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result;
      try {
        const text = await response.text();
        console.log('Response text:', text);
        result = JSON.parse(text);
      } catch (parseError) {
        console.warn('Could not parse response as JSON, assuming success');
        result = { success: true };
      }

      if (result.success !== false) {
        console.log('Submission successful to Apps Script');
        return {
          success: true,
          message: result.message || 'נשלח בהצלחה',
        };
      } else {
        throw new Error(result.error || 'Unknown error from Apps Script');
      }

    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Attempt ${attempt}/${retries} failed:`, error);

      if (attempt === retries) {
        console.warn('Google Apps Script failed - continuing without email notification');
        return {
          success: true,
          message: 'נשלח בהצלחה (התראת אימייל נכשלה)',
        };
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    success: true,
    message: 'נשלח בהצלחה (ללא התראת אימייל)',
  };
}

export async function submitOrder(
  orderDetails: OrderDetails,
  cartItems: CartItem[],
  subtotal: number,
  shipping: number,
  total: number
): Promise<ApiResponse> {
  console.log('=== START: Order Submission ===');
  console.log('Step 1: Preparing order data');

  try {
    // Prepare order payload for Edge Function
    const orderPayload = {
      customer_name: orderDetails.fullName,
      customer_email: orderDetails.email || '',
      customer_phone: orderDetails.phone,
      city: orderDetails.city,
      street: orderDetails.street,
      house_number: orderDetails.houseNumber,
      apartment: orderDetails.apartment || '',
      floor: orderDetails.floor || '',
      delivery_date: orderDetails.deliveryDate || '',
      delivery_time: orderDetails.deliveryTime,
      notes: orderDetails.notes || '',
      payment_method: orderDetails.paymentMethod,
      items: cartItems.map(item => ({
        name: item.menuItem.name_he,
        quantity: item.quantity,
        price: item.menuItem.price,
        addOns: item.selectedAddOns?.map(addOn => ({
          name: addOn.name_he,
          price: addOn.price,
        })) || [],
      })),
      total: total,
      recommendations: [], // Can be populated from cart context
    };

    console.log('Step 2: Calling send-order Edge Function');

    // Call Supabase Edge Function
    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process order');
    }

    const result = await response.json();
    console.log('Step 2 SUCCESS: Order processed via Edge Function', result);

    // WhatsApp is now sent automatically by Edge Function
    console.log('Order processed, WhatsApp sent automatically');

    console.log('=== COMPLETE: Order submitted successfully ===');
    return {
      success: true,
      message: 'ההזמנה נשלחה בהצלחה!',
      orderId: result.orderId
    };
  } catch (error) {
    console.error('=== ERROR: Order submission failed ===', error);

    // Fallback: Try direct Supabase insert
    console.log('Attempting fallback: Direct database insert');
    try {
      const fullAddress = `${orderDetails.street} ${orderDetails.houseNumber}${orderDetails.apartment ? ', דירה ' + orderDetails.apartment : ''}${orderDetails.floor ? ', קומה ' + orderDetails.floor : ''}`;

      const { data, error: dbError } = await supabase
        .from('orders')
        .insert([{
          customer_name: orderDetails.fullName,
          email: orderDetails.email || '',
          phone: orderDetails.phone,
          city: orderDetails.city,
          street: orderDetails.street,
          house_number: orderDetails.houseNumber,
          address: fullAddress,
          delivery_time: orderDetails.deliveryTime,
          notes: orderDetails.notes || '',
          payment_method: orderDetails.paymentMethod,
          total_price: total,
          status: 'pending',
          payment_status: 'pending'
        }])
        .select()
        .maybeSingle();

      if (dbError) throw dbError;

      // WhatsApp sent automatically by Edge Function
      console.log('Order saved to database, WhatsApp will be sent automatically');

      return {
        success: true,
        message: 'ההזמנה נשלחה בהצלחה! (נא לאשר ב-WhatsApp)',
        orderId: data?.order_number
      };
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);

      let errorMessage = 'שגיאה בשמירת ההזמנה. אנא נסה שוב או צור קשר טלפונית.';
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'בעיית תקשורת. אנא בדוק את החיבור לאינטרנט ונסה שוב.';
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

export async function submitContact(contactData: ContactMessage): Promise<ApiResponse> {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        customer_name: contactData.name,
        customer_phone: contactData.phone,
        customer_email: contactData.email || '',
        message: contactData.message,
        status: 'new'
      });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/send-contact-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name: contactData.name,
            phone: contactData.phone,
            email: contactData.email,
            message: contactData.message,
            preferredDate: contactData.preferred_date,
            preferredTime: contactData.preferred_time,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (!result.emailSent && result.whatsappUrl) {
          window.open(result.whatsappUrl, '_blank');
        }
      }
    } catch (emailError) {
      console.warn('Failed to send email (non-blocking):', emailError);
    }

    return {
      success: true,
      message: 'ההודעה נשלחה בהצלחה!'
    };
  } catch (error) {
    console.error('Error submitting contact:', error);
    return {
      success: false,
      error: 'שגיאה בשליחת ההודעה. אנא נסה שוב.'
    };
  }
}

export async function submitReview(
  name: string,
  email: string,
  phone: string,
  rating: number,
  reviewHe: string,
  reviewEn: string
): Promise<ApiResponse> {
  try {
    const { error } = await supabase
      .from('recommendations')
      .insert({
        customer_name: name,
        email: email || '',
        phone: phone || '',
        rating: rating,
        comment: reviewHe,
        comment_en: reviewEn || '',
        status: 'pending'
      });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    try {
      const response = await fetch(
        `${CONFIG.SUPABASE_URL}/functions/v1/send-recommendation-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            rating,
            reviewHe,
            reviewEn,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Email/WhatsApp result:', result);
      }
    } catch (emailError) {
      console.warn('Failed to send notification (non-blocking):', emailError);
    }

    return {
      success: true,
      message: 'ההמלצה נשלחה בהצלחה!'
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      success: false,
      error: 'שגיאה בשליחת ההמלצה. אנא נסה שוב.'
    };
  }
}
