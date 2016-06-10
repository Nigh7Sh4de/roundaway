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
    FACEBOOK_CLIENT_ID      :   "546364295540860",
    FACEBOOK_CLIENT_SECRET  :   "0ee45064c6677199badc21c95f46948f",
    GOOGLE_CLIENT_ID        :   "75788119754-35prom18iupfppskq6965qsg5sq5bp8q.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET    :   "4lf9EBwc8L9yxAzwPEp1pxJ9",
    GOOGLE_API_KEY          :   "AIzaSyDzO69_6QM_qkhczIvkFrmWtjXkg3CTFIE",
    PORT                    :   8081,
    DB_CONNECTION_STRING    :   "mongodb://localhost/roundaway"
}

module.exports = config;