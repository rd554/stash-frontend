# 🎨 Stash AI Frontend

> **Next.js 15 Web Application for Stash AI**

The frontend application for Stash AI, built with Next.js 15, React 19, TypeScript, and TailwindCSS. This application provides a modern, responsive interface for AI-powered financial management.

## 🚀 Features

### 🎯 Core Features
- **Responsive Dashboard**: Modern, mobile-first design
- **AI Financial Insights**: Real-time AI-powered financial analysis
- **Budget Management**: Dynamic budget caps with real-time tracking
- **Transaction Management**: Add, view, and categorize transactions
- **Personalized Experience**: User-specific data and recommendations

### 🎨 UI/UX Features
- **Modern Design**: Clean, elegant interface with TailwindCSS
- **Dark/Light Mode**: Theme support (currently light mode)
- **Responsive Layout**: Optimized for all device sizes
- **Real-time Updates**: Live data synchronization
- **Interactive Components**: Smooth animations and transitions

### 🤖 AI Integration
- **Financial Insights**: AI-generated spending analysis
- **Predictive Analytics**: Future spending forecasts
- **Health Score**: Financial health monitoring
- **Smart Recommendations**: Personalized financial advice

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Main dashboard pages
│   │   ├── onboarding/         # User onboarding flow
│   │   ├── notifications/      # Notification pages
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── AIFinancialInsights.tsx
│   │   ├── BudgetOverview.tsx
│   │   ├── MetricCards.tsx
│   │   ├── RecentTransactions.tsx
│   │   ├── WeeklySpending.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── FloatingChatbot.tsx
│   │   ├── LoginModal.tsx
│   │   └── NewTransactionModal.tsx
│   ├── lib/                    # Utilities and services
│   │   ├── api.ts              # API client
│   │   ├── utils.ts            # Utility functions
│   │   ├── budgetStorage.ts    # Budget storage utilities
│   │   └── monthlyReset.ts     # Monthly reset logic
│   └── types/                  # TypeScript definitions
│       └── index.ts
├── public/                     # Static assets
│   ├── stash_logo.png
│   ├── bell.png
│   └── favicon.ico
├── tailwind.config.ts          # TailwindCSS configuration
├── next.config.ts              # Next.js configuration
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Stash AI

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🎨 Design System

### Colors
- **Primary**: Green (#16a34a) - Success, money, growth
- **Secondary**: Blue (#4a90e2) - Trust, stability
- **Warning**: Orange (#f5a623) - Caution, attention
- **Error**: Red (#e74c3c) - Errors, danger
- **Background**: White (#ffffff) / Gray (#f9fafb)
- **Text**: Dark gray (#1a1a1a) / Black (#000000)

### Typography
- **Font Family**: Raleway (Google Fonts)
- **Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components

#### Metric Cards
- **Fixed Salary**: Blue theme with rupee icon
- **EMI**: Orange theme with credit card icon
- **Savings**: Green theme with money bag icon
- **Net Spend**: Red theme with money bag icon

#### AI Financial Insights
- **Current**: Red cards for immediate alerts
- **Predictive**: Blue cards for future insights
- **Analytics**: Yellow cards for health scores
- **Proactive**: Green cards for recommendations

#### Budget Overview
- **Progress Bars**: Visual budget tracking
- **Color Coding**: Green (under budget), Red (over budget)
- **Edit Icons**: Inline budget cap editing

## 🔌 API Integration

### API Client (`src/lib/api.ts`)
The application uses a centralized API client for all backend communication:

```typescript
// Example API calls
const apiClient = new ApiClient('http://localhost:5000/api')

// Get user transactions
const transactions = await apiClient.getBudgetTransactions(userId)

// Update budget cap
await apiClient.updateBudgetCap(userId, 'Savings', 25000)

// Generate AI insights
await apiClient.generateAgenticInsights(userId, transactionData)
```

### Real-time Features
- **Socket.IO Integration**: Real-time notifications and updates
- **Auto-refresh**: Automatic data synchronization
- **Live Updates**: Instant UI updates on data changes

## 🧩 Key Components

### Dashboard Components
- **MetricCards**: Financial metrics display
- **AIFinancialInsights**: AI-generated insights
- **BudgetOverview**: Budget tracking and management
- **RecentTransactions**: Latest transaction list
- **WeeklySpending**: Weekly spending visualization

### Modal Components
- **LoginModal**: User authentication
- **NewTransactionModal**: Add new transactions
- **ChatInterface**: AI chatbot interface

### Utility Components
- **FloatingChatbot**: Persistent chat access
- **TransactionCard**: Individual transaction display

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- **Touch-friendly**: Large touch targets
- **Swipe gestures**: Intuitive navigation
- **Optimized layout**: Stacked components on mobile
- **Fast loading**: Optimized images and assets

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_APP_NAME=Stash AI
```

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Analyze bundle size
- **Performance Monitoring**: Core Web Vitals tracking

## 🧪 Testing

### Available Tests
```bash
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
npm run test:e2e          # Run end-to-end tests
```

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: User flow testing
- **Visual Regression**: UI component testing

## 🔍 Performance

### Optimization Features
- **Next.js 15**: Latest performance optimizations
- **React 19**: Concurrent features and improvements
- **TailwindCSS v4**: Optimized CSS generation
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Route-based code splitting

### Monitoring
- **Core Web Vitals**: Performance metrics tracking
- **Bundle Analysis**: Regular bundle size monitoring
- **Error Tracking**: Error monitoring and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standard commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using Next.js 15 and React 19**
