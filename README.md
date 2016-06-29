Roundaway
============

## Git Flow

<table>
 <thead>
  <tr>
   <th>Branch name</th>
   <th>Port</th>
   <th>URL</th>
   <th>Version</th>
   <th>Purpose</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>master</td>
   <td>8080</td>
   <td>http://roundaway.com</td>
   <td>0.1</td>
   <td>production</td>
  </tr>
  <tr>
   <td>dev</td>
   <td>8081</td>
   <td>http://roundaway.com:8081</th>
   <td>0.1.5</td>
   <td>staging (completed items)</td>
  </tr>
  <tr>
   <td><i>#-topic</i></td>
   <td colspan="3">LOCAL</td>
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
6. Create a **config.js** file that exports an object with the following config keys (see **config.example.js** for more info and defaults):
  * FACEBOOK_CLIENT_ID
  * FACEBOOK_CLIENT_SECRET
  * GOOGLE_CLIENT_ID
  * GOOGLE_CLIENT_SECRET
  * GOOGLE_API_KEY
  * STRIPE_SECRET_KEY
  * PORT
  * DB_CONNECTION_STRING
7. Ensure MongoDB server is running on localhost
8. *(Optional)* The server will be the port defined in **config.js**. Set up any necessary port-forwarding to accomodate this.

*(Note: For deployment to `master`, since `config.js` is `.gitignore`d the file that is already deployed should be left with the keys it has and updated as necessary)*

## Tests

There are two types of tests in the backend: **unit** tests and **integration** tests.
The unit tests are organized by controller. All the integration tests are nested under a single describe
```
describe('the entire app should not explode', function() {
```
in the `system.test.js` file. This describe is `.skip()`ed on `dev` but allowed to run on `master` because it takes a *very* long time for the integration tests to complete. This is due to the fact that the **integration** tests interact with a live db so when running integration tests keep in mind that you will need to have a `mongod` instance running.
All the test files are named `*.test.js` and are in the `/app/tests/` directory.
Commits with breaking tests are allowed in topic branches and thus when merged into `dev` or `master` some commits will have failing changes, but **ENSURE THAT WHEN YOU MERGE BRANCHES THE `HEAD` IS PASSING ALL TESTS (INCLUDING INTEGRATION TESTS)**.

## Models
*All models have a `createdAt` and `updatedAt` field*

#### User

    profile: {
        name: String
    },
    authid: {
        facebook: String,
        google: String
    },
    admin: Boolean,
    lotIds: [],
    spotIds: [],
    bookingIds: []

#### Lot

    spots: [],
    address: String,
    location: {
        coordinates: [Number]
    },
    spotNumbers: [Number]

#### Spot
    
    address: String,
    price: {
        perHour: Price
    },
    location: {
        coordinates: [Number]
    },
    available: {
        ranges: [Range(Date)],
        next: Range(Date)
    },
    booked: {
        ranges: [Range(Date)],
    },
    bookings: [String],
    lot: String,
    number: Number


#### Booking

    status: ['unpaid', 'paid', 'archived'],
    spot: String,
    price: Price,
    start: Date,
    end: Date,


## API

*All api calls are on the `/api` route*

### Responses

<table>
  <tr>
    <td>status</td>
    <td>One word status description. Usually <code>ERROR</code> or <code>SUCCESS</code></td>
  </tr>
  <tr>
    <td>message</td>
    <td>Optional for <code>ERROR</code> responses. Contains some response message describe the back-end operation that took place</td>
  </tr>
  <tr>
    <td>errors</td>
    <td>Array of strings containing the different errors that occured. Sometimes present on <code>SUCCESS</code> responses as well when performing an action on a collection and some documents documents succeeded while others did not</td>
  </tr>
  <tr>
    <td>data</td>
    <td>Any data being returned by the server as per the request</td>
  </tr>
</table>

### Requests

#### Authentication

##### GET `/logout`
Clears the current user out of the session and redirects to `/home`

##### GET `/login/:strat`
<table>
  <tr>
    <td>strat</td>
    <td>The social network with which to authenticate. Can be one of: ['facebook', 'google'].</td>
  </tr>
</table>
Redirects to the social network's authentication page

##### GET `/login/:strat/return`
<table>
  <tr>
    <td>strat</td>
    <td>The social network with which to authenticate. Can be one of: ['facebook', 'google'].</td>
  </tr>
</table>
A redirect callback that the social network will hit after authentication (successful or failed)

