# Subscription Management Application - Project Structure & Reference Guide

## 📋 Project Overview

A comprehensive subscription management application that automatically detects active subscriptions across multiple platforms and provides intelligent cancellation assistance with a premium Apple Liquid Glass interface.

**Goal**: Help users identify, track, and easily cancel unwanted subscriptions, potentially saving hundreds of dollars annually while providing exceptional user experience.

## 🏗️ Complete Project Structure

```
hakathon2/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .gitignore
│
├── src/                          # Frontend React Application
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base UI components (buttons, cards, etc.)
│   │   ├── layout/               # Layout components (header, sidebar, etc.)
│   │   ├── subscription/         # Subscription-specific components
│   │   ├── analytics/            # Chart and analytics components
│   │   └── auth/                 # Authentication components
│   ├── pages/                    # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Connect.tsx
│   │   ├── Subscriptions.tsx
│   │   ├── Analytics.tsx
│   │   ├── Settings.tsx
│   │   └── auth/
│   │       ├── Login.tsx
│   │       └── Register.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSubscriptions.ts
│   │   └── useAnalytics.ts
│   ├── utils/                    # Utility functions
│   │   ├── api.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── store/                    # Zustand state management
│   │   ├── authStore.ts
│   │   ├── subscriptionStore.ts
│   │   └── uiStore.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── subscription.ts
│   │   └── api.ts
│   ├── styles/                   # Global styles and themes
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.tsx
│   ├── main.tsx
│   └── index.html
│
├── api/                          # Backend Express.js Application
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   │   ├── authController.ts
│   │   │   ├── accountController.ts
│   │   │   ├── subscriptionController.ts
│   │   │   └── analyticsController.ts
│   │   ├── services/             # Business logic layer
│   │   │   ├── authService.ts
│   │   │   ├── subscriptionDetectionService.ts
│   │   │   ├── cancellationService.ts
│   │   │   └── externalApiService.ts
│   │   ├── repositories/         # Data access layer
│   │   │   ├── userRepository.ts
│   │   │   ├── subscriptionRepository.ts
│   │   │   └── accountRepository.ts
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/               # API route definitions
│   │   │   ├── auth.ts
│   │   │   ├── accounts.ts
│   │   │   ├── subscriptions.ts
│   │   │   └── analytics.ts
│   │   ├── utils/                # Backend utilities
│   │   │   ├── database.ts
│   │   │   ├── cache.ts
│   │   │   └── queue.ts
│   │   ├── jobs/                 # Background job workers
│   │   │   ├── subscriptionSync.ts
│   │   │   └── cancellationTracker.ts
│   │   ├── config/               # Configuration files
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── external-apis.ts
│   │   └── app.ts                # Express app setup
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                       # Shared types and utilities
│   ├── types/
│   │   ├── user.ts
│   │   ├── subscription.ts
│   │   └── api.ts
│   └── utils/
│       └── validation.ts
│
├── supabase/                     # Supabase configuration
│   ├── migrations/               # Database migration files
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_subscription_services.sql
│   │   └── 003_indexes_and_permissions.sql
│   └── config.ts
│
└── docs/                         # Documentation
    ├── api.md
    ├── deployment.md
    └── development.md
```

## 🚀 Key Features Summary

### Core Features
- **Subscription Detection**: Automatic detection across 50+ platforms (Netflix, Spotify, Adobe, etc.)
- **Cancellation Assistance**: Step-by-step guides, deep links, completion tracking
- **Analytics Dashboard**: Spending trends, savings calculator, subscription timeline
- **Account Management**: OAuth integration with major platforms
- **Premium Features**: Unlimited connections, advanced analytics

### User Roles
- **Free User**: Up to 3 account connections, basic detection
- **Premium User**: Unlimited connections, advanced analytics, priority support
- **Admin User**: Full system access, user management

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: TailwindCSS 3 + Framer Motion
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Library**: Custom components with Apple Liquid Glass design

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js 4 + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis 7
- **Authentication**: Supabase Auth
- **Background Jobs**: Bull Queue + Redis

### External Services
- **Banking APIs**: Plaid integration
- **Subscription APIs**: Platform-specific APIs
- **Email Service**: Transactional emails
- **OAuth Providers**: Google, Apple, Microsoft

## 🗄️ Database Schema Overview

### Core Tables

