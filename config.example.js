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
    STRIPE_SECRET_KEY       :   "sk_test_y9Ge30ZIbVe98pA4As87q4ob",
    STRIPE_PUBLISH_KEY      :   "pk_test_WwMFp1CE94C8P8QLtPrzW5Lq",
    JWT_SECRET_KEY          :   "14g2-Ed34n6ea7r63:M-(12F63wC~<",
    PORT                    :   8081,
    DB_CONNECTION_STRING    :   "mongodb://localhost/dev_roundaway",
    RUN_ALL_TESTS           :   true
}

module.exports = config;
