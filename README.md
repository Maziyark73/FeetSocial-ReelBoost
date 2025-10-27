# FeetSocial ReelBoost

A full-stack TikTok-like video sharing platform with live streaming capabilities.

## Project Structure

This is a monorepo containing three independent Node.js projects:

- **reel-boost-backend**: Node.js/Express backend API server
- **reel-boost-website**: Next.js frontend application
- **reel-boost-admin**: React/Vite admin panel

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database
- PM2 (for running the backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FeetSocial-ReelBoost
```

2. Set up environment variables for each project:

```bash
# Backend
cd reel-boost-backend
cp .env.example .env
# Edit .env with your database credentials and configuration

# Website
cd ../reel-boost-website
cp .env.example .env.local
# Edit .env.local with your API URLs and keys

# Admin
cd ../reel-boost-admin
cp .env.example .env
# Edit .env with your API URL
```

3. Install dependencies for each project:

```bash
# Backend
cd reel-boost-backend
npm install

# Website
cd ../reel-boost-website
npm install

# Admin
cd ../reel-boost-admin
npm install
```

## Running the Applications

### Backend
```bash
cd reel-boost-backend
pm2 start index.js
```

### Website (Development)
```bash
cd reel-boost-website
npm run dev
```

### Website (Production Build)
```bash
cd reel-boost-website
npm run build
npm start
```

### Admin (Development)
```bash
cd reel-boost-admin
npm run dev
```

### Admin (Production Build)
```bash
cd reel-boost-admin
npm run build
```

## Environment Variables

### Backend (.env)
- Database credentials (DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST)
- Server port (Port)
- JWT secret key (screteKey)
- Base URL (baseUrl)
- Media storage configuration (MEDIAFLOW)
- Demo/trial mode settings

### Website (.env.local)
- Next.js public environment variables for API URLs
- Google Sign-In credentials
- Google Maps API key
- Giphy API key

### Admin (.env)
- VITE_API_URL: Backend API URL

## License

Copyright © FeetSocial
