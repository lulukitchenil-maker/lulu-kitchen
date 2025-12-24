# 💳 Lulu Kitchen - Payment System Documentation

## ⚠️ IMPORTANT: Understanding the Payment Model

### What This System Does (and Doesn't Do)

**✅ What Works:**
- Creates orders with `pending` payment status
- Opens Bit/Grow payment links
- Listens to DB changes in real-time
- Automatically clears cart when payment confirmed
- Automatically resets order form
- Prevents duplicate payments
- Sends confirmation emails

**❌ What Does NOT Work (By Design):**
- No automatic payment confirmation from Bit
- No automatic payment confirmation from Grow
- No real webhook from payment providers
- No API integration with Grow (59₪ plan limitation)

---

## 🎯 The Correct Flow (Semi-Automatic)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer Orders                                           │
│    → Fills form                                             │
│    → Selects Bit/Grow                                       │
│    → Clicks "Confirm Order"                                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Order Created in DB                                       │
│    payment_status: 'pending'                                │
│    payment_method: 'bit' / 'grow'                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Payment Link Opened                                       │
│    Mobile: Deep link to Bit/Grow app                        │
│    Desktop: QR code + direct link                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Customer Pays (Outside Our System)                       │
│    Payment happens in Bit/Grow app/website                  │
│    We have NO automatic notification                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Waiting State                                            │
│    Order remains 'pending'                                  │
│    Frontend listens to DB changes (Supabase Realtime)      │
│    Customer can close browser - nothing breaks              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ⚠️ MANUAL STEP: Admin Confirms Payment                   │
│    Business owner checks Bit/Grow account                   │
│    Sees payment arrived                                     │
│    Updates DB: payment_status → 'paid'                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. 🔔 Automatic Reactions (Instant)                         │
│    ✅ If customer still on site:                            │
│       - Cart cleared                                        │
│       - Redirected to thank you page                        │
│    ✅ Emails sent automatically:                            │
│       - Customer confirmation                               │
│       - Business notifications (2)                          │
│    ✅ Order marked as paid (cannot pay again)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Components

### 1. OrderForm.tsx
**Responsibility:** Create order and handle payment selection

**Key functions:**
- `createPaymentLink()` - Creates order, generates payment link
- `handlePaymentComplete()` - Called when payment confirmed
- **Duplicate prevention** - Checks if order already paid

### 2. GrowPaymentModal.tsx
**Responsibility:** Show payment UI and listen for confirmation

**Key features:**
- Displays payment link/QR code
- **Realtime listener** - Watches for DB changes
- Automatically redirects when `payment_status` becomes `paid`
- Clears localStorage/sessionStorage

**Critical code:**
```javascript
// Lines 43-69
useEffect(() => {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      table: 'orders',
      filter: `id=eq.${orderId}`,
    }, (payload) => {
      if (payload.new.payment_status === 'paid') {
        // 🎯 THIS IS THE MAGIC
        localStorage.removeItem('lulu_k_cart');
        sessionStorage.removeItem('lulu_k_cart');
        window.location.href = `/thank-you?payment_success=true`;
      }
    })
    .subscribe();
}, [orderId]);
```

### 3. ThankYou.tsx
**Responsibility:** Final cart cleanup

**What it does:**
```javascript
useEffect(() => {
  const paymentSuccess = new URLSearchParams(location.search)
    .get('payment_success');

  if (paymentSuccess === 'true') {
    clearCart();  // Clear React state
    localStorage.removeItem('lulu_k_cart');
    sessionStorage.removeItem('lulu_k_cart');
  }
}, []);
```

### 4. useCart.tsx
**Responsibility:** Cart state management

**Key function:**
```javascript
const clearCart = () => {
  setCartItems([]);
  setCouponDiscount(0);
  setAppliedCoupon(null);
};
```

---

## 📧 Email System

### When Are Emails Sent?

**Trigger:** `payment_status` changes from `pending` to `paid`

**Where:** `supabase/functions/send-payment-confirmation/index.ts`

**Who receives:**
1. Customer - Order confirmation with full details
2. Business (Email 1) - New order notification
3. Business (Email 2) - Backup notification

**Email content includes:**
- Order ID
- Payment method (Bit/Grow/Cash)
- Customer details
- Order items with add-ons
- Total price
- Delivery date/time
- Delivery address
- Customer notes

**How it works:**
Currently, you need to manually trigger after updating order:
```javascript
// After updating payment_status to 'paid':
fetch('https://YOUR_SUPABASE_URL/functions/v1/send-payment-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId: 'ORDER_ID' })
})
```

