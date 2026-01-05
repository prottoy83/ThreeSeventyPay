# 🔍 Troubleshooting: "No Predictions Available"

## Quick Diagnostic Steps

### Step 1: Check if Database Tables Exist
```bash
cd d:\Projects\ThreeSeventyPay\server
node setup-ai-tables.js
```

**Expected Output:**
```
✅ ai_prediction table created successfully
✅ ai_insights table created successfully
🎉 Database setup complete!
```

### Step 2: Check if You Have Transaction Data
Run this SQL query:
```sql
SELECT COUNT(*) as total_transactions
FROM transaction_record 
WHERE transaction_type IN ('PAYMENT', 'TRANSFER', 'ADD_MONEY');
```

**Need**: At least 10+ transactions across 3+ months for predictions

### Step 3: Manually Trigger Prediction Generation
```bash
# Replace YOUR_UID with your actual user ID
curl -X POST http://localhost:5990/predictions/generate/YOUR_UID
```

**Check server console** for:
```
✅ AI predictions updated for user YOUR_UID
```

### Step 4: Check API Response
```bash
curl http://localhost:5990/predictions/predictions/YOUR_UID
```

**Possible Responses:**

#### ❌ No transactions:
```json
{
  "success": false,
  "message": "No transaction history found...",
  "predictions": []
}
```
**Solution**: Make some transactions first

#### ❌ Insufficient data:
```json
{
  "success": false,
  "message": "Insufficient transaction history for AI prediction. Need at least 3 months of data.",
  "predictions": []
}
```
**Solution**: Need more historical data (3+ months)

#### ✅ Success:
```json
{
  "success": true,
  "predictions": [...],
  "totalPredicted": 1250.75
}
```

---

## Common Issues & Solutions

### Issue 1: "No predictions available" but have transactions

**Possible Causes:**
1. Database tables not created
2. Not enough historical data (need 3+ months)
3. Transactions not in correct format
4. Server error during generation

**Solutions:**

#### A. Create Database Tables
```bash
cd server
node setup-ai-tables.js
```

#### B. Check Transaction Data
```sql
-- Check total transactions
SELECT COUNT(*) FROM transaction_record 
WHERE sender_id = 'YOUR_UID' 
AND transaction_type IN ('PAYMENT', 'TRANSFER');

-- Check date range
SELECT 
    MIN(timestamp) as first_transaction,
    MAX(timestamp) as last_transaction,
    TIMESTAMPDIFF(MONTH, MIN(timestamp), MAX(timestamp)) as months_of_data
FROM transaction_record 
WHERE sender_id = 'YOUR_UID';
```

**Need**: At least 3 months between first and last transaction

#### C. Manually Generate Predictions
```bash
curl -X POST http://localhost:5990/predictions/generate/YOUR_UID
```

Check server console for errors.

#### D. Check Database for Stored Predictions
```sql
SELECT * FROM ai_prediction 
WHERE user_id = 'YOUR_UID' 
ORDER BY updated_at DESC;
```

If empty, predictions weren't generated successfully.

---

### Issue 2: Server Errors

**Check Server Console:**
Look for errors like:
- `Table 'ai_prediction' doesn't exist`
- `Cannot find module 'brain.js'`
- `Database connection error`

**Solutions:**

#### Table doesn't exist:
```bash
node setup-ai-tables.js
```

#### Brain.js not installed:
```bash
cd server
npm install brain.js
```

#### Database connection:
Check `server/config/db.js` for correct credentials

---

### Issue 3: Frontend Stuck on Loading

**Possible Causes:**
1. Server not running
2. API endpoint unreachable
3. CORS issues
4. Timeout

**Solutions:**

#### A. Check Server is Running
```bash
curl http://localhost:5990/
```

Should return: `ThreeSeventyProject`

#### B. Check Browser Console (F12)
Look for:
- Network errors
- CORS errors
- Timeout errors

#### C. Check API Endpoint
```bash
curl http://localhost:5990/predictions/predictions/YOUR_UID
```

Should return JSON response (not 404)

---

### Issue 4: Have Data But Still No Predictions

**Debug Steps:**

#### 1. Check Transaction Types
```sql
SELECT transaction_type, COUNT(*) as count
FROM transaction_record 
WHERE sender_id = 'YOUR_UID'
GROUP BY transaction_type;
```

**Note**: Only `PAYMENT` and `TRANSFER` types are used for predictions

