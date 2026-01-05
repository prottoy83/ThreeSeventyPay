-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 05, 2026 at 05:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `threeseventypay`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_insights`
--

CREATE TABLE `ai_insights` (
  `insight_id` int(11) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `total_spent` decimal(10,2) NOT NULL,
  `transaction_count` int(11) NOT NULL,
  `category_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`category_breakdown`)),
  `monthly_trend` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`monthly_trend`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_prediction`
--

CREATE TABLE `ai_prediction` (
  `prediction_id` int(11) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `predicted_amount` decimal(10,2) NOT NULL,
  `historical_average` decimal(10,2) NOT NULL,
  `confidence` decimal(5,2) NOT NULL,
  `prediction_month` int(11) NOT NULL,
  `prediction_year` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_prediction`
--

INSERT INTO `ai_prediction` (`prediction_id`, `user_id`, `category`, `predicted_amount`, `historical_average`, `confidence`, `prediction_month`, `prediction_year`, `created_at`, `updated_at`) VALUES
(4, '1', 'Shopping', 3450.00, 3450.00, 30.00, 2, 2026, '2026-01-05 15:42:59', '2026-01-05 15:42:59'),
(5, '1', 'Other', 573.33, 573.33, 30.00, 2, 2026, '2026-01-05 15:42:59', '2026-01-05 15:42:59'),
(6, '1', 'Transfer', 285.25, 285.25, 30.00, 2, 2026, '2026-01-05 15:42:59', '2026-01-05 15:42:59');

-- --------------------------------------------------------

--
-- Table structure for table `payment_method`
--

