# Incubator Platform

A full-stack application for managing startup incubation processes.

## Features

- User Authentication with role-based access control
- Startup profile creation and management
- Basic evaluation system
- Admin dashboard

## Tech Stack

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Bootstrap
- **Authentication**: JWT

## Prerequisites

- Node.js (v14+)
- MongoDB

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd incubator-platform
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
# Edit the .env file with your MongoDB connection string and JWT secret

# Start the server
npm run dev
```

The server will run on http://localhost:5000

### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Start the client
npm start
```

The client will run on http://localhost:3000

## API Endpoints

### Users

- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)

### Startups

- `POST /api/startups` - Create a new startup
- `GET /api/startups/profile` - Get startup profile
- `PUT /api/startups/profile` - Update startup profile
- `GET /api/startups` - Get all startups (Admin/Sales only)
- `GET /api/startups/:id` - Get startup by ID (Admin/Sales only)

## Project Structure

```
incubator-platform/
├── client/                 # Frontend React application
├── server/                 # Backend Express API
├── api/                    # Vercel serverless API functions
├── vercel.json             # Vercel configuration
└── package.json            # Root package.json
```

## Next Steps (Future Phases)

- Complete evaluation module with scoring
- Advanced admin dashboard
- Notification system
- Reporting and analytics
- Data export functionality

## Deploying to Vercel

This project is configured for deployment on Vercel with the following setup:

1. The frontend React app is in the `/client` directory
2. The backend API is configured to work with Vercel's serverless functions

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure the following Build & Development Settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

3. Set up the following environment variables in Vercel:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: Set to `production`

4. Deploy!

### Local Development

1. Clone the repository
2. Install dependencies in both root and client directories:
   ```
   npm install
   cd client && npm install
   ```
3. Create a `.env` file in the server directory with:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
4. Run the development server:
   ```
   npm run dev
   ``` 