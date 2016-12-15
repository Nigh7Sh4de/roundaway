var Schema = require('mongoose').Schema;

module.exports = {
    type: new Schema({
      acct: String,
      cus: String,
      public: String,
      secret: String
    }, {
      _id: false,
      id: false
    })
}