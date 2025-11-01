import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonSegment, IonSegmentButton, IonLabel, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonIcon, IonButton, IonFab, IonFabButton, IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, mapOutline, walletOutline, cameraOutline, checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { TripService } from '../../services/trip.service';
import { Trip, Place, Expense } from '../../models/trip.model';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.page.html',
  styleUrls: ['./trip-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonSegment, IonSegmentButton, IonLabel, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonButton,
    IonFab, IonFabButton, IonChip
  ]
})
export class TripDetailPage implements OnInit {
  tripId = '';
  trip: Trip | null = null;
  places: Place[] = [];
  expenses: Expense[] = [];
  segment = 'overview';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService
  ) {
    addIcons({ addOutline, mapOutline, walletOutline, cameraOutline, checkmarkCircle, ellipseOutline });
  }

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTripData();
  }

  async loadTripData() {
    if (!this.tripId) return;

    this.tripService.getTrip(this.tripId).subscribe(trip => {
      this.trip = trip;
    });

    this.tripService.getPlaces(this.tripId).subscribe(places => {
      this.places = places;
    });

    this.tripService.getExpenses(this.tripId).subscribe(expenses => {
      this.expenses = expenses;
    });
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  getVisitedCount(): number {
    return this.places.filter(p => p.visited).length;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  async togglePlaceVisited(place: Place) {
    await this.tripService.markPlaceAsVisited(this.tripId, place.id);
    this.loadTripData();
  }
}
