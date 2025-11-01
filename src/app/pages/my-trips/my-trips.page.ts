import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment,
  IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonChip, IonIcon, IonFab, IonFabButton, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, locationOutline } from 'ionicons/icons';
import { TripService } from '../../services/trip.service';
import { AuthService } from '../../services/auth.service';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-my-trips',
  templateUrl: './my-trips.page.html',
  styleUrls: ['./my-trips.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonSegment,
    IonSegmentButton, IonLabel, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonChip, IonIcon, IonFab, IonFabButton, IonButton
  ]
})
export class MyTripsPage implements OnInit {
  segment = 'upcoming';
  allTrips: Trip[] = [];
  filteredTrips: Trip[] = [];
  currentUserId = '';

  constructor(
    private tripService: TripService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ addOutline, locationOutline });
  }

  ngOnInit() {
    this.loadTrips();
  }

  ionViewWillEnter() {
    this.loadTrips();
  }

  async loadTrips() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.tripService.getUserTrips(user.uid).subscribe(trips => {
          this.allTrips = trips;
          this.filterTrips();
        });
      }
    });
  }

  filterTrips() {
    const now = new Date();
    switch (this.segment) {
      case 'upcoming':
        this.filteredTrips = this.allTrips.filter(t => 
          t.status === 'planned' && new Date(t.startDate) > now
        );
        break;
      case 'ongoing':
        this.filteredTrips = this.allTrips.filter(t => 
          t.status === 'ongoing' ||
          (new Date(t.startDate) <= now && new Date(t.endDate) >= now)
        );
        break;
      case 'completed':
        this.filteredTrips = this.allTrips.filter(t => 
          t.status === 'completed' || new Date(t.endDate) < now
        );
        break;
    }
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
    this.filterTrips();
  }

  viewTrip(tripId: string) {
    this.router.navigate(['/trip', tripId]);
  }

  createTrip() {
    this.router.navigate(['/create-trip']);
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
