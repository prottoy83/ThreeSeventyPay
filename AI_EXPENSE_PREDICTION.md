# AI-Powered Expense Prediction Feature

## Overview
This feature uses **Brain.js** neural networks to analyze your transaction history and predict future monthly expenses by category.

## How It Works

### 1. **Data Collection**
- Fetches your transaction history from the last 12 months
- Analyzes payment patterns and spending habits

### 2. **Smart Categorization**
Automatically categorizes transactions into:
- 🍽️ Food & Dining
- 🛍️ Shopping
- 🚗 Transportation
- 🎬 Entertainment
- 💡 Bills & Utilities
- ⚕️ Healthcare
- 💸 Transfer
- 📦 Other

### 3. **AI Training**
- Uses a neural network with 2 hidden layers [4, 3]
- Trains on historical spending patterns
- Learns relationships between months and spending amounts
- Generates predictions with confidence scores

### 4. **Prediction Output**
For each category, you get:
- **AI Prediction**: Neural network's prediction for next month
- **Historical Average**: Your average spending in that category
- **Confidence Score**: Based on data availability (more data = higher confidence)
- **Trend Alerts**: Warnings if spending is predicted to increase/decrease significantly

## API Endpoints

### Get Predictions
```
GET /predictions/predictions/:uid?month=<target_month>
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "category": "Food & Dining",
      "predictedAmount": 320.50,
      "historicalAverage": 305.20,
      "confidence": 85
    }
  ],
  "totalPredicted": 1250.75,
  "trainingDataPoints": 24
}
```

### Get Insights
```
GET /predictions/insights/:uid
```

**Response:**
```json
{
  "totalSpent": 5420.30,
  "categoryBreakdown": [
    {
      "category": "Food & Dining",
      "amount": 1830.50,
      "percentage": 34
    }
  ],
  "monthlyTrend": [
    {
      "month": "2025-12",
      "amount": 920.40
    }
  ],
  "transactionCount": 156
}
```

## UI Features

### Predictions Tab
- Beautiful gradient cards for each spending category
- Visual confidence bars
- Alert badges for significant changes
- Animated transitions and hover effects

### Insights Tab
- Total spending summary (last 6 months)
- Category breakdown with percentages
- Monthly spending trend chart
- Interactive visualizations

## Requirements

### Minimum Data
- At least **3 months** of transaction history
- Multiple transactions across different categories
- For best results: 6+ months of data

### How to Get Started
1. Make transactions using the payment feature
2. Add variety to your spending (different categories)
3. Wait for data to accumulate
4. Check the AI Predictions section on your dashboard

## Technical Details

### Neural Network Configuration
```javascript
{
  hiddenLayers: [4, 3],
  activation: 'sigmoid',
  iterations: 2000,
  errorThresh: 0.005
}
```

### Data Normalization
- Month values: Normalized to 0-1 range (month/12)
- Amounts: Normalized to 0-1 range (amount/maxAmount)
- Prevents bias from large numbers

### Confidence Calculation
```
confidence = min((dataPoints / 6) * 100, 100)
```
More historical data = higher confidence

## Future Enhancements
- [ ] Multi-month predictions
- [ ] Seasonal pattern detection
- [ ] Budget recommendations
- [ ] Anomaly detection
- [ ] Export predictions to PDF
- [ ] Email alerts for unusual spending

## Technologies Used
- **Brain.js**: Neural network library
- **React + TypeScript**: Frontend
- **Express.js**: Backend API
- **MySQL**: Data storage
- **CSS3**: Premium animations and gradients

---

**Note**: The AI predictions improve over time as you accumulate more transaction data. The more you use ThreeSeventyPay, the more accurate the predictions become! 🚀
