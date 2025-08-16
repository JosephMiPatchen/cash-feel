# Cash Feel - Crypto Wallet App

## Overview

Cash Feel is a modern cryptocurrency wallet application that combines intuitive budget management with cryptocurrency functionality. The application provides a user-friendly interface for managing digital assets, tracking expenses, and maintaining financial control through envelope-style budgeting.

**Current Status**: Frontend implementation complete. Cryptocurrency integration pending.

## Features

### Current Features
- **Wallet Dashboard**: Clean, intuitive interface showing wallet balance and budget allocations
- **Budget Management**: Zero-based envelope budgeting system with categories:
  - Spending (daily expenses)
  - Bills (recurring payments)
  - Savings (long-term goals)
- **Transaction Handling**: Record and track expenses against budget categories
- **Send Money**: Transfer funds between budget categories with overspend protection
- **Visual Budget Overview**: Track spending progress with visual indicators

### Planned Cryptocurrency Features
- Cryptocurrency wallet integration
- Support for multiple cryptocurrencies
- Secure transaction signing
- Real-time price tracking
- QR code generation for receiving payments
- Transaction history and analytics

## Technical Stack

### Frontend
- **Framework**: React with TypeScript
- **UI Components**: shadcn-ui component library
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Query for async state
- **Routing**: React Router

### Development Tools
- **Package Manager**: npm/bun
- **Type Checking**: TypeScript
- **Linting**: ESLint

## Project Structure

```
cash-feel/
├── src/
│   ├── components/
│   │   ├── ui/           # Base UI components from shadcn
│   │   └── wallet/       # Wallet-specific components
│   ├── crypto-config/    # Future cryptocurrency configuration
│   ├── hooks/            # Custom React hooks
│   ├── lib/
│   │   └── budget/       # Budget management logic
│   └── pages/            # Application pages
├── public/               # Static assets
└── ...config files
```

## Budget Management System

The application uses a zero-based budgeting approach where:
- Users allocate their income to specific categories
- Each category has a set amount and remaining balance
- Transactions reduce the remaining balance in each category
- Categories are organized by type: Expenses, Bills, and Savings

## Getting Started

### Prerequisites
- Node.js 16+ and npm/bun

### Installation

```sh
# Clone the repository
git clone <REPOSITORY_URL>

# Navigate to project directory
cd cash-feel

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Roadmap

1. **Phase 1**: ✅ Frontend implementation and budget management
2. **Phase 2**: 🔄 Cryptocurrency wallet integration
   - Implement secure key management
   - Add blockchain transaction capabilities
   - Create crypto address generation
3. **Phase 3**: 🔄 Enhanced features
   - Multi-currency support
   - Transaction history and analytics
   - Mobile-responsive design improvements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
