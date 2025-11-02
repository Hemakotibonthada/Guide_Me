import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, locationOutline } from 'ionicons/icons';
import { MapsService } from '../../services/maps.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonIcon
  ]
})
export class ExplorePage {
  searchQuery = '';
  places: any[] = [];
  popularDestinations = [
    { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' },
    { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop' },
    { name: 'New York, USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
    { name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop' },
    { name: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop' },
    { name: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop' }
  ];

  constructor(private mapsService: MapsService) {
    addIcons({ searchOutline, locationOutline });
  }

  async searchPlaces(event: any) {
    const query = event.target.value;
    if (query && query.length > 2) {
      this.mapsService.searchPlaces(query).subscribe(places => {
        this.places = places;
      });
    } else {
      this.places = [];
    }
  }
}
