import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { Observable, catchError, map, of } from 'rxjs';
import { Expense, Photo, Place, TravelSegment, Trip } from '../models/trip.model';
import { increment } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private firestore = inject(Firestore);

  // Trip CRUD Operations
  async createTrip(trip: Omit<Trip, 'id'>): Promise<string> {
    const tripsRef = collection(this.firestore, 'trips');
    const now = Timestamp.now();
    const payload = this.cleanPayload({
      userId: trip.userId,
      name: trip.name,
      destination: trip.destination,
      startDate: this.toTimestamp(trip.startDate),
      endDate: this.toTimestamp(trip.endDate),
      budget: trip.budget ?? 0,
      totalExpenses: trip.totalExpenses ?? 0,
      status: trip.status || 'planned',
      coverImage: trip.coverImage || null,
      description: trip.description || null,
      interests: trip.interests || [],
      aiSummary: trip.aiSummary || null,
      placesCount: trip.placesCount ?? 0,
      visitedPlacesCount: trip.visitedPlacesCount ?? 0,
      expensesCount: trip.expensesCount ?? 0,
      photosCount: trip.photosCount ?? 0,
      travelSegmentsCount: trip.travelSegmentsCount ?? 0,
      createdAt: trip.createdAt ? this.toTimestamp(trip.createdAt) : now,
      updatedAt: trip.updatedAt ? this.toTimestamp(trip.updatedAt) : now
    });

    const docRef = await addDoc(tripsRef, payload);
    return docRef.id;
  }

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
    const tripRef = this.getTripRef(tripId);
    const payload: Record<string, any> = this.cleanPayload({ ...updates } as Record<string, any>);

    if (updates.startDate) {
      payload['startDate'] = this.toTimestamp(updates.startDate);
    }

    if (updates.endDate) {
      payload['endDate'] = this.toTimestamp(updates.endDate);
    }

    delete payload['createdAt'];
    delete payload['id'];
    payload['updatedAt'] = Timestamp.now();

    await updateDoc(tripRef, payload);
  }

  async deleteTrip(tripId: string): Promise<void> {
    const tripRef = this.getTripRef(tripId);
    await deleteDoc(tripRef);
  }

  getTrip(tripId: string): Observable<Trip | null> {
    const tripRef = this.getTripRef(tripId);
    return docData(tripRef, { idField: 'id' }).pipe(
      map(data => (data ? this.deserializeTrip(data) : null)),
      catchError(() => of(null))
    );
  }

  getUserTrips(userId: string): Observable<Trip[]> {
    const tripsRef = collection(this.firestore, 'trips');
    const q = query(
      tripsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(snapshot => snapshot.map(item => this.deserializeTrip(item))),
      catchError(() => of([]))
    );
  }

  // Place Operations
  async addPlace(tripId: string, place: Omit<Place, 'id' | 'tripId'>): Promise<string> {
    const placesRef = collection(this.firestore, `trips/${tripId}/places`);
    const payload = this.cleanPayload({
      ...place,
      tripId,
      visited: place.visited ?? false,
      aiSuggested: place.aiSuggested ?? false,
      estimatedDuration: place.estimatedDuration ?? 60,
      sortOrder: place.sortOrder ?? Date.now(),
      plannedDate: this.toTimestamp(place.plannedDate),
      visitedDate: this.toTimestamp(place.visitedDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    const docRef = await addDoc(placesRef, payload);
    await updateDoc(this.getTripRef(tripId), {
      placesCount: increment(1),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  }

  async updatePlace(tripId: string, placeId: string, updates: Partial<Place>): Promise<void> {
    const placeRef = doc(this.firestore, `trips/${tripId}/places/${placeId}`);
    const payload: Record<string, any> = this.cleanPayload({ ...updates } as Record<string, any>);

    if (updates.plannedDate) {
      payload['plannedDate'] = this.toTimestamp(updates.plannedDate);
    }

    if (updates.visitedDate) {
      payload['visitedDate'] = this.toTimestamp(updates.visitedDate);
    }

    payload['updatedAt'] = Timestamp.now();
    await updateDoc(placeRef, payload);
  }

  async togglePlaceVisited(tripId: string, placeId: string, visited: boolean): Promise<void> {
    const placeRef = doc(this.firestore, `trips/${tripId}/places/${placeId}`);
    const placeSnap = await getDoc(placeRef);

    if (!placeSnap.exists()) {
      return;
    }

  const data = placeSnap.data();
  const wasVisited = !!data?.['visited'];

    if (wasVisited === visited) {
      return;
    }

    await updateDoc(placeRef, {
      visited,
      visitedDate: visited ? Timestamp.now() : null,
      updatedAt: Timestamp.now()
    });

    await updateDoc(this.getTripRef(tripId), {
      visitedPlacesCount: increment(visited ? 1 : -1),
      updatedAt: Timestamp.now()
    });
  }

  async deletePlace(tripId: string, placeId: string): Promise<void> {
    const placeRef = doc(this.firestore, `trips/${tripId}/places/${placeId}`);
    const placeSnap = await getDoc(placeRef);

    if (!placeSnap.exists()) {
      return;
    }

  const placeData = placeSnap.data();
  const wasVisited = !!placeData?.['visited'];

    await deleteDoc(placeRef);

    const updates: Record<string, any> = {
      placesCount: increment(-1),
      updatedAt: Timestamp.now()
    };

    if (wasVisited) {
      updates['visitedPlacesCount'] = increment(-1);
    }

    await updateDoc(this.getTripRef(tripId), updates);
  }

  getPlaces(tripId: string): Observable<Place[]> {
    const placesRef = collection(this.firestore, `trips/${tripId}/places`);
  const q = query(placesRef, orderBy('visited', 'asc'), orderBy('sortOrder', 'asc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(snapshot => snapshot.map(item => this.deserializePlace(item))),
      catchError(() => of([]))
    );
  }

  // Expense Operations
  async addExpense(tripId: string, expense: Omit<Expense, 'id' | 'tripId'>): Promise<string> {
    const expensesRef = collection(this.firestore, `trips/${tripId}/expenses`);
    const payload = this.cleanPayload({
      ...expense,
      tripId,
      date: this.toTimestamp(expense.date) ?? Timestamp.now(),
      createdAt: Timestamp.now()
    });

    const docRef = await addDoc(expensesRef, payload);
    await this.updateTripExpenses(tripId);
    await updateDoc(this.getTripRef(tripId), {
      expensesCount: increment(1),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  }

  async deleteExpense(tripId: string, expenseId: string): Promise<void> {
    const expenseRef = doc(this.firestore, `trips/${tripId}/expenses/${expenseId}`);
    await deleteDoc(expenseRef);
    await this.updateTripExpenses(tripId);
    await updateDoc(this.getTripRef(tripId), {
      expensesCount: increment(-1),
      updatedAt: Timestamp.now()
    });
  }

  private async updateTripExpenses(tripId: string): Promise<void> {
    const expenses = await this.getExpensesSnapshot(tripId);
    const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    await updateDoc(this.getTripRef(tripId), {
      totalExpenses: Math.round(total * 100) / 100,
      updatedAt: Timestamp.now()
    });
  }

  private async getExpensesSnapshot(tripId: string): Promise<Expense[]> {
    const expensesRef = collection(this.firestore, `trips/${tripId}/expenses`);
    const snapshot = await getDocs(expensesRef);
    return snapshot.docs.map(docSnap => this.deserializeExpense({ id: docSnap.id, ...docSnap.data() }));
  }

  getExpenses(tripId: string): Observable<Expense[]> {
    const expensesRef = collection(this.firestore, `trips/${tripId}/expenses`);
    const q = query(expensesRef, orderBy('date', 'desc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(snapshot => snapshot.map(item => this.deserializeExpense(item))),
      catchError(() => of([]))
    );
  }

  // Photo Operations
  async addPhoto(tripId: string, photo: Omit<Photo, 'id' | 'tripId'>): Promise<string> {
    const photosRef = collection(this.firestore, `trips/${tripId}/photos`);
    const payload = this.cleanPayload({
      ...photo,
      tripId,
      takenAt: this.toTimestamp(photo.takenAt) ?? Timestamp.now(),
      uploadedAt: Timestamp.now()
    });

    const docRef = await addDoc(photosRef, payload);
    await updateDoc(this.getTripRef(tripId), {
      photosCount: increment(1),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  }

  getPhotos(tripId: string): Observable<Photo[]> {
    const photosRef = collection(this.firestore, `trips/${tripId}/photos`);
    const q = query(photosRef, orderBy('uploadedAt', 'desc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(snapshot => snapshot.map(item => this.deserializePhoto(item))),
      catchError(() => of([]))
    );
  }

  getPhotosByPlace(tripId: string, placeId: string): Observable<Photo[]> {
    const photosRef = collection(this.firestore, `trips/${tripId}/photos`);
    const q = query(photosRef, where('placeId', '==', placeId));

    return collectionData(q, { idField: 'id' }).pipe(
      map(snapshot => snapshot.map(item => this.deserializePhoto(item))),
      catchError(() => of([]))
    );
  }

  // Travel Segment Operations
  async addTravelSegment(tripId: string, segment: Omit<TravelSegment, 'id' | 'tripId'>): Promise<string> {
    const segmentsRef = collection(this.firestore, `trips/${tripId}/travelSegments`);
    const payload = this.cleanPayload({
      ...segment,
      tripId,
      departureTime: this.toTimestamp(segment.departureTime) ?? Timestamp.now(),
      arrivalTime: this.toTimestamp(segment.arrivalTime) ?? Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    const docRef = await addDoc(segmentsRef, payload);
    await updateDoc(this.getTripRef(tripId), {
      travelSegmentsCount: increment(1),
      updatedAt: Timestamp.now()
    });

    return docRef.id;
  }

  async updateTravelSegment(tripId: string, segmentId: string, updates: Partial<TravelSegment>): Promise<void> {
    const segmentRef = doc(this.firestore, `trips/${tripId}/travelSegments/${segmentId}`);
    const payload: Record<string, any> = this.cleanPayload({ ...updates } as Record<string, any>);

    if (updates.departureTime) {
      payload['departureTime'] = this.toTimestamp(updates.departureTime);
    }

    if (updates.arrivalTime) {
      payload['arrivalTime'] = this.toTimestamp(updates.arrivalTime);
    }

    payload['updatedAt'] = Timestamp.now();

    await updateDoc(segmentRef, payload);
  }

  async deleteTravelSegment(tripId: string, segmentId: string): Promise<void> {
    const segmentRef = doc(this.firestore, `trips/${tripId}/travelSegments/${segmentId}`);
    await deleteDoc(segmentRef);
    await updateDoc(this.getTripRef(tripId), {
      travelSegmentsCount: increment(-1),
      updatedAt: Timestamp.now()
    });
  }

  getTravelSegments(tripId: string): Observable<TravelSegment[]> {
    const segmentsRef = collection(this.firestore, `trips/${tripId}/travelSegments`);
    const q = query(segmentsRef, orderBy('departureTime', 'asc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(snapshot => snapshot.map(item => this.deserializeTravelSegment(item))),
      catchError(() => of([]))
    );
  }

  // Helpers
  private getTripRef(tripId: string) {
    return doc(this.firestore, `trips/${tripId}`);
  }

  private cleanPayload<T extends Record<string, any>>(payload: T): T {
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });
    return payload;
  }

  private toTimestamp(value: Date | string | Timestamp | null | undefined): Timestamp | null {
    if (!value) {
      return null;
    }

    if (value instanceof Timestamp) {
      return value;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return Timestamp.fromDate(date);
  }

  private tryConvertToDate(value: any): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }

    if (typeof value === 'object' && typeof value.toDate === 'function') {
      const date = value.toDate();
      return Number.isNaN(date?.getTime?.()) ? undefined : date;
    }

    return undefined;
  }

  private deserializeTrip(data: any): Trip {
    return {
      id: data.id,
      userId: data.userId,
      name: data.name,
      destination: data.destination,
      startDate: this.tryConvertToDate(data.startDate) ?? new Date(),
      endDate: this.tryConvertToDate(data.endDate) ?? new Date(),
      budget: data.budget ?? 0,
      totalExpenses: data.totalExpenses ?? 0,
      status: data.status || 'planned',
      coverImage: data.coverImage || undefined,
      description: data.description || undefined,
      interests: data.interests || [],
      aiSummary: data.aiSummary || undefined,
      placesCount: data.placesCount ?? 0,
      visitedPlacesCount: data.visitedPlacesCount ?? 0,
      expensesCount: data.expensesCount ?? 0,
      photosCount: data.photosCount ?? 0,
      travelSegmentsCount: data.travelSegmentsCount ?? 0,
      createdAt: this.tryConvertToDate(data.createdAt) ?? new Date(),
      updatedAt: this.tryConvertToDate(data.updatedAt) ?? new Date()
    };
  }

  private deserializePlace(data: any): Place {
    return {
      id: data.id,
      tripId: data.tripId,
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      placeId: data.placeId,
      type: data.type || 'point_of_interest',
      rating: data.rating ?? 0,
      userRating: data.userRating,
      visited: data.visited ?? false,
      plannedDate: this.tryConvertToDate(data.plannedDate),
      visitedDate: this.tryConvertToDate(data.visitedDate),
      estimatedDuration: data.estimatedDuration ?? 60,
      notes: data.notes,
      photos: data.photos || [],
      aiSuggested: data.aiSuggested ?? false,
      stayDurationMinutes: data.stayDurationMinutes,
      sortOrder: data.sortOrder
    };
  }

  private deserializeExpense(data: any): Expense {
    return {
      id: data.id,
      tripId: data.tripId,
      category: data.category,
      amount: Number(data.amount) || 0,
      currency: data.currency || 'USD',
      description: data.description,
      date: this.tryConvertToDate(data.date) ?? new Date(),
      placeId: data.placeId,
      receipt: data.receipt
    };
  }

  private deserializePhoto(data: any): Photo {
    return {
      id: data.id,
      tripId: data.tripId,
      placeId: data.placeId,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl || data.url,
      caption: data.caption,
      latitude: data.latitude,
      longitude: data.longitude,
      takenAt: this.tryConvertToDate(data.takenAt) ?? new Date(),
      uploadedAt: this.tryConvertToDate(data.uploadedAt) ?? new Date()
    };
  }

  private deserializeTravelSegment(data: any): TravelSegment {
    return {
      id: data.id,
      tripId: data.tripId,
      type: data.type || 'other',
      provider: data.provider || '',
      departureLocation: data.departureLocation || '',
      arrivalLocation: data.arrivalLocation || '',
      departureTime: this.tryConvertToDate(data.departureTime) ?? new Date(),
      arrivalTime: this.tryConvertToDate(data.arrivalTime) ?? new Date(),
      bookingReference: data.bookingReference,
      seatNumber: data.seatNumber,
      notes: data.notes
    };
  }
}
