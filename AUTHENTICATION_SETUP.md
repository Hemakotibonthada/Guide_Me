# Firebase Authentication Setup Guide

## Step-by-Step Guide to Enable Email/Password Authentication

### 1. Enable Email/Password Authentication in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click **Authentication** in the left sidebar
4. Click **Get Started** (if you haven't already)
5. Go to **Sign-in method** tab
6. Click on **Email/Password**
7. **Enable** the first toggle (Email/Password)
8. Click **Save**

### 2. Verify Your Firebase Configuration

Make sure your `src/environments/environment.ts` has the correct Firebase config:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',              // From Firebase Console
    authDomain: 'YOUR_AUTH_DOMAIN',       // e.g., your-app.firebaseapp.com
    projectId: 'YOUR_PROJECT_ID',         // Your Firebase project ID
    storageBucket: 'YOUR_STORAGE_BUCKET', // e.g., your-app.appspot.com
    messagingSenderId: 'YOUR_SENDER_ID',  // Your messaging sender ID
    appId: 'YOUR_APP_ID',                 // Your app ID
    measurementId: 'YOUR_MEASUREMENT_ID'  // Optional, for analytics
  },
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  openAiApiKey: 'YOUR_OPENAI_API_KEY'
};
```

### 3. Test the Authentication

The app now supports three authentication methods:

#### A. Email/Password Sign Up
1. Open the app at `http://localhost:4200`
2. Click **"Sign Up"** link
3. Fill in:
   - Full Name
   - Email
   - Password (minimum 6 characters)
   - Confirm Password
4. Click **"Create Account"**

#### B. Email/Password Sign In
1. On the login page
2. Enter your email and password
3. Click **"Sign In"**

#### C. Google Sign In
1. Click **"Continue with Google"**
2. Select your Google account
3. Grant permissions

## Features Implemented

### 1. **Sign Up with Email/Password**
- Full name collection
- Email validation
- Password strength requirement (6+ characters)
- Password confirmation
- User profile creation in Firestore

### 2. **Sign In with Email/Password**
- Email and password authentication
- Automatic redirect to home page
- Error handling with user-friendly messages

### 3. **Google Sign-In**
- One-click authentication
- Automatic profile creation
- Profile photo sync

### 4. **Error Handling**
- Invalid email format
- Weak password
- Email already in use
- Wrong password
- User not found
- And more...

### 5. **Form Validation**
- Real-time validation
- Clear error messages
- Required field checks
- Email format validation
- Password matching (for sign up)

## Security Features

✅ **Password Hashing**: Firebase automatically hashes passwords
✅ **Secure Token Management**: JWT tokens for session management
✅ **HTTPS Only**: All authentication requests use HTTPS
✅ **Input Validation**: Client-side validation for better UX
✅ **Error Masking**: Generic error messages for security

## User Experience Features

✅ **Smooth Transitions**: Animated mode switching between Sign In/Sign Up
✅ **Loading States**: Spinner during authentication
✅ **Clear Error Messages**: User-friendly error display
✅ **Responsive Design**: Works on mobile, tablet, and desktop
✅ **Form Persistence**: Email retained when switching modes
✅ **Keyboard Navigation**: Full keyboard support

## Firestore Structure

After authentication, a user document is created:

```
users/
  └── {userId}/
      ├── uid: string
      ├── email: string
      ├── displayName: string
      ├── photoURL: string
      └── createdAt: timestamp
```

## Common Issues & Solutions

### Issue 1: "Firebase: Error (auth/configuration-not-found)"
**Solution**: Make sure you've enabled Email/Password in Firebase Console

### Issue 2: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Check your API key in `environment.ts`

### Issue 3: Google Sign-In doesn't work
**Solution**: 
1. Enable Google provider in Firebase Console
2. Add authorized domains in Firebase Console → Authentication → Settings → Authorized domains

### Issue 4: Password too weak
**Solution**: Firebase requires passwords to be at least 6 characters

## Testing Checklist

- [ ] Sign up with valid email and password
- [ ] Sign up with invalid email (should show error)
- [ ] Sign up with weak password (should show error)
- [ ] Sign up with mismatched passwords (should show error)
- [ ] Sign in with valid credentials
- [ ] Sign in with wrong password (should show error)
- [ ] Sign in with non-existent email (should show error)
- [ ] Google Sign-In flow
- [ ] Sign out and sign in again
- [ ] Check user profile in Firestore

## Next Steps

1. **Password Reset**: Implement "Forgot Password" feature
2. **Email Verification**: Add email verification requirement
3. **Profile Updates**: Allow users to update their profile
4. **Social Login**: Add Facebook, Apple, Twitter authentication
5. **2FA**: Implement two-factor authentication

## API Methods Available

```typescript
// Sign up
authService.signUpWithEmail(email, password, displayName)

// Sign in
authService.signInWithEmail(email, password)

// Google Sign-In
authService.signInWithGoogle()

// Password Reset
authService.resetPassword(email)

// Sign out
authService.signOut()

// Get current user
authService.getCurrentUser()

// Check authentication status
authService.isAuthenticated()
```

## Screenshots Description

### Login Screen
- Gradient purple background
- Animated airplane icon
- App branding
- Email and password inputs
- Sign In button
- Google Sign-In button
- Toggle to Sign Up

### Sign Up Screen
- Same beautiful design
- Additional fields: Full Name, Confirm Password
- Create Account button
- Toggle back to Sign In

---

**Need Help?** Check the [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
