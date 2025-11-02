import { Component, ElementRef, OnDestroy, OnInit, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonFab,
  IonFabButton,
  IonChip,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonSpinner,
  IonSearchbar,
  IonNote,
  IonListHeader,
  IonProgressBar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  mapOutline,
  walletOutline,
  cameraOutline,
  checkmarkCircle,
  ellipseOutline,
  sparklesOutline,
  navigateOutline,
  timeOutline,
  airplaneOutline,
  trainOutline,
  busOutline,
  boatOutline,
  carOutline,
  imagesOutline,
  analyticsOutline
} from 'ionicons/icons';
import { TripService } from '../../services/trip.service';
import { AiService } from '../../services/ai.service';
import { MapsService, PlaceResult } from '../../services/maps.service';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { Expense, Photo, Place, TravelSegment, Trip, AIRecommendation } from '../../models/trip.model';
import { Subscription, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Loader } from '@googlemaps/js-api-loader';

declare const google: any;

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.page.html',
  styleUrls: ['./trip-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonFab,
    IonFabButton,
    IonChip,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonSpinner,
    IonSearchbar,
    IonNote,
    IonListHeader,
    IonProgressBar
  ]
})
export class TripDetailPage implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  tripId = '';
  trip: Trip | null = null;
  places: Place[] = [];
  expenses: Expense[] = [];
  photos: Photo[] = [];
  travelSegments: TravelSegment[] = [];
  segment: 'overview' | 'itinerary' | 'expenses' | 'map' | 'memories' = 'overview';

  showAddPlaceModal = false;
  showAddExpenseModal = false;
  showAddTravelSegmentModal = false;
  showAddPhotoModal = false;

  newPlace = {
    name: '',
    address: '',
    type: '',
    rating: 4.5,
    estimatedDuration: 120,
    plannedDate: '',
    notes: '',
    aiSuggested: false,
    latitude: 0,
    longitude: 0,
    placeId: '',
    stayDurationMinutes: 0
  };

  newExpense = {
    description: '',
    amount: '' as number | string,
    currency: 'USD',
    category: 'transport',
    date: new Date().toISOString(),
    placeId: ''
  };

  travelSegmentForm = {
    type: 'flight',
    provider: '',
    departureLocation: '',
    arrivalLocation: '',
    departureTime: new Date().toISOString(),
    arrivalTime: new Date().toISOString(),
    bookingReference: '',
    seatNumber: '',
    notes: ''
  };

  photoForm = {
    caption: '',
    placeId: ''
  };

  pendingPhotoDataUrl: string | null = null;

  aiSuggestions: AIRecommendation[] = [];
  isLoadingAISuggestions = false;
  isOptimizing = false;
  aiErrorMessage = '';

  placeSearchResults: PlaceResult[] = [];
  placeSearchLoading = false;

  isSavingPlace = false;
  isSavingExpense = false;
  isSavingTravelSegment = false;
  isUploadingPhoto = false;

  currentUserId: string | null = null;

  private subscriptions: Subscription[] = [];
  readonly mapsEnabled = !!environment.googleMapsApiKey && !environment.googleMapsApiKey.toLowerCase().includes('your');
  private readonly mapsLoader?: Loader;
  private map?: any;
  private infoWindow?: any;
  private mapMarkers: any[] = [];
  private routePolyline?: any;
  private mapInitialized = false;
  private mapCenter?: { lat: number; lng: number };
  private destinationGeocoded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private mapsService: MapsService,
    private aiService: AiService,
    private storageService: StorageService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    addIcons({
      addOutline,
      mapOutline,
      walletOutline,
      cameraOutline,
      checkmarkCircle,
      ellipseOutline,
      sparklesOutline,
      navigateOutline,
      timeOutline,
      airplaneOutline,
      trainOutline,
      busOutline,
      boatOutline,
      carOutline,
      imagesOutline,
      analyticsOutline
    });

    if (this.mapsEnabled) {
      this.mapsLoader = new Loader({
        apiKey: environment.googleMapsApiKey,
        libraries: ['places']
      });
    }

    this.subscriptions.push(
      this.authService.getCurrentUser().subscribe(user => {
        this.currentUserId = user?.uid || null;
      })
    );
  }

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.tripId) {
      this.router.navigate(['/tabs/home']);
      return;
    }

    this.subscriptions.push(
      this.tripService.getTrip(this.tripId).subscribe(trip => {
        this.trip = trip;
        if (trip && this.mapsEnabled && !this.destinationGeocoded) {
          this.loadDestinationCoordinates(trip.destination);
        }
      })
    );

    this.subscriptions.push(
      this.tripService.getPlaces(this.tripId).subscribe(places => {
        this.places = places;
        if (this.mapInitialized) {
          this.updateMapMarkers();
        }
      })
    );

    this.subscriptions.push(
      this.tripService.getExpenses(this.tripId).subscribe(expenses => {
        this.expenses = expenses;
      })
    );

    this.subscriptions.push(
      this.tripService.getPhotos(this.tripId).subscribe(photos => {
        this.photos = photos;
        if (this.mapInitialized) {
          this.updateMapMarkers();
        }
      })
    );

    this.subscriptions.push(
      this.tripService.getTravelSegments(this.tripId).subscribe(segments => {
        this.travelSegments = segments;
      })
    );
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
    if (this.segment === 'map') {
      this.initializeMap();
    }
  }

  getVisitedCount(): number {
    return this.places.filter(p => p.visited).length;
  }

  formatDate(date?: Date | string | null): string {
    const resolved = this.resolveDate(date);
    return resolved.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatDateTime(date?: Date | string | null): string {
    const resolved = this.resolveDate(date);
    return resolved.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getVisitedDate(place: Place): Date {
    return this.resolveDate(place.visitedDate || place.plannedDate || this.trip?.endDate || null);
  }

  private resolveDate(value?: Date | string | null): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' && value) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }

  get budgetProgress(): number {
    if (!this.trip || !this.trip.budget) {
      return 0;
    }
    const value = (this.trip.totalExpenses / this.trip.budget) * 100;
    return Math.min(100, Math.round(value));
  }

  get unvisitedPlaces(): Place[] {
    return this.places.filter(place => !place.visited);
  }

  get visitedPlaces(): Place[] {
    return this.places.filter(place => place.visited);
  }

  async togglePlaceVisited(place: Place) {
    try {
      await this.tripService.togglePlaceVisited(this.tripId, place.id, !place.visited);
    } catch (error) {
      console.error('Failed to toggle place visited state', error);
      alert('Unable to update the place right now. Please try again.');
    }
  }

  openAddPlaceModal() {
    this.resetPlaceForm();
    this.showAddPlaceModal = true;
  }

  closeAddPlaceModal() {
    this.showAddPlaceModal = false;
    this.placeSearchResults = [];
  }

  async searchPlaces(event: CustomEvent) {
    const query = (event.detail.value || '').trim();
    if (query.length < 3) {
      this.placeSearchResults = [];
      return;
    }

    this.placeSearchLoading = true;
    try {
      const location = this.mapCenter ? { lat: this.mapCenter.lat, lng: this.mapCenter.lng } : undefined;
      this.placeSearchResults = await firstValueFrom(this.mapsService.searchPlaces(query, location));
    } catch (error) {
      console.error('Place search failed', error);
      this.placeSearchResults = [];
    } finally {
      this.placeSearchLoading = false;
    }
  }

  selectPlaceResult(result: PlaceResult) {
    this.newPlace = {
      ...this.newPlace,
      name: result.name,
      address: result.address,
      latitude: result.latitude,
      longitude: result.longitude,
      placeId: result.placeId,
      type: result.types?.[0] || 'point_of_interest',
      rating: result.rating || 4.5
    };
    this.placeSearchResults = [];
  }

  async savePlace() {
    if (!this.newPlace.name || !this.newPlace.address) {
      alert('Please provide a name and address for the place.');
      return;
    }

    this.isSavingPlace = true;
    try {
      await this.tripService.addPlace(this.tripId, {
        name: this.newPlace.name,
        address: this.newPlace.address,
        latitude: this.newPlace.latitude,
        longitude: this.newPlace.longitude,
        placeId: this.newPlace.placeId,
        type: this.newPlace.type || 'point_of_interest',
        rating: this.newPlace.rating || 0,
        userRating: undefined,
        visited: false,
        plannedDate: this.newPlace.plannedDate ? new Date(this.newPlace.plannedDate) : undefined,
        visitedDate: undefined,
        estimatedDuration: Number(this.newPlace.estimatedDuration) || 60,
        notes: this.newPlace.notes || undefined,
        photos: [],
        aiSuggested: this.newPlace.aiSuggested,
        stayDurationMinutes: this.newPlace.stayDurationMinutes ? Number(this.newPlace.stayDurationMinutes) : undefined,
        sortOrder: Date.now()
      });
      this.closeAddPlaceModal();
    } catch (error) {
      console.error('Failed to add place', error);
      alert('Unable to save the place. Please try again.');
    } finally {
      this.isSavingPlace = false;
    }
  }

  openAddExpenseModal() {
    this.newExpense = {
      description: '',
      amount: '',
      currency: 'USD',
      category: 'transport',
      date: new Date().toISOString(),
      placeId: ''
    };
    this.showAddExpenseModal = true;
  }

  async saveExpense() {
    const amountValue = typeof this.newExpense.amount === 'string'
      ? parseFloat(this.newExpense.amount)
      : this.newExpense.amount;

    if (!this.newExpense.description || !amountValue || amountValue <= 0) {
      alert('Please enter a valid expense description and amount.');
      return;
    }

    this.isSavingExpense = true;
    try {
      await this.tripService.addExpense(this.tripId, {
        description: this.newExpense.description,
        amount: amountValue,
        currency: this.newExpense.currency,
        category: this.newExpense.category as Expense['category'],
        date: new Date(this.newExpense.date),
        placeId: this.newExpense.placeId || undefined,
        receipt: undefined
      });
      this.showAddExpenseModal = false;
    } catch (error) {
      console.error('Failed to add expense', error);
      alert('Unable to save the expense. Please try again.');
    } finally {
      this.isSavingExpense = false;
    }
  }

  openAddTravelSegmentModal() {
    this.travelSegmentForm = {
      type: this.travelSegmentForm.type,
      provider: '',
      departureLocation: '',
      arrivalLocation: '',
      departureTime: new Date().toISOString(),
      arrivalTime: new Date().toISOString(),
      bookingReference: '',
      seatNumber: '',
      notes: ''
    };
    this.showAddTravelSegmentModal = true;
  }

  async saveTravelSegment() {
    if (!this.travelSegmentForm.departureLocation || !this.travelSegmentForm.arrivalLocation) {
      alert('Please provide both departure and arrival locations.');
      return;
    }

    this.isSavingTravelSegment = true;
    try {
      await this.tripService.addTravelSegment(this.tripId, {
        type: this.travelSegmentForm.type as TravelSegment['type'],
        provider: this.travelSegmentForm.provider,
        departureLocation: this.travelSegmentForm.departureLocation,
        arrivalLocation: this.travelSegmentForm.arrivalLocation,
        departureTime: new Date(this.travelSegmentForm.departureTime),
        arrivalTime: new Date(this.travelSegmentForm.arrivalTime),
        bookingReference: this.travelSegmentForm.bookingReference || undefined,
        seatNumber: this.travelSegmentForm.seatNumber || undefined,
        notes: this.travelSegmentForm.notes || undefined
      });
      this.showAddTravelSegmentModal = false;
    } catch (error) {
      console.error('Failed to add travel segment', error);
      alert('Unable to save the travel segment. Please try again.');
    } finally {
      this.isSavingTravelSegment = false;
    }
  }

  async removeTravelSegment(segment: TravelSegment) {
    if (!confirm('Remove this travel segment?')) {
      return;
    }

    try {
      await this.tripService.deleteTravelSegment(this.tripId, segment.id);
    } catch (error) {
      console.error('Failed to delete travel segment', error);
      alert('Unable to remove the travel segment.');
    }
  }

  async generateAISuggestions() {
    if (!this.trip) {
      return;
    }

    this.isLoadingAISuggestions = true;
    this.aiErrorMessage = '';
    try {
      const duration = Math.max(1, Math.ceil((this.trip.endDate.getTime() - this.trip.startDate.getTime()) / (1000 * 60 * 60 * 24)));
      this.aiSuggestions = await firstValueFrom(
        this.aiService.generateTripSuggestions(this.trip.destination, duration, this.trip.interests || [])
      );
    } catch (error) {
      console.error('AI suggestion error', error);
      this.aiErrorMessage = 'Unable to fetch AI suggestions right now. Please try again later.';
      this.aiSuggestions = [];
    } finally {
      this.isLoadingAISuggestions = false;
    }
  }

  async addSuggestionToItinerary(suggestion: AIRecommendation) {
    if (!this.trip) {
      return;
    }

    const suggestionName = suggestion.content;
    let placeResult: PlaceResult | undefined;

    try {
      const query = `${suggestionName} ${this.trip.destination}`;
      const results = await firstValueFrom(this.mapsService.searchPlaces(query, this.mapCenter));
      placeResult = results[0];
    } catch (error) {
      console.warn('Could not match AI suggestion to a map result', error);
    }

    try {
      await this.tripService.addPlace(this.tripId, {
        name: suggestionName,
        address: placeResult?.address || this.trip.destination,
        latitude: placeResult?.latitude || 0,
        longitude: placeResult?.longitude || 0,
        placeId: placeResult?.placeId,
        type: placeResult?.types?.[0] || 'point_of_interest',
        rating: placeResult?.rating || suggestion.data?.rating || 0,
        userRating: undefined,
        visited: false,
        plannedDate: undefined,
        visitedDate: undefined,
        estimatedDuration: suggestion.data?.estimatedDuration || 90,
        notes: suggestion.data?.description || undefined,
        photos: [],
        aiSuggested: true,
        stayDurationMinutes: suggestion.data?.estimatedDuration || undefined,
        sortOrder: Date.now()
      });
      alert(`${suggestionName} added to your itinerary.`);
    } catch (error) {
      console.error('Failed to save AI suggestion', error);
      alert('Unable to add this AI suggestion to the itinerary.');
    }
  }

  async optimizeItineraryOrder() {
    if (!this.trip || this.places.length < 2) {
      return;
    }

    this.isOptimizing = true;
    try {
      const optimized = await firstValueFrom(
        this.aiService.optimizeItinerary(this.places, this.trip.startDate, this.trip.endDate)
      );

      const baseOrder = Date.now();
      await Promise.all(
        optimized.map((place, index) =>
          this.tripService.updatePlace(this.tripId, place.id, { sortOrder: baseOrder + index })
        )
      );
      alert('Itinerary optimized successfully.');
    } catch (error) {
      console.error('Failed to optimize itinerary', error);
      alert('Unable to optimize the itinerary right now.');
    } finally {
      this.isOptimizing = false;
    }
  }

  getPhotosForPlace(placeId: string | undefined): Photo[] {
    if (!placeId) {
      return [];
    }
    return this.photos.filter(photo => photo.placeId === placeId);
  }

  getPlaceName(placeId: string | undefined): string {
    if (!placeId) {
      return 'General';
    }
    const place = this.places.find(p => p.id === placeId);
    return place ? place.name : 'General';
  }

  async captureMemory() {
    try {
      const dataUrl = await this.storageService.capturePhoto();
      this.openPhotoModal(dataUrl);
    } catch (error) {
      console.error('Camera error', error);
      alert('Unable to capture photo. Please try again.');
    }
  }

  async pickMemoryFromGallery() {
    try {
      const dataUrl = await this.storageService.selectPhoto();
      this.openPhotoModal(dataUrl);
    } catch (error) {
      console.error('Gallery error', error);
      alert('Unable to select a photo.');
    }
  }

  private openPhotoModal(dataUrl: string) {
    this.pendingPhotoDataUrl = dataUrl;
    this.photoForm = { caption: '', placeId: '' };
    this.showAddPhotoModal = true;
  }

  async savePhotoMemory() {
    if (!this.pendingPhotoDataUrl) {
      return;
    }

    const ownerId = this.trip?.userId || this.currentUserId;
    if (!ownerId) {
      alert('You must be signed in to upload memories.');
      return;
    }

    this.isUploadingPhoto = true;
    try {
      const uploaded = await this.storageService.uploadTripPhoto(ownerId, this.tripId, this.pendingPhotoDataUrl);
      await this.tripService.addPhoto(this.tripId, {
        url: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        caption: this.photoForm.caption || undefined,
        placeId: this.photoForm.placeId || undefined,
        latitude: undefined,
        longitude: undefined,
        takenAt: new Date(),
        uploadedAt: new Date()
      });

      this.showAddPhotoModal = false;
      this.pendingPhotoDataUrl = null;
      this.photoForm = { caption: '', placeId: '' };
    } catch (error) {
      console.error('Photo upload failed', error);
      alert('Unable to upload the photo at this time.');
    } finally {
      this.isUploadingPhoto = false;
    }
  }

  private resetPlaceForm() {
    this.newPlace = {
      name: '',
      address: '',
      type: '',
      rating: 4.5,
      estimatedDuration: 120,
      plannedDate: '',
      notes: '',
      aiSuggested: false,
      latitude: this.mapCenter?.lat || 0,
      longitude: this.mapCenter?.lng || 0,
      placeId: '',
      stayDurationMinutes: 0
    };
    this.placeSearchResults = [];
  }

  private async loadDestinationCoordinates(destination: string) {
    try {
      const coords = await firstValueFrom(this.mapsService.geocodeAddress(destination));
      if (coords) {
        this.destinationGeocoded = true;
        this.mapCenter = coords;
        if (this.mapInitialized && this.map) {
          this.map.setCenter(coords);
        }
      }
    } catch (error) {
      console.warn('Failed to geocode destination', error);
    }
  }

  private async initializeMap() {
    if (!this.mapsEnabled || this.mapInitialized || !this.mapContainer) {
      return;
    }

    try {
      await this.mapsLoader?.load();
      this.ngZone.runOutsideAngular(() => {
        const center = this.getInitialMapCenter();
        this.map = new google.maps.Map(this.mapContainer!.nativeElement, {
          center,
          zoom: 12,
          streetViewControl: false,
          mapTypeControl: false
        });
        this.mapInitialized = true;
        this.infoWindow = new google.maps.InfoWindow();
        this.updateMapMarkers();
      });
    } catch (error) {
      console.error('Map initialization failed', error);
    }
  }

  private getInitialMapCenter(): { lat: number; lng: number } {
    const placeWithCoords = this.places.find(place => this.hasValidCoordinates(place));
    if (placeWithCoords) {
      return { lat: placeWithCoords.latitude, lng: placeWithCoords.longitude };
    }
    if (this.mapCenter) {
      return this.mapCenter;
    }
    return { lat: 0, lng: 0 };
  }

  private hasValidCoordinates(place: Place): boolean {
    return !!place.latitude && !!place.longitude;
  }

  private updateMapMarkers() {
    if (!this.map) {
      return;
    }

    this.mapMarkers.forEach(marker => marker.setMap(null));
    this.mapMarkers = [];

    const validPlaces = this.places.filter(place => this.hasValidCoordinates(place));
    if (!validPlaces.length) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    validPlaces.forEach(place => {
      const position = { lat: place.latitude, lng: place.longitude };
      bounds.extend(position);
      const marker = new google.maps.Marker({
        position,
        map: this.map,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: place.visited ? '#10b981' : '#4F46E5',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => this.openMarkerInfo(marker, place));
      this.mapMarkers.push(marker);
    });

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, 60);
    }

    this.renderRoutePolyline(validPlaces);
  }

  private renderRoutePolyline(places: Place[]) {
    if (!this.map) {
      return;
    }

    const routePath = places
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(place => ({ lat: place.latitude, lng: place.longitude }));

    if (this.routePolyline) {
      this.routePolyline.setMap(null);
    }

    if (routePath.length < 2) {
      return;
    }

    this.routePolyline = new google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: '#4F46E5',
      strokeOpacity: 0.7,
      strokeWeight: 3
    });

    this.routePolyline.setMap(this.map);
  }

  private openMarkerInfo(marker: any, place: Place) {
    if (!this.infoWindow) {
      return;
    }

    const photos = this.getPhotosForPlace(place.id).slice(0, 3);
    const content = `
      <div class="map-info-window">
        <h3>${this.escapeHtml(place.name)}</h3>
        <p>${this.escapeHtml(place.address || this.trip?.destination || '')}</p>
        <p>Status: ${place.visited ? 'Visited' : 'Planned'}</p>
        ${photos.length ? `<div class="map-info-photos">${photos
          .map(photo => `<img src="${photo.thumbnailUrl}" alt="${this.escapeHtml(photo.caption || place.name)}" />`)
          .join('')}</div>` : ''}
      </div>
    `;

    this.infoWindow.setContent(content);
    this.infoWindow.open({ anchor: marker, map: this.map, shouldFocus: false });
  }

  private escapeHtml(value: string): string {
    return value
      ? value.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
      : '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.routePolyline) {
      this.routePolyline.setMap(null);
    }
    this.mapMarkers.forEach(marker => marker.setMap(null));
  }
}
