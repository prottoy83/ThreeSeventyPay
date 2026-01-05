-- Quick check: Do you have any transactions?
SELECT 
    COUNT(*) as total_transactions,
    sender_id
FROM transaction_record 
WHERE sender_id = '1'
GROUP BY sender_id;

-- What transactions exist?
SELECT 
    transaction_id,
    sender_id,
    amount,
    description,
    transaction_type,
    timestamp
FROM transaction_record 
WHERE sender_id = '1'
ORDER BY timestamp DESC
LIMIT 10;

-- Check if predictions exist
SELECT COUNT(*) as prediction_count 
FROM ai_prediction 
WHERE user_id = '1';

-- Show predictions if they exist
SELECT * FROM ai_prediction WHERE user_id = '1';
