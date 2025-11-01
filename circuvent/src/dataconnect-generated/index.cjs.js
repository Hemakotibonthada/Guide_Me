const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'guideme',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const getPublicPointsOfInterestRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPublicPointsOfInterest');
}
getPublicPointsOfInterestRef.operationName = 'GetPublicPointsOfInterest';
exports.getPublicPointsOfInterestRef = getPublicPointsOfInterestRef;

exports.getPublicPointsOfInterest = function getPublicPointsOfInterest(dc) {
  return executeQuery(getPublicPointsOfInterestRef(dc));
};

const addVisitedPlaceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddVisitedPlace', inputVars);
}
addVisitedPlaceRef.operationName = 'AddVisitedPlace';
exports.addVisitedPlaceRef = addVisitedPlaceRef;

exports.addVisitedPlace = function addVisitedPlace(dcOrVars, vars) {
  return executeMutation(addVisitedPlaceRef(dcOrVars, vars));
};

const getMyTripsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyTrips');
}
getMyTripsRef.operationName = 'GetMyTrips';
exports.getMyTripsRef = getMyTripsRef;

exports.getMyTrips = function getMyTrips(dc) {
  return executeQuery(getMyTripsRef(dc));
};
