# 🔧 Setup Instructions - AI Expense Prediction

## Quick Setup (3 Steps)

### Step 1: Create Database Tables
Run this command to create the required tables:

```bash
cd server
node setup-ai-tables.js
```

You should see:
```
🔧 Setting up AI Prediction tables...
✅ ai_prediction table created successfully
✅ ai_insights table created successfully
🎉 Database setup complete!
```

### Step 2: Verify Brain.js Installation
```bash
cd server
npm list brain.js
```

If not installed:
```bash
npm install brain.js
```

### Step 3: Restart Your Server
```bash
cd server
npm start
# or
nodemon server.js
```

## How It Works Now

### 1. **First Load**
- User visits dashboard
- Component tries to load predictions from database
- If no predictions exist or they're older than 24 hours:
  - System automatically generates new predictions
  - Trains AI on transaction history
  - Stores results in database
  - Returns predictions to user

### 2. **Subsequent Loads**
- Component loads predictions from database (instant!)
- No AI training needed
- Predictions are cached for 24 hours

### 3. **Auto-Refresh**
- Predictions automatically regenerate every 24 hours
- Always stays up-to-date with your spending

## Database Tables Created

### `ai_prediction`
Stores individual category predictions:
- `user_id`: User identifier
- `category`: Spending category
- `predicted_amount`: AI prediction
- `historical_average`: Historical average
- `confidence`: Confidence score (0-100)
- `prediction_month`: Month number (1-12)
- `prediction_year`: Year
- `updated_at`: Last update timestamp

### `ai_insights`
Stores spending insights (future use):
- `user_id`: User identifier
- `total_spent`: Total spending
- `transaction_count`: Number of transactions
- `category_breakdown`: JSON data
- `monthly_trend`: JSON data

## API Endpoints

### GET /predictions/predictions/:uid
- Loads predictions from database
- Auto-generates if missing or outdated
- Returns cached results when available

### POST /predictions/generate/:uid
- Manually trigger prediction generation
- Useful for testing or forcing refresh

### GET /predictions/insights/:uid
- Get spending insights and trends
- Calculated in real-time from transactions

## Testing

### 1. Check if tables exist:
```sql
SHOW TABLES LIKE 'ai_%';
```

### 2. Test prediction endpoint:
```bash
curl http://localhost:5990/predictions/predictions/YOUR_UID
```

### 3. Manually generate predictions:
```bash
curl -X POST http://localhost:5990/predictions/generate/YOUR_UID
```

### 4. Check stored predictions:
```sql
SELECT * FROM ai_prediction WHERE user_id = 'YOUR_UID';
```

## Troubleshooting

### "Table doesn't exist" error
**Solution**: Run `node setup-ai-tables.js`

### Still showing loading spinner
**Possible causes**:
1. Server not running
2. Database connection issue
3. No transactions in database
4. Brain.js not installed

**Check**:
```bash
# Check server is running
curl http://localhost:5990/

# Check Brain.js
cd server && npm list brain.js

# Check database connection
# Look at server console for errors
```

### Predictions not updating
**Solution**: Predictions cache for 24 hours. To force update:
```bash
curl -X POST http://localhost:5990/predictions/generate/YOUR_UID
```

Or delete old predictions:
```sql
DELETE FROM ai_prediction WHERE user_id = 'YOUR_UID';
```

## Performance Benefits

### Before (Real-time AI):
- ❌ 2-5 seconds to train AI every load
- ❌ High CPU usage
- ❌ Slow user experience

### After (Database Caching):
- ✅ <100ms to load predictions
- ✅ Minimal CPU usage
- ✅ Fast, smooth experience
- ✅ Predictions cached for 24 hours

## Next Steps

1. ✅ Run `node setup-ai-tables.js`
2. ✅ Restart server
3. ✅ Visit dashboard
4. ✅ Make some transactions
5. ✅ View AI predictions!

---

**Note**: The first time a user loads predictions, it may take 2-5 seconds to generate. After that, it's instant! 🚀
