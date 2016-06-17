/**
 * 
 * These are the current settings on the `dev` (8081) environment.
 * 
 * Copy the content of this file or a new configuration into a new file `config.js`
 * in the same folder as `server.js` in order to run the app.
 * 
 */

var config = function () {}

config.prototype = {
    FACEBOOK_CLIENT_ID      :   "1047538728658257",
    FACEBOOK_CLIENT_SECRET  :   "27f4b5170ad4cff5e389f0ce60e7decd",
    GOOGLE_CLIENT_ID        :   "569132181251-9an908bh0b1ta0fb5vrsc66roh5lnkq7.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET    :   "dM31Hu2O07Pxl1YHBXvhBC8Z",
    GOOGLE_API_KEY          :   "AIzaSyDVtIdTJrYyfr30Hj9OyioWMaG_HxhHU2E",
    PORT                    :   8081,
    DB_CONNECTION_STRING    :   "mongodb://localhost/dev_roundaway"
}

module.exports = config;
