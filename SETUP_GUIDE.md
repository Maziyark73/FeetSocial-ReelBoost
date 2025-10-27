# Setup Guide for FeetSocial-ReelBoost

## What's Been Set Up

✅ Created a comprehensive `.gitignore` file for Node.js projects
✅ Created `.env.example` files for all three projects:
   - `reel-boost-backend/.env.example` - Backend environment variables
   - `reel-boost-website/.env.example` - Website environment variables  
   - `reel-boost-admin/.env.example` - Admin panel environment variables
✅ Created a comprehensive `README.md` with setup instructions

## What You Need to Do Next

### 1. Install Required Software

**Install Xcode Command Line Tools:**
```bash
xcode-select --install
```
This will prompt you to install the tools. Accept the installation.

**Install Node.js (via Homebrew or direct download):**
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js
brew install node

# Verify installation
node --version
npm --version
```

**Install PM2 globally:**
```bash
npm install -g pm2
```

### 2. Install Dependencies

From the root directory (`FeetSocial-reel-boost`):

```bash
# Backend
cd reel-boost-backend
npm install
cd ..

# Website
cd reel-boost-website
npm install
cd ..

# Admin
cd reel-boost-admin
npm install
cd ..
```

### 3. Configure Environment Variables

**Backend:**
```bash
cd reel-boost-backend
cp .env.example .env
# Edit .env with your actual values
# Required: DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST, screteKey
cd ..
```

**Website:**
```bash
cd reel-boost-website
cp .env.example .env.local
# Edit .env.local with your API URLs and API keys
cd ..
```

**Admin:**
```bash
cd reel-boost-admin
cp .env.example .env
# Edit .env with your API URL
cd ..
```

### 4. Initialize Git Repository

```bash
cd /Users/maziyarkhademi-macmini/FeetSocial-reel-boost
git init
git add .
git commit -m "Initial commit: ReelBoost monorepo setup"
git branch -M main

# Create the repository on GitHub first, then:
git remote add origin git@github.com:YOUR_USERNAME/FeetSocial-ReelBoost.git
git push -u origin main
```

### 5. Test the Applications

**Backend:**
```bash
cd reel-boost-backend
pm2 start index.js
pm2 logs
```

**Website (build test):**
```bash
cd reel-boost-website
npm run build
```

**Admin (dev server):**
```bash
cd reel-boost-admin
npm run dev
```

## Environment Variables That Need Configuration

### Backend (reel-boost-backend/.env)
- `DB_USERNAME` - MySQL database username
- `DB_PASSWORD` - MySQL database password
- `DB_DATABASE` - MySQL database name
- `DB_HOST` - MySQL host (default: 127.0.0.1)
- `Port` - Server port (default: 3000)
- `screteKey` - JWT secret key (generate a strong random string)
- `baseUrl` - Base URL of your server
- `MEDIAFLOW` - Media storage (LOCAL, S3, etc.)

### Website (reel-boost-website/.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SOCKET_URL` - Socket.io server URL
- `NEXT_PUBLIC_GOOGLE_SIGNIN_ID` - Google OAuth Client ID
- `NEXT_PUBLIC_GOOGLE_MAP_KEY` - Google Maps API Key
- `NEXT_PUBLIC_GIF_API_KEY` - Giphy API Key

### Admin (reel-boost-admin/.env)
- `VITE_API_URL` - Backend API URL

## Important Notes

1. **Database**: You'll need to set up a MySQL database before running the backend
2. **API Keys**: You'll need to obtain API keys for Google Sign-In, Google Maps, and Giphy
3. **Security**: Generate a strong JWT secret key for the backend
4. **GitHub**: Create the private repository on GitHub before pushing

## Troubleshooting

- If `xcode-select --install` fails, try installing Xcode from the Mac App Store
- If npm install fails, try `npm cache clean --force` and retry
- Make sure you have MySQL installed and running before starting the backend
- Check that all ports (3000, etc.) are available and not in use by other applications
