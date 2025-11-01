# Deployment Guide for GuideMe Travel App

## Option 1: Firebase Hosting (RECOMMENDED) ⭐

### Advantages:
- ✅ Free SSL/HTTPS automatic
- ✅ Global CDN (fast worldwide)
- ✅ Easy updates with one command
- ✅ Free tier (10GB bandwidth/month)
- ✅ Custom domain support

### Steps:

#### 1. Build Production App
```powershell
npm run build --prod
```

This creates optimized files in the `www/` folder.

#### 2. Deploy to Firebase
```powershell
firebase deploy --only hosting
```

#### 3. Get Your URL
After deployment, you'll get a URL like:
- `https://circuvent.web.app`
- `https://circuvent.firebaseapp.com`

#### 4. Connect Custom Domain (htresearchlab.com)

**Option A: Use a subdomain (Recommended)**
- In Firebase Console: https://console.firebase.google.com/project/circuvent/hosting/sites
- Click "Add custom domain"
- Enter: `travel.htresearchlab.com`
- Follow DNS instructions (add A/CNAME records in GoDaddy)

**Option B: Use main domain**
- Enter: `htresearchlab.com`
- Follow same DNS setup process

---

## Option 2: GoDaddy cPanel Hosting

### Advantages:
- ✅ You already have hosting
- ✅ Can use main domain directly

### Steps:

#### 1. Build Production App
```powershell
npm run build --prod
```

#### 2. Upload to GoDaddy
1. Login to GoDaddy cPanel
2. Open **File Manager**
3. Navigate to `public_html/` (for main domain) or `public_html/travel/` (for subdomain)
4. Upload all files from `www/` folder:
   - index.html
   - All JS/CSS files
   - assets/ folder
   - All other files

#### 3. Configure .htaccess (Important!)

Create `.htaccess` file in the upload directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect all requests to index.html for Angular routing
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
  
  # Enable GZIP compression
  <IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
  </IfModule>
  
  # Browser caching
  <IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
  </IfModule>
</IfModule>
```

#### 4. Access Your App
- Main domain: `https://htresearchlab.com`
- Subdomain: `https://travel.htresearchlab.com` (after creating subdomain in cPanel)

---

## Quick Deployment Commands

### For Firebase Hosting:
```powershell
# Build and deploy in one go
npm run build --prod
firebase deploy --only hosting

# View your site
firebase open hosting:site
```

### For Future Updates:
```powershell
# Make changes, then:
npm run build --prod
firebase deploy --only hosting
```

---

## Recommended: Firebase + Custom Domain

**Best setup:**
1. Deploy to Firebase Hosting (easiest, fastest)
2. Use subdomain: `travel.htresearchlab.com`
3. In GoDaddy DNS, add:
   - Type: `CNAME`
   - Name: `travel`
   - Value: `circuvent.web.app`

This gives you:
- Fast global CDN
- Automatic HTTPS
- Easy updates
- Professional subdomain

---

## Firebase Security Rules (Production)

After deployment, update Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trips - user must be owner
    match /trips/{tripId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Public read, authenticated write
    match /places/{placeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Apply these rules in Firebase Console > Firestore Database > Rules

---

## DNS Configuration for GoDaddy

If using Firebase Hosting with custom domain:

### For subdomain (travel.htresearchlab.com):
1. Login to GoDaddy DNS Manager
2. Add new record:
   - Type: `A`
   - Name: `travel`
   - Value: (IP addresses from Firebase, usually):
     - `151.101.1.195`
     - `151.101.65.195`
3. Or use CNAME:
   - Type: `CNAME`
   - Name: `travel`
   - Value: `circuvent.web.app`

### For main domain (htresearchlab.com):
1. Add A records:
   - Type: `A`
   - Name: `@`
   - Value: Firebase IPs (provided during custom domain setup)

---

## Monitoring & Analytics

After deployment:
- Firebase Console: https://console.firebase.google.com/project/circuvent/overview
- View Analytics: https://console.firebase.google.com/project/circuvent/analytics
- Check Hosting: https://console.firebase.google.com/project/circuvent/hosting

---

## Need Help?

**Firebase Hosting Issues:**
- Docs: https://firebase.google.com/docs/hosting
- Custom domain: https://firebase.google.com/docs/hosting/custom-domain

**GoDaddy DNS Issues:**
- GoDaddy Support: https://www.godaddy.com/help
- DNS Propagation check: https://dnschecker.org
