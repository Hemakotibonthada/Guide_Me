import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddVisitedPlaceData {
  visitedPlace_insert: VisitedPlace_Key;
}

export interface AddVisitedPlaceVariables {
  pointOfInterestId: UUIDString;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface GetMyTripsData {
  trips: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    startDate: TimestampString;
    endDate: TimestampString;
    isPublic?: boolean | null;
  } & Trip_Key)[];
}

export interface GetPublicPointsOfInterestData {
  pointOfInterests: ({
    id: UUIDString;
    name: string;
    latitude: number;
    longitude: number;
    category: string;
  } & PointOfInterest_Key)[];
}

export interface PointOfInterest_Key {
  id: UUIDString;
  __typename?: 'PointOfInterest_Key';
}

export interface Review_Key {
  id: UUIDString;
  __typename?: 'Review_Key';
}

export interface TripActivity_Key {
  id: UUIDString;
  __typename?: 'TripActivity_Key';
}

export interface Trip_Key {
  id: UUIDString;
  __typename?: 'Trip_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface VisitedPlace_Key {
  id: UUIDString;
  __typename?: 'VisitedPlace_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface GetPublicPointsOfInterestRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPublicPointsOfInterestData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetPublicPointsOfInterestData, undefined>;
  operationName: string;
}
export const getPublicPointsOfInterestRef: GetPublicPointsOfInterestRef;

export function getPublicPointsOfInterest(): QueryPromise<GetPublicPointsOfInterestData, undefined>;
export function getPublicPointsOfInterest(dc: DataConnect): QueryPromise<GetPublicPointsOfInterestData, undefined>;

interface AddVisitedPlaceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddVisitedPlaceVariables): MutationRef<AddVisitedPlaceData, AddVisitedPlaceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddVisitedPlaceVariables): MutationRef<AddVisitedPlaceData, AddVisitedPlaceVariables>;
  operationName: string;
}
export const addVisitedPlaceRef: AddVisitedPlaceRef;

export function addVisitedPlace(vars: AddVisitedPlaceVariables): MutationPromise<AddVisitedPlaceData, AddVisitedPlaceVariables>;
export function addVisitedPlace(dc: DataConnect, vars: AddVisitedPlaceVariables): MutationPromise<AddVisitedPlaceData, AddVisitedPlaceVariables>;

interface GetMyTripsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyTripsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyTripsData, undefined>;
  operationName: string;
}
export const getMyTripsRef: GetMyTripsRef;

export function getMyTrips(): QueryPromise<GetMyTripsData, undefined>;
export function getMyTrips(dc: DataConnect): QueryPromise<GetMyTripsData, undefined>;

