# 💳 Payment Flow Documentation - Lulu Kitchen

## System Overview

This system works with Grow's 59₪ plan, which does NOT include:
- ❌ Real payment API
- ❌ Real payment webhooks
- ❌ Automatic payment confirmation

Therefore, the payment flow is **semi-automatic by design**.

---

## 🔄 Complete Payment Flow

### 1️⃣ Order Creation (Automatic)

**Trigger:** User clicks "Confirm Order" with Bit or Grow payment method

**What happens:**
```javascript
// OrderForm.tsx → createPaymentLink()
const order = await supabase.from('orders').insert({
  customer_name: orderDetails.fullName,
  email: orderDetails.email,
  phone: orderDetails.phone,
  // ... other fields
  payment_method: 'bit' | 'grow',
  payment_status: 'pending',  // ← Key: starts as pending
  total_price: total,
  items: sanitizedItems,
  status: 'pending'
})
```

**Result:**
- Order created in DB with `payment_status: 'pending'`
- Order ID returned
- Payment link generated

---

### 2️⃣ Payment Link Display (Automatic)

**Mobile devices:**
```javascript
if (paymentMethod === 'bit') {
  window.location.href = createBitPaymentLink(total);
  // Opens Bit app directly with amount pre-filled
}
```

**Desktop:**
```javascript
// Shows modal with:
- QR code for scanning
- Direct payment link
- Copy link button
```

**Important:**
- Payment link opens Bit/Grow app/website
- User pays OUTSIDE our system
- We have NO automatic confirmation of payment

---

### 3️⃣ Waiting for Payment (Realtime Listener)

**While user is on payment page:**

```javascript
// GrowPaymentModal.tsx - lines 43-69
useEffect(() => {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `id=eq.${orderId}`,
    }, (payload) => {
      if (payload.new.payment_status === 'paid') {
        // 🔔 Payment confirmed!
        localStorage.removeItem('lulu_k_cart');
        sessionStorage.removeItem('lulu_k_cart');
        window.location.href = `/thank-you?orderId=${orderId}&payment_success=true`;
      }
    })
    .subscribe();
}, [orderId, isOpen]);
```

**What this does:**
- Listens to DB changes in real-time
- When `payment_status` changes from `pending` → `paid`
- Automatically clears cart and redirects user

**Key point:** This does NOT rely on external webhooks!

---

### 4️⃣ Manual Payment Confirmation (Admin Action)

**Who:** Business owner
**When:** After verifying payment was received in Bit/Grow account
**How:**

#### Option A: Supabase Dashboard
1. Go to Supabase Dashboard
2. Open `orders` table
3. Find the order
4. Change `payment_status` from `pending` to `paid`
5. Save

#### Option B: SQL Query
```sql
UPDATE orders
SET payment_status = 'paid',
    updated_at = NOW()
WHERE id = 'ORDER_ID_HERE';
```

---

### 5️⃣ Post-Payment Actions (Automatic)

**When `payment_status` changes to `paid`, the following happens automatically:**

#### A. Frontend (if user still on site)
```javascript
// Realtime listener triggers:
- Clear localStorage
- Clear sessionStorage
- Redirect to /thank-you?payment_success=true
```

#### B. Thank You Page
```javascript
// ThankYou.tsx - lines 10-21
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentSuccess = urlParams.get('payment_success');

  if (paymentSuccess === 'true') {
    clearCart();  // Clear cart state
    localStorage.removeItem('lulu_k_cart');
    sessionStorage.removeItem('lulu_k_cart');
  }
}, [clearCart]);
```

#### C. Emails (via Edge Function)
The `send-payment-confirmation` function is called and sends:

1. **Customer email:**
   - Order confirmation
   - Full order details
   - Payment method (Bit/Grow/Cash)
   - Delivery info

2. **Business emails (2):**
   - New order notification
   - Customer details
   - Order items
   - Payment method

---

## 🛡️ Duplicate Payment Prevention

### Scenario: User tries to pay again for same order

```javascript
// OrderForm.tsx - createPaymentLink()
if (currentOrderId) {
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('payment_status')
    .eq('id', currentOrderId)
    .maybeSingle();

  if (existingOrder?.payment_status === 'paid') {
    alert('Order already paid successfully');
    return;  // Block payment
  }
}
```

**Result:** User cannot pay twice for the same order

---

## 🎯 Key Technical Details

### Why No Real Webhook?

The `bit-webhook` function exists but is NOT used in production because:
1. Grow 59₪ plan has no API
2. Bit does not provide webhooks for free accounts
3. No external payment confirmation is sent to our system

### What IS the "webhook" then?

It's a **future-ready endpoint** that can be activated IF:
- You upgrade to Grow plan with API
- Bit provides webhook support
- You want to integrate a different payment provider with webhooks

Until then, it sits unused.

### How Are Emails Triggered?

Currently, emails must be triggered manually by calling:
```bash
# After updating payment_status to 'paid', call:
POST https://YOUR_SUPABASE_URL/functions/v1/send-payment-confirmation
{
  "orderId": "ORDER_ID_HERE"
}
```

**In the future:** This could be automated with a Database Trigger or pg_cron.

---

## 📊 Order States

| State | Meaning | Next Action |
|-------|---------|-------------|
| `pending` | Waiting for payment confirmation | Admin verifies payment → updates to `paid` |
| `paid` | Payment confirmed | Emails sent, order processing begins |

---

## 🔧 Testing the Flow

### Test Case 1: Successful Payment
1. Create order with Bit/Grow
2. Keep browser open
3. Manually update order to `paid` in DB
4. Watch: browser auto-redirects to thank you page
5. Check: cart is cleared
6. Verify: emails were sent

### Test Case 2: Duplicate Payment Prevention
1. Create order with Bit/Grow
2. Update to `paid`
3. Try to access payment link again
4. Verify: blocked with "already paid" message

### Test Case 3: Form Reset
1. Fill order form
2. Submit order
3. Complete payment
4. Return to home page
5. Open order form again
6. Verify: all fields are empty

---

## 🚀 Future Enhancements

### Option 1: Add Database Trigger
Automatically call email function when `payment_status` changes:

```sql
CREATE OR REPLACE FUNCTION send_payment_emails()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    PERFORM net.http_post(
      url := 'https://YOUR_URL/functions/v1/send-payment-confirmation',
      body := json_build_object('orderId', NEW.id)::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_confirmed
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_payment_emails();
```

### Option 2: Upgrade to Grow API Plan
If you upgrade, enable the `bit-webhook` for automatic confirmations.

---

## 📞 Summary

**Current Reality:**
- Semi-automatic payment flow
- Manual payment confirmation required
- Realtime updates for UX
- Email notifications work

**This is NOT a bug** - it's the expected behavior for Grow 59₪ plan.

**What works well:**
✅ Cart clearing
✅ Form reset
✅ Duplicate prevention
✅ Email notifications
✅ Realtime UX updates

**What requires manual work:**
⚠️ Payment confirmation (checking Bit/Grow accounts)
⚠️ Updating DB from `pending` → `paid`
