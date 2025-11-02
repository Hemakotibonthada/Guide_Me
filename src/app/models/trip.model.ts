export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
}

export type TripStatus = 'planned' | 'ongoing' | 'completed';

export interface Trip {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  totalExpenses: number;
  status: TripStatus;
  coverImage?: string;
  description?: string;
  interests?: string[];
  aiSummary?: string;
  places?: Place[];
  expenses?: Expense[];
  photos?: Photo[];
  placesCount?: number;
  visitedPlacesCount?: number;
  expensesCount?: number;
  photosCount?: number;
  travelSegmentsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Place {
  id: string;
  tripId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  type: string;
  rating: number;
  userRating?: number;
  visited: boolean;
  plannedDate?: Date;
  visitedDate?: Date;
  estimatedDuration: number; // in minutes
  notes?: string;
  photos: string[];
  aiSuggested: boolean;
  stayDurationMinutes?: number;
  sortOrder?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  category: 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other';
  amount: number;
  currency: string;
  description: string;
  date: Date;
  placeId?: string;
  receipt?: string;
}

export interface Photo {
  id: string;
  tripId: string;
  placeId?: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  takenAt: Date;
  uploadedAt: Date;
}

export interface Route {
  id: string;
  tripId: string;
  startPlaceId: string;
  endPlaceId: string;
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  mode: 'driving' | 'walking' | 'transit';
}

export interface AIRecommendation {
  type: 'place' | 'itinerary' | 'tip';
  content: string;
  data?: any;
  confidence: number;
}

export interface TravelSegment {
  id: string;
  tripId: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';
  provider: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: Date;
  arrivalTime: Date;
  bookingReference?: string;
  seatNumber?: string;
  notes?: string;
}
