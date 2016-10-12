Roundaway
============

## Git Flow

<table>
 <thead>
  <tr>
   <th>Branch name</th>
   <th>Port</th>
   <th>URL</th>
   <th>Backend Version</th>
   <th>Frontend Version</th>
   <th>Purpose</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>master</td>
   <td>8080</td>
   <td>http://roundaway.com</td>
   <td>1.0.0</td>
   <td>0.1.0</td>
   <td>production</td>
  </tr>
  <tr>
   <td>dev</td>
   <td>8081</td>
   <td>http://roundaway.com:8081</th>
   <td>1.0.1</td>
   <td>0.1.0</td>
   <td>staging (completed items)</td>
  </tr>
  <tr>
   <td><i>#-topic</i></td>
   <td colspan="4">LOCAL</td>
   <td>development (tasks in progress)</td>
  </tr>
 </tbody>
</table>

- Always rebase the source branch onto the target branch before merging (--ff)
- When a task is complete merge the topic branch into dev
- Merges from dev -> master will occur once a significant number of tasks have been completed
- After every merge, update the version number in the package.json and this readme in the target branch following the appropriate scheme
  - Increment least significant digit by 1
  - i.e. on dev: `0.3.4` becomes `0.3.5`
  - on master: `0.3` becomes `0.4`
    - update the **minor** version number on dev after merging to master

## Set Up
1. Clone/download this repo
2. Run `npm update` to download and update all required packages
3. Create and/or find keys for *Facebook* and *Google* web applications (for authentication)
4. Create and/or find the *Google* API key and ensure that the following API's are enabled for it:
  - Geocoding API
5. Create and/or find the *Stripe* secret key
6. Create and/or find the application secret key for *JWT* authentication
7. Create a **config.js** file that exports an object with the following config keys (see **config.example.js** for more info and defaults):
  * FACEBOOK_CLIENT_ID
  * FACEBOOK_CLIENT_SECRET
  * GOOGLE_CLIENT_ID
  * GOOGLE_CLIENT_SECRET
  * GOOGLE_API_KEY
  * STRIPE_SECRET_KEY
  * STRIPE_PUBLISH_KEY
  * JWT_SECRET_KEY
  * PORT
  * DB_CONNECTION_STRING
  * RUN_SYSTEM_TESTS
  * RUN_EXTERNAL_TESTS
8. Ensure MongoDB server is running on localhost
9. *(Optional)* The server will be the port defined in **config.js**. Set up any necessary port-forwarding to accomodate this.

*(Note: For upgrading existing deployments, since `config.js` is `.gitignore`d, the file that is already deployed should be left with the keys it has and updated as necessary)*

## Tests

There are two types of tests in the backend: **unit** tests and **integration** tests.
The unit tests are organized by controller. All the integration tests are nested under a single describe
```
describe('the entire app should not explode', function() {
```
in the `system.test.js` file. This describe is `.skip()`ed on `dev` but allowed to run on `master` because it takes a *very* long time for the integration tests to complete. This is due to the fact that the **integration** tests interact with a live db so when running integration tests keep in mind that you will need to have a `mongod` instance running.
All the test files are named `*.test.js` and are in the `/app/tests/` directory.
Commits with breaking tests are allowed in topic branches and thus when merged into `dev` or `master` some commits will have failing changes, but **ENSURE THAT WHEN YOU MERGE BRANCHES THE `HEAD` IS PASSING ALL TESTS (INCLUDING INTEGRATION TESTS)**.

## Backend Objects
*These are object definitions used in the backend models*

#### Location `{}`
    address: String,
    coordinates: [Number]

#### Price `{}`
    perHour: Number

#### Range (Type) `{}`
    start: Type,
    end: Type

#### Ranger `[]`
    [Range(Date)]
    next: Range(Date)

#### BookingStatus `enum`
    unpaid,
    paid,
    archived

#### Profile `{}`
    name: String

## Models
*All models have a `createdAt` and `updatedAt` field*

#### User
The <b>User</b> object holds basic data about the <b>User</b> including <code>profile</code> and authentication information. All other models reference their owner through a <code>user</code> property.

    profile: Profile,
    authid: {
        facebook: String,
        google: String
    },
    admin: Boolean,
    attendant: Boolean

