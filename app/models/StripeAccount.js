var Schema = require('mongoose').Schema;

module.exports = {
    type: new Schema({
      stripe_id: String,
      customer_id: String,
      public: String,
      secret: String
    }, {
      _id: false,
      id: false
    }),
    // get: function(data) {
    //   try {
    //     if (data && data.stripe_id)
    //       return require('stripe')(data.stripe_id);
    //     else
    //       return undefined
    //   }
    //   catch(e) {
    //     console.error(e);
    //     return data;
    //   }
    // },
    // set: function(data) {
    //   return data;
    // }
}