##### GET `/auth/:strat?noredirect&access_token`
<table>
  <tr>
    <td>strat</td>
    <td>The social network with which to authenticate. Can be one of: ['facebook', 'google'].</td>
  </tr>
  <tr>
    <td>noredirect</td>
    <td>Include this query parameter to receive a <code>User</code> object instead of being redirected</td>
  </tr>
  <tr>
    <td>access_token</td>
    <td>The access token as provided by the social network</td>
</table>
If you have authenticated the user elsewhere (client-side or on another server), send the `access_token` here in order to authenticate with this server and register a session user

##### GET `/connect/:strat`
<table>
  <tr>
    <td>strat</td>
    <td>The social network with which to authenticate. Can be one of: ['facebook', 'google'].</td>
  </tr>
</table>
Used to add an alternative social network after a use has already authenticated. Redirects to the social network's authentication page

##### GET `/connect/:strat/return`
<table>
  <tr>
    <td>strat</td>
    <td>The social network with which to authenticate. Can be one of: ['facebook', 'google'].</td>
  </tr>
</table>
A redirect callback that the social network will hit after authentication (successful or failed)

#### User

##### GET `/api/users`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the entire `users` collection.

##### GET `/api/users/profile`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>False</td>
  </tr>
</table>
Returns the current session user.

##### GET `/api/users/:userid/lots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the given user's lot ids.

##### PUT `/api/users/:userid/lots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>Lots</td>
    <td>Array of lot id's as strings</td>
  </tr>
</table>
Appends the given id's to the user's lots array if those lots exist. Responds with message containing count.

##### GET `/api/users/:userid/spots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the given user's spot ids.

##### PUT `/api/users/:userid/spots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>Lots</td>
    <td>Array of spot id's as strings</td>
  </tr>
</table>
Appends the given id's to the user's spots array if those bookings exist. Responds with message containing count.

##### GET `/api/users/:userid/bookings`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the given user's booking ids.

##### PUT `/api/users/:userid/bookings`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>Lots</td>
    <td>Array of booking id's as strings</td>
  </tr>
</table>
Appends the given id's to the user's bookings array if those bookings exist. Responds with message containing count.

##### GET `/api/users/:userid/profile`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the given user's profile.

##### PATCH `/api/users/:userid/profile`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td colspan="2">Profile properties</td>
  </tr>
  <tr>
    <td>name</td>
    <td>Name of the user</td>
  </tr>
</table>
Updates the specified fields of the user's profile.

#### Booking

##### GET `/api/bookings`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the entire bookings collection.

##### PUT `/api/bookings`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>count</td>
    <td>Number of bookings to create (defaults to 1)</td>
  </tr>
  <tr>
    <td><b>...</b></td>
    <td>Any properties and values you would like the booking(s) to be initialized with </td>
  </tr>
</table>
Create a new booking.

##### GET `/api/bookings/:id`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the booking with the specified id.

##### GET `/api/bookings/:id/spot`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the spot object whose id is associated with the specified booking.

##### PUT `/api/bookings/:id/spot`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>id</td>
    <td>Id of the spot</td>
  </tr>
</table>
Sets the specified id as the booking's spot if it exists.

##### GET `/api/bookings/:id/start`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the start of the specified booking.

##### PUT `/api/bookings/:id/start`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>start</td>
    <td>JSON Date object to be set as the start</td>
  </tr>
</table>
Sets the start of the booking.

##### GET `/api/bookings/:id/duration`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the duration of the specified booking.

##### PUT `/api/bookings/:id/duration`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>duration</td>
    <td>Number of milliseconds of the bookings duration</td>
  </tr>
</table>
Sets the duration of the booking.

##### GET `/api/bookings/:id/end`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the end of the specified booking.

##### PUT `/api/bookings/:id/end`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>end</td>
    <td>JSON Date object to be set as the end</td>
  </tr>
</table>
Sets the end of the booking.

##### GET `/api/bookings/:id/time`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the time `{start: Date, end: Date}` of the specified booking.

##### PUT `/api/bookings/:id/time`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>start</td>
    <td>JSON Date object to be set as the start</td>
  </tr>
  <tr>
    <td>end</td>
    <td>JSON Date object to be set as the end</td>
  </tr>
</table>
Sets the time (start and end dates) of the booking.

##### GET `/api/bookings/:id/price`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the price of the booking of the specified booking.

##### PUT `/api/bookings/:id/pay`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>token</td>
    <td>The card token to use as the source of payment</td>
  </tr>
</table>
Pay for a booking.

#### Lot

##### GET `/api/lots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the entire lots collection.

##### PUT `/api/lots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>count</td>
    <td>Number of lots to create (defaults to 1)</td>
  </tr>
  <tr>
    <td><b>...</b></td>
    <td>Any properties and values you would like the lot(s) to be initialized with </td>
  </tr>
