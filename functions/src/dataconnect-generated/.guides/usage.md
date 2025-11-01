# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, getPublicPointsOfInterest, addVisitedPlace, getMyTrips } from '@dataconnect/generated';


// Operation CreateUser: 
const { data } = await CreateUser(dataConnect);

// Operation GetPublicPointsOfInterest: 
const { data } = await GetPublicPointsOfInterest(dataConnect);

// Operation AddVisitedPlace:  For variables, look at type AddVisitedPlaceVars in ../index.d.ts
const { data } = await AddVisitedPlace(dataConnect, addVisitedPlaceVars);

// Operation GetMyTrips: 
const { data } = await GetMyTrips(dataConnect);


```