-- Add missing fields to pay_link table for payment link functionality

-- Add used field to track if link has been used
ALTER TABLE `pay_link` 
ADD COLUMN `used` TINYINT(1) DEFAULT 0 AFTER `expiry`;

-- Add used_at timestamp to track when link was used
ALTER TABLE `pay_link` 
ADD COLUMN `used_at` DATETIME DEFAULT NULL AFTER `used`;

-- Add pm_id to link payment link to recipient's payment method
ALTER TABLE `pay_link` 
ADD COLUMN `pm_id` INT(11) DEFAULT NULL AFTER `user_id`,
ADD CONSTRAINT `pay_link_pm_fk` FOREIGN KEY (`pm_id`) REFERENCES `payment_method` (`pm_id`) ON DELETE SET NULL;

-- Add index for faster URL lookups
ALTER TABLE `pay_link` 
ADD UNIQUE INDEX `idx_url` (`url`);