</table>
Create a new lot.

##### GET `/api/lots/:id`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the lot with the specified id.

##### GET `/api/lots/:id/location`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the location of the lot with the specified id.

##### PUT `/api/lots/:id/location`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>coordinates</td>
    <td>The coordinates of the location to set the lot to. 
    Can either be a number array of <code>[longitude, latitude]</code> or
    an object containing <code>long</code> and <code>lat</code> or <code>lon</code> properties</td>
  </tr>
</table>
Adds EITHER the specified spots to the lot or generates `count` number of new spots and adds them to the lot.

##### GET `/api/lots/:id/spots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the spots in the lot with the specified id.

##### PUT `/api/lots/:id/spots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>spots</td>
    <td>The <code>spot</code> object(s) to add, can be either id's or entire objects</td>
  </tr>
  <tr>
    <td>count</td>
    <td>Amount of new spots to create and add to lot</td>
  </tr>
</table>
Adds EITHER the specified spots to the lot or generates `count` number of new spots and adds them to the lot.

##### PUT `/api/lots/:id/spots/remove`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>spots</td>
    <td>The <code>spot</code> object(s) to remove, can be either id's or entire objects</td>
  </tr>
  <tr>
    <td>from</td>
    <td>The spot number (inclusive) from which to start removing</td>
  </tr>
  <tr>
    <td>to</td>
    <td>The spot number (inclusive) up to which to remove</td>
  </tr>
</table>
Removes EITHER the specified spots from the lot or the spots associated with the spot number in the range `[from, to]`.

#### Spot

##### GET `/api/spots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the entire spots collection.

##### GET `/api/spots/near?long=LONGITUDE&lat=LATITUDE&available=DATE&count=COUNT`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
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
    <td>A datetime during which this spot should be available (if unassigned then current time is used)</td>
  </tr>
  <tr>
    <td>count</td>
    <td>Number of spots to return</td>
  </tr>
</table>
Returns the required number of Spots based on the given filters

##### PUT `/api/spots`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>count</td>
    <td>Number of spots to create (defaults to 1)</td>
  </tr>
  <tr>
    <td><b>...</b></td>
    <td>Any properties and values you would like the spot(s) to be initialized with </td>
  </tr>
</table>
Create a new spot.

##### GET `/api/spots/:id`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the spot with the specified id.


##### GET `/api/spots/:id/location`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the location of the spot with the specified id.

##### POST `/api/spots/:id/location`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>coordinates</td>
    <td>The coordinates of the location to set the spot to. 
    Can either be a number array of <code>[longitude, latitude]</code> or
    an object containing <code>long</code> and <code>lat</code> or <code>lon</code> properties</td>
  </tr>
</table>
Adds EITHER the specified spots to the spot or generates `count` number of new spots and adds them to the spot.

##### GET `/api/spots/:id/bookings`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the bookings associated with the spot with the given id.

##### PUT `/api/spots/:id/bookings`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>bookings</td>
    <td>The <code>booking</code> object(s) to add, can be either id's or entire objects that must include properties <i>id</i>, <i>start</i>, and <i>end</i></td>
  </tr>
</table>
Associates the specified booking objects with the spot.

##### PUT `/api/spots/:id/bookings/remove`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>bookings</td>
    <td>The <code>booking</code> object(s) to remove, can be either id's or entire objects that must include properties <i>id</i>, <i>start</i>, and <i>end</i></td>
  </tr>
</table>
Disassociates the specified booking objects with the spot.

##### GET `/api/spots/:id/available`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the ranges during which this spot is available in an array where each pair of indices is a start and end time. 

##### PUT `/api/spots/:id/available`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
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
Adds availability based on the supplied information. Either `count` (of reptitions) or `finish` (final upper limit) must be set if using a recuring range.

##### PUT `/api/spots/:id/available/remove`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
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
Removes availability based on the supplied information. Either `count` (of reptitions) or `finish` (final upper limit) must be set if using a recuring range.

##### GET `/api/spots/:id/booked`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns the ranges during which this spot is booked in an array where each pair of indices is a start and end time. 

##### GET `/api/spots/:id/schedules`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns an object which contains 2 propertes: `booked` and `available` each of which are arrays where each pair of indices is a start and end time.

##### GET `/api/spots/:id/price`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
</table>
Returns an object which which contains details for each price type (such as per hour, etc).

##### GET `/api/spots/:id/price`
<table>
  <tr>
    <td><i>Requires auth</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td><i>Requires admin</i></td>
    <td>True</td>
  </tr>
  <tr>
    <td>perHour</td>
    <td>The price per hour for this spot</td>
  </tr>
</table>
Set the price of a spot.