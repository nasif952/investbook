# Incubator Platform Setup Guide

## Project Structure
This project consists of both frontend and backend components:

- `client/`: React.js frontend application
- `server/`: Express.js backend application
- `api/`: Serverless API handlers for Vercel deployment

## Local Development
For local development, you can run both the frontend and backend concurrently:

```bash
# Install dependencies for the project root, client, and server
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Run both frontend and backend
npm run dev
```

This will start:
- React frontend on http://localhost:3000
- Express backend on http://localhost:5000

## Deployment to Vercel

### Backend Configuration
The project uses Vercel's serverless functions to handle the API routes. The backend is configured in two main places:

1. `api/index.js` - The main serverless handler that initializes Express and connects to MongoDB
2. `api/[...route].js` - Catch-all handler for all API routes

### Environment Variables
Make sure to set up the following environment variables in Vercel:

- `MONGO_URI`: Your MongoDB connection string
- You can add this in the Vercel dashboard under Project Settings > Environment Variables

### Vercel.json Configuration
The `vercel.json` file configures how Vercel builds and serves the application:

```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/build",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Troubleshooting
If you encounter issues with the backend not working properly on Vercel:

1. Check the Vercel deployment logs for errors
2. Verify that your environment variables are set correctly
3. Make sure the MongoDB connection is working properly
4. Confirm that all necessary backend routes are properly imported in `api/index.js`

## Database Setup
This project uses MongoDB. You can set up your own MongoDB instance using:
- MongoDB Atlas (cloud-hosted)
- Local MongoDB installation

Make sure to update your `.env` file with the correct MongoDB URI.

## Prerequisites

1. **Node.js and npm**: Version 14.0 or higher
   - Download from [https://nodejs.org/](https://nodejs.org/)

2. **MongoDB**: 
   - Option 1: Local installation from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Option 2: MongoDB Atlas cloud service (free tier available) from [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

## Detailed Setup Steps

### 1. MongoDB Setup

#### Local MongoDB:
- Create a data directory: `mkdir -p /data/db` (Linux/macOS) or `C:\data\db` (Windows)
- Start MongoDB: `mongod`
- The default connection string will be: `mongodb://localhost:27017/incubator-platform`

#### MongoDB Atlas:
- Create a free account on MongoDB Atlas
- Create a new cluster
- Set up database access user and password
- Set up network access (IP whitelist)
- Get your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/incubator-platform`

### 2. Backend Setup

1. Navigate to the server directory:
   ```
   cd incubator-platform/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your .env file:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/incubator-platform
   JWT_SECRET=your_custom_secret_key
   NODE_ENV=development
   ```
   Replace the MONGO_URI with your MongoDB connection string if using Atlas.
   Replace JWT_SECRET with a secure, random string.

4. Start the backend server:
   ```
   npm run dev
   ```

   The server should now be running on http://localhost:5000

### 3. Frontend Setup

1. Navigate to the client directory:
   ```
   cd ../client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

   The client should now be running on http://localhost:3000

## Testing the Application

### Initial Admin User Setup

To set up an initial admin user, you can use a tool like Postman or the following curl command:

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### Testing User Roles

1. **Startup User**:
   - Register as a new user (default role is "startup")
   - Log in and create a startup profile
   - Update profile information

2. **Sales Team User**:
   - Register/create a user with the "sales" role
   - Log in and access the dashboard
   - Review startup profiles

3. **Admin User**:
   - Log in as the admin user
   - Access the admin dashboard
   - Manage users and view all startups

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check if MongoDB is running
   - Verify your connection string in the .env file
   - Check network settings if using MongoDB Atlas

2. **Server Port Already in Use**:
   - Change the PORT in .env to an available port (e.g., 5001)

3. **CORS Issues**:
   - Ensure your frontend is connecting to the correct backend URL
   - Check for error messages in the browser console

4. **Auth Token Issues**:
   - Clear localStorage in your browser
   - Ensure JWT_SECRET is consistent in your backend

For any other issues, check the server logs for detailed error messages. 