import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar,
  IonCard, IonCardContent, IonList, IonItem, IonLabel, IonIcon, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, settingsOutline, logOutOutline, helpCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/trip.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar,
    IonCard, IonCardContent, IonList, IonItem, IonLabel, IonIcon, IonButton
  ]
})
export class ProfilePage implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ personOutline, settingsOutline, logOutOutline, helpCircleOutline });
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  async signOut() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
