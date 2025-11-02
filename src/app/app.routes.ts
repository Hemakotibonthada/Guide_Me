import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
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
      }
    ]
  },
  {
    path: 'trip/:id',
    loadComponent: () => import('./pages/trip-detail/trip-detail.page').then(m => m.TripDetailPage)
  },
  {
    path: 'create-trip',
    loadComponent: () => import('./pages/create-trip/create-trip.page').then(m => m.CreateTripPage)
  },
  {
    path: 'place/:tripId/:placeId',
    loadComponent: () => import('./pages/place-detail/place-detail.page').then(m => m.PlaceDetailPage)
  }
];
