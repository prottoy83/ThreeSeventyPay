# Payment Request Feature - Setup & Usage Guide

## Overview
The payment request feature allows users to create payment links that others can use to send them money. This implements the `pay_link` functionality from the PRD.

---

## Setup Instructions

### 1. Install Required Dependencies

Navigate to the server directory and install nanoid:

```bash
cd server
npm install nanoid
```

### 2. Run Database Migration

Execute the SQL migration to add required fields to the `pay_link` table:

```sql
-- Run this in your MySQL database (threeseventypay)
-- File: sql/payment_link_migration.sql

ALTER TABLE `pay_link` 
ADD COLUMN `used` TINYINT(1) DEFAULT 0 AFTER `expiry`;

ALTER TABLE `pay_link` 
ADD COLUMN `used_at` DATETIME DEFAULT NULL AFTER `used`;

ALTER TABLE `pay_link` 
ADD COLUMN `pm_id` INT(11) DEFAULT NULL AFTER `user_id`,
ADD CONSTRAINT `pay_link_pm_fk` FOREIGN KEY (`pm_id`) REFERENCES `payment_method` (`pm_id`) ON DELETE SET NULL;

ALTER TABLE `pay_link` 
ADD UNIQUE INDEX `idx_url` (`url`);
```

### 3. Restart the Server

After installing dependencies and running migrations:

```bash
cd server
node server.js
```

The server should now include the payment link routes at `/paylinks/`.

---

## How It Works

### User Flow

#### Creating a Payment Request:

1. User clicks **"Request"** button on Dashboard
2. Modal opens with:
   - Amount to request
   - Payment method to receive funds
   - Link expiration time (1h - 7 days)
3. User clicks **"Generate Payment Link"**
4. System creates unique payment link
5. User can copy and share the link

#### Paying via Link:

1. Payer receives link (e.g., `http://localhost:5173/pay/abc123xyz`)
2. Payer clicks link (must be logged in)
3. Payment page shows:
   - Amount to pay
   - Recipient name and email
   - Expiration time
4. Payer selects payment method
5. System validates:
   - Link is not expired
   - Link is not already used
   - Payer has sufficient balance
6. Payment is processed:
   - Deduct from payer's balance
   - Add to recipient's balance
   - Create transaction record
   - Mark link as used
7. Success message shown, redirect to dashboard

---

## API Endpoints

### POST `/paylinks/create`
Create a new payment link

**Request Body:**
```json
{
  "user_id": 1,
  "amount": 50.00,
  "expiry_hours": 24,
  "pm_id": 5
}
```

**Response:**
```json
{
  "message": "Payment link created successfully",
  "link_id": 1,
  "url": "abc123xyz456",
  "full_url": "http://localhost:5173/pay/abc123xyz456",
  "expiry": "2026-01-05T22:15:00.000Z"
}
```

---

### GET `/paylinks/details/:url`
Get payment link details

**Response:**
```json
{
  "link_id": 1,
  "amount": 50.00,
  "recipient_name": "John Doe",
  "recipient_email": "john@example.com",
  "expiry": "2026-01-05T22:15:00.000Z",
  "created_at": "2026-01-04T22:15:00.000Z"
}
```

**Error Responses:**
- `404` - Payment link not found
- `410` - Payment link has expired
- `410` - Payment link has already been used

---

### POST `/paylinks/pay/:url`
Process payment via link

**Request Body:**
```json
{
  "payer_id": 2,
  "pm_id": 3
}
```

**Response:**
```json
{
  "message": "Payment successful",
  "transaction_id": 15,
  "amount": 50.00
}
```

**Error Responses:**
- `400` - Insufficient balance
- `404` - Payment link or payment method not found
- `410` - Link expired or already used

---

### GET `/paylinks/user/:uid`
Get user's created payment links

**Response:**
```json
{
  "links": [
    {
      "link_id": 1,
      "url": "abc123xyz456",
      "full_url": "http://localhost:5173/pay/abc123xyz456",
      "amount": 50.00,
      "expiry": "2026-01-05T22:15:00.000Z",
      "used": false,
      "used_at": null,
      "created_at": "2026-01-04T22:15:00.000Z",
      "method_type": "bank",
      "is_expired": false
    }
  ]
}
```

---

## Frontend Components

### CreatePaymentLinkModal
**Location:** `client/src/components/CreatePaymentLinkModal.tsx`

**Props:**
- `isOpen: boolean` - Modal visibility
- `uid: string` - User ID
- `onClose: () => void` - Close handler
- `onCreated: () => void` - Success callback

