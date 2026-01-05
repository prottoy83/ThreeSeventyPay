-- Migration to enhance transaction_record table
ALTER TABLE `transaction_record` 
ADD COLUMN `transaction_type` ENUM('PAYMENT', 'REFERRAL', 'PAY_LINK', 'TRANSFER', 'ADD_MONEY') DEFAULT 'TRANSFER',
ADD COLUMN `trx_id` VARCHAR(12) DEFAULT NULL,
ADD COLUMN `description` VARCHAR(255) DEFAULT NULL;

-- If recipient_id is NOT NULL, we might need to adjust it to allow 0 or NULL for external merchant payments
-- For now, let's allow it to be 0 for merchant payments or use a reserved range
ALTER TABLE `transaction_record` MODIFY `recipient_id` int(11) DEFAULT NULL;
