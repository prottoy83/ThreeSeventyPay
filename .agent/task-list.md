# ThreeSeventyPay - Task List

**Project:** ThreeSeventyPay Digital Payment Platform  
**Created:** January 4, 2026  
**Status:** In Progress (35% Complete)

---

## 🔴 CRITICAL PRIORITY - Security Issues (Do First!)

### Authentication & Authorization
- [ ] **CRITICAL** - Install `jsonwebtoken` package
- [ ] **CRITICAL** - Create JWT utility functions (sign, verify, refresh)
- [ ] **CRITICAL** - Implement authentication middleware for protected routes
- [ ] **CRITICAL** - Add JWT token generation to login endpoint
- [ ] **CRITICAL** - Update all protected API endpoints to require authentication
- [ ] **CRITICAL** - Add role field to user table (user, support, admin)
- [ ] **CRITICAL** - Implement role-based access control middleware
- [ ] **CRITICAL** - Update frontend to store and send JWT tokens with requests

### Data Encryption
- [ ] **CRITICAL** - Encrypt CVV before storage (or remove from database entirely)
- [ ] **CRITICAL** - Encrypt card numbers before storage
- [ ] **CRITICAL** - Encrypt bank account numbers before storage
- [ ] **CRITICAL** - Remove CVV from all GET endpoint responses
- [ ] **CRITICAL** - Create encryption/decryption utility functions
- [ ] **CRITICAL** - Migrate existing plaintext data to encrypted format

### Input Validation & Security
- [ ] **CRITICAL** - Install `joi` or `express-validator` package
- [ ] **CRITICAL** - Create validation schemas for all endpoints
- [ ] **CRITICAL** - Add validation middleware to all routes
- [ ] **CRITICAL** - Install and configure `helmet` for security headers
- [ ] **CRITICAL** - Install and configure `express-rate-limit`
- [ ] **CRITICAL** - Add CORS whitelist for production

---

## 🟠 HIGH PRIORITY - Core Features

### Transaction System (Backend)
- [ ] Create `/server/modules/transaction.js` router
- [ ] Implement `POST /transactions/send` endpoint
  - [ ] Validate sender has sufficient balance
  - [ ] Validate recipient exists
  - [ ] Validate payment method ownership
  - [ ] Use database transactions for atomicity
  - [ ] Deduct from sender's payment method balance
  - [ ] Add to recipient's balance (or default payment method)
  - [ ] Create transaction record with proper status
  - [ ] Handle rollback on failure
- [ ] Implement `GET /transactions/history/:uid` endpoint with pagination
- [ ] Implement `GET /transactions/:transaction_id` endpoint
- [ ] Add transaction endpoints to server.js
- [ ] Add database indexes on transaction_record table

### Transaction System (Frontend)
- [ ] Create `SendMoneyModal.tsx` component
  - [ ] Recipient input (email, phone, or user ID)
  - [ ] Amount input with validation
  - [ ] Payment method selection dropdown
  - [ ] Confirmation screen
  - [ ] Success/failure feedback
- [ ] Create `TransactionHistory.tsx` page
  - [ ] List sent and received transactions
  - [ ] Transaction details view
  - [ ] Filtering by date, status, type
  - [ ] Pagination controls
- [ ] Update Dashboard.tsx - Connect "Send Money" button to modal
- [ ] Update Dashboard.tsx - Replace mock expenses with real transaction data
- [ ] Create transaction API service in frontend

### Payment Links (Backend)
- [ ] Create `/server/modules/paymentLink.js` router
- [ ] Install `nanoid` or use `uuid` for unique URL generation
- [ ] Implement `POST /paylinks/create` endpoint
  - [ ] Generate unique, high-entropy URL
  - [ ] Validate amount and expiration
  - [ ] Store link in database
  - [ ] Return shareable URL
- [ ] Implement `GET /paylinks/:linkId` endpoint (validate and return details)
- [ ] Implement `POST /paylinks/:linkId/pay` endpoint
  - [ ] Validate link is active and not expired
  - [ ] Process payment (create transaction)
  - [ ] Mark link as used
  - [ ] Update balances
