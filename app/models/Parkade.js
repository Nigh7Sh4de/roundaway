var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var parkadeSchema = new Schema({
    address: String,
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    }
});

var Parkade = mongoose.model('Parkade', parkadeSchema);

module.exports = Parkade;
