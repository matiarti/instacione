# 🚗 Instacione - Smart Parking Platform

A modern, full-stack parking reservation platform built with Next.js, MongoDB, and Google Maps integration.

## 🚀 Current Status

**✅ MVP Core Features Complete**
- Complete reservation flow: Search → Reserve → Pay → Success
- Stripe payment integration working
- Google Maps integration functional
- Multi-language support (EN/PT-BR)
- Responsive design for all devices
- Professional logo with dark/light mode support

**🔄 Recent Updates**
- Fixed Stripe loading issues (deferred loading to prevent ad blocker conflicts)
- Resolved reservation API datetime format issues
- Fixed success page data structure mismatch
- Improved error handling and debugging
- Added professional logo with automatic theme switching
- Complete internationalization for all pages

**📋 Next Steps**
- Operator subscription system
- Enhanced analytics and logging
- Soft launch with pilot parking lots

## 🌟 Features

### Core Functionality ✅ **FULLY FUNCTIONAL**
- **Interactive Map Search**: Find parking lots using Google Maps integration
- **Real-time Availability**: Live updates of parking lot availability
- **Smart Reservations**: Reserve parking spots with time-based arrival windows
- **Secure Payments**: Stripe integration for reservation fees
- **Email Notifications**: Automated confirmations and updates via Resend

### User Experience
- **Magic Link Authentication**: Passwordless login with email magic links
- **User Dashboard**: Manage reservations, vehicles, and preferences
- **Mobile Responsive**: Optimized for all device sizes
- **Advanced Filtering**: Filter by distance, price, availability, and amenities
- **Multi-Language Support**: English and Portuguese (pt-BR) with language switcher

### Operator Features
- **Lot Management**: Create and manage parking lots
- **Real-time Dashboard**: Monitor reservations and availability
- **Revenue Tracking**: Track earnings and performance metrics
- **Subscription System**: Stripe-based operator subscriptions

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with magic link support
- **Payments**: Stripe for payment processing
- **Maps**: Google Maps JavaScript API
- **Email**: Resend for transactional emails
- **Analytics**: PostHog for user behavior tracking
- **Internationalization**: next-intl for multi-language support
- **UI Components**: shadcn/ui for modern, accessible components
- **Deployment**: Vercel for serverless hosting

### Project Structure
```
instacione/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── [locale]/       # Internationalized routes
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── lot/            # Parking lot pages
│   │   ├── operator/       # Operator dashboard
│   │   ├── account/        # User account pages
│   │   └── search/         # Search interface
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components (shadcn/ui)
│   │   ├── map.tsx        # Google Maps component
│   │   ├── logo.tsx       # Professional logo with theme support
│   │   ├── language-switcher.tsx  # Language selection
│   │   └── ...
│   ├── lib/               # Utility libraries
│   │   ├── mongodb.ts     # Database connection
│   │   ├── auth.ts        # Authentication config
│   │   ├── maps.ts        # Google Maps utilities
│   │   ├── stripe.ts      # Payment utilities
│   │   ├── email.ts       # Email utilities
│   │   └── analytics.ts   # Analytics tracking
│   ├── hooks/             # Custom React hooks
│   ├── i18n.ts           # Internationalization config
│   ├── middleware.ts     # Locale routing middleware
│   └── messages/         # Translation files
│       ├── en.json       # English translations
│       └── pt-BR.json    # Portuguese translations
├── models/                # MongoDB models
├── scripts/               # Database and utility scripts
├── types/                 # TypeScript definitions
└── public/               # Static assets
    └── logo/             # Logo assets
        ├── dark.svg      # Dark mode logo
        └── light.svg     # Light mode logo
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Google Maps API key
- Stripe account and API keys
- Resend account and API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/instacione.git
   cd instacione
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   MONGODB_URI=mongodb+srv://...
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_MAPS_API_KEY=your-google-maps-key
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   RESEND_API_KEY=re_...
   ```

4. **Set up the database**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run system tests
npm run test:system
```

### Test Coverage
- **Unit Tests**: Utility functions and components
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Complete user flows
- **System Tests**: Full system validation

## 📊 Analytics

The application includes comprehensive analytics tracking:

### User Events
- Search performed
- Lot viewed
- Reservation started/completed
- Payment completed
- Check-in/out events

### Business Metrics
- Conversion rates
- Revenue tracking
- User engagement
- Error monitoring

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ✅ |
| `RESEND_API_KEY` | Resend API key | ✅ |
| `EMAIL_FROM` | From email address | ✅ |
| `RESERVATION_FEE_PCT` | Reservation fee percentage | ❌ |
| `ARRIVAL_WINDOW_MIN` | Arrival window in minutes | ❌ |
| `PENDING_PAYMENT_TTL_MIN` | Payment timeout in minutes | ❌ |

### Database Configuration

The application uses MongoDB with the following collections:
- **users**: User accounts and profiles
- **parkinglots**: Parking lot information and availability
- **reservations**: Reservation records and state management

Required indexes:
- Geospatial index on `parkinglots.location.geo`
- Compound indexes on `reservations` for efficient queries

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Set environment variables**
   Configure all required environment variables in the Vercel dashboard.

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📈 Performance

### Optimization Features
- **Server-side Rendering**: Fast initial page loads
- **Static Generation**: Pre-built pages for better performance
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting for smaller bundles
- **Database Indexing**: Optimized database queries

### Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **PostHog Analytics**: User behavior and error tracking
- **Custom Metrics**: Application-specific performance metrics

## 🔒 Security

### Security Features
- **Authentication**: Secure session management with NextAuth.js
- **Input Validation**: Zod schema validation for all inputs
- **CORS Protection**: Configured CORS policies
- **Environment Variables**: Secure secret management
- **Payment Security**: PCI-compliant payment processing with Stripe

### Best Practices
- Regular dependency updates
- Secure API endpoints
- Input sanitization
- Error handling without information leakage

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test:run
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add your feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Comprehensive testing
- Clear documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment
- **Stripe** for payment processing
- **Google Maps** for mapping services
- **MongoDB** for the database
- **Tailwind CSS** for the styling framework

## 📞 Support

For support and questions:
- **Email**: support@instacione.com
- **Documentation**: [docs.instacione.com](https://docs.instacione.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/instacione/issues)

---

**Built with ❤️ for the future of parking**
# Trigger deployment
# Trigger deployment after fixing env vars
# Final deployment trigger after fixing MONGODB_URI
# Test deployment after fixing env vars in dashboard
