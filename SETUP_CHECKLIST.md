# ✅ Setup Checklist - AI Expense Prediction

## Before You Start
- [ ] Server is stopped
- [ ] Database is running
- [ ] You have access to the database

## Setup Steps

### 1. Create Database Tables ⚠️ REQUIRED
```bash
cd d:\Projects\ThreeSeventyPay\server
node setup-ai-tables.js
```

**Expected Output:**
```
🔧 Setting up AI Prediction tables...
✅ ai_prediction table created successfully
✅ ai_insights table created successfully
🎉 Database setup complete!
```

**If you see errors:**
- Check database connection in `server/config/db.js`
- Make sure MySQL is running
- Verify database credentials

### 2. Verify Brain.js Installation
```bash
cd d:\Projects\ThreeSeventyPay\server
npm list brain.js
```

**Should show:**
```
brain.js@2.0.0-beta.24
```

**If not installed:**
```bash
npm install brain.js
```

### 3. Start the Server
```bash
cd d:\Projects\ThreeSeventyPay\server
npm start
```

**or with nodemon:**
```bash
nodemon server.js
```

### 4. Start the Client
```bash
cd d:\Projects\ThreeSeventyPay\client
npm run dev
```

### 5. Test the Feature
1. Open browser to `http://localhost:5173` (or your client port)
2. Log in to your account
3. Go to Dashboard
4. Scroll to "🤖 AI Expense Insights"

**What you should see:**
- If you have transactions: Predictions or insights
- If no transactions: Empty state message
- Should NOT be stuck on loading

## Verification

### Check Database Tables
```sql
SHOW TABLES LIKE 'ai_%';
```

**Should show:**
```
ai_prediction
ai_insights
```

### Check Table Structure
```sql
DESCRIBE ai_prediction;
```

**Should show columns:**
- prediction_id
- user_id
- category
- predicted_amount
- historical_average
- confidence
- prediction_month
- prediction_year
- created_at
- updated_at

### Test API Endpoint
```bash
# Replace YOUR_UID with your actual user ID
curl http://localhost:5990/predictions/predictions/YOUR_UID
```

**Expected responses:**

**If no transactions:**
```json
{
  "success": false,
  "message": "No transaction history found...",
  "predictions": []
}
```

**If insufficient data:**
```json
{
  "success": false,
  "message": "Insufficient transaction history for AI prediction...",
  "predictions": []
}
```

**If successful:**
```json
{
  "success": true,
  "predictions": [...],
  "totalPredicted": 1250.75,
  "trainingDataPoints": 24
}
```

## Common Issues & Solutions

### ❌ "Table 'ai_prediction' doesn't exist"
**Solution:** Run `node setup-ai-tables.js`

### ❌ Component stuck on loading
**Possible causes:**
1. Server not running → Start server
2. Database tables not created → Run setup script
3. API endpoint error → Check server console
4. Network issue → Check browser console

**Debug:**
```bash
# Check if server is running
curl http://localhost:5990/

# Check specific endpoint
curl http://localhost:5990/predictions/predictions/YOUR_UID
```

### ❌ "Cannot find module 'brain.js'"
**Solution:**
```bash
cd server
npm install brain.js
```

### ❌ Database connection error
**Check:**
1. MySQL is running
2. Database credentials in `server/config/db.js`
3. Database exists
4. User has permissions

### ❌ Empty predictions but have transactions
**Possible reasons:**
1. Not enough data (need 3+ months)
2. Transactions not categorizable
3. Check transaction_type filter

**Debug:**
```sql
-- Check your transactions
SELECT COUNT(*) FROM transaction_record 
WHERE sender_id = 'YOUR_UID' 
AND transaction_type IN ('PAYMENT', 'TRANSFER');

-- Check date range
SELECT MIN(timestamp), MAX(timestamp) 
FROM transaction_record 
WHERE sender_id = 'YOUR_UID';
```

## Post-Setup

### Monitor First Load
1. Open browser console (F12)
2. Go to Network tab
3. Load dashboard
4. Look for request to `/predictions/predictions/YOUR_UID`
5. Check response time and data

### Check Database After First Load
```sql
SELECT * FROM ai_prediction WHERE user_id = 'YOUR_UID';
```

Should see predictions stored if you have enough transaction data.

### Performance Test
1. First load: May take 2-5 seconds (AI training)
2. Refresh page: Should load instantly (<100ms)
3. Check `cached: true` in API response

## Success Criteria

✅ Database tables created  
✅ Brain.js installed  
✅ Server running without errors  
✅ Client running  
✅ Dashboard loads  
✅ AI Insights section visible  
✅ No loading spinner stuck  
✅ Predictions show (if data available) OR empty state shows  

## Need Help?

### Check Logs
**Server console:**
- Look for errors
- Check database connection messages
- See API request logs

**Browser console:**
- Check for network errors
- Look for API response errors
- See component errors

### Test Endpoints Manually
```bash
# Health check
curl http://localhost:5990/

# Predictions
curl http://localhost:5990/predictions/predictions/YOUR_UID

# Insights
curl http://localhost:5990/predictions/insights/YOUR_UID

# Force generate
curl -X POST http://localhost:5990/predictions/generate/YOUR_UID
```

---

## Quick Reference

**Setup Command:**
```bash
cd server && node setup-ai-tables.js
```

**Start Server:**
```bash
cd server && npm start
```

**Start Client:**
```bash
cd client && npm run dev
```

**Test API:**
```bash
curl http://localhost:5990/predictions/predictions/YOUR_UID
```

---

**Once setup is complete, the feature will work automatically!** 🎉