- [ ] Implement `GET /paylinks/user/:uid` endpoint (user's created links)
- [ ] Add `used` and `used_at` fields to pay_link table
- [ ] Add payment link endpoints to server.js

### Payment Links (Frontend)
- [ ] Create `CreatePaymentLinkModal.tsx` component
  - [ ] Amount input
  - [ ] Expiration date/time picker
  - [ ] Generate link button
  - [ ] Copy link functionality
  - [ ] Share options
- [ ] Create `PaymentLinkList.tsx` page (show user's created links)
- [ ] Create `PayLink.tsx` page (`/pay/:linkId` route)
  - [ ] Display amount and creator info
  - [ ] Payment method selection
  - [ ] Confirm payment button
  - [ ] Success/failure feedback
- [ ] Update Dashboard.tsx - Connect "Request" button to create payment link modal
- [ ] Add payment link routes to App.tsx

---

## 🟡 MEDIUM PRIORITY - Growth & Engagement

### Referral System (Backend)
- [ ] Create `/server/modules/referral.js` router
- [ ] Add `referral_code` field to user table
- [ ] Implement referral code generation function (unique 6-8 char code)
- [ ] Update signup endpoint to accept optional referral code
  - [ ] Validate referral code exists
  - [ ] Prevent self-referral
  - [ ] Create referral record
- [ ] Implement `POST /referrals/reward/:referralId` endpoint
  - [ ] Calculate reward amount
  - [ ] Add to referrer's balance
  - [ ] Update referral status
  - [ ] Ensure idempotency
- [ ] Implement `GET /referrals/user/:uid` endpoint (user's referrals)
- [ ] Implement `GET /referrals/code/:uid` endpoint (get user's code)
- [ ] Add `status` and `rewarded_at` fields to referral table
- [ ] Add referral endpoints to server.js

### Referral System (Frontend)
- [ ] Create `Referral.tsx` page
  - [ ] Display user's referral code
  - [ ] Copy code button
  - [ ] Share buttons (social media, email, WhatsApp)
  - [ ] List of referred users
  - [ ] Total rewards earned
- [ ] Update Signup.tsx - Add referral code input field
- [ ] Update Dashboard.tsx - Add referral widget/summary
- [ ] Add referral route to App.tsx

### AI Expense Prediction (Backend)
- [ ] Create `/server/modules/prediction.js` router
- [ ] Implement `POST /predictions/generate/:uid` endpoint
  - [ ] Analyze user's transaction history
  - [ ] Calculate spending by category
  - [ ] Generate predictions (simple algorithm or ML)
  - [ ] Store in ai_prediction table
- [ ] Implement `GET /predictions/user/:uid` endpoint
- [ ] Implement `GET /predictions/latest/:uid` endpoint
- [ ] Add `category` field to ai_prediction table
- [ ] Add prediction endpoints to server.js
- [ ] Create monthly cron job for auto-generation (optional)

### AI Expense Prediction (Frontend)
- [ ] Create `Predictions.tsx` page
  - [ ] Display current month predictions
  - [ ] Show spending by category
  - [ ] Charts/visualizations
  - [ ] Historical predictions
- [ ] Update Dashboard.tsx - Replace mock predictions with real API data
- [ ] Add predictions route to App.tsx

### Customer Support Chat (Backend)
- [ ] Install `socket.io` package
- [ ] Update chat_logs table schema
  - [ ] Add `sender_type` field (user, support, system)
  - [ ] Add `conversation_id` field
  - [ ] Add `status` field (open, closed)
- [ ] Create `/server/modules/chat.js` router
- [ ] Implement `POST /chat/message` endpoint
- [ ] Implement `GET /chat/history/:uid` endpoint
- [ ] Implement `GET /chat/conversations` endpoint (for support agents)
- [ ] Set up Socket.io server in server.js
- [ ] Implement WebSocket message handling
- [ ] Add authentication to WebSocket connections
- [ ] Add chat endpoints to server.js

### Customer Support Chat (Frontend)
- [ ] Install `socket.io-client` package
- [ ] Create `Chat.tsx` component/page
  - [ ] Message list with auto-scroll
  - [ ] Message input field
  - [ ] Send button
  - [ ] Real-time message updates
- [ ] Create `SupportDashboard.tsx` page (for support agents)
  - [ ] Conversation list
  - [ ] Active conversation view
  - [ ] User information panel
- [ ] Implement WebSocket client connection
- [ ] Add chat route to App.tsx
- [ ] Add chat widget to Dashboard (optional)

---

## 🟢 NORMAL PRIORITY - Admin & Management

### Admin Dashboard (Backend)
- [ ] Create `/server/modules/admin.js` router
- [ ] Implement `GET /admin/users` endpoint (list all users)
- [ ] Implement `PUT /admin/users/:uid` endpoint (update user, change role)
- [ ] Implement `GET /admin/transactions` endpoint (all transactions)
- [ ] Implement `GET /admin/stats` endpoint (platform statistics)
- [ ] Add admin-only middleware to all admin routes
- [ ] Add admin endpoints to server.js

### Admin Dashboard (Frontend)
- [ ] Create `AdminDashboard.tsx` page
  - [ ] Key metrics (users, transactions, volume)
  - [ ] Charts and graphs
  - [ ] Recent activity
- [ ] Create `UserManagement.tsx` page
  - [ ] User list with search/filter
  - [ ] Edit user modal
  - [ ] Suspend/activate user
- [ ] Create `TransactionMonitoring.tsx` page
  - [ ] All transactions list
  - [ ] Advanced filters
  - [ ] Export to CSV
- [ ] Add admin route protection (check role)
- [ ] Add admin routes to App.tsx

### User Profile & Settings (Backend)
- [ ] Implement `GET /users/profile/:uid` endpoint
- [ ] Implement `PUT /users/profile/:uid` endpoint (update name, email, phone)
- [ ] Implement `PUT /users/password/:uid` endpoint (change password)
- [ ] Implement `DELETE /users/account/:uid` endpoint (delete account)
- [ ] Add user endpoints to server.js

### User Profile & Settings (Frontend)
- [ ] Create `Profile.tsx` page
  - [ ] Display user information
  - [ ] Edit profile form
  - [ ] Save changes button
- [ ] Create `Settings.tsx` page
  - [ ] Change password form
  - [ ] Delete account option
  - [ ] Notification preferences (optional)
- [ ] Add profile and settings routes to App.tsx
- [ ] Add profile link to Navbar

---

## 🔵 LOW PRIORITY - Polish & Optimization

### Error Handling & Logging
- [ ] Install `winston` or `pino` logging library
- [ ] Create centralized error handler middleware
- [ ] Add structured logging for all operations
- [ ] Create error response formatter
- [ ] Add request ID tracking
- [ ] Create ErrorBoundary component in frontend
- [ ] Add global error handler in frontend
- [ ] Implement user-friendly error messages

### Testing
- [ ] Install `jest` or `mocha` for backend testing
- [ ] Install `vitest` and `@testing-library/react` for frontend
- [ ] Write unit tests for backend utilities
- [ ] Write integration tests for API endpoints
- [ ] Write component tests for frontend
- [ ] Write E2E tests for critical flows (optional)
- [ ] Set up test database
- [ ] Add test coverage reporting
- [ ] Add tests to CI/CD pipeline

### API Documentation
- [ ] Install `swagger-jsdoc` and `swagger-ui-express`
- [ ] Document all API endpoints
- [ ] Add request/response examples
- [ ] Add authentication documentation
- [ ] Add error code documentation
- [ ] Set up Swagger UI route (`/api-docs`)

### Production Preparation
- [ ] Create `.env.example` file with all variables
- [ ] Add database indexes for performance
- [ ] Optimize slow queries
- [ ] Set up database connection pooling
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags
- [ ] Add health check endpoint (`/health`)
- [ ] Set up error tracking (Sentry or similar)
- [ ] Add performance monitoring
- [ ] Code splitting and lazy loading in frontend
- [ ] Image optimization
- [ ] Bundle size analysis
- [ ] SEO optimization (meta tags, sitemap)

### DevOps
- [ ] Set up CI/CD pipeline (GitHub Actions, etc.)
- [ ] Configure automated testing in CI
- [ ] Configure automated deployment
- [ ] Choose hosting provider (AWS, Heroku, DigitalOcean)
- [ ] Set up database hosting
- [ ] Configure domain and SSL certificate
- [ ] Set up automated database backups
- [ ] Test backup restoration
- [ ] Set up monitoring and alerts

---

## 📊 Progress Tracking

### Module Completion Status
- [x] User & Identity Management - 90% ✅
- [x] Payment & Card Infrastructure - 60% ⚠️
- [ ] Transaction & Flow Management - 0% ❌
- [ ] Digital Payment Tools (Pay Links) - 0% ❌
- [ ] Referral & Growth System - 0% ❌
- [ ] AI Expense Prediction - 0% ❌
- [ ] Customer Support Chat - 0% ❌
- [ ] Admin Dashboard - 0% ❌

### Overall Progress
**Current:** 35% Complete  
**Target:** 100% Complete in 5 weeks

---

## 📝 Notes

- **Security tasks must be completed before any other development**
- Tasks marked **CRITICAL** should be done in Week 1
- Each task should be tracked in a project management tool
- Regular code reviews are recommended
- Test each feature thoroughly before moving to the next
- Keep the PRD document as the source of truth
- Update this task list as tasks are completed

---

## ✅ Completed Tasks

### User & Identity Management
- [x] User registration with all required fields
- [x] Password hashing with bcrypt
- [x] User login with credential validation
- [x] Frontend signup page
- [x] Frontend login page
- [x] Session management via localStorage

### Payment & Card Infrastructure
- [x] Database schema for payment methods
- [x] Add bank account endpoint
- [x] Add card endpoint
- [x] View payment methods endpoint
- [x] Delete payment method endpoint
- [x] Add money to payment method endpoint
- [x] Total balance calculation endpoint
- [x] Frontend payment method management UI
- [x] Add payment modal component
- [x] Add money modal component

### Frontend Foundation
- [x] Landing page with Hero, Features, CTA
- [x] Navigation bar
- [x] Footer
- [x] Dashboard page
- [x] Routing setup
- [x] Design system and styling

### Database
- [x] All required tables created
- [x] Foreign key relationships established
- [x] Basic indexes added

---

## 🎯 Quick Start Guide

To start working on this project:

1. **Start with CRITICAL security tasks** (Week 1)
2. **Then implement transactions** (Week 2) - this is the core feature
3. **Add payment links and referrals** (Week 3)
4. **Implement AI and support** (Week 4)
5. **Polish and deploy** (Week 5)

**Remember:** Don't skip security! It's the foundation of a payment platform.
