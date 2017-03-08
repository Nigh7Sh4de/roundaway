
Roundaway API
============
------------

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


#### StripeAccount `{}`
    acct: String,
    cus: String,
    public: String,
    secret: String

------------


## Models
*All models have a `createdAt` and `updatedAt` field*


#### User
The <b>User</b> object holds basic data about the <b>User</b> including <code>profile</code> and authentication information. All other models reference their owner through a <code>user</code> property.

    profile: Profile,
    authid: {
        facebook: String,
        google: String
    },
    stripe: StripeAccount,
    admin: Boolean


#### Car
The <b>Car</b> represents a <b>User</b>'s car in the database and holds basic information about it. When a <b>Car</b> 
has <code>selected: true</code> it will be used for <b>Booking</b>s (unless the <b>User</b> only has one <b>Car</b>, then that single <b>Car</b> will be used).

    user: User,
    license: String,
    make: String,
    model: String,
    year: Number,
    colour: String,
    description: String,
    selected: Boolean


#### Lot
A <b>Lot</b> is simply a collection of <b>Spot</b>s that share a common <code>user</code>. The <b>Lot</b>'s <code>price</code>, <code>availability</code>, and <code>location</code> are used as defaults for new <b>Spot</b>s. The <code>name</code> of a <b>Lot</b> is only shown to the owner (for easy management) while the <code>description</code> will be displayed publicly.

    User: User
    attendants: [User]
    location: Location,
    price: Price,
    available: Ranger,
    name: String,
    description: String


#### Spot
A <b>Spot</b> can be booked by users for a set period of time. Once a <b>Spot</b> is created you cannot modify the <code>location</code>. Modifying the <code>price</code> of a <b>Spot</b> will not modify existing <b>Booking</b>s. Associating a <b>Spot</b> with a <b>Lot</b> will overwrite the <b>Spot</b>'s <code>location</code> with the one in the <b>Lot</b>. The <code>name</code> of a <b>Spot</b> is only shown to the owner (for easy management) while the <code>description</code> will be displayed publicly.
    
    user: User,
    attendants: [User],
    lot: Lot,
    name: String,
    reserved: Boolean,
    location: Location,
    price: Price,
    available: Ranger,
    booked: Ranger,
    description: String