#### Lot
A <b>Lot</b> is simply a collection of <b>Spot</b>s that share a common <code>profile</code>. The <b>Lot</b>'s **price**, **availability**, and **location** are used as defaults for new <b>Spot</b>s.

    User: User
    attendants: [User]
    location: Location,
    price: Price,
    available: Ranger,
    name: String,
    description: String

#### Spot
A <b>Spot</b> can be booked by users for a set period of time. Once a <b>Spot</b> is created you cannot modify the **location**. Modifying the **price** of a <b>Spot</b> will not modify existing `Booking`s. Associating a <b>Spot</b> with a <b>Lot</b> will overwrite the <b>Spot</b>'s **location** with the one in the <b>Lot</b>. 
    
    user: User,
    attendants: [User],
    lot: Lot,
    name: String,
    description: String
    reserved: Boolean,
    price: Price,
    location: Location,
    available: Ranger,
    booked: Ranger,


#### Booking
A `Booking` is an immutable object that is used to track bookings on a <b>Spot</b>. Once a `Booking` is created you cannot modify the **spot**, **price**, **start**, nor **end** properties. The status defaults to `unpaid` and will change to `paid` once payment has been succesfuly processed. A `Booking`s price is calculated using it's duration (calculated using it's **start** and **end** properties) multiplied byt he price of the <b>Spot</b> that it is associated with.

    user: User,
    car: Car,
    spot: Spot,
    status: BookingStatus,
    price: Price,
    start: Date,
    end: Date,


## Authentication

Certain API routes requre a JWT and/or the associated user to have certain privelages. The specific requirements for each route are listed below.
In order to make API calls that are auth protected use the following flow:

1. Authenticate with a 3rd party authentication server of your choice. Currently supported options:
  - Facebook
  - Google 
2. Hit `POST /auth/:strat` with an **access_token** as supplied by the social network you are authenticating with
3. You will receieve a **JWT** in the response if authentication was successful after one of the following operations has completed:
  - A user was found in db
  - A new user was created
4. Set an `Authorizaton` header with the `JWT` scheme (as in: `Authorization: JWT JWT_STRING...`) in all subsequent requests
5. If a certain user requires elevated privelages (such as *admin*) the db admin must set the appropriate flag in the user collection manually (*note*: changing privelages does not require generating a new JWT, so changing privelages can be done on the fly)


## API

*All api calls are on the `/api` route*

