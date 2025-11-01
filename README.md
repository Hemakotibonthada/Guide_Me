# GuideMe Travel - AI-Powered Travel Planning App

A comprehensive cross-platform travel planning and management application built with Ionic, Angular, and Firebase.

## Features

### 🎯 Core Features
- **AI-Powered Trip Planning**: Get intelligent trip suggestions, itinerary optimization, and budget recommendations
- **Google Authentication**: Secure sign-in with Google OAuth
- **Trip Management**: Create, edit, and organize trips with ease
- **Place Discovery**: Find and add nearby attractions, restaurants, and points of interest
- **Expense Tracking**: Monitor spending with category-based expense management
- **Route Planning**: Integrated maps and route tracking
- **Photo Memories**: Capture and pin photos to specific locations
- **Visit Tracking**: Mark places as visited/unvisited with time tracking

### 🤖 AI Features
- Smart destination recommendations
- Automated itinerary optimization
- Budget estimation
- Travel tips and insights
- Place suggestions based on interests

### 📱 Cross-Platform
- **iOS**: Native iOS app via Capacitor
- **Android**: Native Android app via Capacitor
- **Web**: Progressive Web App (PWA)

## Tech Stack

- **Framework**: Ionic 7 + Angular 17
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Maps**: Google Maps API
- **AI**: OpenAI GPT API
- **Mobile**: Capacitor 5
- **Language**: TypeScript

## Getting Started

### Prerequisites

```bash
node >= 18.x
npm >= 9.x
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Guide_Me
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'YOUR_MEASUREMENT_ID'
  },
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  openAiApiKey: 'YOUR_OPENAI_API_KEY'
};
```

### Running the App

#### Web Development
```bash
npm start
# or
ionic serve
```

#### iOS
```bash
ionic cap add ios
ionic cap sync ios
ionic cap open ios
```

#### Android
```bash
ionic cap add android
ionic cap sync android
ionic cap open android
```

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Google provider
3. Create a Firestore database
4. Enable Firebase Storage
5. Add your Firebase config to environment files

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /trips/{tripId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      match /places/{placeId} {
        allow read, write: if request.auth != null;
      }
      
      match /expenses/{expenseId} {
        allow read, write: if request.auth != null;
      }
      
      match /photos/{photoId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Google Maps Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
3. Create an API key and add it to your environment files

## OpenAI Setup

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Generate an API key
3. Add the API key to your environment files

## Project Structure

```
Guide_Me/
├── src/
│   ├── app/
│   │   ├── models/           # Data models
│   │   ├── services/         # Business logic services
│   │   ├── pages/            # Application pages
│   │   │   ├── login/
│   │   │   ├── home/
│   │   │   ├── my-trips/
│   │   │   ├── explore/
│   │   │   ├── profile/
│   │   │   ├── create-trip/
│   │   │   ├── trip-detail/
│   │   │   └── place-detail/
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── environments/         # Environment configs
│   ├── theme/                # Global styles
│   ├── assets/               # Static assets
│   ├── index.html
│   ├── main.ts
│   └── global.scss
├── capacitor.config.ts       # Capacitor configuration
├── ionic.config.json         # Ionic configuration
├── angular.json              # Angular configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Features Implementation Status

- ✅ Authentication (Google Sign-In)
- ✅ Trip Management (Create, Read, Update, Delete)
- ✅ Place Management
- ✅ Expense Tracking
- ✅ AI Trip Suggestions
- ✅ Photo Upload & Storage
- ✅ Maps Integration
- ✅ Route Planning
- ✅ Visit Tracking
- ✅ Clean UI/UX Design
- ✅ Cross-platform Support

## Building for Production

### Web
```bash
ionic build --prod
```

### iOS
```bash
ionic build --prod
ionic cap copy ios
ionic cap open ios
# Build in Xcode
```

### Android
```bash
ionic build --prod
ionic cap copy android
ionic cap open android
# Build in Android Studio
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@guideme-travel.com or open an issue in the repository.

## Acknowledgments

- Ionic Framework
- Angular
- Firebase
- Google Maps
- OpenAI
- Capacitor

---

Made with ❤️ for travelers worldwide
