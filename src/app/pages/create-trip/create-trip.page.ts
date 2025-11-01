import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonItem, IonLabel, IonInput, IonTextarea, IonDatetime, IonSelect,
  IonSelectOption, IonButtons, IonBackButton, IonList, IonCard
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, sparklesOutline } from 'ionicons/icons';
import { TripService } from '../../services/trip.service';
import { AiService } from '../../services/ai.service';
import { AuthService } from '../../services/auth.service';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.page.html',
  styleUrls: ['./create-trip.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonItem, IonLabel, IonInput, IonTextarea,
    IonDatetime, IonSelect, IonSelectOption, IonButtons, IonBackButton, IonList, IonCard
  ]
})
export class CreateTripPage {
  trip = {
    name: '',
    destination: '',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    budget: 0,
    description: '',
    interests: [] as string[]
  };

  interests = [
    'Adventure', 'Nature', 'Culture', 'Food', 'Shopping', 
    'Beaches', 'Mountains', 'History', 'Art', 'Nightlife'
  ];

  isLoading = false;
  isGeneratingAI = false;
  currentUserId = '';

  constructor(
    private tripService: TripService,
    private aiService: AiService,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ saveOutline, sparklesOutline });
    
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  toggleInterest(interest: string) {
    const index = this.trip.interests.indexOf(interest);
    if (index > -1) {
      this.trip.interests.splice(index, 1);
    } else {
      this.trip.interests.push(interest);
    }
  }

  isInterestSelected(interest: string): boolean {
    return this.trip.interests.includes(interest);
  }

  async generateAISuggestions() {
    if (!this.trip.destination) {
      alert('Please enter a destination first');
      return;
    }

    this.isGeneratingAI = true;
    try {
      const days = this.getDaysBetweenDates();
      
      // Generate trip description
      if (!this.trip.description) {
        const description = await this.aiService.generateTripDescription(
          this.trip.destination, 
          []
        ).toPromise();
        if (description) {
          this.trip.description = description;
        }
      }

      // Suggest budget
      if (!this.trip.budget) {
        const budget = await this.aiService.getBudgetSuggestion(
          this.trip.destination, 
          days, 
          1
        ).toPromise();
        if (budget) {
          this.trip.budget = budget;
        }
      }

      alert('AI suggestions generated successfully!');
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      alert('Failed to generate AI suggestions');
    } finally {
      this.isGeneratingAI = false;
    }
  }

  getDaysBetweenDates(): number {
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  async saveTrip() {
    if (!this.trip.name || !this.trip.destination) {
      alert('Please fill in all required fields');
      return;
    }

    if (!this.currentUserId) {
      alert('User not authenticated');
      return;
    }

    this.isLoading = true;
    try {
      const tripData: Omit<Trip, 'id'> = {
        userId: this.currentUserId,
        name: this.trip.name,
        destination: this.trip.destination,
        startDate: new Date(this.trip.startDate),
        endDate: new Date(this.trip.endDate),
        budget: this.trip.budget,
        totalExpenses: 0,
        status: 'planned',
        description: this.trip.description,
        places: [],
        expenses: [],
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const tripId = await this.tripService.createTrip(tripData);
      this.router.navigate(['/trip', tripId]);
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip');
    } finally {
      this.isLoading = false;
    }
  }
}
