-- Add referral_code column to user table
-- This allows users to have unique referral codes for the referral program

ALTER TABLE `user` 
ADD COLUMN `referral_code` VARCHAR(20) UNIQUE DEFAULT NULL 
AFTER `Password`;

-- Note: Existing users will have NULL referral codes
-- They can generate codes through the application