**Future improvement:** Add a Database Trigger to automate this.

---

## 🛡️ Security Features

### 1. Duplicate Payment Prevention
```javascript
if (currentOrderId) {
  const { data: order } = await supabase
    .from('orders')
    .select('payment_status')
    .eq('id', currentOrderId)
    .maybeSingle();

  if (order?.payment_status === 'paid') {
    alert('Order already paid');
    return; // Block
  }
}
```

### 2. Order Integrity
- Orders cannot be modified after payment
- Payment status can only go forward (pending → paid)
- Order ID is UUID (non-guessable)

### 3. Cart Isolation
- Each user's cart in their own localStorage
- Cart cleared immediately after payment
- No cart data sent to server

---

## 🔧 Admin Tasks

### Daily Workflow:

1. **Check Bit/Grow accounts** for incoming payments
2. **Match payments to orders** in DB (by amount + time + customer)
3. **Update orders** to `paid` status
4. **Trigger email function** (or wait for automatic trigger if set up)

### Tools Needed:

- Supabase Dashboard access
- Bit app/account access
- Grow account access

### Quick Update Method:

**Via Supabase Dashboard:**
1. Open `orders` table
2. Filter: `payment_status = 'pending'`
3. Find order by customer name or phone
4. Edit row → Change `payment_status` to `paid`
5. Save

**Via SQL:**
```sql
UPDATE orders
SET payment_status = 'paid', updated_at = NOW()
WHERE id = 'ORDER_ID_HERE';
```

---

## 🚨 Troubleshooting

### Issue: Customer says payment stuck

**Solution:**
1. Check if order exists in DB
2. Check if `payment_status` is still `pending`
3. Verify payment in Bit/Grow account
4. If payment confirmed → update to `paid` manually
5. Customer will see thank you page automatically

### Issue: Emails not sent

**Solution:**
1. Check SMTP settings in Supabase
2. Verify environment variables:
   - `SMTP_HOST`
   - `SMTP_USER`
   - `SMTP_PASS`
3. Check Edge Function logs
4. Manually trigger email function

### Issue: Cart not clearing

**Solution:**
1. Verify customer reached `/thank-you?payment_success=true`
2. Check browser console for errors
3. Clear browser cache
4. Test with incognito mode

---

## ❓ FAQ

### Q: Why is payment confirmation manual?
**A:** Grow 59₪ plan has no API/webhooks. This is expected.

### Q: Can this be automated?
**A:** Yes, if you upgrade to Grow plan with API access.

### Q: Is the "bit-webhook" endpoint used?
**A:** No, not currently. It's future-ready for when API access is available.

### Q: What if customer closes browser before payment?
**A:** No problem! Order is saved in DB. When admin confirms payment, order is marked as paid. Customer can check status anytime.

### Q: Can customer pay after closing browser?
**A:** Yes, as long as they have the payment link or can re-access it.

### Q: How long can order stay pending?
**A:** Indefinitely. Set your own policy (e.g., 24 hours).

---

## 🎓 Understanding "Semi-Automatic"

**What's Automatic:**
- Order creation ✅
- Payment link generation ✅
- Realtime UI updates ✅
- Cart clearing ✅
- Form reset ✅
- Email sending ✅
- Duplicate prevention ✅

**What's Manual:**
- Payment verification ⚠️
- Updating payment_status ⚠️

**Why?**
Because we don't have API access to Bit or Grow to receive automatic payment confirmations.

**Is this a problem?**
No - it's the standard flow for 59₪ Grow plan. Many businesses operate this way.

---

## 📚 Related Files

- `ADMIN_PAYMENT_INSTRUCTIONS.md` - Step-by-step guide for admins
- `PAYMENT_FLOW_DOCUMENTATION.md` - Technical deep dive
- `src/components/OrderForm.tsx` - Order creation
- `src/components/GrowPaymentModal.tsx` - Payment UI
- `src/pages/ThankYou.tsx` - Post-payment cleanup
- `src/hooks/useCart.tsx` - Cart state
- `supabase/functions/send-payment-confirmation/` - Email function

---

## 🚀 Production Checklist

Before going live, verify:

- [ ] SMTP configured correctly
- [ ] Supabase Realtime enabled
- [ ] Orders table RLS policies correct
- [ ] Test order flow end-to-end
- [ ] Test email sending
- [ ] Test duplicate payment prevention
- [ ] Test cart clearing after payment
- [ ] Document admin workflow
- [ ] Train staff on payment confirmation
- [ ] Set up monitoring for pending orders

---

**Last Updated:** 2024
**System Version:** v1.0
**Grow Plan:** 59₪ (No API)