#### 2. Check Descriptions
```sql
SELECT description, COUNT(*) as count
FROM transaction_record 
WHERE sender_id = 'YOUR_UID' 
AND transaction_type IN ('PAYMENT', 'TRANSFER')
GROUP BY description
LIMIT 10;
```

Predictions work better with varied descriptions

#### 3. Force Regeneration
```sql
-- Delete old predictions
DELETE FROM ai_prediction WHERE user_id = 'YOUR_UID';
```

Then:
```bash
curl -X POST http://localhost:5990/predictions/generate/YOUR_UID
```

---

## Creating Test Data

If you don't have enough transactions, create some test data:

```sql
-- Insert test transactions (replace YOUR_UID and PM_ID)
INSERT INTO transaction_record 
(sender_id, pm_id, amount, transaction_type, description, status, timestamp) 
VALUES 
('YOUR_UID', 1, 45.50, 'PAYMENT', 'Payment to Pizza Restaurant', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 90 DAY)),
('YOUR_UID', 1, 25.00, 'PAYMENT', 'Uber ride to downtown', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 85 DAY)),
('YOUR_UID', 1, 120.00, 'PAYMENT', 'Shopping at Mall', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 80 DAY)),
('YOUR_UID', 1, 60.00, 'PAYMENT', 'Gas station fuel', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 75 DAY)),
('YOUR_UID', 1, 35.00, 'PAYMENT', 'Coffee shop', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 70 DAY)),
('YOUR_UID', 1, 50.00, 'PAYMENT', 'Restaurant dinner', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 60 DAY)),
('YOUR_UID', 1, 30.00, 'PAYMENT', 'Taxi ride', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 55 DAY)),
('YOUR_UID', 1, 80.00, 'PAYMENT', 'Grocery shopping', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 50 DAY)),
('YOUR_UID', 1, 40.00, 'PAYMENT', 'Movie tickets', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 45 DAY)),
('YOUR_UID', 1, 55.00, 'PAYMENT', 'Food delivery', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 40 DAY)),
('YOUR_UID', 1, 70.00, 'PAYMENT', 'Clothing store', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 30 DAY)),
('YOUR_UID', 1, 45.00, 'PAYMENT', 'Restaurant lunch', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 25 DAY)),
('YOUR_UID', 1, 90.00, 'PAYMENT', 'Shopping mall', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 20 DAY)),
('YOUR_UID', 1, 35.00, 'PAYMENT', 'Gas station', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 15 DAY)),
('YOUR_UID', 1, 60.00, 'PAYMENT', 'Restaurant dinner', 'SUCCESS', DATE_SUB(NOW(), INTERVAL 10 DAY));
```

Then generate predictions:
```bash
curl -X POST http://localhost:5990/predictions/generate/YOUR_UID
```

---

## Verification Checklist

- [ ] Database tables created (`ai_prediction` exists)
- [ ] Brain.js installed (`npm list brain.js`)
- [ ] Server running (port 5990)
- [ ] Have 10+ transactions
- [ ] Transactions span 3+ months
- [ ] Transactions have descriptions
- [ ] Manually triggered generation
- [ ] Checked server console for errors
- [ ] Checked browser console for errors
- [ ] API endpoint returns data

---

## Still Not Working?

### Get Your User ID
```javascript
// In browser console on dashboard
console.log(localStorage.getItem('uid'));
```

### Check Full Diagnostic
```sql
-- Run all these queries
SELECT COUNT(*) as total_tx FROM transaction_record WHERE sender_id = 'YOUR_UID';
SELECT MIN(timestamp), MAX(timestamp) FROM transaction_record WHERE sender_id = 'YOUR_UID';
SELECT COUNT(*) as predictions FROM ai_prediction WHERE user_id = 'YOUR_UID';
SHOW TABLES LIKE 'ai_%';
```

### Check Server Logs
Look for:
- `✅ AI predictions updated for user...`
- Any error messages
- Database connection issues

### Test API Directly
```bash
# Test server
curl http://localhost:5990/

# Test predictions endpoint
curl http://localhost:5990/predictions/predictions/YOUR_UID

# Test insights endpoint  
curl http://localhost:5990/predictions/insights/YOUR_UID

# Force generate
curl -X POST http://localhost:5990/predictions/generate/YOUR_UID
```

---

## Contact Points

If still having issues, provide:
1. Server console output
2. Browser console errors
3. Result of diagnostic SQL queries
4. API response from curl commands

This will help diagnose the exact issue!
