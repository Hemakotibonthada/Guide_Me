import { Routes } from '@angular/router';
import { authChildGuard, authGuard, redirectIfAuthenticatedGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [redirectIfAuthenticatedGuard],
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'my-trips',
        loadComponent: () => import('./pages/my-trips/my-trips.page').then(m => m.MyTripsPage)
      },
      {
        path: 'explore',
        loadComponent: () => import('./pages/explore/explore.page').then(m => m.ExplorePage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'trip/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/trip-detail/trip-detail.page').then(m => m.TripDetailPage)
  },
  {
    path: 'create-trip',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/create-trip/create-trip.page').then(m => m.CreateTripPage)
  },
  {
    path: 'place/:tripId/:placeId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/place-detail/place-detail.page').then(m => m.PlaceDetailPage)
  }
];
