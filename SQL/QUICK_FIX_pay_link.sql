-- Quick fix for pay_link table - Run this in phpMyAdmin SQL tab

USE threeseventypay;

-- Add missing columns
ALTER TABLE `pay_link` 
ADD COLUMN `pm_id` INT(11) DEFAULT NULL AFTER `user_id`;

ALTER TABLE `pay_link` 
ADD COLUMN `used` TINYINT(1) DEFAULT 0 AFTER `expiry`;

ALTER TABLE `pay_link` 
ADD COLUMN `used_at` DATETIME DEFAULT NULL AFTER `used`;

-- Add foreign key constraint
ALTER TABLE `pay_link` 
ADD CONSTRAINT `pay_link_pm_fk` FOREIGN KEY (`pm_id`) REFERENCES `payment_method` (`pm_id`) ON DELETE SET NULL;

-- Add unique index on url
ALTER TABLE `pay_link` 
ADD UNIQUE INDEX `idx_url` (`url`);

SELECT 'Migration completed successfully!' AS status;
