# ThreeSeventyPay - Complete Developer Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Server Documentation](#server-documentation)
6. [Client Documentation](#client-documentation)
7. [API Endpoints](#api-endpoints)
8. [Setup & Installation](#setup--installation)
9. [Feature Implementation Guide](#feature-implementation-guide)

---

## Project Overview

**ThreeSeventyPay** is a full-stack digital payment platform that enables users to:
- Create accounts and manage payment methods (bank accounts and cards)
- Make payments to merchants
- Transfer money between users
- Generate and use payment links
- Participate in a referral program
- View AI-powered expense predictions and insights

### Project Structure
```
ThreeSeventyPay/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (routes)
│   │   ├── assets/        # Images, icons, etc.
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # Entry point
│   │   ├── App.css        # Global styles
│   │   └── index.css      # CSS variables & base styles
│   └── package.json       # Frontend dependencies
│
├── server/                # Node.js/Express backend
│   ├── config/           # Configuration files
│   │   └── db.js         # Database connection
│   ├── modules/          # API route modules
│   │   ├── userAuth.js   # Authentication endpoints
│   │   ├── paymentMethod.js  # Payment method management
│   │   ├── transaction.js    # Transaction processing
│   │   ├── paymentLink.js    # Payment link feature
│   │   ├── referral.js       # Referral system
│   │   ├── expensePrediction.js  # AI predictions
│   │   └── currency.js       # Currency conversion
│   ├── server.js         # Main server file
│   └── package.json      # Backend dependencies
│
├── sql/                  # Database schema
│   └── threeseventypay.sql  # Database structure
│
└── README.md            # Project readme

```

---

## Architecture

### System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │   React     │ ◄─────► │   Express   │
│   (Client)  │  HTTP   │   Frontend  │   API   │   Backend   │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │    MySQL    │
                                                 │  Database   │
                                                 └─────────────┘
```

### Request Flow

1. **User Action** → User interacts with React UI
2. **API Call** → Frontend makes HTTP request to backend (localhost:5990)
3. **Route Handling** → Express routes request to appropriate module
4. **Database Query** → Module queries MySQL database
5. **Response** → Data flows back through the chain to update UI

### Authentication Flow

```
1. User submits login/signup form
2. Frontend sends credentials to /auth/login or /auth/signup
3. Backend validates credentials
4. Backend hashes password with bcrypt
5. Backend queries/inserts user in database
6. Backend returns user data (uid, name, email, referral_code)
7. Frontend stores user object in localStorage
8. Frontend redirects to dashboard
```

---

## Technology Stack

### Frontend Technologies

#### Core Framework
- **React 18.3.1** - UI library for building component-based interfaces
  - Used for: All UI components, state management, routing
  - Why: Component reusability, virtual DOM performance, large ecosystem

- **TypeScript 5.6.2** - Typed superset of JavaScript
  - Used for: Type safety across all frontend code
  - Why: Catch errors at compile time, better IDE support, self-documenting code

- **Vite 6.0.5** - Build tool and dev server
  - Used for: Fast development server, optimized production builds
  - Why: Extremely fast HMR (Hot Module Replacement), modern ES modules

#### Routing
- **React Router DOM 7.1.1** - Client-side routing
  - Used for: Navigation between pages (Login, Dashboard, Referrals, etc.)
  - Why: Standard routing solution for React, declarative routing

#### HTTP Client
- **Axios 1.7.9** - Promise-based HTTP client
  - Used for: All API calls to backend
  - Why: Automatic JSON transformation, interceptors, better error handling than fetch

#### Styling
- **CSS3** - Vanilla CSS with CSS variables
  - Used for: All styling (no CSS framework)
  - Why: Full control, no bloat, custom design system

### Backend Technologies

#### Core Framework
- **Node.js** - JavaScript runtime
  - Used for: Server-side JavaScript execution
  - Why: Non-blocking I/O, JavaScript everywhere, large package ecosystem

- **Express 4.21.2** - Web application framework
  - Used for: API routing, middleware, HTTP server
  - Why: Minimalist, flexible, industry standard

#### Database
- **MySQL** - Relational database
  - Used for: All data storage (users, transactions, predictions, etc.)
  - Why: ACID compliance, relational data structure, mature ecosystem

- **mysql 2.18.1** - MySQL driver for Node.js
  - Used for: Database connection and queries
  - Why: Official MySQL driver, connection pooling, prepared statements

#### Security
- **bcrypt 5.1.1** - Password hashing
  - Used for: Hashing user passwords before storage
  - Why: Industry standard, salt generation, slow by design (prevents brute force)

- **cors 2.8.5** - Cross-Origin Resource Sharing
  - Used for: Allow frontend (port 58482) to access backend (port 5990)
  - Why: Security, controlled access from specific origins

#### AI/ML
- **brain.js 2.0.0-beta.24** - Neural network library
  - Used for: Training AI models for expense prediction
  - Why: Pure JavaScript, no Python required, runs in Node.js

#### Utilities
- **nanoid 5.0.9** - Unique ID generator
  - Used for: Generating payment link URLs, referral codes
  - Why: Small, fast, URL-safe, cryptographically strong

- **body-parser 1.20.3** - Request body parsing middleware
  - Used for: Parsing JSON request bodies
  - Why: Standard Express middleware for body parsing

---

## Database Schema

### Overview
The database consists of 7 tables that handle user management, payments, referrals, and AI features.

### Entity Relationship Diagram

```
┌─────────────┐
│    user     │
│  (uid PK)   │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┬──────────────┐
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│payment_     │ │transaction_ │ │  pay_link   │ │  referral   │ │ai_prediction│
│  method     │ │   record    │ │             │ │             │ │             │
│(pm_id PK)   │ │(tm_id PK)   │ │(link_id PK) │ │(ref_id PK)  │ │(pred_id PK) │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### Table: `user`
**Purpose**: Stores user account information and authentication credentials

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `uid` | INT (PK, AUTO_INCREMENT) | Unique user identifier |
| `nid` | VARCHAR(50) UNIQUE | National ID number |
| `first_name` | VARCHAR(100) | User's first name |
| `last_name` | VARCHAR(100) | User's last name |
| `email` | VARCHAR(100) UNIQUE | Email address (used for login) |
| `phone` | VARCHAR(20) UNIQUE | Phone number |
| `dob` | DATE | Date of birth |
| `Password` | VARCHAR(255) | Bcrypt hashed password |
| `referral_code` | VARCHAR(20) UNIQUE | User's unique referral code |
| `created_at` | TIMESTAMP | Account creation timestamp |

**Indexes**:
- PRIMARY KEY on `uid`
- UNIQUE on `email`, `nid`, `phone`, `referral_code`

**Usage**: 
- Created during signup (`/auth/signup`)
- Queried during login (`/auth/login`)
- Referenced by all other tables via foreign keys

---

### Table: `payment_method`
**Purpose**: Stores user's bank accounts and credit/debit cards

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `pm_id` | INT (PK, AUTO_INCREMENT) | Payment method ID |
| `user_id` | INT (FK → user.uid) | Owner of this payment method |
| `method_type` | VARCHAR(10) | 'bank' or 'card' |
| `added_at` | TIMESTAMP | When method was added |
| `balance` | INT | Current balance in this account/card |
| **Bank-specific columns**: | | |
| `acc_no` | VARCHAR(50) | Bank account number |
| `branch_name` | VARCHAR(100) | Bank branch name |
| `routing_number` | VARCHAR(50) | Bank routing number |
| `bank_code` | VARCHAR(4) | Bank code |
| **Card-specific columns**: | | |
| `card_no` | VARCHAR(50) | Card number |
| `exp_date` | DATE | Card expiration date |
| `cvv` | VARCHAR(10) | Card CVV |

**Indexes**:
- PRIMARY KEY on `pm_id`
- FOREIGN KEY `user_id` → `user(uid)`

**Usage**:
- Created when user adds bank/card (`/payMethods/addBank`, `/payMethods/addCard`)
- Updated when balance changes (payments, deposits)
- Queried to show user's payment methods on dashboard

**Design Note**: Both bank and card info in one table with nullable columns. `method_type` determines which columns are used.

---

### Table: `transaction_record`
**Purpose**: Records all financial transactions in the system

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `tm_id` | INT (PK, AUTO_INCREMENT) | Transaction ID |
| `sender_id` | INT (FK → user.uid) | User making the payment |
| `recipient_id` | INT (FK → user.uid) | User receiving payment (NULL for merchant payments) |
| `pm_id` | INT (FK → payment_method.pm_id) | Payment method used |
| `amount` | DECIMAL(12,2) | Transaction amount |
| `timestamp` | TIMESTAMP | When transaction occurred |
| `status` | VARCHAR(20) | 'SUCCESS', 'FAILED', 'PENDING' |
| `transaction_type` | ENUM | 'PAYMENT', 'TRANSFER', 'ADD_MONEY', 'PAY_LINK', 'REFERRAL' |
| `trx_id` | VARCHAR(12) | Transaction reference ID (for PAYMENT type) |
| `description` | VARCHAR(255) | Transaction description |

**Indexes**:
- PRIMARY KEY on `tm_id`
- FOREIGN KEY `sender_id` → `user(uid)`
- FOREIGN KEY `recipient_id` → `user(uid)`
- FOREIGN KEY `pm_id` → `payment_method(pm_id)`

**Transaction Types**:
1. **PAYMENT**: User pays a merchant (recipient_id is NULL)
2. **TRANSFER**: User-to-user money transfer
3. **ADD_MONEY**: User deposits money to their account
4. **PAY_LINK**: Payment made via payment link
5. **REFERRAL**: Referral reward transfer

**Usage**:
- Created for every transaction
- Queried for transaction history (`/transaction/history/:uid`)
- Used by AI for expense prediction analysis

---

### Table: `pay_link`
**Purpose**: Stores payment links created by users

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `link_id` | INT (PK, AUTO_INCREMENT) | Payment link ID |
| `user_id` | INT (FK → user.uid) | User who created the link |
| `pm_id` | INT (FK → payment_method.pm_id) | Destination payment method |
| `url` | VARCHAR(500) UNIQUE | Unique URL identifier (12 chars) |
| `amount` | DECIMAL(10,2) | Amount to be paid |
| `expiry` | DATETIME | When link expires |
| `used` | TINYINT(1) | 0 = not used, 1 = used |
| `used_at` | DATETIME | When link was used |
| `created_at` | TIMESTAMP | When link was created |

**Indexes**:
- PRIMARY KEY on `link_id`
- UNIQUE on `url`
- FOREIGN KEY `user_id` → `user(uid)`
- FOREIGN KEY `pm_id` → `payment_method(pm_id)`

**Usage**:
- Created when user requests payment (`/payLink/create`)
- Queried when someone accesses payment link (`/payLink/link/:url`)
- Updated when payment is made (`/payLink/pay/:url`)

**URL Generation**: Uses `nanoid` to generate 12-character URL-safe strings

---

### Table: `referral`
**Purpose**: Tracks referral relationships and rewards

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `referral_id` | INT (PK, AUTO_INCREMENT) | Referral record ID |
| `referrer_id` | INT (FK → user.uid) | User who referred |
| `referred_id` | INT (FK → user.uid) | User who was referred |
| `reward_amount` | DECIMAL(10,2) | Reward amount earned |
| `status` | ENUM('available', 'redeemed') | Reward status |
| `created_at` | TIMESTAMP | When referral was created |

**Indexes**:
- PRIMARY KEY on `referral_id`
- FOREIGN KEY `referrer_id` → `user(uid)`
- FOREIGN KEY `referred_id` → `user(uid)`

**Usage**:
- Created during signup when referral code is used (`/auth/signup`)
- Queried to show referral history (`/referrals/:uid`)
- Updated when rewards are transferred (`/referrals/transfer-earnings`)

**Reward System**:
- When user signs up with referral code, a record is created
- Status starts as 'available'
- User can transfer available rewards to their payment method
- Status changes to 'redeemed' after transfer

---

### Table: `ai_prediction`
**Purpose**: Stores AI-generated expense predictions

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `prediction_id` | INT (PK, AUTO_INCREMENT) | Prediction record ID |
| `user_id` | VARCHAR(50) | User this prediction is for |
| `category` | VARCHAR(100) | Expense category (e.g., "Shopping", "Food & Dining") |
| `predicted_amount` | DECIMAL(10,2) | AI-predicted spending amount |
| `historical_average` | DECIMAL(10,2) | Average from historical data |
| `confidence` | DECIMAL(5,2) | Prediction confidence (0-100%) |
| `prediction_month` | INT | Month being predicted (1-12) |
| `prediction_year` | INT | Year being predicted |
| `created_at` | TIMESTAMP | When prediction was generated |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `prediction_id`
- UNIQUE on (`user_id`, `category`, `prediction_month`, `prediction_year`)
- INDEX on `user_id`
- INDEX on (`prediction_year`, `prediction_month`)

**Usage**:
- Generated automatically after transactions (`expensePrediction.js`)
- Cached for 24 hours to avoid re-computation
- Queried for dashboard display (`/predictions/predictions/:uid`)

**AI Model**: Uses brain.js neural network trained on user's transaction history

---

### Table: `ai_insights`
**Purpose**: Stores aggregated spending insights

**Columns**:
| Column | Type | Description |
|--------|------|-------------|
| `insight_id` | INT (PK, AUTO_INCREMENT) | Insight record ID |
| `user_id` | VARCHAR(50) UNIQUE | User this insight is for |
| `total_spent` | DECIMAL(10,2) | Total amount spent |
| `transaction_count` | INT | Number of transactions |
| `category_breakdown` | JSON | Spending by category |
| `monthly_trend` | JSON | Spending trend over months |
| `created_at` | TIMESTAMP | When insight was created |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes**:
- PRIMARY KEY on `insight_id`
- UNIQUE on `user_id`
- INDEX on `user_id`

**Usage**:
- Generated from transaction history
- Queried for insights tab (`/predictions/insights/:uid`)

**JSON Structure**:
```json
{
  "category_breakdown": [
    {"category": "Shopping", "amount": 1500, "percentage": 45},
    {"category": "Food & Dining", "amount": 800, "percentage": 24}
  ],
  "monthly_trend": [
    {"month": "Dec", "amount": 2500},
    {"month": "Jan", "amount": 3200}
  ]
}
```

---

This completes Part 1 of the documentation. Continue to the next files for detailed server and client documentation.