#### Booking
A <b>Booking</b> is an immutable object that is used to track bookings on a <b>Spot</b>. Once a <b>Booking</b> is created you cannot modify the <code>spot</code>, <code>price</code>, <code>start</code>, nor <code>end</code> properties. The status defaults to `unpaid` and will change to `paid` once payment has been succesfuly processed. A <b>Booking</b>'s price is calculated using it's duration (calculated using it's <code>start</code> and <code>end</code> properties) multiplied by the price of the <b>Spot</b> that it is associated with. All <b>Booking</b>s must have a <code>spot</code>. The <code>lot</code> for a <b>Booking</b> must be left empty unless the <b>Spot</b> is <code>generic</code>, then the <b>Booking</b>'s <code>lot</code> must be set.

    user: User,
    car: Car,
    lot: Lot,
    spot: Spot,
    status: BookingStatus,
    price: Price,
    start: Date,
    end: Date,

------------

## Authentication

Certain API routes requre a JWT and/or the associated user to have certain privelages. The specific requirements for each route are listed below.
In order to make API calls that are auth protected use the following flow:

1. Authenticate with a 3rd party authentication server of your choice. Currently supported options:
- Facebook
- Google 
2. Hit `POST /auth/:strat` with an <code>access_token</code> as supplied by the social network you are authenticating with
3. You will receieve a <b>JWT</b> in the response if authentication was successful after one of the following operations has completed:
- A user was found in db
- A new user was created
4. Set an `Authorizaton` header with the `JWT` scheme (as in: `Authorization: JWT <jwt string...>`) in all subsequent requests
5. If a certain user requires elevated privelages (such as *admin*) the db admin must set the appropriate flag in the user collection manually (*note*: changing privelages does not require generating a new JWT, so changing privelages can be done on the fly)

------------

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


<br />
------------
#### Util


##### PUT `/api/util/location/geocode`
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


<br />
------------
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


<br />
------------
#### User


##### GET `/api/users`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Returns the entire <b>User</b>s collection.


<br />
##### GET `/api/users/profile`
<table>
<tr>
    <td><i>security</i></td>
    <td>authorized</td>
</tr>
</table>
Returns the current session <b>User</b>.


<br />
##### GET `/api/users/:userid/lots`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Returns the given <b>User</b>'s lots.


<br />
##### GET `/api/users/:userid/spots`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Returns the given <b>User</b>'s spots.


<br />
##### GET `/api/users/:userid/bookings`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Returns the given <b>User</b>'s bookings.


<br />
##### GET `/api/users/:userid/profile`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Returns the given <b>User</b>'s profile.


<br />
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


<br />
##### GET `/api/users/:userid/stripe/account`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Returns the given <b>User</b>'s <i>Stripe</i> <code>account</code> object.


<br />
##### GET `/api/users/:userid/stripe/customer`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Returns the given <b>User</b>'s <i>Stripe</i> <code>customer</code> object.


<br />
##### PUT `/api/users/:userid/stripe`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Create or update a <i>Stripe</i> <i>Connect</i> account for the user. Parameters will be passed directly to the <i>Stripe</i> <a href="https://stripe.com/docs/api#update_account">api</a>.


<br />
##### GET `/api/users/:userid/stripe/history`
<table>
<tr>
    <td><i>security</i></td>
    <td>admin</td>
</tr>
</table>
Returns the given <b>User</b>'s <i>Stripe</i> transaction history.


<br />
------------
#### Car


##### GET `/api/cars`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the owned <b>Car</b>s or entire collection if admin.


<br />
##### POST `/api/cars`
<table>
<tr>
    <td><i>security</i></td>
    <td>authorized</td>
</tr>
<tr>
    <td>...</td>
    <td>Any properties as specified in the <b>Car</b> Model</td>
</tr>
<tr>
    <td>car</td>
    <td>An object containing any properties as specified in the <b>Car</b> Model. If set all other request body properties are ignored.</td>
</tr>
</table>
Creates a <b>Car</b> with the specified properties.


<br />
##### GET `/api/cars/:id`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the <b>Car</b> with the specified id.


<br />
##### PATCH `/api/cars/:id`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
<tr>
    <td>...</td>
    <td>Any properties as specified in the <b>Car</b> Model</td>
</tr>
</table>
Updates a <b>Car</b> with the specified properties.


<br />
##### GET `/api/cars/:id/bookings`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Gets the <b>Booking</b>s associated with the <b>Car</b>.


<br />
##### GET `/api/cars/:id/bookings/next`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Gets the next <b>Booking</b> associated with the <b>Car</b>.




<br />
------------
#### Booking


##### GET `/api/bookings`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
</table>
Returns the owned <b>Booking</b> or entire collection if admin.


<br />
##### GET `/api/bookings/:id`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
</table>
Returns the <b>Booking</b> with the specified id.


<br />
##### GET `/api/bookings/:id/spot`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
</table>
Returns the spot that is associated with this <b>Booking</b>.


<br />
##### GET `/api/bookings/:id/car`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
</table>
Returns the car that is associated with this <b>Booking</b>.


<br />
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


<br />
------------
#### Lot


##### GET `/api/lots`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the owned <b>Lot</b>s or entire collection if admin.


<br />
##### POST `/api/lots`
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


<br />
##### GET `/api/lots/:id`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the <b>Lot</b> with the specified id.


<br />
##### PATCH `/api/lots/:id`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
<tr>
    <td>name</td>
    <td>The new name for the lot</td>
</tr>
<tr>
    <td>description</td>
    <td>The new description for the lot</td>
</tr>
<tr>
    <td>price</td>
    <td>The new price object for the lot (only needs to have the price divisions you wish to update)</td>
</tr>
</table>
Update the <b>Lot</b> with the specified id. You only need to use the request body parameters that you wish to update.


<br />
##### GET `/api/lots/:id/spots`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the spots associated with the <b>Lot</b>.


<br />
##### GET `/api/lots/:id/attendants`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
</table>
Return the attendants associated with the <b>Lot</b>.


<br />
##### POST `/api/lots/:id/attendants`
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


<br />
##### POST `/api/lots/:id/available`
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


<br />
##### POST `/api/lots/:id/available/remove`
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



<br />
------------
#### Spot


##### GET `/api/spots`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the owned <b>Spot</b>s or entire collection if admin.


<br />
##### POST `/api/spots`
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


<br />
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


<br />
##### GET `/api/spots/:id`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the <b>Spot</b> with the specified id.


<br />
##### PATCH `/api/lots/:id`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
<tr>
    <td>name</td>
    <td>The new name for the lot</td>
</tr>
<tr>
    <td>description</td>
    <td>The new description for the lot</td>
</tr>
<tr>
    <td>price</td>
    <td>The new price object for the lot (only needs to have the price divisions you wish to update)</td>
</tr>
</table>
Update the <b>Lot</b> with the specified id. You only need to use the request body parameters that you wish to update.


<br />
##### GET `/api/spots/:id/lot`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the <b>Lot</b> associated with the <b>Spot</b>


<br />
##### GET `/api/lots/:id/attendants`
<table>
<tr>
    <td><i>security</i></td>
    <td>owner</td>
</tr>
</table>
Return the attendants associated with the lot.


<br />
##### POST `/api/lots/:id/attendants`
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
Return the attendants associated with the lot.


<br />
##### GET `/api/spots/:id/bookings`
<table>
<tr>
    <td><i>security</i></td>
    <td>attendant</td>
</tr>
</table>
Returns the bookings associated with the <b>Spot</b> with the given id.


<br />
##### POST `/api/spots/:id/bookings`
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


<br />
##### POST `/api/spots/:id/bookings/remove`
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


<br />
##### POST `/api/spots/:id/available`
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


<br />
##### POST `/api/spots/:id/available/remove`
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
