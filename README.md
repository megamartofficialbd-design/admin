# Bekolpo - Admin Dashboard

Admin and vendor management dashboard for Bekolpo built with Next.js and React.

## Features

- Admin dashboard with analytics
- Vendor management
- Product management
- Order management
- Category and brand management
- User management
- Banner and promotion management
- Fraud detection integration
- Courier integration

## Tech Stack

- **Framework:** Next.js 16
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **State Management:** Redux
- **API:** RTK Query
- **Authentication:** NextAuth.js
- **Rich Text Editor:** TipTap

## Setup

1. Clone repository
2. Copy `.env.example` to `.env.local`
3. Configure environment variables
4. Run `npm install`
5. Run `npm run dev`

Development server: `http://localhost:3001`

## Key Pages

- `/` - Dashboard home
- `/products` - Product management
- `/categories` - Category management
- `/vendors` - Vendor management
- `/orders` - Order management
- `/users` - User management
- `/auth/login` - Admin login

## Environment Variables

- `NEXT_PUBLIC_BASE_API` - Backend API URL
- `NEXTAUTH_SECRET` - NextAuth session secret
- `GOOGLE_CLIENT_ID` - Google OAuth ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `NEXT_PUBLIC_CLOUDINARY_*` - Cloudinary image service
- `NEXT_PUBLIC_STEADFAST_*` - Courier integration
- `FRAUDBD_*` - Fraud detection service

See `ENV_SETUP_GUIDE.md` for complete setup.

## License

ISC
