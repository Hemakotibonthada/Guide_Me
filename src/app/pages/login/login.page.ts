import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, 
  IonLabel, IonInput, IonText, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle, airplaneOutline, mailOutline, lockClosedOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonButton, IonIcon, IonCard, 
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
    IonItem, IonLabel, IonInput, IonText, IonSpinner
  ]
})
export class LoginPage {
  isSignUp = false;
  isLoading = false;
  errorMessage = '';
  
  // Form fields
  email = '';
  password = '';
  confirmPassword = '';
  displayName = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ logoGoogle, airplaneOutline, mailOutline, lockClosedOutline, personOutline });
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.clearForm();
  }

  clearForm() {
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.displayName = '';
    this.errorMessage = '';
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return false;
    }

    if (this.isSignUp) {
      if (!this.displayName) {
        this.errorMessage = 'Please enter your name.';
        return false;
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return false;
      }
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async signInWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      this.errorMessage = error.message || 'Failed to sign in with Google.';
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithEmail() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signInWithEmail(this.email, this.password);
      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      console.error('Sign-in error:', error);
      this.errorMessage = error.message || 'Failed to sign in.';
    } finally {
      this.isLoading = false;
    }
  }

  async signUpWithEmail() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signUpWithEmail(this.email, this.password, this.displayName);
      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      console.error('Sign-up error:', error);
      this.errorMessage = error.message || 'Failed to create account.';
    } finally {
      this.isLoading = false;
    }
  }

  async submitForm() {
    if (this.isSignUp) {
      await this.signUpWithEmail();
    } else {
      await this.signInWithEmail();
    }
  }
}
