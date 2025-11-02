# GuideMe App - Production Testing Guide

🌐 **Live App URL**: https://circuvent.web.app

## ✅ Authentication Testing Checklist

### Test 1: Sign up with valid email and password
**Steps:**
1. Open https://circuvent.web.app
2. Click "Sign Up" (or toggle to Sign Up mode)
3. Fill in:
   - Full Name: `Test User`
   - Email: `testuser@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Create Account"

**Expected Result:** ✅
- Loading spinner appears
- Successful account creation
- Automatic redirect to `/tabs/home`
- User document created in Firestore `users` collection

---

### Test 2: Sign up with invalid email (should show error)
**Steps:**
1. Click "Sign Up"
2. Fill in:
   - Full Name: `Invalid User`
   - Email: `notanemail` (no @ symbol)
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"

**Expected Result:** ✅
- Error message: "Please enter a valid email address"
- Account NOT created
- Stays on login page

---

### Test 3: Sign up with weak password (should show error)
**Steps:**
1. Click "Sign Up"
2. Fill in:
   - Full Name: `Weak Pass User`
   - Email: `weakpass@example.com`
   - Password: `12345` (only 5 characters)
   - Confirm Password: `12345`
3. Click "Create Account"

**Expected Result:** ✅
- Error message: "Password should be at least 6 characters"
- Account NOT created
- Stays on login page

---

### Test 4: Sign up with mismatched passwords (should show error)
**Steps:**
1. Click "Sign Up"
2. Fill in:
   - Full Name: `Mismatch User`
   - Email: `mismatch@example.com`
   - Password: `password123`
   - Confirm Password: `password456` (different)
3. Click "Create Account"

**Expected Result:** ✅
- Error message: "Passwords do not match"
- Account NOT created
- Stays on login page

---

### Test 5: Sign in with valid credentials
**Steps:**
1. Toggle to "Sign In" mode
2. Fill in:
   - Email: `testuser@example.com` (from Test 1)
   - Password: `password123`
3. Click "Sign In"

**Expected Result:** ✅
- Loading spinner appears
- Successful authentication
- Automatic redirect to `/tabs/home`
- User session established

---

### Test 6: Sign in with wrong password (should show error)
**Steps:**
1. On "Sign In" page
2. Fill in:
   - Email: `testuser@example.com`
   - Password: `wrongpassword`
3. Click "Sign In"

**Expected Result:** ✅
- Error message: "The password is invalid or the user does not have a password"
- Authentication FAILS
- Stays on login page

---

### Test 7: Sign in with non-existent email (should show error)
**Steps:**
1. On "Sign In" page
2. Fill in:
   - Email: `nonexistent@example.com`
   - Password: `password123`
3. Click "Sign In"

**Expected Result:** ✅
- Error message: "There is no user record corresponding to this identifier"
- Authentication FAILS
- Stays on login page

---

### Test 8: Google Sign-In flow
**Steps:**
1. On login page
2. Click "Continue with Google" button
3. Select your Google account
4. Grant permissions

**Expected Result:** ✅
- Google account picker appears
- Successful authentication
- User profile created with Google details
- Automatic redirect to `/tabs/home`
- Profile photo synced from Google

---

### Test 9: Sign out and sign in again
**Steps:**
1. After signing in, navigate to Profile tab
2. Click "Sign Out" button
3. Confirm sign out
4. Sign in again with same credentials

**Expected Result:** ✅
- Successfully signed out
- Redirected to login page
- Can sign in again successfully
- Session restored

---

### Test 10: Check user profile in Firestore
**Steps:**
1. Sign in to https://console.firebase.google.com
2. Go to your project: `circuvent`
3. Navigate to Firestore Database
4. Open `users` collection
5. Find the user documents created

**Expected Result:** ✅
- User documents exist in Firestore
- Each document has:
  - `uid`: User's unique ID
  - `email`: User's email address
  - `displayName`: User's full name
  - `photoURL`: Profile photo URL (if Google Sign-In)
  - `createdAt`: Timestamp of creation

---

## 🎯 Additional Tests

### Test 11: Form Validation
- Try submitting empty forms
- Try entering spaces in required fields
- Verify all validation messages appear correctly

### Test 12: Responsive Design
- Test on mobile viewport (375px width)
- Test on tablet viewport (768px width)
- Test on desktop (1920px width)
- Verify all UI elements are accessible

### Test 13: Loading States
- Verify loading spinner appears during sign up
- Verify loading spinner appears during sign in
- Verify button is disabled during loading

### Test 14: Navigation
- After login, verify tabs work (Home, My Trips, Explore, Profile)
- Verify logout redirects to login page
- Verify authentication guards prevent unauthorized access

---

## 🐛 Known Issues to Watch For

1. **Firestore Offline Error**: If you see "client is offline" errors:
   - Verify Firestore is created in test mode
   - Check Firestore rules allow read/write until December 2025
   - Refresh the page

2. **Google Sign-In Popup Blocked**: 
   - Allow popups in browser settings
   - Try in incognito mode if issues persist

3. **Slow Loading**:
   - First load might be slow due to CDN caching
   - Subsequent loads should be instant

---

## 📊 Testing Results Log

| Test # | Test Case | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Valid sign up | ⏳ Pending | |
| 2 | Invalid email | ⏳ Pending | |
| 3 | Weak password | ⏳ Pending | |
| 4 | Mismatched passwords | ⏳ Pending | |
| 5 | Valid sign in | ⏳ Pending | |
| 6 | Wrong password | ⏳ Pending | |
| 7 | Non-existent email | ⏳ Pending | |
| 8 | Google Sign-In | ⏳ Pending | |
| 9 | Sign out/in | ⏳ Pending | |
| 10 | Firestore profile | ⏳ Pending | |

---

## 🎉 Success Criteria

All tests should pass with expected results. Once complete, your authentication system is production-ready!

## 🔗 Quick Links

- **Live App**: https://circuvent.web.app
- **Firebase Console**: https://console.firebase.google.com/project/circuvent
- **GitHub Repository**: https://github.com/Hemakotibonthada/Guide_Me

---

**Last Updated**: November 1, 2025