### Authorization
Each route has a security policy with one of the following properties:
<table>
  <tr>
    <td><i>public</i></td>
    <td>Anyone can access this route</td>
  </tr>
  <tr>
    <td><i>authorized</i></td>
    <td>A valid JWT must be provided</td>
  </tr>
  <tr>
    <td><i>attendant</i></td>
    <td>You must be an attendant that is specified on the resource</td>
  </tr>
  <tr>
    <td><i>owner</i></td>
    <td>You must be an owner of the resource (user id is set in the resource's <code>user</code> property)</td>
  </tr>
  <tr>
    <td><i>admin</i></td>
    <td>You must be an admin</td>
  </tr>
</table>

### Responses

<table>
  <tr>
    <td>status</td>
    <td>One word status description: <code>ERROR</code> or <code>SUCCESS</code>.</td>
  </tr>
  <tr>
    <td>message</td>
    <td>Optional for <code>ERROR</code> responses. Contains some response message describe the back-end operation that took place</td>
  </tr>
  <tr>
    <td>errors</td>
    <td>Array of strings containing the different errors that occured. Sometimes present on <code>SUCCESS</code> responses as well when performing an action on a collection and some documents succeeded while others did not</td>
  </tr>
  <tr>
    <td>data</td>
    <td>Any data being returned by the server as per the request</td>
  </tr>
</table>

### Requests

#### Util

##### POST `/api/util/location/geocode`
<table>
  <tr>
    <td><i>Security</i></td>
    <td>public</td>
  </tr>
  <tr>
    <td>address</td>
    <td>The address you wish to geocode</td>
  </tr>
</table>
Retrieve the proper formatted address for a location (as it would be saved in the database)

#### Authentication

##### GET `/auth/:strat?access_token`
<table>
  <tr>
    <td><i>Security</i></td>
    <td>public</td>
  </tr>
  <tr>
    <td>strat</td>
    <td>The social network with which to authenticate. Can be one of: ['facebook', 'google'].</td>
  </tr>
  <tr>
    <td>access_token</td>
    <td>The access token as provided by the social network</td>
</table>
Once you have authenticated the user elsewhere (client-side or on another server), send the `access_token` here in order to authenticate with this server. Sends back a JWT for subsequent API requests.

#### User

##### GET `/api/users`
<table>
  <tr>
    <td><i>security</i></td>
    <td>admin</td>
  </tr>
</table>
Returns the entire <b>User</b>s collection.

##### GET `/api/users/profile`
<table>
  <tr>
    <td><i>security</i></td>
    <td>authorized</td>
  </tr>
</table>
Returns the current session <b>User</b>.

##### GET `/api/users/:userid/lots`
<table>
  <tr>
    <td><i>security</i></td>
    <td>admin</td>
  </tr>
</table>
Returns the given <b>User</b>'s lots.

##### GET `/api/users/:userid/spots`
<table>
  <tr>
    <td><i>security</i></td>
    <td>admin</td>
  </tr>
</table>
Returns the given <b>User</b>'s spots.

##### GET `/api/users/:userid/bookings`
<table>
  <tr>
    <td><i>security</i></td>
    <td>admin</td>
  </tr>
</table>
Returns the given <b>User</b>'s bookings.

##### GET `/api/users/:userid/profile`
<table>
  <tr>
    <td><i>security</i></td>
    <td>admin</td>
  </tr>
</table>
Returns the given <b>User</b>'s profile.

##### PATCH `/api/users/:userid/profile`
<table>
  <tr>
    <td><i>security</i></td>
    <td>admin</td>
  </tr>
  <tr>
    <td colspan="2">Profile properties</td>
  </tr>
  <tr>
    <td>name</td>
    <td>Name of the <b>User</b></td>
  </tr>
</table>
Updates the specified fields of the <b>User</b>'s profile.

#### Booking

##### GET `/api/bookings`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the owned <b>Booking</b> or entire collection if admin.

##### GET `/api/bookings/:id`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the <b>Booking</b> with the specified id.

##### GET `/api/bookings/:id/spot`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the spot that is associated with this <b>Booking</b>.

##### GET `/api/bookings/:id/car`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the car that is associated with this <b>Booking</b>.

##### GET `/api/bookings/:id/start`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the start of the specified <b>Booking</b>.

##### GET `/api/bookings/:id/duration`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the duration of the specified <b>Booking</b>.

##### GET `/api/bookings/:id/end`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the end of the specified <b>Booking</b>.

##### GET `/api/bookings/:id/time`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the time <code>{start: Date, end: Date}</code> of the specified <b>Booking</b>.

##### GET `/api/bookings/:id/price`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the price of the booking of the specified <b>Booking</b>.

##### GET `/api/bookings/:id/status`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Returns the status of the booking of the specified <b>Booking</b>.

##### PUT `/api/bookings/:id/pay`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>token</td>
    <td>The card token to use as the source of payment</td>
  </tr>
</table>
Pay for a <b>Booking</b>.

#### Lot

##### GET `/api/lots`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the owned <b>Lot</b>s or entire collection if admin.

##### PUT `/api/lots`
<table>
  <tr>
    <td><i>security</i></td>
    <td>authorized</td>
  </tr>
  <tr>
    <td>count</td>
    <td>Number of <b>Lot</b>s to create (defaults to 1)</td>
  </tr>
  <tr>
    <td>location</td>
    <td>An object containing a <code>coordinates</code> property with the coordinates of the location of the <b>Lot</b><br /> 
    Can either be a number array of <code>[longitude, latitude]</code> or
    an object containing <code>long</code> or <code>lon</code> and <code>lat</code> and properties</td>
  </tr>
  <tr>
    <td><i>(optional)</i> price</td>
    <td>A price object containing the price breakdown for the <b>Lot</b> (to be used as a default for the <b>Lot</b>'s spots)</td>
  </tr>
  <tr>
    <td>lot</td>
    <td>An object containing the properties you want to intiate the <b>Lot</b>(s) with (if this is used the rest of the request body except <b>count</b> is ignored)</td>
  </tr>
</table>
Create a new <b>Lot</b>.

##### GET `/api/lots/:id`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the <b>Lot</b> with the specified id.

##### GET `/api/lots/:id/location`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the location of the <b>Lot</b> with the specified id.

##### GET `/api/lots/:id/spots`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the spots associated with the <b>Lot</b>.


##### GET `/api/lots/:id/attendants`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Return the attendants associated with the <b>Lot</b>.

##### PUT `/api/lots/:id/attendants`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>attendants</td>
    <td>The id's of <b>User</b>'s to add as attendants</td>  
  </tr>
</table>
Return the attendants associated with the <b>Lot</b>.

##### GET `/api/lots/:id/available`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the ranges during which new spots in this <b>Lot</b> would be available in an array where each pair of indices is a start and end time. 

##### PUT `/api/lots/:id/available`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>start</td>
    <td>The start of the range to add</td>
  </tr>
  <tr>
    <td>end</td>
    <td>The end of the range to add</td>
  </tr>
  <tr>
    <td>interval</td>
    <td><i>(optional - required for recuring ranges)</i> The interval (in ms) at which to repeat this range</td>
  </tr>
  <tr>
    <td>count </td>
    <td><i>(optional - required for recuring ranges)</i> The number of times to repeat the recuring range</td>
  </tr>
  <tr>
    <td>finish </td>
    <td><i>(optional - required for recuring ranges)</i> The limit at which to stop repeating the recuring range</td>
  </tr>
  <tr>
    <td>schedules</td>
    <td>An array of schedules each with <i>start</i>, <i>end</i>, and optionally <i>interval</i> and either <i>count</i> or <i>finish</i>. If using an array, the rest of the body of the request will be ignored.
  </tr>
</table>
Adds availability based on the supplied information. Either <code>count</code> (of reptitions) or <code>finish</code> (final upper limit) must be set if using a recuring range.

##### PUT `/api/lots/:id/available/remove`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>start</td>
    <td>The start of the range to remove</td>
  </tr>
  <tr>
    <td>end</td>
    <td>The end of the range to remove</td>
  </tr>
  <tr>
    <td>interval</td>
    <td><i>(optional - required for recuring ranges)</i> The interval (in ms) at which to repeat this range</td>
  </tr>
  <tr>
    <td>count </td>
    <td><i>(optional - required for recuring ranges)</i> The number of times to repeat the recuring range</td>
  </tr>
  <tr>
    <td>finish </td>
    <td><i>(optional - required for recuring ranges)</i> The limit at which to stop repeating the recuring range</td>
  </tr>
  <tr>
    <td>schedules</td>
    <td>An array of schedules each with <i>start</i>, <i>end</i>, and optionally <i>interval</i> and either <i>count</i> or <i>finish</i>. If using an array, the rest of the body of the request will be ignored.
  </tr>
</table>
Removes availability based on the supplied information. Either <code>count</code> (of reptitions) or <code>finish</code> (final upper limit) must be set if using a recuring range.

##### GET `/api/lots/:id/price`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns an object which which contains details for each price type (such as per hour, etc).

##### GET `/api/lots/:id/price`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
  <tr>
    <td>...</td>
    <td>The <code>Price</code> properties you wish to update and their new values</td>
  </tr>
</table>
Set the price of new spots for the <b>Lot</b>. Does not modify existing spots.

##### GET `/api/lots/:id/name`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the name of the <b>Lot</b>

##### PUT `/api/lots/:id/name`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>name</td>
    <td>the name to set for the <b>Lot</b></td>
  </tr>
</table>
Set a name for the <b>Lot</b> that will be used by the owner to identify spots (instead of just by location)

##### GET `/api/lots/:id/description`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the description of the <b>Lot</b>

##### PUT `/api/lots/:id/description`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>description</td>
    <td>the description to set for the <b>Lot</b></td>
  </tr>
</table>
Set the description of the <b>Lot</b> that will be displayed to users looking to rent (can provide details regarding where to park, type of spot, etc). In retrospect this is probably useless on <b>Lot</b>s.

#### Spot

##### GET `/api/spots`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the owned <b>Spot</b>s or entire collection if admin.

##### PUT `/api/spots`
<table>
  <tr>
    <td><i>security</i></td>
    <td>authorized</td>
  </tr>
  <tr>
    <td>location</td>
    <td>An object containing an <code>address: String</code> property with the address of the <b>Spot</b>; this address will be geocoded again to retrieve a uniform formattedAddress and coordinates 
  </tr>
  <tr>
    <td>price</td>
    <td>A price object containing the price breakdown for the <b>Spot</b> (to be used as a default for the <b>Spot</b>'s <b>Spot</b>s)</td>
  </tr>
  <tr>
    <td><i>(optional)</i> lot</td>
    <td>Either the id or the entire <b>Lot</b> object of the lot to associate with this <b>Spot</b> (<i><code>*</code></i> when this property is provided, price and location properties are attempted to be retrieved from the <b>Lot</b> object)</td>
  </tr>
  <tr>
    <td><i>(optional)</i> <b>Spot</b></td>
    <td>An object containing the properties you want to intiate the <b>Spot</b>(s) with (if this is used the rest of the request body except <b>count</b> is ignored)</td>
  </tr>
  <tr>
    <td><i>(optional)</i> count</td>
    <td>Number of <b>Spot</b>s to create (defaults to 1)</td>
  </tr>
</table>
Create a new <b>Spot</b>.

##### GET `/api/spots/near?long=LONGITUDE&lat=LATITUDE&available=DATE&count=COUNT`
<table>
  <tr>
    <td><i>security</i></td>
    <td>public</td>
  </tr>
  <tr>
    <td>long</td>
    <td>Longitude of the target location</td>
  </tr>
  <tr>
    <td>lat</td>
    <td>Latitude of the target location</td>
  </tr>
    <td>available</td>
    <td>A datetime during which this <b>Spot</b> should be available (if unassigned then current time is used)</td>
  </tr>
  <tr>
    <td>count</td>
    <td>Number of <b>Spot</b>s to return</td>
  </tr>
</table>
Returns the required number of <b>Spot</b>s based on the given filters

##### GET `/api/spots/:id`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the <b>Spot</b> with the specified id.

##### GET `/api/spots/:id/lot`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the <b>Lot</b> associated with the <b>Spot</b>

##### PUT `/api/spots/:id/lot`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Associate a <b>Lot</b> with the <b>Spot</b>. This will not transfer over any of the Lot's properties such as <code>price</code>, <code>location</code>, etc.

##### PUT `/api/spots/:id/lot/remove`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Disassociate any lot from this <b>Spot</b>

##### GET `/api/spots/:id/location`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the location of the <b>Spot</b> with the specified id.

##### GET `/api/spots/:id/price`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns an object which which contains details for each price type (such as per hour, etc).

##### PUT `/api/spots/:id/price`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>...</td>
    <td>The <code>Price</code> properties you wish to update and their new values</td>
  </tr>
</table>
Set the price of a <b>Spot</b>. Does not modify existing bookings.

##### GET `/api/spots/:id/name`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the name of the <b>Spot</b>

##### PUT `/api/spots/:id/name`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>name</td>
    <td>the name to set for the <b>Spot</b></td>
  </tr>
</table>
Set a name for the <b>Spot</b> that will be used by the owner to identify spots (instead of just by location)

##### GET `/api/spots/:id/reserved`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the reserved of the <b>Spot</b>

##### PUT `/api/spots/:id/reserved`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>reserved</td>
    <td>the reserved state to set for the <b>Spot</b></td>
  </tr>
</table>
Set the reserved state of the <b>Spot</b>. When true, this <b>Spot</b> will not be booked when booking a generic <b>Spot</b> through a **Lot**.

##### GET `/api/spots/:id/description`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the description of the <b>Spot</b>

##### PUT `/api/spots/:id/description`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>description</td>
    <td>the description to set for the <b>Spot</b></td>
  </tr>
</table>
Set the description of the <b>Spot</b> that will be displayed to users looking to rent the spot (can provide details regarding where to park, type of spot, etc.)

##### GET `/api/spots/:id/attendants`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
</table>
Return the attendants associated with the spot.

##### PUT `/api/spots/:id/attendants`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>attendants</td>
    <td>The id's of <b>User</b>'s to add as attendants</td>  
  </tr>
</table>
Return the attendants associated with the spot.

##### GET `/api/spots/:id/bookings`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the bookings associated with the <b>Spot</b> with the given id.

##### PUT `/api/spots/:id/bookings`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
  <tr>
    <td>start</td>
    <td>The start of the booking</td>
  </tr>
  <tr>
    <td>end</td>
    <td>The end of the booking</td>
  </tr>
  <tr>
    <td>bookings</td>
    <td>The <b>Booking</b> object(s) to add, can be either a single <b>Booking</b> object or an <code>Array</code> of them that must include properties <b>start</b> and <b>end</b> (when this is used, the rest of the request body is ignored)
  </tr>
</table>
Creates a new booking for the <b>Spot</b>

##### PUT `/api/spots/:id/bookings/remove`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
  <tr>
    <td>id</td>
    <td>The id of the booking</td>
  </tr>
  <tr>
  <td><i>(used instead of id) start</td>
    <td>The start of the booking</td>
  </tr>
  <tr>
    <td><i>(used instead of id) end</td>
    <td>The end of the booking</td>
  </tr>
  <tr>
    <td>bookings</td> 
    <td>The <b>Booking</b> object(s) to remove, can be either a single <b>Booking</b> object or an <code>Array</code> of them that must include properties <b>start</b> and <b>end</b> or an <b>id</b> (when this is used, the rest of the request body is ignored)
  </tr>
</table>
Removes the specified booking objects from the <b>Spot</b> and updates schedules.

##### GET `/api/spots/:id/available`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the ranges during which this <b>Spot</b> is available in an array where each pair of indices is a start and end time. 

##### PUT `/api/spots/:id/available`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>start</td>
    <td>The start of the range to add</td>
  </tr>
  <tr>
    <td>end</td>
    <td>The end of the range to add</td>
  </tr>
  <tr>
    <td>interval</td>
    <td><i>(optional - required for recuring ranges)</i> The interval (in ms) at which to repeat this range</td>
  </tr>
  <tr>
    <td>count </td>
    <td><i>(optional - required for recuring ranges)</i> The number of times to repeat the recuring range</td>
  </tr>
  <tr>
    <td>finish </td>
    <td><i>(optional - required for recuring ranges)</i> The limit at which to stop repeating the recuring range</td>
  </tr>
  <tr>
    <td>schedules</td>
    <td>An array of schedules each with <i>start</i>, <i>end</i>, and optionally <i>interval</i> and either <i>count</i> or <i>finish</i>. If using an array, the rest of the body of the request will be ignored.
  </tr>
</table>
Adds availability based on the supplied information. Either <code>count</code> (of reptitions) or <code>finish</code> (final upper limit) must be set if using a recuring range.

##### PUT `/api/spots/:id/available/remove`
<table>
  <tr>
    <td><i>security</i></td>
    <td>owner</td>
  </tr>
  <tr>
    <td>start</td>
    <td>The start of the range to remove</td>
  </tr>
  <tr>
    <td>end</td>
    <td>The end of the range to remove</td>
  </tr>
  <tr>
    <td>interval</td>
    <td><i>(optional - required for recuring ranges)</i> The interval (in ms) at which to repeat this range</td>
  </tr>
  <tr>
    <td>count </td>
    <td><i>(optional - required for recuring ranges)</i> The number of times to repeat the recuring range</td>
  </tr>
  <tr>
    <td>finish </td>
    <td><i>(optional - required for recuring ranges)</i> The limit at which to stop repeating the recuring range</td>
  </tr>
  <tr>
    <td>schedules</td>
    <td>An array of schedules each with <i>start</i>, <i>end</i>, and optionally <i>interval</i> and either <i>count</i> or <i>finish</i>. If using an array, the rest of the body of the request will be ignored.
  </tr>
</table>
Removes availability based on the supplied information. Either <code>count</code> (of reptitions) or <code>finish</code> (final upper limit) must be set if using a recuring range.

##### GET `/api/spots/:id/booked`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns the ranges during which this <b>Spot</b> is booked in an array where each pair of indices is a start and end time. 

##### GET `/api/spots/:id/schedules`
<table>
  <tr>
    <td><i>security</i></td>
    <td>attendant</td>
  </tr>
</table>
Returns an object which contains 2 propertes: `booked` and `available` each of which are arrays where each pair of indices is a start and end time.

