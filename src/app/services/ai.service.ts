import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AIRecommendation, Trip, Place } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  generateTripSuggestions(destination: string, duration: number, interests: string[]): Observable<AIRecommendation[]> {
    const prompt = `You are a travel expert AI. Suggest top places to visit in ${destination} for a ${duration}-day trip. 
    User interests: ${interests.join(', ')}. 
    Provide 10 must-visit places with brief descriptions. Format as JSON array with fields: name, description, estimatedDuration (in minutes), type, rating (1-5).`;

    return this.callOpenAI(prompt).pipe(
      map(response => this.parseRecommendations(response)),
      catchError(error => {
        console.error('AI Error:', error);
        return of([]);
      })
    );
  }

  optimizeItinerary(places: Place[], startDate: Date, endDate: Date): Observable<Place[]> {
    const placesInfo = places.map(p => ({
      name: p.name,
      duration: p.estimatedDuration,
      lat: p.latitude,
      lng: p.longitude
    }));

    const prompt = `You are a travel planning AI. Optimize this itinerary for maximum efficiency.
    Places: ${JSON.stringify(placesInfo)}
    Trip duration: ${startDate.toISOString()} to ${endDate.toISOString()}
    Consider: travel time between locations, opening hours, and logical grouping.
    Return the places in optimal visit order as JSON array with place names.`;

    return this.callOpenAI(prompt).pipe(
      map(response => this.reorderPlaces(places, response)),
      catchError(() => of(places))
    );
  }

  generateTripDescription(destination: string, places: string[]): Observable<string> {
    const prompt = `Write a compelling 2-3 sentence trip description for a vacation to ${destination} 
    visiting: ${places.join(', ')}. Make it exciting and informative.`;

    return this.callOpenAI(prompt).pipe(
      map(response => this.extractText(response)),
      catchError(() => of('An amazing trip awaits!'))
    );
  }

  getBudgetSuggestion(destination: string, duration: number, travelers: number): Observable<number> {
    const prompt = `Estimate a reasonable budget in USD for ${travelers} traveler(s) 
    visiting ${destination} for ${duration} days. Include accommodation, food, transport, and activities. 
    Return only the number.`;

    return this.callOpenAI(prompt).pipe(
      map(response => {
        const match = response.match(/\d+/);
        return match ? parseInt(match[0]) : 1000;
      }),
      catchError(() => of(1000))
    );
  }

  getTravelTips(destination: string): Observable<string[]> {
    const prompt = `Provide 5 essential travel tips for visiting ${destination}. 
    Format as JSON array of strings.`;

    return this.callOpenAI(prompt).pipe(
      map(response => this.parseArray(response)),
      catchError(() => of([]))
    );
  }

  private callOpenAI(prompt: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openAiApiKey}`
    });

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful travel planning assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => response.choices[0].message.content)
    );
  }

  private parseRecommendations(response: string): AIRecommendation[] {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed.map((item: any) => ({
        type: 'place',
        content: item.name,
        data: item,
        confidence: 0.8
      })) : [];
    } catch {
      return [];
    }
  }

  private reorderPlaces(places: Place[], response: string): Place[] {
    try {
      const order = JSON.parse(response);
      if (!Array.isArray(order)) return places;
      
      const ordered: Place[] = [];
      order.forEach((name: string) => {
        const place = places.find(p => p.name === name);
        if (place) ordered.push(place);
      });
      
      // Add any missing places
      places.forEach(p => {
        if (!ordered.find(op => op.id === p.id)) {
          ordered.push(p);
        }
      });
      
      return ordered;
    } catch {
      return places;
    }
  }

  private extractText(response: string): string {
    return response.trim();
  }

  private parseArray(response: string): string[] {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return response.split('\n').filter(line => line.trim());
    }
  }
}