**users**
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `plan` (VARCHAR: 'free'|'premium')
- `usage_count` (INTEGER)
- `created_at`, `updated_at` (TIMESTAMP)

**connected_accounts**
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `provider` (VARCHAR: 'plaid'|'apple'|'google')
- `account_type` (VARCHAR)
- `credentials` (JSONB)
- `is_active` (BOOLEAN)
- `last_synced` (TIMESTAMP)

**subscriptions**
- `id` (UUID, PK)
- `account_id` (UUID, FK)
- `service_id` (UUID, FK)
- `service_name` (VARCHAR)
- `monthly_cost` (DECIMAL)
- `billing_cycle` (VARCHAR)
- `next_billing_date` (DATE)
- `status` (VARCHAR)
- `metadata` (JSONB)

**subscription_services**
- `id` (UUID, PK)
- `name` (VARCHAR)
- `logo_url` (TEXT)
- `cancellation_url` (TEXT)
- `cancellation_steps` (JSONB)
- `difficulty_rating` (INTEGER 1-5)
- `category` (VARCHAR)

**cancellation_attempts**
- `id` (UUID, PK)
- `subscription_id` (UUID, FK)
- `user_id` (UUID, FK)
- `method` (VARCHAR)
- `status` (VARCHAR)
- `tracking_id` (VARCHAR)
- `notes` (TEXT)
- `initiated_at`, `completed_at` (TIMESTAMP)

## 🔌 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Account Management
- `POST /api/accounts/connect` - Connect external account
- `GET /api/accounts` - List connected accounts
- `DELETE /api/accounts/:id` - Disconnect account
- `POST /api/accounts/:id/sync` - Manual sync account

### Subscription Management
- `GET /api/subscriptions` - List user subscriptions
- `GET /api/subscriptions/detect` - Detect subscriptions
- `POST /api/subscriptions/:id/cancel` - Initiate cancellation
- `GET /api/subscriptions/:id/guide` - Get cancellation guide
- `PUT /api/subscriptions/:id/status` - Update subscription status

### Analytics
- `GET /api/analytics/spending` - Spending analytics
- `GET /api/analytics/savings` - Savings calculator
- `GET /api/analytics/trends` - Spending trends

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - System analytics
- `POST /api/admin/services` - Add subscription service

## 🎨 UI/UX Design Principles

### Apple Liquid Glass Design
- **Colors**: Deep Blue (#1A365D), Soft White (#FAFAFA)
- **Effects**: Frosted glass with 80% opacity, subtle blur
- **Typography**: SF Pro Display (headings), SF Pro Text (body)
- **Animations**: Smooth micro-interactions, liquid motion graphics
- **Layout**: Card-based design, 16px spacing, floating elements

### Accessibility
- WCAG 2.1 AA compliance
- High contrast mode support
- Screen reader optimization
- Touch-optimized interactions
- Keyboard navigation support

### Responsive Design
- Mobile-first approach
- Touch gestures (swipe-to-cancel)
- Adaptive layouts for all screen sizes
- Progressive enhancement

## 📋 Development Workflow Guidelines

### Git Workflow (Gitflow)
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature development
- **release/***: Release preparation
- **hotfix/***: Critical production fixes

### Development Process
1. Create feature branch from develop
2. Implement feature with tests
3. Create pull request with review
4. Merge to develop after approval
5. Deploy to staging for testing
6. Merge to main for production

### Code Quality
- TypeScript strict mode
- ESLint + Prettier configuration
- Unit tests with Jest/Vitest
- E2E tests with Playwright
- Code coverage > 80%

### CI/CD Pipeline
- Automated testing on PR
- Build verification
- Security scanning
- Automated deployment to staging
- Manual approval for production

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm or npm
- Supabase account
- Redis instance
- External API keys (Plaid, etc.)

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd hakathon2

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev        # Frontend (Vite)
npm run dev:api    # Backend (Express)
npm run dev:redis  # Redis cache
```

### Environment Variables
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Redis
REDIS_URL=redis://localhost:6379

# External APIs
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# JWT
JWT_SECRET=your_jwt_secret

# Email
EMAIL_SERVICE_API_KEY=your_email_api_key
```

---

**Note**: This document serves as the central reference for the entire project. Keep it updated as the project evolves and refer to it during development for consistency and clarity.