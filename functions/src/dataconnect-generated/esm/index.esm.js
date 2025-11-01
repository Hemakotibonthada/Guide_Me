import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'guideme',
  location: 'us-central1'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const getPublicPointsOfInterestRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublicPointsOfInterest');
}
getPublicPointsOfInterestRef.operationName = 'GetPublicPointsOfInterest';

export function getPublicPointsOfInterest(dc) {
  return executeQuery(getPublicPointsOfInterestRef(dc));
}

export const addVisitedPlaceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddVisitedPlace', inputVars);
}
addVisitedPlaceRef.operationName = 'AddVisitedPlace';

export function addVisitedPlace(dcOrVars, vars) {
  return executeMutation(addVisitedPlaceRef(dcOrVars, vars));
}

export const getMyTripsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyTrips');
}
getMyTripsRef.operationName = 'GetMyTrips';

export function getMyTrips(dc) {
  return executeQuery(getMyTripsRef(dc));
}

