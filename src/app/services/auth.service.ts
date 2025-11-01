import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  user, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { User } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  user$ = user(this.auth);
  currentUser$: Observable<User | null>;

  constructor() {
    this.currentUser$ = this.user$.pipe(
      switchMap(firebaseUser => {
        if (!firebaseUser) {
          return of(null);
        }
        return this.getUserProfile(firebaseUser.uid);
      }),
      catchError(() => of(null))
    );
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = credential.user;
      
      // Update display name
      await updateProfile(firebaseUser, { displayName });
      
      // Create user profile
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: displayName,
        photoURL: '',
        createdAt: new Date()
      };
      
      await this.createOrUpdateUserProfile(user);
      return user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw this.handleAuthError(error);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = credential.user;
      
      // Get or create user profile
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date()
      };
      
      await this.createOrUpdateUserProfile(user);
      return user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(this.auth, provider);
      const firebaseUser = result.user;
      
      // Create or update user profile
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        createdAt: new Date()
      };
      
      await this.createOrUpdateUserProfile(user);
      return user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw this.handleAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw this.handleAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  private async createOrUpdateUserProfile(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, user);
    } else {
      await setDoc(userRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email
      }, { merge: true });
    }
  }

  private getUserProfile(uid: string): Observable<User | null> {
    return from(getDoc(doc(this.firestore, `users/${uid}`))).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as User;
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$;
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  private handleAuthError(error: any): Error {
    let message = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address.';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operation not allowed.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Use at least 6 characters.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password.';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid email or password.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign-in popup was closed.';
        break;
      default:
        message = error.message || message;
    }
    
    return new Error(message);
  }
}