CREATE TABLE `payment_method` (
  `pm_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `method_type` varchar(10) DEFAULT NULL,
  `added_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `acc_no` varchar(50) DEFAULT NULL,
  `branch_name` varchar(100) DEFAULT NULL,
  `routing_number` varchar(50) DEFAULT NULL,
  `card_no` varchar(50) DEFAULT NULL,
  `exp_date` date DEFAULT NULL,
  `cvv` varchar(10) DEFAULT NULL,
  `bank_code` varchar(4) DEFAULT NULL,
  `balance` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_method`
--

INSERT INTO `payment_method` (`pm_id`, `user_id`, `method_type`, `added_at`, `acc_no`, `branch_name`, `routing_number`, `card_no`, `exp_date`, `cvv`, `bank_code`, `balance`) VALUES
(1, 1, 'bank', '2026-01-04 19:51:35', '3334232244', 'Rafid', '2332', NULL, NULL, NULL, NULL, 14997),
(2, 1, 'card', '2026-01-04 19:51:51', NULL, NULL, NULL, '44888399927743', '2040-03-01', '332', NULL, 1562),
(3, 4, 'bank', '2026-01-04 20:03:44', '34234234455', 'Marzuk', '2343', NULL, NULL, NULL, NULL, 130),
(4, 5, 'bank', '2026-01-04 20:32:37', '23423424235', 'Hoga', '443', NULL, NULL, NULL, NULL, 2147470757);

-- --------------------------------------------------------

--
-- Table structure for table `pay_link`
--

CREATE TABLE `pay_link` (
  `link_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pm_id` int(11) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `expiry` datetime DEFAULT NULL,
  `used` tinyint(1) DEFAULT 0,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pay_link`
--

INSERT INTO `pay_link` (`link_id`, `user_id`, `pm_id`, `url`, `amount`, `expiry`, `used`, `used_at`, `created_at`) VALUES
(1, 4, 3, 'tAPTpFLa0giL', 120.00, '2026-01-06 02:03:55', 1, '2026-01-05 02:04:09', '2026-01-04 20:03:55'),
(2, 1, 1, 'skSVYtbTr5pX', 140.00, '2026-01-06 02:04:25', 0, NULL, '2026-01-04 20:04:25'),
(3, 1, 1, 'iHa0qJEvOKPz', 1.00, '2026-01-05 03:33:02', 1, '2026-01-05 02:33:39', '2026-01-04 20:33:02'),
(4, 1, 1, 'LuvLyr_KUW27', 12000.00, '2026-01-06 02:55:35', 1, '2026-01-05 02:55:46', '2026-01-04 20:55:35');

-- --------------------------------------------------------

--
-- Table structure for table `referral`
--

CREATE TABLE `referral` (
  `referral_id` int(11) NOT NULL,
  `referrer_id` int(11) NOT NULL,
  `referred_id` int(11) NOT NULL,
  `reward_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `referral`
--

INSERT INTO `referral` (`referral_id`, `referrer_id`, `referred_id`, `reward_amount`, `created_at`) VALUES
(1, 1, 3, 0.00, '2026-01-04 20:00:59'),
(2, 1, 4, 0.00, '2026-01-04 20:03:29'),
(3, 1, 5, 0.00, '2026-01-04 20:30:59');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_record`
--

CREATE TABLE `transaction_record` (
  `tm_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `pm_id` int(11) NOT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT NULL,
  `transaction_type` enum('PAYMENT','REFERRAL','PAY_LINK','TRANSFER','ADD_MONEY') DEFAULT 'TRANSFER',
  `trx_id` varchar(12) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction_record`
--

INSERT INTO `transaction_record` (`tm_id`, `sender_id`, `recipient_id`, `pm_id`, `amount`, `timestamp`, `status`, `transaction_type`, `trx_id`, `description`) VALUES
(1, 1, 4, 1, 120.00, '2026-01-04 20:04:09', 'Completed', 'TRANSFER', NULL, NULL),
(2, 5, 1, 4, 1.00, '2026-01-04 20:33:39', 'Completed', 'TRANSFER', NULL, NULL),
(3, 1, NULL, 1, 1500.00, '2026-01-04 20:55:05', 'SUCCESS', 'PAYMENT', '778899776655', 'Payment to Amazon'),
(4, 1, NULL, 2, 1500.00, '2026-01-04 20:55:23', 'SUCCESS', 'ADD_MONEY', NULL, 'Deposited money to account'),
(5, 5, 1, 4, 12000.00, '2026-01-04 20:55:46', 'SUCCESS', 'PAY_LINK', NULL, 'Payment via link'),
(6, 1, NULL, 1, 1010.00, '2026-01-04 20:57:51', 'SUCCESS', 'PAYMENT', '778866654557', 'Payment to BRACU'),
(7, 5, NULL, 4, 889.00, '2026-01-04 21:02:21', 'SUCCESS', 'PAYMENT', '778877766655', 'Payment to Steam'),
(8, 1, NULL, 2, 88.00, '2026-01-05 15:19:27', 'SUCCESS', 'PAYMENT', '778847738884', 'Payment to Cable'),
(9, 1, NULL, 1, 77.00, '2026-01-05 15:24:20', 'SUCCESS', 'PAYMENT', '567567567567', 'Payment to Disney'),
(10, 1, NULL, 1, 777.00, '2026-01-05 15:24:43', 'SUCCESS', 'PAYMENT', '567567567567', 'Payment to Hulu'),
(11, 1, NULL, 1, 74.00, '2026-01-05 15:27:12', 'SUCCESS', 'PAYMENT', '239992938884', 'Payment to Disney'),
(12, 1, NULL, 2, 100.00, '2026-01-05 15:34:00', 'SUCCESS', 'ADD_MONEY', NULL, 'Deposited money to account'),
(13, 1, NULL, 2, 100.00, '2026-01-05 15:34:20', 'SUCCESS', 'PAYMENT', '786786787688', 'Payment to BRACU'),
(14, 1, NULL, 2, 100.00, '2026-01-05 15:35:10', 'SUCCESS', 'PAYMENT', '786786787688', 'Payment to BRACU'),
(15, 1, NULL, 1, 56.00, '2026-01-05 15:38:47', 'SUCCESS', 'PAYMENT', '998845645645', 'Payment to Bikroy'),
(16, 1, NULL, 1, 5400.00, '2026-01-05 15:42:59', 'SUCCESS', 'PAYMENT', '345345345534', 'Payment to Amazon');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `uid` int(11) NOT NULL,
  `nid` varchar(50) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `dob` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `Password` varchar(255) NOT NULL,
  `referral_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`uid`, `nid`, `first_name`, `last_name`, `email`, `phone`, `dob`, `created_at`, `Password`, `referral_code`) VALUES
(1, '28839992845', 'Prottoy', 'Roy', 'prottoy@test.com', '0189033224', '2003-04-07', '2025-12-21 21:18:24', '$2b$10$5VIo2MRiIWR4xIDg/To7BOU2Bg.I6moQZE1FR7nBwMtz06UrG16k6', 'NNkm4a_sC0'),
(3, '432423455', 'Rafid', 'Alam', 'ralam@a.com', '33442233', '2001-02-02', '2026-01-04 20:00:59', '$2b$10$z7JgQWtsX0uEG46SJYalP.//PzuHyuY2bERC0sYrJBRtVkQf8XiAC', 'H9pkHk33z-'),
(4, '23423424', 'Marzuk', 'Alam', 'malm@m.com', '1234234234', '1933-03-04', '2026-01-04 20:03:29', '$2b$10$sv1t0OS4faf9Ylmed2jgGuNXhDNcMXKVthOCYtE2GYvcNdbd5q14G', 'CXpaPAeQcm'),
(5, '2342345324', 'nigga', 'gondar', 'y@y.com', '23342334234', '1994-03-04', '2026-01-04 20:30:59', '$2b$10$zcY9PIV0nT4u5ELtYhAcRexCyAJvKx4UANorhmG9WEb02Q0.l726m', 'VBBcrpfzo_');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_insights`
--
ALTER TABLE `ai_insights`
  ADD PRIMARY KEY (`insight_id`),
  ADD UNIQUE KEY `unique_user_insights` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `ai_prediction`
--
ALTER TABLE `ai_prediction`
  ADD PRIMARY KEY (`prediction_id`),
  ADD UNIQUE KEY `unique_user_category_month` (`user_id`,`category`,`prediction_month`,`prediction_year`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_prediction_date` (`prediction_year`,`prediction_month`);

--
-- Indexes for table `payment_method`
--
ALTER TABLE `payment_method`
  ADD PRIMARY KEY (`pm_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `pay_link`
--
ALTER TABLE `pay_link`
  ADD PRIMARY KEY (`link_id`),
  ADD UNIQUE KEY `idx_url` (`url`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `pm_id` (`pm_id`);

--
-- Indexes for table `referral`
--
ALTER TABLE `referral`
  ADD PRIMARY KEY (`referral_id`),
  ADD KEY `referrer_id` (`referrer_id`),
  ADD KEY `referred_id` (`referred_id`);

--
-- Indexes for table `transaction_record`
--
ALTER TABLE `transaction_record`
  ADD PRIMARY KEY (`tm_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `recipient_id` (`recipient_id`),
  ADD KEY `pm_id` (`pm_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `nid` (`nid`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `referral_code` (`referral_code`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_insights`
--
ALTER TABLE `ai_insights`
  MODIFY `insight_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_prediction`
--
ALTER TABLE `ai_prediction`
  MODIFY `prediction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payment_method`
--
ALTER TABLE `payment_method`
  MODIFY `pm_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pay_link`
--
ALTER TABLE `pay_link`
  MODIFY `link_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `referral`
--
ALTER TABLE `referral`
  MODIFY `referral_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transaction_record`
--
ALTER TABLE `transaction_record`
  MODIFY `tm_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `uid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `payment_method`
--
ALTER TABLE `payment_method`
  ADD CONSTRAINT `payment_method_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`);

--
-- Constraints for table `pay_link`
--
ALTER TABLE `pay_link`
  ADD CONSTRAINT `pay_link_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`uid`),
  ADD CONSTRAINT `pay_link_ibfk_2` FOREIGN KEY (`pm_id`) REFERENCES `payment_method` (`pm_id`) ON DELETE SET NULL;

--
-- Constraints for table `referral`
--
ALTER TABLE `referral`
  ADD CONSTRAINT `referral_ibfk_1` FOREIGN KEY (`referrer_id`) REFERENCES `user` (`uid`),
  ADD CONSTRAINT `referral_ibfk_2` FOREIGN KEY (`referred_id`) REFERENCES `user` (`uid`);

--
-- Constraints for table `transaction_record`
--
ALTER TABLE `transaction_record`
  ADD CONSTRAINT `transaction_record_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `user` (`uid`),
  ADD CONSTRAINT `transaction_record_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `user` (`uid`),
  ADD CONSTRAINT `transaction_record_ibfk_3` FOREIGN KEY (`pm_id`) REFERENCES `payment_method` (`pm_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
