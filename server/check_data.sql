-- Quick diagnostic query to check if you have transaction data
-- Run this to see if you have enough data for predictions

-- Check total transactions
SELECT 
    'Total Transactions' as metric,
    COUNT(*) as count
FROM transaction_record
WHERE transaction_type IN ('PAYMENT', 'TRANSFER', 'ADD_MONEY')

UNION ALL

-- Check transactions by month
SELECT 
    DATE_FORMAT(timestamp, '%Y-%m') as metric,
    COUNT(*) as count
FROM transaction_record
WHERE transaction_type IN ('PAYMENT', 'TRANSFER', 'ADD_MONEY')
GROUP BY DATE_FORMAT(timestamp, '%Y-%m')
ORDER BY metric DESC;

-- Check if ai_prediction table exists
SHOW TABLES LIKE 'ai_prediction';

-- Check if there are any predictions stored
SELECT COUNT(*) as prediction_count FROM ai_prediction;
