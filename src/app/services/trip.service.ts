import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of } from 'rxjs';
import { Trip, Place, Expense, Photo } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private firestore = inject(Firestore);

  // Trip CRUD Operations
  async createTrip(trip: Omit<Trip, 'id'>): Promise<string> {
    try {
      const tripsRef = collection(this.firestore, 'trips');
      const docRef = await addDoc(tripsRef, {
        ...trip,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<void> {
    try {
      const tripRef = doc(this.firestore, `trips/${tripId}`);
      await updateDoc(tripRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }

  async deleteTrip(tripId: string): Promise<void> {
    try {
      const tripRef = doc(this.firestore, `trips/${tripId}`);
      await deleteDoc(tripRef);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }

  getTrip(tripId: string): Observable<Trip | null> {
    return from(getDoc(doc(this.firestore, `trips/${tripId}`))).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Trip;
        }
        return null;
      }),
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
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Trip));
      }),
      catchError(() => of([]))
    );
  }

  // Place Operations
  async addPlace(tripId: string, place: Omit<Place, 'id' | 'tripId'>): Promise<string> {
    try {
      const placesRef = collection(this.firestore, `trips/${tripId}/places`);
      const docRef = await addDoc(placesRef, {
        ...place,
        tripId
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding place:', error);
      throw error;
    }
  }

  async updatePlace(tripId: string, placeId: string, updates: Partial<Place>): Promise<void> {
    try {
      const placeRef = doc(this.firestore, `trips/${tripId}/places/${placeId}`);
      await updateDoc(placeRef, updates);
    } catch (error) {
      console.error('Error updating place:', error);
      throw error;
    }
  }

  async markPlaceAsVisited(tripId: string, placeId: string): Promise<void> {
    await this.updatePlace(tripId, placeId, {
      visited: true,
      visitedDate: new Date()
    });
  }

  getPlaces(tripId: string): Observable<Place[]> {
    const placesRef = collection(this.firestore, `trips/${tripId}/places`);
    
    return from(getDocs(placesRef)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Place));
      }),
      catchError(() => of([]))
    );
  }

  // Expense Operations
  async addExpense(tripId: string, expense: Omit<Expense, 'id' | 'tripId'>): Promise<string> {
    try {
      const expensesRef = collection(this.firestore, `trips/${tripId}/expenses`);
      const docRef = await addDoc(expensesRef, {
        ...expense,
        tripId,
        date: Timestamp.fromDate(expense.date)
      });
      
      // Update trip total expenses
      await this.updateTripExpenses(tripId);
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  async deleteExpense(tripId: string, expenseId: string): Promise<void> {
    try {
      const expenseRef = doc(this.firestore, `trips/${tripId}/expenses/${expenseId}`);
      await deleteDoc(expenseRef);
      await this.updateTripExpenses(tripId);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  private async updateTripExpenses(tripId: string): Promise<void> {
    const expenses = await this.getExpensesSnapshot(tripId);
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    await this.updateTrip(tripId, { totalExpenses: total });
  }

  private async getExpensesSnapshot(tripId: string): Promise<Expense[]> {
    const expensesRef = collection(this.firestore, `trips/${tripId}/expenses`);
    const snapshot = await getDocs(expensesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  }

  getExpenses(tripId: string): Observable<Expense[]> {
    const expensesRef = collection(this.firestore, `trips/${tripId}/expenses`);
    
    return from(getDocs(expensesRef)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Expense));
      }),
      catchError(() => of([]))
    );
  }

  // Photo Operations
  async addPhoto(tripId: string, photo: Omit<Photo, 'id' | 'tripId'>): Promise<string> {
    try {
      const photosRef = collection(this.firestore, `trips/${tripId}/photos`);
      const docRef = await addDoc(photosRef, {
        ...photo,
        tripId,
        takenAt: Timestamp.fromDate(photo.takenAt),
        uploadedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding photo:', error);
      throw error;
    }
  }

  getPhotos(tripId: string): Observable<Photo[]> {
    const photosRef = collection(this.firestore, `trips/${tripId}/photos`);
    
    return from(getDocs(photosRef)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Photo));
      }),
      catchError(() => of([]))
    );
  }

  getPhotosByPlace(tripId: string, placeId: string): Observable<Photo[]> {
    const photosRef = collection(this.firestore, `trips/${tripId}/photos`);
    const q = query(photosRef, where('placeId', '==', placeId));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Photo));
      }),
      catchError(() => of([]))
    );
  }
}
