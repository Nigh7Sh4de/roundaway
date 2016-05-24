Roundaway
============

## Git Flow

<table>
 <thead>
  <tr>
   <th>Branch name</th>
   <th>Port</th>
   <th>Version scheme</th>
   <th>Purpose</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>master</td>
   <td>80</td>
   <td>major.minor</td>
   <td>production</td>
  </tr>
  <tr>
   <td>dev</td>
   <td>DNE (for now)</td>
   <td>major.minor.build</td>
   <td>staging (completed items)</td>
  </tr>
  <tr>
   <td><i>topic</i></td>
   <td>LOCAL</td>
   <td>N/A</td>
   <td>development (tasks in progress)</td>
  </tr>
 </tbody>
</table>



## Config

1. Run `npm install` to download all required packages
2. Create the following environment variables:
  * FACEBOOK_CLIENT_ID
  * FACEBOOK_CLIENT_SECRET
  * GOOGLE_CLIENT_ID
  * GOOGLE_CLIENT_SECRET
  * GOOGLE_API_KEY
3. Ensure MongoDB server is running on localhost
4. *(Optional)* The server will be listening on port 8080. Set up any necessary port-forwarding to accomodate this.

## API

*All api calls are on the `/api` route*

#### GET `/api/users`
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

#### GET `/api/users/profile`
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

#### GET `/api/users/:userid/lots`
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

#### PUT `/api/users/:userid/lots`
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

#### GET `/api/users/:userid/spots`
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

#### PUT `/api/users/:userid/spots`
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

#### GET `/api/users/:userid/bookings`
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

#### PUT `/api/users/:userid/bookings`
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

#### GET `/api/users/:userid/profile`
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

#### PATCH `/api/users/:userid/profile`
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

#### GET `/api/bookings`
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

#### PUT `/api/bookings`
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

#### GET `/api/bookings/:id`
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

#### GET `/api/bookings/:id/spot`
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

#### PUT `/api/bookings/:id/spot`
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

#### GET `/api/bookings/:id/start`
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

#### PUT `/api/bookings/:id/start`
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

#### GET `/api/bookings/:id/duration`
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

#### PUT `/api/bookings/:id/duration`
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

#### GET `/api/bookings/:id/end`
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

#### PUT `/api/bookings/:id/end`
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

#### GET `/api/bookings/:id/time`
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

#### PUT `/api/bookings/:id/time`
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

#### GET `/api/spots`
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
Returns the entire `spots` collection.

#### GET `/api/spots/near?long=LONGITUDE&lat=LATITUDE`
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
Returns the entire `spots` collection sorting by shortest to longest distance away from the supplied `LATITUDE` and `LONGITUDE`

#### PUT `/api/spots`
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
    <td>Adress</td>
    <td>A formatted string with the street address</td>
  </tr>
  <tr>
    <td>Coordinates</td>
    <td>Object containing <code>long</code> and <code>lat</code> properties describing the coordinates</td>
  </tr>
</table>
Creates a new `spots` document with the given data.

#### GET `/api/lots`
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

#### PUT `/api/lots`
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

#### GET `/api/lots/:id`
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

#### GET `/api/lots/:id/location`
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

#### PUT `/api/lots/:id/location`
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
    Can either be a number array of <code>[latitude, longitude]</code> or
    an object containing <code>lat</code> and <code>long</code> or <code>lon</code> properties</td>
  </tr>
</table>
Adds EITHER the specified spots to the lot or generates `count` number of new spots and adds them to the lot.

#### GET `/api/lots/:id/spots`
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

#### PUT `/api/lots/:id/spots`
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

#### DELETE `/api/lots/:id/spots`
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

#### GET `/api/spots`
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

#### PUT `/api/spots`
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

#### GET `/api/spots/:id`
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


#### GET `/api/spots/:id/location`
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

#### PUT `/api/spots/:id/location`
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
    Can either be a number array of <code>[latitude, longitude]</code> or
    an object containing <code>lat</code> and <code>long</code> or <code>lon</code> properties</td>
  </tr>
</table>
Adds EITHER the specified spots to the spot or generates `count` number of new spots and adds them to the spot.

#### GET `/api/spots/:id/bookings`
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

#### PUT `/api/spots/:id/bookings`
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

#### PUT `/api/spots/:id/bookings/remove`
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

#### GET `/api/spots/:id/available`
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

#### PUT `/api/spots/:id/available`
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

#### PUT `/api/spots/:id/available/remove`
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

#### GET `/api/spots/:id/booked`
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

#### GET `/api/spots/:id/schedules`
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
