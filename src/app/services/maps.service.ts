import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  types: string[];
  photos?: string[];
}

export interface RouteResult {
  distance: number;
  duration: number;
  polyline: string;
  steps: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private apiKey = environment.googleMapsApiKey;

  constructor(private http: HttpClient) {}

  searchNearbyPlaces(latitude: number, longitude: number, type: string = 'tourist_attraction', radius: number = 5000): Observable<PlaceResult[]> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.results) {
          return response.results.map((place: any) => this.mapPlaceResult(place));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error searching places:', error);
        return [];
      })
    );
  }

  getPlaceDetails(placeId: string): Observable<PlaceResult | null> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,types,photos&key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.result) {
          return this.mapPlaceResult(response.result);
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  searchPlaces(query: string, location?: { lat: number, lng: number }): Observable<PlaceResult[]> {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}`;
    
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=50000`;
    }
    
    url += `&key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.results) {
          return response.results.map((place: any) => this.mapPlaceResult(place));
        }
        return [];
      }),
      catchError(() => [])
    );
  }

  getDirections(origin: { lat: number, lng: number }, destination: { lat: number, lng: number }, mode: string = 'driving'): Observable<RouteResult | null> {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${mode}&key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.routes && response.routes.length > 0) {
          const route = response.routes[0];
          const leg = route.legs[0];
          
          return {
            distance: leg.distance.value,
            duration: leg.duration.value,
            polyline: route.overview_polyline.points,
            steps: leg.steps
          };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  geocodeAddress(address: string): Observable<{ lat: number, lng: number } | null> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.results && response.results.length > 0) {
          const location = response.results[0].geometry.location;
          return { lat: location.lat, lng: location.lng };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  private mapPlaceResult(place: any): PlaceResult {
    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity || '',
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating || 0,
      types: place.types || [],
      photos: place.photos ? place.photos.map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`
      ) : []
    };
  }
}