**Features:**
- Amount input with validation
- Payment method selection (where to receive money)
- Expiry time selection (1h, 6h, 12h, 24h, 48h, 7 days)
- Link generation and copy functionality
- Success state with shareable link

---

### PayLink Page
**Location:** `client/src/pages/PayLink.tsx`

**Route:** `/pay/:linkId`

**Features:**
- Displays payment request details
- Shows recipient information
- Payment method selection for payer
- Balance validation
- Payment processing with transaction support
- Success/error states
- Auto-redirect after successful payment

---

## Database Schema Updates

### pay_link Table (Updated)

| Field | Type | Description |
|-------|------|-------------|
| link_id | INT | Primary key |
| user_id | INT | Recipient user ID |
| pm_id | INT | Recipient's payment method ID |
| url | VARCHAR(500) | Unique link identifier |
| amount | DECIMAL(10,2) | Amount to request |
| expiry | DATETIME | Expiration timestamp |
| used | TINYINT(1) | Whether link has been used |
| used_at | DATETIME | When link was used |
| created_at | TIMESTAMP | Creation timestamp |

---

## Security Features

1. **Unique URLs**: Generated using nanoid (12 characters, high entropy)
2. **Expiration**: Links automatically expire after set time
3. **Single-use**: Links can only be used once
4. **Balance Validation**: Checks payer has sufficient funds
5. **Transaction Atomicity**: Uses database transactions for consistency
6. **Authentication Required**: Payer must be logged in

---

## Testing the Feature

### Test Scenario 1: Create and Pay via Link

1. **User A** (Recipient):
   - Login to dashboard
   - Click "Request" button
   - Enter amount: $50
   - Select payment method to receive
   - Set expiry: 24 hours
   - Click "Generate Payment Link"
   - Copy the generated link

2. **User B** (Payer):
   - Login to account
   - Paste the link in browser
   - Verify amount and recipient details
   - Select payment method (with sufficient balance)
   - Click "Pay $50.00"
   - Verify success message

3. **Verification**:
   - Check User A's balance increased by $50
   - Check User B's balance decreased by $50
   - Check transaction record created
   - Try using link again - should show "already used"

### Test Scenario 2: Insufficient Balance

1. User A creates link for $100
2. User B (with only $50 balance) tries to pay
3. Should show error: "Insufficient balance"

### Test Scenario 3: Expired Link

1. Create link with 1 hour expiry
2. Manually update expiry in database to past time
3. Try to access link
4. Should show "Payment link has expired"

---

## Known Limitations

1. **No multi-payment method support**: Payer can only use one payment method per transaction
2. **No partial payments**: Must pay full amount
3. **No link editing**: Once created, links cannot be modified
4. **No link cancellation**: Active links cannot be manually cancelled (only expire)

---

## Future Enhancements

- [ ] Allow splitting payment across multiple payment methods
- [ ] Add link cancellation feature
- [ ] Add payment link history page
- [ ] Add QR code generation for links
- [ ] Add email/SMS notifications
- [ ] Add custom link messages/notes
- [ ] Add recurring payment links
- [ ] Add minimum/maximum amount validation
- [ ] Add payment link analytics

---

## Troubleshooting

### Issue: "nanoid is not defined"
**Solution:** Run `npm install nanoid` in the server directory

### Issue: "Column 'used' doesn't exist"
**Solution:** Run the database migration SQL script

### Issue: "Payment link not found"
**Solution:** Verify the link URL is correct and exists in database

### Issue: "Insufficient balance"
**Solution:** Add money to payment method or select different payment method

### Issue: Link shows as expired immediately
**Solution:** Check server and database timezone settings

---

## Code Files Created/Modified

### New Files:
1. `server/modules/paymentLink.js` - Backend payment link logic
2. `client/src/components/CreatePaymentLinkModal.tsx` - Request modal
3. `client/src/pages/PayLink.tsx` - Payment page
4. `sql/payment_link_migration.sql` - Database migration

### Modified Files:
1. `server/server.js` - Added payment link routes
2. `client/src/App.tsx` - Added PayLink route
3. `client/src/pages/Dashboard.tsx` - Added request button functionality

---

## Support

For issues or questions:
1. Check the implementation plan in `.agent/implementation-plan.md`
2. Review the task list in `.agent/task-list.md`
3. Check console logs for detailed error messages
4. Verify all migrations have been run
5. Ensure all dependencies are installed
