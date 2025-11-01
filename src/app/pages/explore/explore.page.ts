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
    { name: 'Paris, France', image: 'assets/destinations/paris.jpg' },
    { name: 'Tokyo, Japan', image: 'assets/destinations/tokyo.jpg' },
    { name: 'New York, USA', image: 'assets/destinations/newyork.jpg' },
    { name: 'Bali, Indonesia', image: 'assets/destinations/bali.jpg' },
    { name: 'Dubai, UAE', image: 'assets/destinations/dubai.jpg' },
    { name: 'Rome, Italy', image: 'assets/destinations/rome.jpg' }
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
