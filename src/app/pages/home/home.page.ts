import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonChip, IonLabel, IonFab, IonFabButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, airplaneOutline, walletOutline, cameraOutline, mapOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { TripService } from '../../services/trip.service';
import { Trip, User } from '../../models/trip.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonChip, IonLabel, IonFab, IonFabButton
  ]
})
export class HomePage implements OnInit {
  currentUser: User | null = null;
  upcomingTrips: Trip[] = [];
  ongoingTrips: Trip[] = [];
  stats = {
    totalTrips: 0,
    totalExpenses: 0,
    placesVisited: 0,
    photosUploaded: 0
  };

  constructor(
    private authService: AuthService,
    private tripService: TripService,
    private router: Router
  ) {
    addIcons({ addOutline, airplaneOutline, walletOutline, cameraOutline, mapOutline });
  }

  ngOnInit() {
    this.loadUserData();
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  async loadUserData() {
    this.authService.getCurrentUser().subscribe(async user => {
      if (user) {
        this.currentUser = user;
        await this.loadTrips();
        this.calculateStats();
      }
    });
  }

  async loadTrips() {
    if (!this.currentUser) return;

    this.tripService.getUserTrips(this.currentUser.uid).subscribe(trips => {
      const now = new Date();
      this.upcomingTrips = trips.filter(t => 
        t.status === 'planned' && new Date(t.startDate) > now
      ).slice(0, 3);
      
      this.ongoingTrips = trips.filter(t => 
        t.status === 'ongoing' || 
        (new Date(t.startDate) <= now && new Date(t.endDate) >= now)
      );
    });
  }

  calculateStats() {
    if (!this.currentUser) return;

    this.tripService.getUserTrips(this.currentUser.uid).subscribe(trips => {
      this.stats.totalTrips = trips.length;
      this.stats.totalExpenses = trips.reduce((sum, trip) => sum + (trip.totalExpenses || 0), 0);
      this.stats.placesVisited = trips.reduce((sum, trip) => 
        sum + trip.places.filter(p => p.visited).length, 0
      );
      this.stats.photosUploaded = trips.reduce((sum, trip) => 
        sum + (trip.photos?.length || 0), 0
      );
    });
  }

  createTrip() {
    this.router.navigate(['/create-trip']);
  }

  viewTrip(tripId: string) {
    this.router.navigate(['/trip', tripId]);
  }

  viewAllTrips() {
    this.router.navigate(['/my-trips']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTripDuration(trip: Trip): string {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}
