# Incubator Platform Project Overview

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Frontend](#frontend)
   - [Pages](#pages)
   - [Components](#components)
   - [Authentication Flow](#authentication-flow)
5. [Backend](#backend)
   - [API Routes](#api-routes)
   - [Controllers & Services](#controllers--services)
6. [Database](#database)
   - [Models](#models)
   - [Schema Relationships](#schema-relationships)
7. [User Roles](#user-roles)
8. [Key Features](#key-features)
9. [Deployment](#deployment)

## Project Overview

The Incubator Platform is a web application designed to facilitate the management of startup incubation programs. It provides a platform for startups to register, sales representatives to evaluate startups, and administrators to oversee the entire process.

The platform offers role-based access control, startup profile management, evaluation processes, and dashboard analytics for decision-making.

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **UI Library**: Material UI (MUI)
- **State Management**: React Context API
- **Authentication**: NextAuth.js
- **Data Fetching**: Fetch API
- **Styling**: Emotion (with MUI)
- **Charts & Visualization**: Chart.js, Recharts

### Backend
- **Framework**: Next.js API Routes
- **Authentication**: NextAuth.js, JWT
- **Security**: bcryptjs for password hashing

### Database
- **Database**: MongoDB
- **ODM**: Mongoose
- **Cloud Provider**: MongoDB Atlas

## Architecture

The application follows a modern full-stack architecture with Next.js:

1. **Frontend**: React components with Material UI
2. **API Layer**: Next.js API Routes
3. **Data Layer**: Mongoose models interacting with MongoDB
4. **Authentication**: JWT-based authentication with NextAuth

The application uses a serverless architecture with Next.js API routes, making it easy to deploy on platforms like Vercel.

## Frontend

### Pages

The platform consists of the following main pages:

1. **Home Page** (`pages/index.js`)
   - Landing page with information about the incubator platform
   - Sign-in and registration options

2. **Registration** (`pages/register.js`)
   - User registration form
   - Role selection (Startup Founder or Sales Representative)

3. **Login** (`pages/login.js`)
   - Authentication form
   - Redirects based on user role

4. **Dashboard** (`pages/dashboard.js`)
   - Overview of key metrics
   - Different views based on user role

5. **Startups** (`pages/startups.js`)
   - List of all startups
   - Filtering and search capabilities
   - Access restricted to sales and admin roles

6. **Startup Profile** (`pages/startup/form.js`)
   - Startup information form
   - Document upload
   - Accessible to startup founders

7. **Evaluations** (`pages/evaluations/[id].js`)
   - Evaluation forms
   - Scoring interface
   - Comments and feedback

8. **Profile** (`pages/profile.js`)
   - User profile management
   - Account settings

9. **Criteria Management** (`pages/criteria/index.js`)
   - Define evaluation criteria
   - Set weights and categories

### Components

Key reusable components include:

1. **Header** (`components/Header.js`)
   - Navigation menu
   - Role-based visibility
   - Authentication status handling

2. **EvaluationSummary** (`components/EvaluationSummary.js`)
   - Displays evaluation results
   - Charts and metrics

3. **StartupEvaluation** (`components/StartupEvaluation.js`)
   - Evaluation form for startups
   - Scoring interface

4. **DataTable** (`components/DataTable.js`)
   - Reusable table for displaying data
   - Sorting, filtering, and pagination

5. **DashboardCard** (`components/DashboardCard.js`)
   - Card component for dashboard metrics
   - Visual indicators and statistics

6. **SalesDashboard** (`components/SalesDashboard.js`)
   - Dashboard specific to sales representatives
   - Performance metrics and startup statistics

7. **Footer** (`components/Footer.js`)
   - Site footer with links and information

### Authentication Flow

1. User registers via `/register` page
2. Data is sent to `/api/users/register` endpoint
3. Upon successful registration, user is redirected to login
4. Login credentials are verified via NextAuth.js
5. JWT token is generated and stored in cookies
6. User is redirected based on role:
   - Startup founders → `/startup/form`
   - Sales representatives → `/dashboard`

## Backend

### API Routes

1. **Authentication**
   - `/api/auth/[...nextauth].js` - NextAuth.js authentication handler
   - `/api/users/register` - User registration

2. **Users**
   - `/api/users/index.js` - CRUD operations for users
   - `/api/users/me.js` - Current user information

3. **Startups**
   - `/api/startups/index.js` - CRUD operations for startups
   - `/api/startups/[id].js` - Specific startup operations
   - `/api/startups/documents` - Document upload and management

4. **Evaluations**
   - `/api/evaluations/index.js` - CRUD operations for evaluations
   - `/api/evaluations/[id].js` - Specific evaluation operations
   - `/api/evaluations/startup/[id].js` - Evaluations for a specific startup

5. **Criteria**
   - `/api/criteria/index.js` - CRUD operations for evaluation criteria
   - `/api/criteria/[id].js` - Specific criterion operations

### Controllers & Services

While Next.js API routes handle request/response, the business logic is organized in service functions:

1. **Database Connection**
   - `lib/db.js` - MongoDB connection handler with caching

2. **Authentication**
   - NextAuth.js providers and callbacks in `pages/api/auth/[...nextauth].js`

## Database

### Models

1. **User** (`lib/models/User.js`)
   ```javascript
   {
     email: String,       // Unique email
     password: String,    // Hashed password
     role: String,        // 'startup', 'sales', or 'admin'
     name: String,        // User's full name
     phone: String,       // Contact phone
     position: String,    // Job title
     lastLogin: Date      // Last login timestamp
   }
   ```

2. **Startup** (`lib/models/Startup.js`)
   ```javascript
   {
     userId: ObjectId,    // Reference to User
     companyName: String, // Startup name
     foundingDate: Date,  // When the startup was founded
     stage: String,       // 'idea', 'prototype', 'mvp', 'growth'
     industry: String,    // Industry category
     description: String, // Company description
     teamSize: Number,    // Number of team members
     website: String,     // Company website
     location: String,    // Physical location
     financials: {        // Financial information
       revenue: Number,
       funding: Number,
       burnRate: Number
     },
     metrics: {           // Performance metrics
       userBase: Number,
       growthRate: Number
     },
     documents: [         // Uploaded documents
       {
         name: String,
         data: Buffer,
         contentType: String,
         size: Number,
         uploadDate: Date
       }
     ],
     onboardingCompleted: Boolean // Onboarding status
   }
   ```

3. **Evaluation** (`lib/models/Evaluation.js`)
   ```javascript
   {
     startupId: ObjectId,    // Reference to Startup
     evaluatorId: ObjectId,  // Reference to User (evaluator)
     scores: [               // Individual criterion scores
       {
         criterionId: ObjectId, // Reference to EvaluationCriteria
         score: Number       // Score from 1-10
       }
     ],
     overallScore: Number,   // Calculated overall score
     status: String,         // 'pending', 'in-progress', 'completed'
     comments: String,       // Evaluator comments
     recommendIncubation: Boolean // Final recommendation
   }
   ```

4. **EvaluationCriteria** (`lib/models/EvaluationCriteria.js`)
   ```javascript
   {
     name: String,          // Criterion name
     description: String,   // Detailed description
     category: String,      // Grouping category
     weight: Number,        // Weight in overall calculation
     active: Boolean,       // Whether currently in use
     createdBy: ObjectId    // User who created the criterion
   }
   ```

### Schema Relationships

1. **User to Startup**: One-to-One relationship
   - A user with 'startup' role has one startup profile
   - The Startup model references the User via `userId`

2. **Startup to Evaluation**: One-to-Many relationship
   - A startup can have multiple evaluations
   - The Evaluation model references the Startup via `startupId`

3. **User to Evaluation**: One-to-Many relationship
   - A user (with 'sales' role) can create multiple evaluations
   - The Evaluation model references the User via `evaluatorId`

4. **EvaluationCriteria to Evaluation**: Many-to-Many relationship
   - An evaluation includes multiple criteria
   - A criterion can be used in multiple evaluations
   - The relationship is managed via the `scores` array in Evaluation

## User Roles

The platform implements three distinct user roles:

1. **Startup Founder** (`role: 'startup'`)
   - Can create and manage startup profile
   - Can view their own evaluations (read-only)
   - Cannot access other startups' data

2. **Sales Representative** (`role: 'sales'`)
   - Can view all startups
   - Can create and manage evaluations
   - Can access dashboard with analytics
   - Cannot modify startup profiles directly

3. **Administrator** (`role: 'admin'`)
   - Full access to all features
   - Can manage users, startups, and evaluations
   - Can define evaluation criteria
   - Can view comprehensive analytics

## Key Features

1. **Startup Onboarding**
   - Multi-step form for startup registration
   - Document upload capability
   - Progress tracking

2. **Evaluation System**
   - Customizable evaluation criteria
   - Weighted scoring system
   - Automated overall score calculation

3. **Analytics Dashboard**
   - Performance metrics visualization
   - Startup comparison tools
   - Filtering and sorting capabilities

4. **Role-Based Access Control**
   - Different navigation options based on user role
   - Protected routes and API endpoints
   - Data access restrictions

5. **Document Management**
   - Secure document storage
   - Access control for sensitive documents
   - Version tracking

## Deployment

The application is configured for deployment on Vercel, with:

1. **Environment Variables**
   - MongoDB connection string
   - JWT secret key
   - NextAuth configuration

2. **Configuration**
   - `next.config.js` for Next.js settings
   - `vercel.json` for Vercel-specific configuration

3. **Database**
   - MongoDB Atlas for database hosting
   - Connection pooling for optimal performance 