# Ranking System Setup Guide

## Overview
The ranking system tracks user performance based on DSA problems solved, with weekly and monthly rankings.

**Points System:**
- Easy: 3 points
- Medium: 7 points  
- Hard/Tough: 10 points

## Prerequisites

### 1. Environment Configuration
Create a `.env.local` file in the root directory:
```
VITE_BACKEND_URL=http://localhost:5000
```

### 2. Database Setup
Ensure MongoDB is running and the database URL is configured in your backend `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/placement-prep
JWT_SECRET=your_jwt_secret_key
```

### 3. Backend Server
The backend must be running on port 5000:
```bash
cd backend
npm install
npm start
# or
node index.js
```

## How It Works

### Authentication Flow
1. User logs in via Firebase
2. When accessing the Rankings tab, the app exchanges the Firebase token for a JWT token
3. JWT token is used for all API requests to the backend
4. JWT token is cached in localStorage as `jwtToken` for performance

### API Endpoints

**Rankings Endpoints:**
- `GET /api/rankings?type=weekly|monthly` - Get full leaderboard
- `GET /api/rankings/me?type=weekly|monthly` - Get current user's ranking

**Auth Endpoints:**
- `POST /api/auth/firebase` - Exchange Firebase credentials for JWT token

**Problem Endpoints:**
- `PUT /api/problems/:id/mark-solved` - Mark a problem as solved
- `PUT /api/problems/:id/mark-unsolved` - Mark a problem as unsolved

## Troubleshooting

### Error: "Failed to fetch"
**Possible Causes:**
1. Backend server not running
2. Wrong `VITE_BACKEND_URL` in `.env.local`
3. MongoDB connection issue
4. CORS configuration issue

**Solutions:**
- Check if backend is running: `curl http://localhost:5000/api/health`
- Verify `.env.local` has correct backend URL
- Check backend console for database connection errors
- Ensure MongoDB is running

### Error: "Not authorized, token failed"
**Cause:** JWT token is invalid or expired

**Solution:** 
- Refresh the page to get a new token
- Clear browser cache and localStorage
- Re-login to your account

### Error: "Authentication token not found"
**Cause:** Not logged in or Firebase token couldn't be obtained

**Solution:**
- Make sure you're logged into the app first
- Check if Firebase is properly configured
- Verify Firebase credentials in `src/pages/firebase.js`

## Testing Rankings

### Manual Testing Steps:
1. Log in to your account
2. Navigate to "MyProgress" page
3. Click on "ranking" tab
4. You should see:
   - Your current rank and score
   - Weekly and monthly toggles
   - Leaderboard with top users
   - Detailed ranking breakdown

### Creating Test Data:
To test the ranking system, you need to mark some problems as solved:
1. Go to DSA or problem pages
2. Mark problems as solved using the UI
3. Return to Rankings tab - your score and rank should update

## Database Schema Changes

### User Model
Added field:
- `firebaseUID: String` - Links Firebase user to MongoDB user

### PracticeProblem Model
Added field:
- `solvedDate: Date` - Tracks when problem was solved (for weekly/monthly filtering)

## Future Enhancements
- [ ] Real-time ranking updates
- [ ] Achievement badges
- [ ] Historical ranking charts
- [ ] Regional/group leaderboards
- [ ] Problem-specific rankings
