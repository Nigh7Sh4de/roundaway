Roundaway
============

## Config

1. Run `npm install` to download all required packages
2. Create the following environment variables:
  * FACEBOOK_CLIENT_ID
  * FACEBOOK_CLIENT_SECRET
  * GOOGLE_CLIENT_ID
  * GOOGLE_CLIENT_SECRET
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
