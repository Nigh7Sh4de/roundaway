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

#### GET `/api/parkades`
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
Returns the entire `parkades` collection.

#### GET `/api/parkades/near?long=LONGITUDE&lat=LATITUDE`
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
Returns the entire `parkades` collection sorting by shortest to longest distance away from the supplied `LATITUDE` and `LONGITUDE`

#### PUT `/api/parkades`
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
Creates a new `parkades` document with the given data.
