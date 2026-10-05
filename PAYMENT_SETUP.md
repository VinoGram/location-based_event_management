# African Payment Integration Setup

## Overview
Added Paystack and Flutterwave payment integration for African countries to handle ticket purchases with local payment methods.

## Supported Countries
- Nigeria (NG) - Paystack
- Ghana (GH) - Paystack  
- Kenya (KE) - Flutterwave
- South Africa (ZA) - Paystack
- Uganda (UG) - Flutterwave
- Tanzania (TZ) - Flutterwave
- Rwanda (RW) - Flutterwave
- Senegal (SN) - Flutterwave
- And other African countries

## Setup Instructions

### 1. Get API Keys

**Paystack:**
1. Sign up at https://paystack.com
2. Get your Secret Key from Settings > API Keys & Webhooks
3. Add to backend/.env: `PAYSTACK_SECRET_KEY=sk_test_...`

**Flutterwave:**
1. Sign up at https://flutterwave.com
2. Get your Secret Key from Settings > API
3. Add to backend/.env: `FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST...`

### 2. Environment Variables
```
PAYSTACK_SECRET_KEY=your_paystack_secret_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FRONTEND_URL=http://localhost:3000
```

### 3. Database Update
Run the updated SQL schema to add payment tracking fields:
```sql
ALTER TABLE ticket_purchases ADD COLUMN payment_reference VARCHAR(255);
ALTER TABLE ticket_purchases ADD COLUMN payment_provider VARCHAR(50);
```

## Payment Flow

### 1. Initialize Payment
```javascript
POST /api/payments/initialize
{
  "eventId": 123,
  "amount": 25.00,
  "currency": "GHS",
  "country": "GH"
}
```

### 2. User Redirected to Payment Page
- Paystack for Nigeria, Ghana, South Africa
- Flutterwave for other African countries

### 3. Payment Callback
- User redirected to `/payment/callback`
- Payment automatically verified
- Ticket purchase recorded

## Supported Currencies
- GHS (Ghana Cedis)
- NGN (Nigerian Naira)  
- KES (Kenyan Shilling)
- ZAR (South African Rand)
- UGX (Ugandan Shilling)
- TZS (Tanzanian Shilling)
- RWF (Rwandan Franc)

## Payment Methods
- Mobile Money (MTN, Vodafone, Airtel, etc.)
- Bank Cards (Visa, Mastercard)
- Bank Transfers
- USSD Codes
- QR Codes

## Testing
Use test API keys for development:
- Paystack: `sk_test_...`
- Flutterwave: `FLWSECK_TEST...`

## Files Added
- `backend/routes/payments.js` - Payment API endpoints
- `Frontend/src/components/PaymentModal.tsx` - Payment modal
- `Frontend/src/components/PaymentCallback.tsx` - Payment verification
- Updated database schema with payment tracking

## Integration with Existing Discount System
- Premium users: 50% off first ticket, then 10%
- Free users: 10% discount
- Discounts applied before payment initialization